const pool = require('../config/db');

const one = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows[0];
};

// Numbers, 14-day trend and recent bookings for the admin dashboard
exports.stats = async (req, res, next) => {
  try {
    const [counts, team, unread, trend, byStatus, topDepartments, recent] = await Promise.all([
      one(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN appointment_date = CURRENT_DATE THEN 1 ELSE 0 END) AS today,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN appointment_date >= CURRENT_DATE AND status IN ('Pending','Confirmed') THEN 1 ELSE 0 END) AS upcoming,
                SUM(CASE WHEN CAST(created_at AS DATE) >= CURRENT_DATE - INTERVAL '6' DAY THEN 1 ELSE 0 END) AS this_week
         FROM appointments`
      ),
      one(
        `SELECT (SELECT COUNT(*) FROM doctors WHERE is_active = 1) AS doctors,
                (SELECT COUNT(*) FROM departments WHERE is_active = 1) AS departments`
      ),
      one('SELECT COUNT(*) AS unread FROM contact_messages WHERE is_read = 0'),
      pool.query(
        `SELECT CAST(created_at AS DATE) AS day, COUNT(*) AS count
         FROM appointments
         WHERE created_at >= CURRENT_DATE - INTERVAL '13' DAY
         GROUP BY CAST(created_at AS DATE)`
      ).then(([rows]) => rows),
      pool.query('SELECT status, COUNT(*) AS count FROM appointments GROUP BY status').then(([rows]) => rows),
      pool.query(
        `SELECT dep.name, COUNT(*) AS count
         FROM appointments a JOIN departments dep ON dep.id = a.department_id
         GROUP BY dep.id, dep.name ORDER BY count DESC LIMIT 5`
      ).then(([rows]) => rows),
      pool.query(
        `SELECT a.id, a.booking_ref, a.patient_name, a.phone, a.appointment_date, a.appointment_time,
                a.status, a.created_at, doc.name AS doctor_name, dep.name AS department_name
         FROM appointments a
         LEFT JOIN doctors doc ON doc.id = a.doctor_id
         LEFT JOIN departments dep ON dep.id = a.department_id
         ORDER BY a.created_at DESC LIMIT 6`
      ).then(([rows]) => rows),
    ]);

    // Fill missing days so the chart always has 14 bars
    const byDay = Object.fromEntries(trend.map((t) => [t.day, Number(t.count)]));
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { day: key, count: byDay[key] || 0 };
    });

    const num = (v) => Number(v) || 0;
    res.json({
      totals: {
        appointments: num(counts.total),
        today: num(counts.today),
        pending: num(counts.pending),
        upcoming: num(counts.upcoming),
        thisWeek: num(counts.this_week),
        doctors: num(team.doctors),
        departments: num(team.departments),
        unreadMessages: num(unread.unread),
      },
      trend: days,
      byStatus: byStatus.map((s) => ({ status: s.status, count: num(s.count) })),
      topDepartments: topDepartments.map((d) => ({ name: d.name, count: num(d.count) })),
      recent,
    });
  } catch (err) {
    next(err);
  }
};
