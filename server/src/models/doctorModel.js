const pool = require('../config/db');

const FIELDS = [
  'department_id', 'name', 'designation', 'qualification', 'experience_years', 'bio',
  'consultation_fee', 'languages', 'is_featured', 'sort_order', 'is_active',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BASE_SELECT = `
  SELECT d.*, dep.name AS department_name, dep.slug AS department_slug
  FROM doctors d
  LEFT JOIN departments dep ON dep.id = d.department_id`;

// Attach each doctor's weekly schedule as `schedules: [{ day_of_week, start_time, end_time }]`
const withSchedules = async (doctors, { activeOnly = true } = {}) => {
  if (!doctors.length) return doctors;
  const [rows] = await pool.query(
    `SELECT id, doctor_id, day_of_week, start_time, end_time, slot_minutes, max_patients, is_active
     FROM doctor_schedules
     WHERE doctor_id IN (?) ${activeOnly ? 'AND is_active = 1' : ''}
     ORDER BY CASE day_of_week ${DAYS.map((d, i) => `WHEN '${d}' THEN ${i}`).join(' ')} END, start_time`,
    [doctors.map((d) => d.id)]
  );
  return doctors.map((d) => ({ ...d, schedules: rows.filter((r) => r.doctor_id === d.id) }));
};

// Strip Cloudinary ids for the public site
const publicShape = ({ photo_public_id, ...rest }) => rest;

const listActive = async () => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE d.is_active = 1 ORDER BY d.sort_order, d.name`);
  return (await withSchedules(rows)).map(publicShape);
};

// Homepage cards: featured doctors first; falls back to the first active ones if none are featured
const listFeatured = async (limit = 4) => {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE d.is_active = 1 ORDER BY d.is_featured DESC, d.sort_order, d.name LIMIT ?`,
    [limit]
  );
  return rows.map(publicShape);
};

const listAll = async () => {
  const [rows] = await pool.query(`${BASE_SELECT} ORDER BY d.sort_order, d.name`);
  return withSchedules(rows, { activeOnly: false });
};

const findById = async (id) => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE d.id = ?`, [id]);
  if (!rows[0]) return null;
  return (await withSchedules(rows, { activeOnly: false }))[0];
};

const create = async (data) => {
  const [result] = await pool.query('INSERT INTO doctors SET ?', [data]);
  return result.insertId;
};

const update = (id, data) => pool.query('UPDATE doctors SET ? WHERE id = ?', [data, id]);

const remove = (id) => pool.query('DELETE FROM doctors WHERE id = ?', [id]);

const slugExists = async (slug, exceptId = 0) => {
  const [rows] = await pool.query('SELECT id FROM doctors WHERE slug = ? AND id <> ?', [slug, exceptId]);
  return rows.length > 0;
};

// Replaces the doctor's whole weekly schedule in one transaction
const setSchedules = async (doctorId, schedules) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM doctor_schedules WHERE doctor_id = ?', [doctorId]);
    for (const s of schedules) {
      await conn.query('INSERT INTO doctor_schedules SET ?', [{
        doctor_id: doctorId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      }]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  FIELDS, DAYS, listActive, listFeatured, listAll, findById, create, update, remove, slugExists, setSchedules,
};
