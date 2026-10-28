-- =========================================================
-- Clinic Booking Landing Page - MySQL Schema
-- Stack: React + Vite | Node + Express | MySQL | Cloudinary
-- Every image column has a matching *_public_id so the
-- admin panel can delete/replace images on Cloudinary.
-- =========================================================

CREATE DATABASE IF NOT EXISTS clinic_booking
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinic_booking;

-- ---------- 1. Admin users ----------
CREATE TABLE admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  username      VARCHAR(60) UNIQUE,              -- login name (ADMIN_USERNAME in .env)
  email        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt hash
  role          ENUM('superadmin','staff') DEFAULT 'staff',
  is_active     TINYINT(1) DEFAULT 1,
  last_login    DATETIME NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- 2. Site settings (single row) ----------
-- Navbar logo, name, tagline, phone, footer details
CREATE TABLE site_settings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  clinic_name      VARCHAR(150) NOT NULL,
  tagline          VARCHAR(200),               -- "Compassion · Excellence · Wellness"
  logo_url         VARCHAR(500),
  logo_public_id   VARCHAR(255),
  phone            VARCHAR(30),
  emergency_phone  VARCHAR(30),
  email            VARCHAR(150),
  whatsapp         VARCHAR(30),
  address          TEXT,
  map_embed_url    TEXT,
  facebook_url     VARCHAR(300),
  instagram_url    VARCHAR(300),
  twitter_url      VARCHAR(300),
  linkedin_url     VARCHAR(300),
  footer_text      VARCHAR(300),
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- 3. Hero section ----------
CREATE TABLE hero_section (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  badge_text        VARCHAR(50),               -- "SINCE 2004"
  title             VARCHAR(200) NOT NULL,     -- "Expert care, delivered with"
  highlight_word    VARCHAR(50),               -- "grace." (italic word)
  subtitle          TEXT,
  primary_btn_text  VARCHAR(50),               -- "Book an Appointment"
  primary_btn_link  VARCHAR(200),
  secondary_btn_text VARCHAR(50),              -- "Meet our Doctors"
  secondary_btn_link VARCHAR(200),
  info_title        VARCHAR(60),               -- "OPD today" (card on hero image)
  info_text         VARCHAR(100),              -- "9:00 AM – 6:00 PM"
  image_url        VARCHAR(500),
  image_public_id   VARCHAR(255),
  is_active         TINYINT(1) DEFAULT 1,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- 3b. Section headings (eyebrow / title / description per section) ----------
CREATE TABLE section_content (
  section_key  VARCHAR(40) PRIMARY KEY,         -- 'departments', 'doctors', ...
  eyebrow      VARCHAR(80),                     -- "What we treat"
  title        VARCHAR(150),                    -- "Our Departments"
  description  TEXT,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- 4. Stats / counters ----------
CREATE TABLE stats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  label       VARCHAR(100) NOT NULL,           -- "Years of Care"
  value       VARCHAR(20) NOT NULL,            -- "20"
  suffix      VARCHAR(10),                     -- "+", "K", "%"
  icon        VARCHAR(50),
  sort_order  INT DEFAULT 0,
  is_active   TINYINT(1) DEFAULT 1
);

-- ---------- 5. About section ----------
CREATE TABLE about_section (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  heading          VARCHAR(200),
  sub_heading      VARCHAR(200),
  description      TEXT,
  mission          TEXT,
  vision           TEXT,
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(255),
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- 6. Departments ----------
CREATE TABLE departments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,      -- Cardiology, Orthopedics...
  slug             VARCHAR(120) NOT NULL UNIQUE,
  short_desc       VARCHAR(300),
  description      TEXT,
  icon             VARCHAR(50),
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(255),
  sort_order       INT DEFAULT 0,
  is_active        TINYINT(1) DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- 7. Doctors ----------
CREATE TABLE doctors (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  department_id     INT NULL,
  name              VARCHAR(120) NOT NULL,
  slug              VARCHAR(140) NOT NULL UNIQUE,
  designation       VARCHAR(150),              -- "Senior Consultant"
  qualification     VARCHAR(200),              -- "MBBS, MD, DM"
  experience_years  INT DEFAULT 0,
  bio               TEXT,
  consultation_fee  DECIMAL(10,2),
  languages         VARCHAR(200),              -- "English, Tamil, Hindi"
  photo_url         VARCHAR(500),
  photo_public_id   VARCHAR(255),
  is_featured       TINYINT(1) DEFAULT 0,      -- show on homepage
  sort_order        INT DEFAULT 0,
  is_active         TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ---------- 8. Doctor weekly schedule (for booking slots) ----------
CREATE TABLE doctor_schedules (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id      INT NOT NULL,
  day_of_week    ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  slot_minutes   INT DEFAULT 15,               -- slot length
  max_patients   INT DEFAULT 20,
  is_active      TINYINT(1) DEFAULT 1,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE KEY uq_doc_day_start (doctor_id, day_of_week, start_time)
);

-- ---------- 9. Doctor leave / unavailable dates ----------
CREATE TABLE doctor_leaves (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id   INT NOT NULL,
  leave_date  DATE NOT NULL,
  reason      VARCHAR(200),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE KEY uq_doc_leave (doctor_id, leave_date)
);

-- ---------- 10. Clinic / OPD timings (Timings & Contact) ----------
CREATE TABLE clinic_timings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  label        VARCHAR(100) NOT NULL,          -- "OPD", "Emergency", "Pharmacy"
  day_range    VARCHAR(100) NOT NULL,          -- "Mon - Sat"
  open_time    TIME NULL,
  close_time   TIME NULL,
  is_24x7      TINYINT(1) DEFAULT 0,
  is_closed    TINYINT(1) DEFAULT 0,
  note         VARCHAR(100),                   -- e.g. "Closed (Emergency open)"
  sort_order   INT DEFAULT 0
);

-- ---------- 11. Services / facilities ----------
CREATE TABLE services (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(150) NOT NULL,      -- "Modern Diagnostics"
  description      TEXT,
  icon             VARCHAR(50),
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(255),
  sort_order       INT DEFAULT 0,
  is_active        TINYINT(1) DEFAULT 1
);

-- ---------- 12. Testimonials ----------
CREATE TABLE testimonials (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  patient_name      VARCHAR(120) NOT NULL,
  location          VARCHAR(100),
  rating            TINYINT DEFAULT 5,
  message           TEXT NOT NULL,
  photo_url         VARCHAR(500),
  photo_public_id   VARCHAR(255),
  sort_order        INT DEFAULT 0,
  is_active         TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- 13. FAQs ----------
CREATE TABLE faqs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  question    VARCHAR(300) NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  is_active   TINYINT(1) DEFAULT 1
);

-- ---------- 14. Gallery ----------
CREATE TABLE gallery (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(150),
  image_url        VARCHAR(500) NOT NULL,
  image_public_id  VARCHAR(255) NOT NULL,
  sort_order       INT DEFAULT 0,
  is_active        TINYINT(1) DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- 15. Appointments (Book Appointment form) ----------
CREATE TABLE appointments (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref       VARCHAR(20) NOT NULL UNIQUE,   -- e.g. RMC-20261027-0001
  patient_name      VARCHAR(120) NOT NULL,
  phone             VARCHAR(20) NOT NULL,
  email             VARCHAR(150),
  age               TINYINT UNSIGNED,
  gender            ENUM('Male','Female','Other'),
  department_id     INT NULL,
  doctor_id         INT NULL,
  appointment_date  DATE NOT NULL,
  appointment_time  TIME NULL,
  visit_type        ENUM('New','Follow-up') DEFAULT 'New',
  message           TEXT,
  status            ENUM('Pending','Confirmed','Completed','Cancelled','No-show') DEFAULT 'Pending',
  admin_notes       TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id)     REFERENCES doctors(id)     ON DELETE SET NULL,
  INDEX idx_appt_date (appointment_date),
  INDEX idx_appt_status (status),
  -- prevents double-booking the same doctor slot
  UNIQUE KEY uq_doctor_slot (doctor_id, appointment_date, appointment_time)
);

-- ---------- 16. Contact messages ----------
CREATE TABLE contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(150),
  phone       VARCHAR(20),
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- 17. Newsletter subscribers (optional) ----------
CREATE TABLE subscribers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(150) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- Starter data (edit from admin panel later)
-- Admin user is created by server/src/seed/seedAdmin.js
-- so the password gets bcrypt-hashed properly.
-- =========================================================
INSERT INTO site_settings (clinic_name, tagline, phone, email, address)
VALUES ('Riverside Medical Center', 'Compassion · Excellence · Wellness',
        '+91 33 4050 1200', 'info@riversidemedical.com', 'Your clinic address here');

INSERT INTO hero_section (badge_text, title, highlight_word, subtitle,
  primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, info_title, info_text)
VALUES ('Now accepting online bookings', 'Expert care, delivered with', 'grace.',
  'Riverside Medical Center brings together senior consultants, modern diagnostics and calm, unhurried appointments — so your health always gets the time it deserves.',
  'Book an Appointment', '#booking', 'Meet our Doctors', '#doctors', 'OPD today', '9:00 AM – 6:00 PM');

INSERT INTO stats (label, value, suffix, sort_order) VALUES
('Years of Care', '20', '+', 1),
('Specialities', '6', '', 2),
('Emergency', '24×7', '', 3);

INSERT INTO clinic_timings (label, day_range, open_time, close_time, sort_order) VALUES
('OPD', 'Mon - Sat', '09:00:00', '18:00:00', 1),
('OPD', 'Sunday',    '09:00:00', '13:00:00', 2);
INSERT INTO clinic_timings (label, day_range, is_24x7, sort_order) VALUES
('Emergency', 'All days', 1, 3);
