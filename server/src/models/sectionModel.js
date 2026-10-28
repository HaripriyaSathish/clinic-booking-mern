const pool = require('../config/db');

// Heading block (eyebrow / title / description) for each landing page section, keyed by section name
const FIELDS = ['eyebrow', 'title', 'description'];

const getAll = async () => {
  const [rows] = await pool.query('SELECT section_key, eyebrow, title, description FROM section_content');
  return Object.fromEntries(rows.map(({ section_key, ...rest }) => [section_key, rest]));
};

const get = async (key) => {
  const [rows] = await pool.query('SELECT * FROM section_content WHERE section_key = ?', [key]);
  return rows[0] || null;
};

const save = async (key, data) => {
  await pool.query(
    'INSERT INTO section_content SET ? ON DUPLICATE KEY UPDATE ?',
    [{ section_key: key, ...data }, data]
  );
  return get(key);
};

module.exports = { FIELDS, getAll, get, save };
