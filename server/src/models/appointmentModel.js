const pool = require('../config/db');
const generateBookingRef = require('../utils/generateBookingRef');

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT a.*, dep.name AS department_name, doc.name AS doctor_name
     FROM appointments a
     LEFT JOIN departments dep ON dep.id = a.department_id
     LEFT JOIN doctors doc ON doc.id = a.doctor_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Inserts with a fresh booking_ref, retrying if the random ref happens to collide
const create = async (data, refPrefix) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const [result] = await pool.query('INSERT INTO appointments SET ?', [
        { ...data, booking_ref: generateBookingRef(refPrefix) },
      ]);
      return findById(result.insertId);
    } catch (err) {
      const refClash = err.code === 'ER_DUP_ENTRY' && /booking_ref/.test(err.sqlMessage || '');
      if (!refClash) throw err;
    }
  }
  throw new Error('Could not generate a booking reference, please try again');
};

module.exports = { findById, create };
