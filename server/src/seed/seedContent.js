// Seeds the website content with the exact wording from the design.
//   npm run seed:content            -> fills only what is missing (safe to re-run, keeps admin edits)
//   npm run seed:content -- --reset -> overwrites settings / hero / stats text with the design copy
require('dotenv').config();
const pool = require('../config/db');

const reset = process.argv.includes('--reset');

const settings = {
  clinic_name: 'Riverside Medical Center',
  tagline: 'Compassion · Excellence · Wellness',
  phone: '+91 33 4050 1200',
  whatsapp: '+91 98765 43210', // dummy — change in admin
  email: 'info@riversidemedical.com',
  footer_text: 'A premium multispeciality centre bringing together senior consultants, modern diagnostics and unhurried, personal care since 2004.',
};

const hero = {
  badge_text: 'Now accepting online bookings',
  title: 'Expert care, delivered with',
  highlight_word: 'grace.',
  subtitle:
    'Riverside Medical Center brings together senior consultants, modern diagnostics and calm, unhurried appointments — so your health always gets the time it deserves.',
  primary_btn_text: 'Book an Appointment',
  primary_btn_link: '#booking',
  secondary_btn_text: 'Meet our Doctors',
  secondary_btn_link: '#doctors',
  info_title: 'OPD today',
  info_text: '9:00 AM – 6:00 PM',
};

const stats = [
  { label: 'Years of Care', value: '20', suffix: '+', sort_order: 1 },
  { label: 'Specialities', value: '6', suffix: '', sort_order: 2 },
  { label: 'Emergency', value: '24×7', suffix: '', sort_order: 3 },
];

const sections = {
  departments: {
    eyebrow: 'What we treat',
    title: 'Our Departments',
    description: 'Six specialities under one roof, each led by consultants who take the time to listen.',
  },
  doctors: {
    eyebrow: 'Senior Consultants',
    title: 'Meet Our Doctors',
    description: '',
  },
  doctors_page: {
    eyebrow: 'Senior Consultants',
    title: 'Our Doctors',
    description:
      'Every consultant at Riverside Medical Center practises by appointment so that your consultation is never rushed. Pick a doctor and request a slot — our care team confirms it within hours.',
  },
};

Object.assign(sections, {
  services: {
    eyebrow: 'Facilities',
    title: 'Care Under One Roof',
    description: 'Modern diagnostics, surgical suites and round-the-clock support — everything you need without running between hospitals.',
  },
  testimonials: {
    eyebrow: 'Patient Stories',
    title: 'Words From Our Patients',
    description: 'Real experiences from families who trusted us with their care.',
  },
  gallery: {
    eyebrow: 'Inside Riverside',
    title: 'A Calm Place to Heal',
    description: 'Thoughtfully designed spaces that put patients at ease from the moment they walk in.',
  },
  faq: {
    eyebrow: 'Good to know',
    title: 'Frequently Asked Questions',
    description: 'Quick answers about appointments, timings and visiting us. Still unsure? Call or WhatsApp our front desk.',
  },
  cta: {
    eyebrow: 'Book an Appointment', // used as the button label
    title: "Your health can't wait.",
    description: 'Request an appointment online and our care team will confirm your slot within a few hours during working time.',
  },
  contact: {
    eyebrow: "We're here for you",
    title: 'Timings & Contact',
    description: 'Walk-in emergencies are stabilised immediately — no appointment needed.',
  },
});

// Stock photos without people — replace from the admin panel with your own
const img = (id, shape) => (shape === 'portrait'
  ? `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=800&h=800&q=80`
  : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`);

const services = [
  { title: 'Advanced Diagnostics', icon: 'activity', image_url: img('1530026405186-ed1f139313f8'), description: 'ECG, echo, TMT and digital imaging under one roof, with same-day reports for most tests.' },
  { title: 'Modular Operation Theatres', icon: 'cross', image_url: img('1516549655169-df83a0774514'), description: 'Laminar-flow operation theatres for cardiac, orthopaedic and general surgery.' },
  { title: '24×7 Emergency & Trauma', icon: 'heart-pulse', image_url: img('1551076805-e1869033e561'), description: 'A fully equipped emergency room with a resident doctor and ambulance support, day and night.' },
  { title: 'In-house Pathology Lab', icon: 'eye', image_url: img('1606206873764-fd15e242df52'), description: 'Automated analysers for blood, urine and hormone tests — results shared on WhatsApp and email.' },
  { title: 'Comfortable Patient Rooms', icon: 'stethoscope', image_url: img('1538108149393-fbbd81895907'), description: 'Clean, well-lit private and semi-private rooms with round-the-clock nursing care.' },
  { title: '24-hour Pharmacy', icon: 'pill', image_url: img('1587854692152-cbe660dbde88'), description: 'Genuine medicines and surgical supplies available at any hour, right inside the hospital.' },
];

const testimonials = [
  { patient_name: 'Lakshmi Narayanan', location: 'Chennai', rating: 5, message: 'Dr. Meera explained every step of my father’s angioplasty in Tamil and English. The nurses checked on him through the night — we felt cared for, not rushed.' },
  { patient_name: 'Rahul Menon', location: 'Kochi', rating: 5, message: 'Booked online in the morning and was seen the same afternoon. Reports came on WhatsApp before I reached home. Very smooth experience.' },
  { patient_name: 'Divya Reddy', location: 'Hyderabad', rating: 5, message: 'Dr. Vikram is wonderful with children. My daughter was scared of hospitals, but she left smiling. Clean rooms and friendly staff.' },
  { patient_name: 'Suresh Gowda', location: 'Bengaluru', rating: 5, message: 'After my knee replacement with Dr. Ananya, I was walking in two days. The physiotherapy team was patient and encouraging throughout.' },
];

const gallery = [
  { title: 'Reception & waiting lounge', image_url: img('1519494026892-80bbd2d6fd0d') },
  { title: 'Patient ward', image_url: img('1538108149393-fbbd81895907') },
  { title: 'Operation theatre', image_url: img('1516549655169-df83a0774514') },
  { title: 'Procedure room', image_url: img('1551076805-e1869033e561') },
  { title: 'Diagnostics lab', image_url: img('1606206873764-fd15e242df52') },
  { title: 'Consultation essentials', image_url: img('1584982751601-97dcc096659c') },
];

const faqs = [
  { question: 'How do I book an appointment?', answer: 'Tap "Book Appointment", choose a department or doctor and your preferred date and time. Our care team will call you within a few hours during working time to confirm your slot.' },
  { question: 'Do I need an appointment for an emergency?', answer: 'No. Our emergency and trauma unit is open 24 × 7 and walk-in emergencies are stabilised immediately — no appointment needed.' },
  { question: 'What are your OPD timings?', answer: 'OPD runs Monday to Friday from 9:00 AM to 6:00 PM and Saturday from 9:00 AM to 2:00 PM. On Sunday the OPD is closed, but emergency services remain open.' },
  { question: 'Can I choose a specific doctor?', answer: 'Yes. Pick a doctor on the "Our Doctors" page or in the booking form. The form shows each doctor\'s available days and hours so you can choose a suitable slot.' },
  { question: 'What should I bring to my first visit?', answer: 'Please bring a photo ID, any previous prescriptions and test reports, and a list of medicines you currently take. Arrive 10–15 minutes early to complete registration.' },
  { question: 'How will I receive my lab reports?', answer: 'Most reports are ready the same day. We share them on WhatsApp and email, and you can also collect a printed copy from the front desk.' },
];

const timings = [
  { label: 'OPD', day_range: 'Monday – Friday', open_time: '09:00', close_time: '18:00' },
  { label: 'OPD', day_range: 'Saturday', open_time: '09:00', close_time: '14:00' },
  { label: 'OPD', day_range: 'Sunday', is_closed: 1, note: 'Closed (Emergency open)' },
  { label: 'Emergency', day_range: 'Emergency & Trauma', is_24x7: 1 },
];

// [day, start, end]
const doctors = [
  {
    name: 'Dr. Meera Chatterjee', department: 'cardiology', designation: 'Interventional Cardiologist',
    qualification: 'MD, DM (Cardiology)', experience_years: 16, consultation_fee: 1200, languages: 'English, Bengali, Hindi',
    bio: 'Dr. Chatterjee leads our cardiology team with over 16 years of experience in interventional cardiology. She has performed more than 4,000 angioplasties and specialises in complex coronary interventions and structural heart disease.',
    is_featured: 1, schedules: [['Mon', '09:00', '13:00'], ['Wed', '09:00', '13:00'], ['Fri', '14:00', '18:00']],
  },
  {
    name: 'Dr. Arjun Mehta', department: 'neurology', designation: 'Consultant Neurologist',
    qualification: 'MD, DM (Neurology)', experience_years: 12, consultation_fee: 1100, languages: 'English, Hindi, Marathi',
    bio: 'Dr. Mehta is a consultant neurologist specialising in stroke care, epilepsy and movement disorders. He trained at NIMHANS and has published extensively on acute stroke management.',
    is_featured: 1, schedules: [['Tue', '10:00', '14:00'], ['Thu', '10:00', '14:00'], ['Sat', '09:00', '12:00']],
  },
  {
    name: 'Dr. Ananya Sharma', department: 'orthopaedics', designation: 'Joint Replacement & Sports Injury Specialist',
    qualification: 'MS (Orthopaedics), FIAS', experience_years: 14, consultation_fee: 1000, languages: 'English, Malayalam, Hindi',
    bio: 'Dr. Nair specialises in minimally invasive knee and hip replacement and arthroscopic sports surgery. She is an advocate of rapid-recovery protocols that get patients moving within days.',
    is_featured: 1, schedules: [['Mon', '14:00', '18:00'], ['Thu', '09:00', '13:00'], ['Sat', '10:00', '13:00']],
  },
  {
    photo_url: img('1612349317150-e413f6a5b16d', 'portrait'), name: 'Dr. Vikram Iyer', department: 'paediatrics', designation: 'Paediatrician & Neonatologist',
    qualification: 'MD (Paediatrics)', experience_years: 11, consultation_fee: 800, languages: 'English, Tamil, Hindi',
    bio: 'Dr. Iyer has cared for children across Kerala and Karnataka for over a decade, with a special interest in newborn care, childhood asthma and developmental paediatrics.',
    is_featured: 1, schedules: [['Tue', '09:00', '13:00'], ['Wed', '14:00', '18:00'], ['Fri', '09:00', '13:00']],
  },
  {
    photo_url: img('1623854767648-e7bb8009f0db', 'portrait'), name: 'Dr. Sana Qureshi', department: 'dermatology', designation: 'Consultant Dermatologist',
    qualification: 'MD (Dermatology)', experience_years: 9, consultation_fee: 900, languages: 'English, Urdu, Hindi',
    bio: 'Dr. Qureshi offers medical and aesthetic dermatology — acne, pigmentation, hair restoration and laser therapy — with an evidence-first, gentle approach to skin health.',
    is_featured: 0, schedules: [['Mon', '10:00', '13:00'], ['Thu', '14:00', '18:00']],
  },
  {
    name: 'Dr. Rohan Bose', department: 'general-medicine', designation: 'Physician & Diabetologist',
    qualification: 'MD (Internal Medicine)', experience_years: 18, consultation_fee: 700, languages: 'English, Bengali, Hindi',
    bio: 'Dr. Bose is our senior general physician, trusted for diabetes, hypertension and thyroid management. He runs our annual preventive health check programme.',
    is_featured: 0, schedules: [['Tue', '09:00', '12:30'], ['Fri', '09:00', '12:30'], ['Sat', '09:00', '11:30']],
  },
];

const departments = [
  { name: 'Cardiology', icon: 'heart-pulse', short_desc: 'Advanced heart care — from preventive cardiology to complex interventional procedures in our cath lab.' },
  { name: 'Neurology', icon: 'brain', short_desc: 'Diagnosis and treatment of brain, spine and nervous system conditions with modern imaging support.' },
  { name: 'Orthopaedics', icon: 'bone', short_desc: 'Bone, joint and spine care including sports injuries, joint replacement and physiotherapy.' },
  { name: 'Paediatrics', icon: 'baby', short_desc: 'Compassionate care for newborns, children and adolescents, including vaccinations and growth checks.' },
  { name: 'Dermatology', icon: 'sparkles', short_desc: 'Medical and cosmetic skin care — acne, eczema, hair loss and advanced laser treatments.' },
  { name: 'General Medicine', icon: 'stethoscope', short_desc: 'Everyday primary care, chronic disease management and annual health check-ups.' },
];

const slugify = require('../utils/slugify');

const ensureSectionTable = () =>
  pool.query(`CREATE TABLE IF NOT EXISTS section_content (
    section_key  VARCHAR(40) PRIMARY KEY,
    eyebrow      VARCHAR(80),
    title        VARCHAR(150),
    description  TEXT,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

const ensureHeroColumns = async () => {
  if (pool.dialect !== 'mysql') return;
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hero_section' AND COLUMN_NAME IN ('info_title','info_text')`
  );
  const have = cols.map((c) => c.COLUMN_NAME);
  if (!have.includes('info_title')) {
    await pool.query('ALTER TABLE hero_section ADD COLUMN info_title VARCHAR(60) NULL AFTER secondary_btn_link');
  }
  if (!have.includes('info_text')) {
    await pool.query('ALTER TABLE hero_section ADD COLUMN info_text VARCHAR(100) NULL AFTER info_title');
  }
};

// Single-row tables: insert if empty; otherwise fill blank columns (or overwrite with --reset)
const seedSingle = async (table, data) => {
  const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY id LIMIT 1`);
  if (!rows[0]) {
    await pool.query(`INSERT INTO ${table} SET ?`, [data]);
    return 'created';
  }
  const updates = reset
    ? data
    : Object.fromEntries(Object.entries(data).filter(([k]) => rows[0][k] === null || rows[0][k] === ''));
  if (Object.keys(updates).length) {
    await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [updates, rows[0].id]);
    return 'updated';
  }
  return 'already set';
};

(async () => {
  try {
    await ensureHeroColumns();
    console.log(`site_settings: ${await seedSingle('site_settings', settings)}`);
    console.log(`hero_section:  ${await seedSingle('hero_section', hero)}`);

    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM stats');
    if (reset) await pool.query('DELETE FROM stats');
    if (reset || count === 0) {
      for (const s of stats) await pool.query('INSERT INTO stats SET ?', [s]);
      console.log('stats:         created');
    } else {
      console.log('stats:         already set');
    }

    if (pool.dialect === 'mysql') await ensureSectionTable();
    for (const [key, data] of Object.entries(sections)) {
      const [[existing]] = await pool.query('SELECT section_key FROM section_content WHERE section_key = ?', [key]);
      if (!existing) await pool.query('INSERT INTO section_content SET ?', [{ section_key: key, ...data }]);
      else if (reset) await pool.query('UPDATE section_content SET ? WHERE section_key = ?', [data, key]);
    }
    console.log('sections:      ok');

    // Departments: upsert by slug so re-running never duplicates
    for (const [i, d] of departments.entries()) {
      const row = { ...d, slug: slugify(d.name), sort_order: i + 1 };
      const [[existing]] = await pool.query('SELECT id FROM departments WHERE slug = ?', [row.slug]);
      if (!existing) await pool.query('INSERT INTO departments SET ?', [row]);
      else if (reset) await pool.query('UPDATE departments SET ? WHERE id = ?', [row, existing.id]);
    }
    console.log('departments:   ok');

    // Doctors: upsert by slug; schedules are only (re)written when the doctor is created or on --reset
    for (const [i, doc] of doctors.entries()) {
      const { department, schedules, ...fields } = doc;
      const [[dept]] = await pool.query('SELECT id FROM departments WHERE slug = ?', [department]);
      const row = { ...fields, slug: slugify(doc.name), department_id: dept?.id || null, sort_order: i + 1 };
      const [[existing]] = await pool.query('SELECT id FROM doctors WHERE slug = ?', [row.slug]);
      let id = existing?.id;
      if (!existing) [{ insertId: id }] = await pool.query('INSERT INTO doctors SET ?', [row]);
      else if (reset) await pool.query('UPDATE doctors SET ? WHERE id = ?', [row, id]);
      // Seed photo only fills an empty slot — never replaces one uploaded from the admin panel
      if (existing && !reset && row.photo_url) {
        await pool.query("UPDATE doctors SET photo_url = ? WHERE id = ? AND (photo_url IS NULL OR photo_url = '')", [row.photo_url, id]);
      }
      if (!existing || reset) {
        await pool.query('DELETE FROM doctor_schedules WHERE doctor_id = ?', [id]);
        for (const [day_of_week, start_time, end_time] of schedules) {
          await pool.query('INSERT INTO doctor_schedules SET ?', [{ doctor_id: id, day_of_week, start_time, end_time }]);
        }
      }
    }
    console.log('doctors:       ok');

    // List sections: filled only when empty (or replaced with --reset)
    const seedList = async (table, rows, isOldDefault = () => false) => {
      const [existing] = await pool.query(`SELECT * FROM ${table}`);
      if (existing.length && !reset && !isOldDefault(existing)) return 'already set';
      await pool.query(`DELETE FROM ${table}`);
      for (const [i, row] of rows.entries()) await pool.query(`INSERT INTO ${table} SET ?`, [{ ...row, sort_order: i + 1 }]);
      return 'created';
    };

    const [noteCol] = pool.dialect !== 'mysql' ? [[true]] : await pool.query(
      `SELECT 1 FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clinic_timings' AND COLUMN_NAME = 'note'`
    );
    if (!noteCol.length) await pool.query('ALTER TABLE clinic_timings ADD COLUMN note VARCHAR(100) NULL AFTER is_closed');

    console.log(`services:      ${await seedList('services', services)}`);
    console.log(`testimonials:  ${await seedList('testimonials', testimonials)}`);
    console.log(`gallery:       ${await seedList('gallery', gallery.map((g) => ({ ...g, image_public_id: '' })))}`);
    // The original schema shipped placeholder rows like "Mon - Sat" — swap them for the design copy
    console.log(`faqs:          ${await seedList('faqs', faqs)}`);
    console.log(`timings:       ${await seedList('clinic_timings', timings, (rows) => rows.some((r) => r.day_range === 'Mon - Sat'))}`);

    // Contact details from the design
    await pool.query(
      `UPDATE site_settings SET address = '12 Lake View Road\nKolkata 700029'
       WHERE address IS NULL OR address = '' OR address = 'Your clinic address here'`
    );
    await pool.query(
      `UPDATE site_settings SET emergency_phone = '+91 33 4050 1999' WHERE emergency_phone IS NULL OR emergency_phone = ''`
    );
    console.log('contact:       ok');
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
