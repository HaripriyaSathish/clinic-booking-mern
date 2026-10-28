// mailService — nodemailer booking emails (clinic notification + patient acknowledgement)
const nodemailer = require('nodemailer');

let transporter;
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const escapeHtml = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const formatTime = (t) => {
  if (!t) return 'Any time';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

const row = (label, value) =>
  value
    ? `<tr><td style="padding:8px 0;color:#5f6b66;width:160px;vertical-align:top">${label}</td>
       <td style="padding:8px 0;color:#0e3b2e;font-weight:600">${escapeHtml(value)}</td></tr>`
    : '';

const layout = (clinic, heading, intro, rows) => `
  <div style="background:#f7f5ec;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e1cf">
      <div style="background:#0d4f3a;padding:24px 28px">
        <div style="font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:bold">${escapeHtml(clinic.clinic_name)}</div>
        <div style="font-size:11px;letter-spacing:3px;color:#d8b968;text-transform:uppercase;margin-top:4px">${escapeHtml(clinic.tagline || '')}</div>
      </div>
      <div style="padding:28px">
        <h2 style="font-family:Georgia,serif;color:#0e3b2e;margin:0 0 8px">${heading}</h2>
        <p style="color:#5f6b66;margin:0 0 20px;line-height:1.6">${intro}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      </div>
      <div style="padding:16px 28px;background:#faf8f1;color:#5f6b66;font-size:12px">
        ${escapeHtml(clinic.clinic_name)}${clinic.phone ? ` · ${escapeHtml(clinic.phone)}` : ''}${clinic.address ? ` · ${escapeHtml(clinic.address)}` : ''}
      </div>
    </div>
  </div>`;

const detailRows = (a) =>
  row('Booking ref', a.booking_ref) +
  row('Patient', a.patient_name) +
  row('Mobile', a.phone) +
  row('Email', a.email) +
  row('Age / Gender', [a.age, a.gender].filter((v) => v !== null && v !== undefined && v !== '').join(' / ')) +
  row('Department', a.department_name) +
  row('Doctor', a.doctor_name) +
  row('Preferred date', formatDate(a.appointment_date)) +
  row('Preferred time', formatTime(a.appointment_time)) +
  row('Visit type', a.visit_type) +
  row('Message', a.message);

// Sends: 1) new-booking alert to the clinic (site_settings.email), 2) acknowledgement to the patient
exports.sendBookingEmails = async (appointment, settings) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('SMTP_USER / SMTP_PASS not set — skipping booking emails');
    return;
  }

  const clinic = settings || { clinic_name: 'Clinic' };
  const from = `"${clinic.clinic_name}" <${process.env.SMTP_USER}>`;
  const clinicInbox = clinic.email || process.env.SMTP_USER;
  const jobs = [];

  jobs.push(
    mailer.sendMail({
      from,
      to: clinicInbox,
      replyTo: appointment.email || undefined,
      subject: `New appointment request — ${appointment.patient_name} (${appointment.booking_ref})`,
      html: layout(
        clinic,
        'New appointment request',
        'A patient has requested an appointment from the website. Please call them to confirm.',
        detailRows(appointment)
      ),
    })
  );

  if (appointment.email) {
    jobs.push(
      mailer.sendMail({
        from,
        to: appointment.email,
        replyTo: clinicInbox,
        subject: `We've received your appointment request (${appointment.booking_ref})`,
        html: layout(
          clinic,
          `Thank you, ${escapeHtml(appointment.patient_name)}`,
          'We have received your appointment request. Our team will call you shortly to confirm the time.',
          detailRows(appointment)
        ),
      })
    );
  }

  await Promise.all(jobs);
};
