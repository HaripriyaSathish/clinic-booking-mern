const pool = require('../config/db');

// Editable text fields (image is handled separately via Cloudinary)
const FIELDS = [
  'badge_text', 'title', 'highlight_word', 'subtitle',
  'primary_btn_text', 'secondary_btn_text', 'secondary_btn_link',
  'info_title', 'info_text',
];

const get = async () => {
  const [rows] = await pool.query('SELECT * FROM hero_section ORDER BY id LIMIT 1');
  return rows[0] || null;
};

// hero_section is a single-row table: update the row if it exists, else create it
const save = async (data) => {
  const current = await get();
  if (current) await pool.query('UPDATE hero_section SET ? WHERE id = ?', [data, current.id]);
  else await pool.query('INSERT INTO hero_section SET ?', [data]);
  return get();
};

module.exports = { FIELDS, get, save };
