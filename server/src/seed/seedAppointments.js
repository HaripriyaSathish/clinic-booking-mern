// Sample appointments so the admin dashboard has something to show.
//   npm run seed:appointments            -> adds samples only if none exist yet
//   npm run seed:appointments -- --reset -> replaces the samples (real bookings are never touched)
// Samples are marked with admin_notes = SAMPLE_NOTE so they can be found and removed later.
require('dotenv').config();
const pool = require('../config/db');

const SAMPLE_NOTE = 'Sample appointment (seed data)';
const reset = process.argv.includes('--reset');

const PATIENTS = [
  ['Karthik Subramanian', 'Male', 42], ['Priya Venkatesh', 'Female', 34], ['Arun Kumar', 'Male', 58],
  ['Meenakshi Iyer', 'Female', 29], ['Rajesh Nair', 'Male', 47], ['Deepa Krishnan', 'Female', 38],
  ['Sanjay Reddy', 'Male', 63], ['Anitha Raman', 'Female', 52], ['Vignesh Murali', 'Male', 26],
  ['Lakshmi Prasad', 'Female', 45], ['Harish Gowda', 'Male', 36], ['Kavya Menon', 'Female', 8],
  ['Suresh Babu', 'Male', 69], ['Divya Shankar', 'Female', 31], ['Naveen Pillai', 'Male', 54],
  ['Revathi Sundaram', 'Female', 41], ['Ashwin Rao', 'Male', 5], ['Sowmya Hegde', 'Female', 27],
  ['Ganesh Iyengar', 'Male', 60], ['Nithya Varghese', 'Female', 33], ['Pradeep Chandran', 'Male', 49],
  ['Janani Selvam', 'Female', 23], ['Mohan Raj', 'Male', 71], ['Shalini Jayaram', 'Female', 39],
];

const REASONS = [
  'Chest discomfort while climbing stairs', 'Follow-up after blood test results', 'Recurring headaches for two weeks',
  'Knee pain while walking', 'Skin rash on arms', 'Routine annual health check-up', 'Child has fever and cough',
  'Blood sugar review', 'Lower back pain', 'Vaccination for child', 'Hair fall consultation', 'Dizziness in the mornings',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pick = (arr, i) => arr[i % arr.length];

(async () => {
  try {
    const [[{ samples }]] = await pool.query('SELECT COUNT(*) AS samples FROM appointments WHERE admin_notes = ?', [SAMPLE_NOTE]);
    if (samples && !reset) {
      console.log(`appointments:  already seeded (${samples} samples)`);
      return;
    }
    if (reset) await pool.query('DELETE FROM appointments WHERE admin_notes = ?', [SAMPLE_NOTE]);

    const [doctors] = await pool.query('SELECT id, department_id FROM doctors WHERE is_active = 1 ORDER BY sort_order');
    const [schedules] = await pool.query('SELECT doctor_id, day_of_week, start_time, end_time FROM doctor_schedules WHERE is_active = 1');
    if (!doctors.length) throw new Error('Seed doctors first (npm run seed:content)');

    const used = new Set(); // doctor|date|time — respects the no-double-booking key
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let created = 0;

    for (let i = 0; i < PATIENTS.length; i += 1) {
      const doctor = pick(doctors, i * 5 + 1);
      const slots = schedules.filter((s) => s.doctor_id === doctor.id);

      // Spread bookings from 12 days ago to 9 days ahead, landing on a day the doctor works
      let date = new Date(today);
      date.setDate(today.getDate() - 12 + Math.round((i / PATIENTS.length) * 21));
      let slot;
      for (let tries = 0; tries < 7; tries += 1) {
        slot = slots.find((s) => s.day_of_week === DAY_NAMES[date.getDay()]);
        if (slot || !slots.length) break;
        date.setDate(date.getDate() + 1);
      }

      // 30-minute steps inside the doctor's hours
      let time = null;
      if (slot) {
        const [sh, sm] = slot.start_time.split(':').map(Number);
        const [eh, em] = slot.end_time.split(':').map(Number);
        const steps = Math.max(1, Math.floor((eh * 60 + em - (sh * 60 + sm)) / 30));
        for (let k = 0; k < steps; k += 1) {
          const mins = sh * 60 + sm + ((i + k) % steps) * 30;
          const candidate = `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}:00`;
          if (!used.has(`${doctor.id}|${ymd(date)}|${candidate}`)) { time = candidate; break; }
        }
      }
      used.add(`${doctor.id}|${ymd(date)}|${time}`);

      const isPast = date < today;
      const isToday = ymd(date) === ymd(today);
      const status = isPast
        ? pick(['Completed', 'Completed', 'Completed', 'No-show', 'Cancelled'], i)
        : isToday ? pick(['Confirmed', 'Pending'], i) : pick(['Pending', 'Confirmed', 'Pending'], i);

      // Booked 1–4 days before the visit, never in the future
      const createdAt = new Date(date);
      createdAt.setDate(createdAt.getDate() - (1 + (i % 4)));
      if (createdAt > new Date()) createdAt.setTime(Date.now() - (i + 1) * 3600 * 1000);
      createdAt.setHours(9 + (i % 9), (i * 13) % 60, 0, 0);
      if (createdAt > new Date()) createdAt.setTime(Date.now() - (i + 1) * 600 * 1000);

      const [name, gender, age] = PATIENTS[i];
      const ref = `RMC-${ymd(createdAt).replace(/-/g, '')}-${String(1000 + i * 37).slice(-4)}`;
      await pool.query('INSERT INTO appointments SET ?', [{
        booking_ref: ref,
        patient_name: name,
        phone: `9${String(840000000 + i * 1234567).slice(0, 9)}`,
        email: i % 3 === 0 ? `${name.split(' ')[0].toLowerCase()}@example.com` : null,
        age,
        gender,
        department_id: doctor.department_id,
        doctor_id: doctor.id,
        appointment_date: ymd(date),
        appointment_time: time,
        visit_type: i % 4 === 0 ? 'Follow-up' : 'New',
        message: pick(REASONS, i),
        status,
        admin_notes: SAMPLE_NOTE,
        created_at: createdAt,
      }]);
      created += 1;
    }
    console.log(`appointments:  created ${created} samples`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
