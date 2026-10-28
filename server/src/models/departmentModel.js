const pool = require('../config/db');

const FIELDS = ['name', 'short_desc', 'description', 'icon', 'sort_order', 'is_active'];

const listActive = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, slug, short_desc, icon, image_url FROM departments WHERE is_active = 1 ORDER BY sort_order, name'
  );
  return rows;
};

const listAll = async () => {
  const [rows] = await pool.query('SELECT * FROM departments ORDER BY sort_order, name');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const [result] = await pool.query('INSERT INTO departments SET ?', [data]);
  return findById(result.insertId);
};

const update = async (id, data) => {
  await pool.query('UPDATE departments SET ? WHERE id = ?', [data, id]);
  return findById(id);
};

const remove = (id) => pool.query('DELETE FROM departments WHERE id = ?', [id]);

module.exports = { FIELDS, listActive, listAll, findById, create, update, remove };
