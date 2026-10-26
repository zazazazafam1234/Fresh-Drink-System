import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fresh_drink',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: process.env.DB_TIME_ZONE || '+07:00',
});

app.use(express.json({ limit: '1mb' }));
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const env = (...names) => names.map((name) => process.env[name]).find((value) => value && value.trim())?.trim();
const googleClientId = env('googleId', 'GOOGLE_CLIENT_ID', 'GOOGLE_ID');
const googleClientSecret = env('googleSecret', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_SECRET');
const googleCallbackURL = env('callbackURL', 'GOOGLE_CALLBACK_URL', 'CALLBACK_URL');
const googleClient = new OAuth2Client(googleClientId, googleClientSecret, googleCallbackURL);
const cookieNameFor = (role) => role === 'admin' ? 'fresh_drink_admin_session' : 'fresh_drink_user_session';
const oauthStateCookieName = 'fresh_drink_oauth_state';
const sessionSecret = process.env.SESSION_SECRET;
const sign = (payload) => createHmac('sha256', sessionSecret || 'dev-only-change-this-secret').update(payload).digest('base64url');
const makeSession = (user) => {
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};
const getSession = (req, role) => {
  const cookieName = cookieNameFor(role);
  const entry = (req.headers.cookie || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(`${cookieName}=`));
  if (!entry || !sessionSecret) return null;
  try {
    const [payload, signature] = decodeURIComponent(entry.slice(cookieName.length + 1)).split('.');
    const expected = Buffer.from(sign(payload));
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return user.exp > Date.now() ? user : null;
  } catch { return null; }
};
app.use('/api', (req, res, next) => {
  if (['/health', '/auth/me', '/auth/logout'].includes(req.path) || req.path.startsWith('/auth/google')) return next();
  const user = getSession(req, req.path.startsWith('/user/') ? 'user' : 'admin');
  if (!user) return res.status(401).json({ error: 'Please sign in with Google' });
  req.user = user;
  if (!req.path.startsWith('/user/') && user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
});

const mailer = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } }) : null;
const emailAdmins = async (subject, text) => {
  const recipients = (process.env.ADMIN_EMAILS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (mailer && recipients.length) await mailer.sendMail({ from: process.env.GMAIL_USER, to: recipients, subject, text });
};
const emailMachineUsers = async (machineId, subject, text) => {
  if (!mailer) return;
  const [rows] = await pool.execute(`SELECT DISTINCT u.email FROM app_users u
    JOIN dispense_records d ON d.user_key = u.id WHERE d.machine_id = ?`, [machineId]);
  const recipients = rows.map((row) => row.email);
  if (recipients.length) await mailer.sendMail({ from: process.env.GMAIL_USER, to: recipients, subject, text });
};

const allowedReturnTo = (req, role, value) => {
  const fallback = role === 'user' ? '/user/' : '/';
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  try {
    const url = new URL(trimmed);
    const configuredOrigins = [process.env.APP_BASE_URL, process.env.USER_APP_BASE_URL]
      .filter(Boolean)
      .map((baseUrl) => {
        try { return new URL(baseUrl).origin; } catch { return null; }
      })
      .filter(Boolean);
    const localOrigin = ['localhost', '127.0.0.1'].includes(url.hostname);
    const requestOrigin = `${req.protocol}://${req.get('host')}`;
    if (localOrigin || url.origin === requestOrigin || configuredOrigins.includes(url.origin)) return url.toString();
  } catch { return fallback; }
  return fallback;
};
const makeGoogleState = (state) => {
  const payload = Buffer.from(JSON.stringify({ ...state, exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};
const readGoogleState = (value) => {
  if (!sessionSecret || typeof value !== 'string') return null;
  try {
    const [payload, signature] = value.split('.');
    const expected = Buffer.from(sign(payload));
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
    const state = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return state.exp > Date.now() ? state : null;
  } catch { return null; }
};
const equalSecrets = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};
const readCookie = (req, name) => {
  const entry = (req.headers.cookie || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
};
const stateCookie = (value, maxAge) => `${oauthStateCookieName}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/api/auth/google; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
const authErrorRedirect = (req, res, role, returnTo, message) => {
  const destination = allowedReturnTo(req, role, returnTo);
  const url = new URL(destination, `${req.protocol}://${req.get('host')}`);
  url.searchParams.set('authError', message);
  res.redirect(url.toString());
};
const signInWithGoogleProfile = async (profile, requestedRole, res) => {
  if (!profile?.sub || !profile.email || !profile.email_verified) {
    const error = new Error('A verified Google email is required');
    error.status = 401;
    throw error;
  }
  const email = profile.email.toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const accountRole = adminEmails.includes(email) ? 'admin' : 'user';
  if (!['user', 'admin'].includes(requestedRole)) {
    const error = new Error('Choose User or Admin sign-in');
    error.status = 400;
    throw error;
  }
  if (requestedRole === 'admin' && accountRole !== 'admin') {
    const error = new Error('This Google account is not allowed to use Admin');
    error.status = 403;
    throw error;
  }
  await pool.execute(`INSERT INTO app_users (id, google_sub, email, name, picture, role) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE name = VALUES(name), picture = VALUES(picture), role = VALUES(role), last_login_at = CURRENT_TIMESTAMP`,
  [randomUUID(), profile.sub, email, profile.name || email, profile.picture || null, accountRole]);
  const [[user]] = await pool.execute('SELECT id, email, name, picture, role FROM app_users WHERE google_sub = ?', [profile.sub]);
  const cookieName = cookieNameFor(requestedRole);
  res.append('Set-Cookie', `${cookieName}=${encodeURIComponent(makeSession({ ...user, role: requestedRole }))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return { ...user, role: requestedRole };
};

app.get('/api/auth/google/start', (req, res) => {
  const role = req.query.role === 'admin' ? 'admin' : 'user';
  if (!googleClientId || !googleClientSecret || !googleCallbackURL || !sessionSecret) {
    return res.status(503).json({ error: 'Google OAuth redirect is not configured' });
  }
  const returnTo = allowedReturnTo(req, role, req.query.returnTo);
  const nonce = randomUUID();
  const url = googleClient.generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
    state: makeGoogleState({ role, returnTo, nonce }),
  });
  res.append('Set-Cookie', stateCookie(nonce, 600));
  res.redirect(url);
});

app.get('/api/auth/google/callback', asyncRoute(async (req, res) => {
  if (!googleClientId || !googleClientSecret || !googleCallbackURL || !sessionSecret) {
    return res.status(503).send('Google OAuth redirect is not configured');
  }
  const state = readGoogleState(req.query.state);
  res.append('Set-Cookie', stateCookie('', 0));
  if (!state) return res.status(400).send('Invalid or expired Google sign-in state. Return to the app and try again.');
  if (!equalSecrets(state.nonce, readCookie(req, oauthStateCookieName))) {
    return authErrorRedirect(req, res, state.role, state.returnTo, 'Your sign-in session expired. Please try again.');
  }
  if (req.query.error) {
    const message = req.query.error === 'access_denied'
      ? 'You cancelled Google sign-in.'
      : 'Google could not complete sign-in. Please try again.';
    return authErrorRedirect(req, res, state.role, state.returnTo, message);
  }
  try {
    const { tokens } = await googleClient.getToken(requiredText(String(req.query.code || ''), 'Google authorization code', 10000));
    if (!tokens.id_token) throw new Error('Google did not return an ID token');
    const ticket = await googleClient.verifyIdToken({ idToken: tokens.id_token, audience: googleClientId });
    const user = await signInWithGoogleProfile(ticket.getPayload(), state.role, res);
    return res.redirect(allowedReturnTo(req, user.role, state.returnTo));
  } catch (error) {
    const message = error.status === 403
      ? 'This Google account is not allowed to use Admin.'
      : 'Google sign-in failed. Please try again.';
    return authErrorRedirect(req, res, state.role, state.returnTo, message);
  }
}));
app.post('/api/auth/google', asyncRoute(async (req, res) => {
  if (!googleClientId || !sessionSecret) return res.status(503).json({ error: 'Google sign-in is not configured' });
  const ticket = await googleClient.verifyIdToken({ idToken: requiredText(req.body.credential, 'Google credential', 10000), audience: googleClientId });
  const user = await signInWithGoogleProfile(ticket.getPayload(), req.body.role, res);
  res.json({ user });
}));
app.get('/api/auth/me', (req, res) => { const role = req.query.role === 'admin' ? 'admin' : 'user'; res.json({ user: getSession(req, role) }); });
app.post('/api/auth/logout', (req, res) => { const role = req.body.role === 'admin' ? 'admin' : 'user'; res.setHeader('Set-Cookie', `${cookieNameFor(role)}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`); res.json({ ok: true }); });

const requiredText = (value, label, max = 255) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    const error = new Error(`${label} is required (max ${max} characters)`);
    error.status = 400;
    throw error;
  }
  return value.trim();
};
const timestampLabel = (value) => new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: process.env.APP_TIME_ZONE || 'Asia/Bangkok',
}).format(new Date(value));

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, database: 'connected' });
}));

app.get('/api/machines', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT id, name, location, filter_percent AS filterPercent FROM machines ORDER BY name');
  res.json(rows);
}));

app.post('/api/machines', asyncRoute(async (req, res) => {
  const id = requiredText(req.body.id, 'Machine ID', 64);
  const name = requiredText(req.body.name, 'Machine name', 120);
  const location = typeof req.body.location === 'string' ? req.body.location.trim().slice(0, 255) : '';
  const filterPercent = req.body.filterPercent === undefined ? 100 : Number(req.body.filterPercent);
  if (!Number.isFinite(filterPercent) || filterPercent < 0 || filterPercent > 100) return res.status(400).json({ error: 'Filter percent must be between 0 and 100' });
  await pool.execute('INSERT INTO machines (id, name, location, filter_percent) VALUES (?, ?, ?, ?)', [id, name, location, filterPercent]);
  res.status(201).json({ id, name, location, filterPercent });
}));

app.get('/api/dashboard', asyncRoute(async (req, res) => {
  const machineId = requiredText(String(req.query.machineId || ''), 'machineId', 64);
  const [[machine]] = await pool.execute('SELECT id, name, location, filter_percent AS filterPercent FROM machines WHERE id = ?', [machineId]);
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  const [alertRows] = await pool.execute(
    `SELECT id, machine_id AS machineId, title, severity AS type, status, assigned_technician AS technician,
      notes, is_unread AS isUnread, created_at AS createdAt
     FROM alerts WHERE machine_id = ? ORDER BY created_at DESC LIMIT 200`, [machineId]);
  const alerts = alertRows.map((row) => ({
    ...row,
    statusText: ({ new: '\u0e43\u0e2b\u0e21\u0e48', in_progress: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23', completed: '\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19' })[row.status],
    location: machine.location ? `${machine.name} â€¢ ${machine.location}` : machine.name,
    time: timestampLabel(row.createdAt), timestamp: timestampLabel(row.createdAt),
  }));
  const [flushRows] = await pool.execute(
    `SELECT id, trigger_type AS triggerType, status, requested_at AS requestedAt
     FROM flush_records WHERE machine_id = ? ORDER BY requested_at DESC LIMIT 100`, [machineId]);
  const [maintenanceRows] = await pool.execute(
    `SELECT id, technician, machine_id AS machineId, notes, created_at AS createdAt
     FROM maintenance_logs WHERE machine_id = ? ORDER BY created_at DESC LIMIT 100`, [machineId]);
  const [telemetryRows] = await pool.execute(
    `SELECT pressure_bar AS pressure, purity_percent AS purity, recorded_at AS recordedAt
     FROM telemetry WHERE machine_id = ? AND recorded_at >= NOW() - INTERVAL 24 HOUR
     ORDER BY recorded_at ASC`, [machineId]);
  const [usageRows] = await pool.execute(
    `SELECT day, SUM(liters) AS liters FROM (
       SELECT DATE(recorded_at) AS day, water_liters AS liters FROM telemetry
       WHERE machine_id = ? AND recorded_at >= NOW() - INTERVAL 7 DAY AND water_liters IS NOT NULL
       UNION ALL
       SELECT DATE(created_at) AS day, requested_ml / 1000 AS liters FROM dispense_records
       WHERE machine_id = ? AND status = 'completed' AND created_at >= NOW() - INTERVAL 7 DAY
     ) usage_data GROUP BY day ORDER BY day`, [machineId, machineId]);
  const [efficiencyRows] = await pool.execute(
    `SELECT DATE(recorded_at) AS day, AVG(purity_percent) AS percentage FROM telemetry
     WHERE machine_id = ? AND recorded_at >= NOW() - INTERVAL 7 DAY
     GROUP BY DATE(recorded_at) ORDER BY day`, [machineId]);
  const [issueRows] = await pool.execute(
    `SELECT title AS issue, COUNT(*) AS count FROM alerts WHERE machine_id = ? AND severity <> 'normal'
     GROUP BY title ORDER BY count DESC LIMIT 5`, [machineId]);
  const flushHistory = flushRows.map((row) => ({
    id: row.id, time: timestampLabel(row.requestedAt), date: timestampLabel(row.requestedAt),
    triggerType: row.triggerType, status: row.status,
  }));
  const maintenanceLogs = maintenanceRows.map((row) => ({ ...row, dateTime: timestampLabel(row.createdAt) }));
  const [dispenseRequestRows] = await pool.execute(
    `SELECT id, machine_id AS machineId, requested_ml AS amountMl, status, created_at AS createdAt
     FROM dispense_records WHERE machine_id = ? ORDER BY created_at DESC LIMIT 20`, [machineId]);
  const [[flushSummary]] = await pool.execute(
    `SELECT COUNT(*) AS countToday, MAX(requested_at) AS lastFlush FROM flush_records
     WHERE machine_id = ? AND DATE(requested_at) = CURDATE() AND status <> 'failed'`, [machineId]);
  const totalIssues = issueRows.reduce((sum, row) => sum + Number(row.count), 0);
  res.json({
    machine,
    alerts,
    flushHistory,
    maintenanceLogs,
    dispenseRequests: dispenseRequestRows.map((row) => ({ ...row, amountMl: Number(row.amountMl), createdAt: timestampLabel(row.createdAt) })),
    filterPercent: Number(machine.filterPercent),
    flushCountToday: Number(flushSummary.countToday),
    lastFlushTime: flushSummary.lastFlush ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: process.env.APP_TIME_ZONE || 'Asia/Bangkok' }).format(new Date(flushSummary.lastFlush)) : 'â€”',
    realtimeData: telemetryRows.map((row) => ({ time: timestampLabel(row.recordedAt), pressure: Number(row.pressure), purity: Number(row.purity) })),
    usageData: usageRows.map((row) => ({ date: timestampLabel(row.day), liters: Number(row.liters) })),
    efficiencyData: efficiencyRows.map((row) => ({ date: timestampLabel(row.day), percentage: Number(row.percentage) })),
    frequentIssues: issueRows.map((row, index) => ({ id: String(index + 1), issue: row.issue, count: Number(row.count), percentage: totalIssues ? Math.round(Number(row.count) / totalIssues * 100) : 0, color: 'bg-blue-50 text-blue-700', barColor: 'bg-blue-500' })),
  });
}));

app.post('/api/alerts', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const title = requiredText(req.body.title, 'Alert title');
  const severity = ['critical', 'warning', 'normal'].includes(req.body.severity) ? req.body.severity : 'warning';
  const id = randomUUID();
  await pool.execute('INSERT INTO alerts (id, machine_id, title, severity) VALUES (?, ?, ?, ?)', [id, machineId, title, severity]);
  const emailText = `${title}\nMachine: ${machineId}`;
  Promise.all([emailAdmins(`Fresh Drink: ${severity} alert`, emailText), emailMachineUsers(machineId, `Fresh Drink: ${severity} alert`, emailText)])
    .catch((error) => console.error('Alert email failed:', error.message));
  res.status(201).json({ id });
}));

app.patch('/api/alerts/:id', asyncRoute(async (req, res) => {
  const status = req.body.status;
  if (!['new', 'in_progress', 'completed'].includes(status)) return res.status(400).json({ error: 'Invalid alert status' });
  const technician = typeof req.body.technician === 'string' ? req.body.technician.trim().slice(0, 160) : null;
  const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : null;
  const [result] = await pool.execute(
    'UPDATE alerts SET status = ?, assigned_technician = COALESCE(?, assigned_technician), notes = COALESCE(?, notes), is_unread = FALSE WHERE id = ?',
    [status, technician, notes, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Alert not found' });
  if (status === 'completed' && notes) {
    const [[alert]] = await pool.execute('SELECT machine_id AS machineId, assigned_technician AS technician FROM alerts WHERE id = ?', [req.params.id]);
    await pool.execute('INSERT INTO maintenance_logs (id, machine_id, technician, notes) VALUES (?, ?, ?, ?)', [randomUUID(), alert.machineId, alert.technician || technician || 'Unassigned', notes]);
  }
  res.json({ ok: true });
}));

app.patch('/api/dispense-records/:id/status', asyncRoute(async (req, res) => {
  const status = req.body.status;
  if (!['completed', 'failed'].includes(status)) return res.status(400).json({ error: 'Status must be completed or failed' });
  const [result] = await pool.execute('UPDATE dispense_records SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Dispense request not found' });
  if (mailer) {
    const [[request]] = await pool.execute('SELECT u.email, d.requested_ml AS amount, d.machine_id AS machineId FROM dispense_records d JOIN app_users u ON u.id = d.user_key WHERE d.id = ?', [req.params.id]);
    if (request) mailer.sendMail({ from: process.env.GMAIL_USER, to: request.email, subject: `Fresh Drink: water request ${status}`, text: `Your ${request.amount} ml water request for dispenser ${request.machineId} was marked ${status}.` }).catch((error) => console.error('User status email failed:', error.message));
  }
  res.json({ ok: true });
}));

app.post('/api/maintenance', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const technician = requiredText(req.body.technician, 'Technician', 160);
  const notes = requiredText(req.body.notes, 'Notes', 10000);
  const createdAt = req.body.dateTime ? new Date(req.body.dateTime) : new Date();
  if (Number.isNaN(createdAt.getTime())) return res.status(400).json({ error: 'Invalid maintenance date' });
  const id = randomUUID();
  await pool.execute('INSERT INTO maintenance_logs (id, machine_id, technician, notes, created_at) VALUES (?, ?, ?, ?, ?)', [id, machineId, technician, notes, createdAt]);
  res.status(201).json({ id });
}));

app.post('/api/flush', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const id = randomUUID();
  await pool.execute('INSERT INTO flush_records (id, machine_id, trigger_type, status) VALUES (?, ?, ?, \'requested\')', [id, machineId, 'admin']);
  res.status(201).json({ id, status: 'requested', message: 'Request recorded. Connect a device controller to execute the flush.' });
}));

app.post('/api/filter-replacements', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const technician = requiredText(req.body.technician, 'Technician', 160);
  const filterType = requiredText(req.body.filterType, 'Filter type', 160);
  const createdAt = req.body.date ? new Date(`${req.body.date}T12:00:00`) : new Date();
  if (Number.isNaN(createdAt.getTime())) return res.status(400).json({ error: 'Invalid replacement date' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('UPDATE machines SET filter_percent = 100 WHERE id = ?', [machineId]);
    await connection.execute('INSERT INTO maintenance_logs (id, machine_id, technician, notes, created_at) VALUES (?, ?, ?, ?, ?)', [randomUUID(), machineId, technician, `Filter replaced: ${filterType}`, createdAt]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  res.status(201).json({ ok: true });
}));

app.post('/api/telemetry', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const pressure = Number(req.body.pressure);
  const purity = Number(req.body.purity);
  const liters = req.body.waterLiters == null ? null : Number(req.body.waterLiters);
  if (!Number.isFinite(pressure) || !Number.isFinite(purity) || purity < 0 || purity > 100 || (liters !== null && (!Number.isFinite(liters) || liters < 0))) {
    return res.status(400).json({ error: 'Invalid telemetry values' });
  }
  await pool.execute('INSERT INTO telemetry (machine_id, pressure_bar, purity_percent, water_liters) VALUES (?, ?, ?, ?)', [machineId, pressure, purity, liters]);
  res.status(201).json({ ok: true });
}));

app.get('/api/user/machines', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.location, m.filter_percent AS filterPercent,
      t.pressure_bar AS pressure, t.purity_percent AS purity, t.recorded_at AS recordedAt
     FROM machines m LEFT JOIN telemetry t ON t.id = (
       SELECT latest.id FROM telemetry latest WHERE latest.machine_id = m.id ORDER BY latest.recorded_at DESC LIMIT 1
     ) ORDER BY m.name`);
  res.json(rows.map((machine) => ({ ...machine, filterPercent: Number(machine.filterPercent), filterRemainingPercent: Number(machine.filterPercent), pressure: machine.pressure == null ? null : Number(machine.pressure), purity: machine.purity == null ? null : Number(machine.purity), tds: null, ph: null, turbidity: null, temp: null, filteredLiters: null, maxFilterLiters: null, telemetryStatus: !machine.recordedAt ? 'never' : Date.now() - new Date(machine.recordedAt).getTime() < 15 * 60 * 1000 ? 'recent' : 'stale' })));
}));

app.get('/api/user/machines/:machineId/data', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.params.machineId, 'Machine ID', 64);
  const userKey = req.user.id;
  const [[machine]] = await pool.execute(
    `SELECT m.id, m.name, m.location, m.filter_percent AS filterPercent,
      t.pressure_bar AS pressure, t.purity_percent AS purity, t.recorded_at AS recordedAt
     FROM machines m LEFT JOIN telemetry t ON t.id = (
       SELECT latest.id FROM telemetry latest WHERE latest.machine_id = m.id ORDER BY latest.recorded_at DESC LIMIT 1
     ) WHERE m.id = ?`, [machineId]);
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  const [dispenseRows] = await pool.execute(
    `SELECT d.id, d.requested_ml AS amount, d.status, d.created_at AS createdAt, m.name AS machineName
     FROM dispense_records d JOIN machines m ON m.id = d.machine_id
     WHERE d.machine_id = ? AND d.user_key = ? ORDER BY d.created_at DESC LIMIT 100`, [machineId, userKey]);
  const [alerts] = await pool.execute(
    `SELECT a.id, a.title, a.notes, a.status, a.severity, a.created_at AS createdAt,
      (r.notification_id IS NOT NULL) AS isRead
     FROM alerts a LEFT JOIN user_notification_reads r ON r.notification_id = a.id AND r.user_key = ?
     WHERE a.machine_id = ? ORDER BY a.created_at DESC LIMIT 100`, [userKey, machineId]);
  const [flushes] = await pool.execute(
    `SELECT f.id, f.status, f.requested_at AS createdAt, (r.notification_id IS NOT NULL) AS isRead
     FROM flush_records f LEFT JOIN user_notification_reads r ON r.notification_id = f.id AND r.user_key = ?
     WHERE f.machine_id = ? ORDER BY f.requested_at DESC LIMIT 50`, [userKey, machineId]);
  const [dispenseNotifications] = await pool.execute(
    `SELECT d.id, d.status, d.requested_ml AS amount, d.created_at AS createdAt,
      (r.notification_id IS NOT NULL) AS isRead
     FROM dispense_records d LEFT JOIN user_notification_reads r ON r.notification_id = d.id AND r.user_key = ?
     WHERE d.machine_id = ? AND d.user_key = ? ORDER BY d.created_at DESC LIMIT 50`, [userKey, machineId, userKey]);
  const formatTime = (date) => timestampLabel(date);
  const notifications = [
    ...alerts.map((item) => ({ id: item.id, type: item.severity === 'critical' ? 'error' : item.severity === 'warning' ? 'warning' : 'success', title: item.title, description: item.notes || `Alert status: ${item.status}`, time: formatTime(item.createdAt), sortAt: new Date(item.createdAt).getTime(), read: Boolean(item.isRead) })),
    ...flushes.map((item) => ({ id: item.id, type: item.status === 'failed' ? 'error' : item.status === 'success' ? 'success' : 'warning', title: item.status === 'requested' ? 'Auto Flush request saved' : `Auto Flush ${item.status}`, description: item.status === 'requested' ? 'Waiting for a connected device controller.' : 'Status updated by the system.', time: formatTime(item.createdAt), sortAt: new Date(item.createdAt).getTime(), read: Boolean(item.isRead) })),
    ...dispenseNotifications.map((item) => ({ id: item.id, type: item.status === 'failed' ? 'error' : item.status === 'completed' ? 'success' : 'warning', title: item.status === 'requested' ? 'Water request saved' : `Dispense ${item.status}`, description: `${Number(item.amount)} ml Â· ${item.status === 'requested' ? 'Waiting for a connected dispenser controller.' : 'Dispenser status updated.'}`, time: formatTime(item.createdAt), sortAt: new Date(item.createdAt).getTime(), read: Boolean(item.isRead) })),
  ].sort((a, b) => b.sortAt - a.sortAt).slice(0, 100).map(({ sortAt, ...notification }) => notification);
  res.json({
    machine: { ...machine, filterPercent: Number(machine.filterPercent), filterRemainingPercent: Number(machine.filterPercent), pressure: machine.pressure == null ? null : Number(machine.pressure), purity: machine.purity == null ? null : Number(machine.purity), tds: null, ph: null, turbidity: null, temp: null, filteredLiters: null, maxFilterLiters: null, telemetryStatus: !machine.recordedAt ? 'never' : Date.now() - new Date(machine.recordedAt).getTime() < 15 * 60 * 1000 ? 'recent' : 'stale' },
    logs: dispenseRows.map((row) => ({ id: row.id, date: new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeZone: process.env.APP_TIME_ZONE || 'Asia/Bangkok' }).format(new Date(row.createdAt)), time: new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: process.env.APP_TIME_ZONE || 'Asia/Bangkok' }).format(new Date(row.createdAt)), createdAt: new Date(row.createdAt).toISOString(), amount: Number(row.amount), unitDisplay: `${Number(row.amount)} ml`, dispenserName: row.machineName, status: row.status })),
    notifications,
  });
}));

app.post('/api/user/dispense', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const userKey = req.user.id;
  const amount = Number(req.body.amountMl);
  if (!Number.isInteger(amount) || amount < 100 || amount > 5000) return res.status(400).json({ error: 'Amount must be an integer between 100 and 5000 ml' });
  const id = randomUUID();
  await pool.execute('INSERT INTO dispense_records (id, machine_id, user_key, requested_ml) VALUES (?, ?, ?, ?)', [id, machineId, userKey, amount]);
  if (mailer) mailer.sendMail({ from: process.env.GMAIL_USER, to: req.user.email, subject: 'Fresh Drink: water request received', text: `Your request for ${amount} ml from dispenser ${machineId} has been recorded.` }).catch((error) => console.error('User email failed:', error.message));
  res.status(201).json({ id, status: 'requested', message: 'Request recorded. Connect a dispenser controller to dispense water.' });
}));

app.post('/api/user/notifications/read-all', asyncRoute(async (req, res) => {
  const userKey = req.user.id;
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((id) => typeof id === 'string' && /^[\da-f-]{36}$/i.test(id)).slice(0, 200) : [];
  if (!ids.length) return res.json({ ok: true, updated: 0 });
  const values = ids.map(() => '(?, ?)').join(',');
  await pool.execute(`INSERT IGNORE INTO user_notification_reads (user_key, notification_id) VALUES ${values}`, ids.flatMap((id) => [userKey, id]));
  res.json({ ok: true, updated: ids.length });
}));

app.post('/api/user/flush', asyncRoute(async (req, res) => {
  const machineId = requiredText(req.body.machineId, 'Machine ID', 64);
  const id = randomUUID();
  await pool.execute('INSERT INTO flush_records (id, machine_id, trigger_type, status) VALUES (?, ?, ?, \'requested\')', [id, machineId, `user:${req.user.email}`]);
  if (mailer) mailer.sendMail({ from: process.env.GMAIL_USER, to: req.user.email, subject: 'Fresh Drink: Auto Flush request received', text: `Your Auto Flush request for dispenser ${machineId} has been recorded and is waiting for the controller.` }).catch((error) => console.error('User email failed:', error.message));
  res.status(201).json({ id, status: 'requested' });
}));

app.post('/api/email/test', asyncRoute(async (req, res) => {
  if (!mailer) return res.status(503).json({ error: 'Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in the API .env file.' });
  try {
    await mailer.sendMail({
      from: process.env.GMAIL_USER,
      to: req.user.email,
      subject: 'Fresh Drink: Gmail notification test',
      text: 'Gmail notifications are connected. This test message was sent to the email address on your Admin account.',
    });
    res.json({ ok: true });
  } catch (error) {
    const code = error?.code || 'UNKNOWN';
    console.error('Gmail test email failed:', code);
    const message = code === 'EAUTH'
      ? 'Gmail rejected the credentials. Check GMAIL_USER and replace GMAIL_APP_PASSWORD with a valid Google App Password.'
      : 'Could not send the test email. Check the Gmail settings and API server logs.';
    res.status(502).json({ error: message });
  }
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

const distDir = path.join(__dirname, 'dist');
const userDistDir = path.join(__dirname, 'fresh-drink-(user-app)', 'dist');
app.use('/user', express.static(userDistDir));
app.get('/user/*', (_req, res, next) => res.sendFile(path.join(userDistDir, 'index.html'), (error) => error && next()));
app.use(express.static(distDir));
app.get('*', (_req, res, next) => res.sendFile(path.join(distDir, 'index.html'), (error) => error && next()));

app.use((error, _req, res, _next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This machine ID already exists' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Machine does not exist' });
  console.error(error);
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Server or database error' });
});

app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Fresh Drink API listening on http://localhost:${port}`));
