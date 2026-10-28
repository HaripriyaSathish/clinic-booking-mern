import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { bookAppointment, getDepartments, getDoctors } from '../../api/publicApi';
import { ArrowRightIcon, CalendarIcon, CheckIcon, ClockIcon } from '../common/Icons';
import { formatSchedule, shortTime, weekdayOf } from '../../utils/formatDate';

const MAX_DAYS_AHEAD = 90;

const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

// Strict rules — mirror server/src/controllers/appointmentController.js
const rules = {
  patient_name: {
    required: 'Full name is required',
    minLength: { value: 3, message: 'Name must be at least 3 characters' },
    maxLength: { value: 60, message: 'Name must be under 60 characters' },
    pattern: { value: /^[A-Za-z][A-Za-z .']*$/, message: 'Use letters, spaces, dots and apostrophes only' },
  },
  phone: {
    required: 'Mobile number is required',
    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
  },
  email: {
    maxLength: { value: 150, message: 'Email is too long' },
    pattern: { value: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, message: 'Enter a valid email address' },
  },
  age: {
    required: 'Age is required',
    pattern: { value: /^\d{1,3}$/, message: 'Age must be a number' },
    validate: (v) => (Number(v) >= 0 && Number(v) <= 120) || 'Age must be between 0 and 120',
  },
  gender: { required: 'Please select gender' },
  appointment_date: {
    required: 'Preferred date is required',
    validate: (v) => {
      if (v < localDate()) return 'Date cannot be in the past';
      if (v > localDate(addDays(MAX_DAYS_AHEAD))) return `Choose a date within ${MAX_DAYS_AHEAD} days`;
      return true;
    },
  },
  appointment_time: {
    pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Enter a valid time' },
  },
  message: { maxLength: { value: 500, message: 'Message must be under 500 characters' } },
};

// Block invalid keystrokes before they reach the field…
const blockChars = (allowed) => (e) => {
  // single keystrokes only — multi-character input (paste) is cleaned in onChange instead
  if (e.data && e.data.length === 1 && !allowed.test(e.data)) e.preventDefault();
};
const onlyDigitKeys = blockChars(/^\d+$/);
const onlyNameKeys = blockChars(/^[A-Za-z .']+$/);

// …and clean anything pasted or autofilled (only rewrites when something actually changed)
const digitsOnly = (max) => (e) => {
  const clean = e.target.value.replace(/\D/g, '').slice(0, max);
  if (clean !== e.target.value) e.target.value = clean;
};
const lettersOnly = (e) => {
  const clean = e.target.value.replace(/[^A-Za-z .']/g, '').replace(/\s{2,}/g, ' ');
  if (clean !== e.target.value) e.target.value = clean;
};

const Field = ({ label, required, error, children, className = '' }) => (
  <label className={`field ${error ? 'field--error' : ''} ${className}`}>
    <span className="field__label">{label}{required && <i aria-hidden="true">*</i>}</span>
    {children}
    <AnimatePresence>
      {error && (
        <motion.span
          className="field__error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="alert"
        >
          {error.message}
        </motion.span>
      )}
    </AnimatePresence>
  </label>
);

export default function AppointmentForm({ prefill = {}, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);

  const {
    register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      patient_name: '', phone: '', email: '', age: '', gender: '',
      department_id: prefill.department_id ? String(prefill.department_id) : '',
      doctor_id: prefill.doctor_id ? String(prefill.doctor_id) : '',
      appointment_date: '', appointment_time: '', visit_type: 'New', message: '',
    },
  });

  useEffect(() => {
    getDepartments().then((r) => setDepartments(r.data)).catch(() => {});
    getDoctors().then((r) => setDoctors(r.data)).catch(() => {});
  }, []);

  const departmentId = watch('department_id');
  const doctorId = watch('doctor_id');
  const appointmentDate = watch('appointment_date');
  const messageLength = (watch('message') || '').length;

  // Options load after the form mounts — re-apply the prefill so the selects show it
  useEffect(() => {
    if (departments.length && prefill.department_id) setValue('department_id', String(prefill.department_id));
  }, [departments, prefill.department_id, setValue]);
  useEffect(() => {
    if (doctors.length && prefill.doctor_id) setValue('doctor_id', String(prefill.doctor_id));
  }, [doctors, prefill.doctor_id, setValue]);

  const filteredDoctors = useMemo(
    () => (departmentId ? doctors.filter((d) => String(d.department_id) === departmentId) : doctors),
    [doctors, departmentId]
  );

  const selectedDoctor = useMemo(() => doctors.find((d) => String(d.id) === doctorId), [doctors, doctorId]);
  const doctorSlots = selectedDoctor?.schedules || [];
  const doctorDays = [...new Set(doctorSlots.map((s) => s.day_of_week))];

  // Clear the doctor if they don't belong to the newly chosen department
  useEffect(() => {
    if (!doctors.length) return;
    if (doctorId && !filteredDoctors.some((d) => String(d.id) === doctorId)) setValue('doctor_id', '');
  }, [doctors, filteredDoctors, doctorId, setValue]);

  // Picking a doctor fills in their department, and re-checks the chosen date/time against their schedule
  useEffect(() => {
    if (selectedDoctor?.department_id && String(selectedDoctor.department_id) !== departmentId) {
      setValue('department_id', String(selectedDoctor.department_id));
    }
    if (getValues('appointment_date')) trigger(['appointment_date', 'appointment_time']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor]);

  const validateDoctorDay = (date) => {
    if (!date || !doctorSlots.length) return true;
    return doctorDays.includes(weekdayOf(date)) || `${selectedDoctor.name} is available on ${doctorDays.join(', ')} only`;
  };

  const validateDoctorTime = (time) => {
    const date = getValues('appointment_date');
    if (!time || !date || !doctorSlots.length) return true;
    const slots = doctorSlots.filter((s) => s.day_of_week === weekdayOf(date));
    if (!slots.length) return true; // the date field already shows the day error
    return slots.some((s) => time >= s.start_time.slice(0, 5) && time < s.end_time.slice(0, 5))
      || `Available ${slots.map((s) => `${shortTime(s.start_time)}–${shortTime(s.end_time)}`).join(', ')} on this day`;
  };

  const slotsForDate = appointmentDate ? doctorSlots.filter((s) => s.day_of_week === weekdayOf(appointmentDate)) : [];

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { data } = await bookAppointment({ ...values, patient_name: values.patient_name.trim() });
      setResult({ ref: data.booking_ref, email: values.email, name: values.patient_name.trim() });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not send your request. Please try again.');
    }
  };

  if (result) {
    return (
      <motion.div
        className="booking-success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="booking-success__icon"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
        >
          <CheckIcon size={34} />
        </motion.span>
        <h3>Thank you, {result.name}!</h3>
        <p>Your appointment request has been received. Our team will call you shortly to confirm the time.</p>
        <div className="booking-success__ref">Booking reference <strong>{result.ref}</strong></div>
        {result.email && <p className="booking-success__note">A copy has been sent to {result.email}.</p>}
        <button type="button" className="btn btn--primary" onClick={onClose}>Done</button>
      </motion.div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="booking-form__head">
        <span className="booking-form__icon"><CalendarIcon size={22} /></span>
        <div>
          <span className="section-title__eyebrow">Appointment request</span>
          <h3>Book an Appointment</h3>
        </div>
      </div>

      <div className="booking-form__grid">
        <Field label="Full name" required error={errors.patient_name}>
          <input
            type="text"
            autoComplete="name"
            maxLength={60}
            placeholder="e.g. Priya Sharma"
            onBeforeInput={onlyNameKeys}
            {...register('patient_name', { ...rules.patient_name, onChange: lettersOnly })}
          />
        </Field>

        <Field label="Mobile number" required error={errors.phone}>
          <div className="field__prefix">
            <span>+91</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile"
              onBeforeInput={onlyDigitKeys}
              {...register('phone', { ...rules.phone, onChange: digitsOnly(10) })}
            />
          </div>
        </Field>

        <Field label="Email (optional)" error={errors.email}>
          <input type="email" autoComplete="email" maxLength={150} placeholder="you@example.com" {...register('email', rules.email)} />
        </Field>

        <div className="booking-form__pair">
          <Field label="Age" required error={errors.age}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Age"
              onBeforeInput={onlyDigitKeys}
              {...register('age', { ...rules.age, onChange: digitsOnly(3) })}
            />
          </Field>
          <Field label="Gender" required error={errors.gender}>
            <select {...register('gender', rules.gender)}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>
        </div>

        <Field label="Department" error={errors.department_id}>
          <select {...register('department_id')}>
            <option value="">Any department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>

        <Field label="Doctor" error={errors.doctor_id}>
          <select {...register('doctor_id')} disabled={!filteredDoctors.length}>
            <option value="">{filteredDoctors.length ? 'Any available doctor' : 'No doctors listed yet'}</option>
            {filteredDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>

        <AnimatePresence>
          {doctorSlots.length > 0 && (
            <motion.div
              className="booking-form__availability field--full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span><ClockIcon size={16} /> {selectedDoctor.name} is available:</span>
              <ul>
                {doctorSlots.map((s) => <li key={s.id}>{formatSchedule(s)}</li>)}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <Field label="Preferred date" required error={errors.appointment_date}>
          <input
            type="date"
            min={localDate()}
            max={localDate(addDays(MAX_DAYS_AHEAD))}
            {...register('appointment_date', {
              ...rules.appointment_date,
              validate: { range: rules.appointment_date.validate, doctorDay: validateDoctorDay },
              onChange: () => getValues('appointment_time') && trigger('appointment_time'),
            })}
          />
        </Field>

        <Field label="Preferred time" error={errors.appointment_time}>
          <input
            type="time"
            min={slotsForDate[0]?.start_time.slice(0, 5)}
            max={slotsForDate[slotsForDate.length - 1]?.end_time.slice(0, 5)}
            {...register('appointment_time', { ...rules.appointment_time, validate: validateDoctorTime })}
          />
        </Field>

        <div className="field field--full">
          <span className="field__label">Visit type</span>
          <div className="segmented">
            {['New', 'Follow-up'].map((v) => (
              <label key={v} className="segmented__option">
                <input type="radio" value={v} {...register('visit_type')} />
                <span>{v === 'New' ? 'New visit' : 'Follow-up'}</span>
              </label>
            ))}
          </div>
        </div>

        <Field label="Reason for visit (optional)" error={errors.message} className="field--full">
          <textarea rows={3} maxLength={500} placeholder="Briefly describe your symptoms or concern" {...register('message', rules.message)} />
          <span className="field__count">{messageLength}/500</span>
        </Field>
      </div>

      <AnimatePresence>
        {serverError && (
          <motion.p className="booking-form__error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert">
            {serverError}
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" className="btn btn--primary booking-form__submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : <>Request Appointment <ArrowRightIcon size={18} /></>}
      </button>
    </form>
  );
}
