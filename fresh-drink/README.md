# Fresh Drink user app

This UI uses the shared MySQL API from `fresh-drink-admin---smart-ro-system`. User sign-in, dispenser data, dispense requests, history, and notifications are served by that API instead of browser mock data.

## Run locally

1. Copy `fresh-drink-admin---smart-ro-system/.env.example` to `.env` in that backend folder. Configure the database, `googleId`, `googleSecret`, `callbackURL`, a long random `SESSION_SECRET`, your admin email allowlist, and Gmail App Password.
2. In Google Cloud Console, add `http://localhost:3000` and `http://localhost:3003` as authorized JavaScript origins, and add `http://localhost:3001/api/auth/google/callback` as an authorized redirect URI.
3. Copy this folder's `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID` or `VITE_googleId` to the same Google OAuth client ID. Restart Vite after changing it.
4. Import `fresh-drink-admin---smart-ro-system/database/schema.sql` into MySQL. For an existing database, add the `app_users` table as described in the backend README.
5. Start the backend in one terminal: `cd fresh-drink-admin---smart-ro-system; npm run server`.
6. Start this UI in another terminal: `cd fresh-drink; npm run dev` and open `http://localhost:3003`.

The Admin UI uses port `3000`, this Fresh Drink UI uses `3003`, and the shared API uses `3001`. The separate integrated User app uses `3002` if you also need it.

Email delivery is configured on the backend only. Admins and users who have used the affected machine receive system alert emails; users receive email when they submit a dispense request and when the device reports its result. Dispense and Auto Flush requests remain pending until a connected controller updates their status.
