# Fresh Drink User App

The user site shares machines, alerts, telemetry, and dispense requests with the admin site through the admin Express API and the same `fresh_drink` MySQL database. It does not maintain a separate database or sample records.

## Local development

1. Start XAMPP MySQL and make sure the admin API's `.env` settings point to it.
2. If dependencies are not installed, run `npm install` in the workspace root.
3. In the workspace root, start the admin API with `npm run server`.
4. In this folder, run `npm run dev` and open `http://localhost:3002`.
5. Add machines from the admin site's Machines page; they will appear in the user site.

The Vite development server proxies `/api` requests to the admin API on port 3001. To serve both built sites from one API server, build both projects and run `npm start` in the workspace root. Admin opens at `http://localhost:3001`; user app opens at `http://localhost:3001/user/`.

Water requests are stored as `requested` records and appear on the admin dashboard. They are not counted as dispensed water until a dispenser controller reports `completed`. Sensor cards only show pressure and purity values received through the admin telemetry API; unsupported TDS, pH, turbidity, and temperature values are not fabricated.

The browser stores an anonymous user key to scope local user history. This is not account authentication. Keep the API on localhost until proper user authentication and device access controls are added.
