const { body } = require('express-validator');
const appointmentModel = require('../models/appointmentModel');
const settingsModel = require('../models/settingsModel');
const doctorModel = require('../models/doctorModel');
const { sendBookingEmails } = require('../services/mailService');

const MAX_DAYS_AHEAD = 90;

// YYYY-MM-DD in server local time
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// "Riverside Medical Center" -> "RMC" (used in booking refs)
const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'APT';

// Strict validation — mirrors the rules in client/src/components/booking/AppointmentForm.jsx
exports.rules = [
  body('patient_name')
    .trim()
    .notEmpty().withMessage('Full name is required').bail()
    .isLength({ min: 3, max: 60 }).withMessage('Name must be 3–60 characters').bail()
    .matches(/^[A-Za-z][A-Za-z .']*$/).withMessage('Name can contain only letters, spaces, dots and apostrophes'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Mobile number is required').bail()
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number (digits only)'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 150 }).withMessage('Email is too long').bail()
    .isEmail().withMessage('Enter a valid email address'),
  body('age')
    .notEmpty().withMessage('Age is required').bail()
    .matches(/^\d{1,3}$/).withMessage('Age must be a number').bail()
    .isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120')
    .toInt(),
  body('gender')
    .notEmpty().withMessage('Gender is required').bail()
    .isIn(['Male', 'Female', 'Other']).withMessage('Choose a valid gender'),
  body('department_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid department').toInt(),
  body('doctor_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid doctor').toInt(),
  body('appointment_date')
    .notEmpty().withMessage('Preferred date is required').bail()
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('Enter a valid date').bail()
    .custom((value) => {
      const max = new Date();
      max.setDate(max.getDate() + MAX_DAYS_AHEAD);
      if (value < localDate()) throw new Error('Date cannot be in the past');
      if (value > localDate(max)) throw new Error(`Date must be within the next ${MAX_DAYS_AHEAD} days`);
      return true;
    }),
  body('appointment_time')
    .optional({ values: 'falsy' })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Enter a valid time'),
  body('visit_type').optional({ values: 'falsy' }).isIn(['New', 'Follow-up']).withMessage('Invalid visit type'),
  body('message')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('Message must be under 500 characters'),
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// When a doctor is chosen: they must be active, and the date/time must fall in their weekly schedule
const checkDoctorAvailability = async (b) => {
  if (!b.doctor_id) return null;
  const doctor = await doctorModel.findById(b.doctor_id);
  if (!doctor || !doctor.is_active) return { error: 'Selected doctor is not available' };

  const schedules = doctor.schedules.filter((s) => s.is_active);
  if (schedules.length) {
    const [y, m, d] = b.appointment_date.split('-').map(Number);
    const day = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    const daySlots = schedules.filter((s) => s.day_of_week === day);
    if (!daySlots.length) {
      const days = [...new Set(schedules.map((s) => s.day_of_week))].join(', ');
      return { error: `${doctor.name} is available on ${days} only` };
    }
    if (b.appointment_time) {
      const t = b.appointment_time.slice(0, 5);
      const fits = daySlots.some((s) => t >= s.start_time.slice(0, 5) && t < s.end_time.slice(0, 5));
      if (!fits) {
        const hours = daySlots.map((s) => `${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`).join(', ');
        return { error: `On ${day}, ${doctor.name} is available ${hours}` };
      }
    }
  }
  return { doctor };
};

exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    const availability = await checkDoctorAvailability(b);
    if (availability?.error) return res.status(400).json({ message: availability.error });
    // Doctor always belongs to their own department
    if (availability?.doctor?.department_id) b.department_id = availability.doctor.department_id;

    const settings = await settingsModel.get();

    const appointment = await appointmentModel.create(
      {
        patient_name: b.patient_name,
        phone: b.phone,
        email: b.email || null,
        age: b.age,
        gender: b.gender,
        department_id: b.department_id || null,
        doctor_id: b.doctor_id || null,
        appointment_date: b.appointment_date,
        appointment_time: b.appointment_time || null,
        visit_type: b.visit_type || 'New',
        message: b.message || null,
      },
      initials(settings?.clinic_name)
    );

    // Emails go out in the background so the patient isn't kept waiting on SMTP
    sendBookingEmails(appointment, settings).catch((err) =>
      console.error('Booking email failed:', err.message)
    );

    res.status(201).json({
      message: 'Appointment request received',
      booking_ref: appointment.booking_ref,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That time slot was just booked. Please pick another time.' });
    }
    next(err);
  }
};
