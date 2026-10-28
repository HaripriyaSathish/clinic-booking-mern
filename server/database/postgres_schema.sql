-- =========================================================
-- Clinic Booking - PostgreSQL schema (Neon / Render)
-- Same tables and columns as clinic_booking_schema.sql (MySQL).
-- TINYINT(1) flags stay SMALLINT 0/1 so the app's `= 1` checks work on both.
-- Loaded by: npm run db:copy-to-postgres --prefix server
-- =========================================================

-- MySQL's ON UPDATE CURRENT_TIMESTAMP
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  username      VARCHAR(60) UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('superadmin','staff')),
  is_active     SMALLINT DEFAULT 1,
  last_login    TIMESTAMP(0) NULL,
  created_at    TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_settings (
  id               SERIAL PRIMARY KEY,
  clinic_name      VARCHAR(150) NOT NULL,
  tagline          VARCHAR(200),
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
  updated_at       TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hero_section (
  id                 SERIAL PRIMARY KEY,
  badge_text         VARCHAR(50),
  title              VARCHAR(200) NOT NULL,
  highlight_word     VARCHAR(50),
  subtitle           TEXT,
  primary_btn_text   VARCHAR(50),
  primary_btn_link   VARCHAR(200),
  secondary_btn_text VARCHAR(50),
  secondary_btn_link VARCHAR(200),
  info_title         VARCHAR(60),
  info_text          VARCHAR(100),
  image_url          VARCHAR(500),
  image_public_id    VARCHAR(255),
  is_active          SMALLINT DEFAULT 1,
  updated_at         TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE section_content (
  section_key  VARCHAR(40) PRIMARY KEY,
  eyebrow      VARCHAR(80),
  title        VARCHAR(150),
  description  TEXT,
  updated_at   TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stats (
  id          SERIAL PRIMARY KEY,
  label       VARCHAR(100) NOT NULL,
  value       VARCHAR(20) NOT NULL,
  suffix      VARCHAR(10),
  icon        VARCHAR(50),
  sort_order  INT DEFAULT 0,
  is_active   SMALLINT DEFAULT 1
);

CREATE TABLE about_section (
  id               SERIAL PRIMARY KEY,
  heading          VARCHAR(200),
  sub_heading      VARCHAR(200),
  description      TEXT,
  mission          TEXT,
  vision           TEXT,
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(255),
  updated_at       TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  slug             VARCHAR(120) NOT NULL UNIQUE,
  short_desc       VARCHAR(300),
  description      TEXT,
  icon             VARCHAR(50),
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(255),
  sort_order       INT DEFAULT 0,
  is_active        SMALLINT DEFAULT 1,
  created_at       TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id                SERIAL PRIMARY KEY,
  department_id     INT NULL REFERENCES departments(id) ON DELETE SET NULL,
  name              VARCHAR(120) NOT NULL,
  slug              VARCHAR(140) NOT NULL UNIQUE,
  designation       VARCHAR(150),
  qualification     VARCHAR(200),
  experience_years  INT DEFAULT 0,
  bio               TEXT,
  consultation_fee  DECIMAL(10,2),
  languages         VARCHAR(200),
  photo_url         VARCHAR(500),
  photo_public_id   VARCHAR(255),
  is_featured       SMALLINT DEFAULT 0,
  sort_order        INT DEFAULT 0,
  is_active         SMALLINT DEFAULT 1,
  created_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_schedules (
  id             SERIAL PRIMARY KEY,
  doctor_id      INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week    VARCHAR(3) NOT NULL CHECK (day_of_week IN ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  slot_minutes   INT DEFAULT 15,
  max_patients   INT DEFAULT 20,
  is_active      SMALLINT DEFAULT 1,
  CONSTRAINT uq_doc_day_start UNIQUE (doctor_id, day_of_week, start_time)
);

CREATE TABLE doctor_leaves (
  id          SERIAL PRIMARY KEY,
  doctor_id   INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  leave_date  DATE NOT NULL,
  reason      VARCHAR(200),
  CONSTRAINT uq_doc_leave UNIQUE (doctor_id, leave_date)
);

CREATE TABLE clinic_timings (
  id           SERIAL PRIMARY KEY,
  label        VARCHAR(100) NOT NULL,
  day_range    VARCHAR(100) NOT NULL,
  open_time    TIME NULL,
  close_time   TIME NULL,
  is_24x7      SMALLINT DEFAULT 0,
  is_closed    SMALLINT DEFAULT 0,
  note         VARCHAR(100),
  sort_order   INT DEFAULT 0
);

CREATE TABLE services (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(150) NOT NULL,
  description      TEXT,
  icon             VARCHAR(50),
  image_url        VARCHAR(500),
  image_public_id  VARCHAR(255),
  sort_order       INT DEFAULT 0,
  is_active        SMALLINT DEFAULT 1
);

CREATE TABLE testimonials (
  id                SERIAL PRIMARY KEY,
  patient_name      VARCHAR(120) NOT NULL,
  location          VARCHAR(100),
  rating            SMALLINT DEFAULT 5,
  message           TEXT NOT NULL,
  photo_url         VARCHAR(500),
  photo_public_id   VARCHAR(255),
  sort_order        INT DEFAULT 0,
  is_active         SMALLINT DEFAULT 1,
  created_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faqs (
  id          SERIAL PRIMARY KEY,
  question    VARCHAR(300) NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  is_active   SMALLINT DEFAULT 1
);

CREATE TABLE gallery (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(150),
  image_url        VARCHAR(500) NOT NULL,
  image_public_id  VARCHAR(255) NOT NULL,
  sort_order       INT DEFAULT 0,
  is_active        SMALLINT DEFAULT 1,
  created_at       TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id                SERIAL PRIMARY KEY,
  booking_ref       VARCHAR(20) NOT NULL UNIQUE,
  patient_name      VARCHAR(120) NOT NULL,
  phone             VARCHAR(20) NOT NULL,
  email             VARCHAR(150),
  age               SMALLINT CHECK (age >= 0),
  gender            VARCHAR(10) CHECK (gender IN ('Male','Female','Other')),
  department_id     INT NULL REFERENCES departments(id) ON DELETE SET NULL,
  doctor_id         INT NULL REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_date  DATE NOT NULL,
  appointment_time  TIME NULL,
  visit_type        VARCHAR(10) DEFAULT 'New' CHECK (visit_type IN ('New','Follow-up')),
  message           TEXT,
  status            VARCHAR(10) DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','Completed','Cancelled','No-show')),
  admin_notes       TEXT,
  created_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
  -- prevents double-booking the same doctor slot
  CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)
);
CREATE INDEX idx_appt_date ON appointments (appointment_date);
CREATE INDEX idx_appt_status ON appointments (status);

CREATE TABLE contact_messages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(150),
  phone       VARCHAR(20),
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  is_read     SMALLINT DEFAULT 0,
  created_at  TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscribers (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(150) NOT NULL UNIQUE,
  created_at  TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_admins_updated BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_hero_section_updated BEFORE UPDATE ON hero_section FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_section_content_updated BEFORE UPDATE ON section_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_about_section_updated BEFORE UPDATE ON about_section FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_departments_updated BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
