// Creates (or resets the password of) the admin from ADMIN_USERNAME / ADMIN_PASSWORD in .env
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  try {
    const username = (process.env.ADMIN_USERNAME || 'admin').trim();
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error('ADMIN_PASSWORD is missing in server/.env');
    const email = process.env.ADMIN_EMAIL || `${username}@admin.local`;

    // Older databases were created without a username column
    const [cols] = pool.dialect === 'mysql' ? await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'username'`
    ) : [[true]];
    if (!cols.length) {
      await pool.query('ALTER TABLE admins ADD COLUMN username VARCHAR(60) NULL UNIQUE AFTER name');
    }

    const hash = await bcrypt.hash(password, 10);
    const [existing] = await pool.query('SELECT id FROM admins WHERE username = ? OR email = ? LIMIT 1', [username, email]);
    if (existing[0]) {
      await pool.query('UPDATE admins SET username = ?, password_hash = ?, is_active = 1 WHERE id = ?', [username, hash, existing[0].id]);
    } else {
      await pool.query(
        `INSERT INTO admins (name, username, email, password_hash, role) VALUES (?, ?, ?, ?, 'superadmin')`,
        ['Super Admin', username, email, hash]
      );
    }
    console.log(`Admin ready: ${username}`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
