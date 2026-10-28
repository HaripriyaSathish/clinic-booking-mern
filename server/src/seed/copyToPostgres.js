// One-time copy of the local MySQL database (DB_* in .env) into Postgres (e.g. Neon).
// Usage: PG_URL="postgresql://..." npm run db:copy-to-postgres [-- --reset]
// Creates the tables from database/postgres_schema.sql, copies every row (ids kept),
// then moves each id sequence past the copied ids. --reset drops existing tables first.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { Client } = require('pg');

// Parents before children so foreign keys are satisfied
const TABLES = [
  'admins', 'site_settings', 'hero_section', 'section_content', 'stats', 'about_section',
  'departments', 'doctors', 'doctor_schedules', 'doctor_leaves', 'clinic_timings', 'services',
  'testimonials', 'faqs', 'gallery', 'appointments', 'contact_messages', 'subscribers',
];
const reset = process.argv.includes('--reset');

(async () => {
  if (!process.env.PG_URL) throw new Error('Set PG_URL to the Postgres connection string');
  const my = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true,
  });
  const pg = new Client({ connectionString: process.env.PG_URL, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  try {
    const { rows: existing } = await pg.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [TABLES]
    );
    if (existing.length && !reset) {
      throw new Error(`Postgres already has tables (${existing.map((t) => t.table_name).join(', ')}). Re-run with --reset to replace them.`);
    }

    await pg.query('BEGIN');
    if (reset) await pg.query(`DROP TABLE IF EXISTS ${TABLES.join(', ')} CASCADE`);
    await pg.query(fs.readFileSync(path.join(__dirname, '../../database/postgres_schema.sql'), 'utf8'));

    const [myTables] = await my.query('SHOW TABLES');
    const have = new Set(myTables.map((r) => Object.values(r)[0]));

    for (const table of TABLES) {
      if (!have.has(table)) {
        console.log(`${table.padEnd(18)} not in MySQL, left empty`);
        continue;
      }
      const { rows: pgCols } = await pg.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );
      const [rows] = await my.query(`SELECT * FROM \`${table}\``);
      const cols = rows.length ? Object.keys(rows[0]).filter((c) => pgCols.some((p) => p.column_name === c)) : [];

      for (const row of rows) {
        const values = cols.map((c) => (row[c] === '0000-00-00 00:00:00' || row[c] === '0000-00-00' ? null : row[c]));
        await pg.query(
          `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})`,
          values
        );
      }
      if (pgCols.some((p) => p.column_name === 'id')) {
        await pg.query(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`
        );
      }
      console.log(`${table.padEnd(18)} ${rows.length} rows`);
    }
    await pg.query('COMMIT');
    console.log('Done.');
  } catch (err) {
    await pg.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await my.end();
    await pg.end();
  }
})().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
