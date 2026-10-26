# Fresh Drink RO (Admin + User)

Both sites use the same Express API and XAMPP MySQL/MariaDB database (`fresh_drink`). Import `database/schema.sql` in phpMyAdmin when first setting up; it creates the admin tables and user dispense request tables without adding demo machines or activity. Database connection settings are in `.env.example`.

## Google sign-in and Gmail

Copy `.env.example` to `.env`. Set `googleId`, `googleSecret`, and `callbackURL` from your Google OAuth web client. Keep `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, and `VITE_GOOGLE_CLIENT_ID` in sync if you use the compatibility aliases. Set a long random `SESSION_SECRET`, and add Admin account addresses to `ADMIN_EMAILS` (comma-separated). Add authorized JavaScript origins `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`, and `http://localhost:3003` in Google Cloud Console, and add `http://localhost:3001/api/auth/google/callback` as an authorized redirect URI. Admin access is limited to the allowlist; other verified Google accounts receive the User role. Accounts are stored in `app_users`.

Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` to a Gmail account and its Google App Password to enable email. New system alerts go to the Admin allowlist and users who have used that machine. User dispense requests and device-reported results go to the account email. Missing SMTP settings skip email delivery.

If the database already exists, run `CREATE TABLE IF NOT EXISTS app_users (id CHAR(36) PRIMARY KEY, google_sub VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(320) NOT NULL UNIQUE, name VARCHAR(160) NOT NULL, picture TEXT NULL, role ENUM('user','admin') NOT NULL DEFAULT 'user', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, last_login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);` in phpMyAdmin.

## Develop locally

1. Start Apache/MySQL in XAMPP.
2. Run `npm install` in this folder once if dependencies are not installed yet.
3. In this folder, run `npm run server` to start the shared API at `http://localhost:3001`.
4. In a second terminal run `npm run dev` for the admin site at `http://localhost:3000`.
5. In a third terminal run `npm --prefix "fresh-drink-(user-app)" run dev` for the user site at `http://localhost:3002`.
6. Add the real RO machines in the admin site's Machines page. The User site and `fresh-drink` app will list the same machines.
7. To run the separate designed `fresh-drink` UI too, start `npm run dev` from the sibling `../fresh-drink` folder. It runs on `http://localhost:3003` and uses this same API.

## Build and serve both sites

Run `npm run build`, then `npm --prefix "fresh-drink-(user-app)" run build`, then `npm start`. The shared server serves the admin at `http://localhost:3001` and the user site at `http://localhost:3001/user/`.

User dispense requests are written to `dispense_records` and shown on the admin dashboard. They remain `requested` until a connected machine controller reports the result. Only `completed` requests contribute to admin usage totals. Telemetry is shared through the admin API; the user site only shows measurements that have actually been submitted.

After a dispenser controller verifies a request, it can report the outcome to `PATCH /api/dispense-records/:id/status` with `{"status":"completed"}` or `{"status":"failed"}`. Do not mark a request completed before the machine confirms water was dispensed.

The API listens on localhost by default. API routes require a signed, HTTP-only Google session. Keep `SESSION_SECRET` private and use HTTPS outside local development. See `fresh-drink-(user-app)/README.md` and `../fresh-drink/README.md` for frontend details.
