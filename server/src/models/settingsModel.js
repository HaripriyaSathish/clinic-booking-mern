const pool = require('../config/db');

const FIELDS = [
  'clinic_name', 'tagline', 'phone', 'emergency_phone', 'email', 'whatsapp', 'address',
  'map_embed_url', 'facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'footer_text',
];

const get = async () => {
  const [rows] = await pool.query('SELECT * FROM site_settings ORDER BY id LIMIT 1');
  return rows[0] || null;
};

// site_settings is a single-row table
const save = async (data) => {
  const current = await get();
  if (current) await pool.query('UPDATE site_settings SET ? WHERE id = ?', [data, current.id]);
  else await pool.query('INSERT INTO site_settings SET ?', [data]);
  return get();
};

module.exports = { FIELDS, get, save };
