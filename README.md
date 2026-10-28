# Clinic Booking Website

React + Vite | Node.js + Express | MySQL | Cloudinary | Admin Panel

## First-time setup
1. Run `server/database/clinic_booking_schema.sql` in MySQL Workbench.
2. Fill `server/.env` (DB, JWT, Cloudinary, SMTP). Admin login comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
3. From this folder:
   ```
   npm run install:all   # root + server + client dependencies
   npm run seed          # admin user + website content (exact wording from the design)
   npm run dev           # starts the API (5000) and the website (5173) together
   ```

- Website: http://localhost:5173
- Admin:   http://localhost:5173/admin

`npm run seed` only fills missing content, so it never overwrites admin edits.
To restore the original design copy: `npm run seed:content --prefix server -- --reset`.

## Booking emails
The Book Appointment form emails the clinic (Admin → Navbar & Site Settings → Clinic email) and,
if the patient entered an email, sends them a confirmation. Set `SMTP_USER` and `SMTP_PASS` in
`server/.env` (for Gmail use an App Password). Without them bookings are still saved, but no email is sent.
