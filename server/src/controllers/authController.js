const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = 1 LIMIT 1',
      [username, username]
    );
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    res.json({
      token,
      admin: { id: admin.id, name: admin.name, username: admin.username, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
};
