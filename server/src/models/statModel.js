const pool = require('../config/db');

const FIELDS = ['label', 'value', 'suffix', 'icon', 'sort_order', 'is_active'];

const listActive = async () => {
  const [rows] = await pool.query(
    'SELECT id, label, value, suffix, icon FROM stats WHERE is_active = 1 ORDER BY sort_order, id'
  );
  return rows;
};

const listAll = async () => {
  const [rows] = await pool.query('SELECT * FROM stats ORDER BY sort_order, id');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM stats WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const [result] = await pool.query('INSERT INTO stats SET ?', [data]);
  return findById(result.insertId);
};

const update = async (id, data) => {
  await pool.query('UPDATE stats SET ? WHERE id = ?', [data, id]);
  return findById(id);
};

const remove = (id) => pool.query('DELETE FROM stats WHERE id = ?', [id]);

module.exports = { FIELDS, listActive, listAll, findById, create, update, remove };
