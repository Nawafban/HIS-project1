-- ============================================================
-- SE371 – Hospital Information System
-- PostgreSQL Schema (Aiven Cloud)
-- Team: Nawaf Alfraikh · Omar Alwahashi · Mohammed Alshaibani
-- ============================================================


DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments     CASCADE;
DROP TABLE IF EXISTS staff            CASCADE;
DROP TABLE IF EXISTS doctors          CASCADE;
DROP TABLE IF EXISTS patients         CASCADE;
DROP TABLE IF EXISTS feedback         CASCADE;
DROP TABLE IF EXISTS plans            CASCADE;
DROP TABLE IF EXISTS users            CASCADE;


DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS gender_type;
DROP TYPE IF EXISTS blood_type;
DROP TYPE IF EXISTS appt_status;
DROP TYPE IF EXISTS record_type;
DROP TYPE IF EXISTS billing_cycle;
DROP TYPE IF EXISTS feedback_status;

CREATE TYPE user_role      AS ENUM ('patient','doctor','staff','admin');
CREATE TYPE gender_type    AS ENUM ('male','female','other');
CREATE TYPE blood_type     AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-');
CREATE TYPE appt_status    AS ENUM ('scheduled','completed','cancelled');
CREATE TYPE record_type    AS ENUM ('checkup','emergency','follow-up','surgery','lab','consultation');
CREATE TYPE billing_cycle  AS ENUM ('monthly','annual');
CREATE TYPE feedback_status AS ENUM ('open','resolved','closed');

CREATE TABLE users (
    user_id      SERIAL PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         user_role    NOT NULL DEFAULT 'patient',
    created_date TIMESTAMP    DEFAULT NOW(),
    last_login   TIMESTAMP
);

CREATE TABLE patients (
    patient_id         SERIAL PRIMARY KEY,
    user_id            INT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date_of_birth      DATE         NOT NULL,
    gender             gender_type  NOT NULL,
    contact_phone      VARCHAR(20)  NOT NULL,
    address            VARCHAR(255) NOT NULL,
    emergency_contact  VARCHAR(100) NOT NULL,
    blood_type         blood_type   NOT NULL,
    allergies          TEXT,
    insurance_provider VARCHAR(100),
    insurance_number   VARCHAR(50)
);

CREATE TABLE doctors (
    doctor_id            SERIAL PRIMARY KEY,
    user_id              INT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    specialization       VARCHAR(100) NOT NULL,
    license_number       VARCHAR(50)  NOT NULL UNIQUE,
    hospital_affiliation VARCHAR(150) NOT NULL,
    contact_phone        VARCHAR(20)  NOT NULL
);

CREATE TABLE staff (
    staff_id      SERIAL PRIMARY KEY,
    user_id       INT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department    VARCHAR(100) NOT NULL,
    job_title     VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20)  NOT NULL
);

CREATE TABLE appointments (
    appointment_id       SERIAL PRIMARY KEY,
    patient_id           INT         NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id            INT         NOT NULL REFERENCES doctors(doctor_id)   ON DELETE CASCADE,
    appointment_datetime TIMESTAMP   NOT NULL,
    status               appt_status NOT NULL DEFAULT 'scheduled',
    type                 VARCHAR(100) NOT NULL DEFAULT 'General',
    notes                TEXT
);

CREATE TABLE medical_records (
    record_id       SERIAL PRIMARY KEY,
    patient_id      INT         NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id       INT         NOT NULL REFERENCES doctors(doctor_id)   ON DELETE CASCADE,
    visit_date      DATE        NOT NULL,
    diagnosis       TEXT        NOT NULL,
    prescription    TEXT,
    treatment_notes TEXT,
    test_results    TEXT,
    record_type     record_type NOT NULL DEFAULT 'checkup'
);

CREATE TABLE plans (
    plan_id       SERIAL PRIMARY KEY,
    name          VARCHAR(100)   NOT NULL,
    price         DECIMAL(10,2)  NOT NULL,
    billing_cycle billing_cycle  NOT NULL DEFAULT 'monthly',
    max_users     INT            NOT NULL,
    max_patients  INT            NOT NULL,
    storage_gb    INT            NOT NULL,
    features      TEXT           NOT NULL,
    is_popular    BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP      DEFAULT NOW(),
    updated_at    TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL,
    subject     VARCHAR(200)    NOT NULL,
    message     TEXT            NOT NULL,
    status      feedback_status NOT NULL DEFAULT 'open',
    created_at  TIMESTAMP       DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO users (full_name, email, password, role, last_login) VALUES
('Ahmed Al-Rashidi',  'ahmed@his.sa',    'pass123', 'patient', '2026-04-10 08:00:00'),
('Sara Al-Ghamdi',    'sara@his.sa',     'pass123', 'patient', '2026-04-11 09:30:00'),
('Khalid Al-Otaibi',  'khalid@his.sa',   'pass123', 'patient', '2026-04-12 07:45:00'),
('Fatima Al-Zahrani', 'fatima@his.sa',   'pass123', 'patient', '2026-04-15 10:00:00'),
('Omar Al-Harbi',     'omar@his.sa',     'pass123', 'patient', '2026-04-15 13:00:00'),
('Rania Al-Dosari',   'rania@his.sa',    'pass123', 'patient', '2026-04-16 09:00:00'),
('Majed Al-Shammari', 'majed@his.sa',    'pass123', 'patient', '2026-04-17 12:00:00'),
('Hind Al-Otaibi',    'hind@his.sa',     'pass123', 'patient', '2026-04-20 09:30:00'),
('Yasser Al-Amer',    'yasser@his.sa',   'pass123', 'patient', '2026-04-08 14:00:00'),
('Noura Al-Harbi',    'noura@his.sa',    'pass123', 'patient', '2026-04-09 11:00:00'),
('Dr. Nora Al-Subaie',   'dr.nora@his.sa',   'pass123', 'doctor', '2026-04-20 08:00:00'),
('Dr. Tariq Al-Amer',    'dr.tariq@his.sa',  'pass123', 'doctor', '2026-04-19 08:30:00'),
('Dr. Hessa Al-Qahtani', 'dr.hessa@his.sa',  'pass123', 'doctor', '2026-04-18 07:55:00'),
('Dr. Faisal Al-Dosari', 'dr.faisal@his.sa', 'pass123', 'doctor', '2026-04-17 08:10:00'),
('Dr. Lama Al-Shammari', 'dr.lama@his.sa',   'pass123', 'doctor', '2026-04-16 09:00:00'),
('Nadia Al-Qurashi',  'nadia@his.sa',  'pass123', 'staff', '2026-04-20 07:30:00'),
('Admin',             'admin@his.sa',  'admin123','admin', '2026-04-20 06:00:00');

INSERT INTO patients (user_id, date_of_birth, gender, contact_phone, address, emergency_contact, blood_type, allergies, insurance_provider, insurance_number) VALUES
(1,  '1985-04-12', 'male',   '+966-50-001-0001', 'Riyadh, Al-Olaya',      'Layla +966-50-111', 'O+',  'Penicillin',  'Bupa Arabia', 'INS-001'),
(2,  '1992-08-22', 'female', '+966-50-001-0002', 'Riyadh, Al-Malaz',      'Faris +966-50-112', 'A+',  NULL,          'Tawuniya',    'INS-002'),
(3,  '1978-12-05', 'male',   '+966-50-001-0003', 'Jeddah, Al-Rawdah',     'Maha  +966-50-113', 'B-',  'Sulfa drugs', 'Medgulf',     'INS-003'),
(4,  '2001-03-30', 'female', '+966-50-001-0004', 'Riyadh, Al-Naseem',     'Ali   +966-50-114', 'AB+', NULL,          'Bupa Arabia', 'INS-004'),
(5,  '1990-07-18', 'male',   '+966-50-001-0005', 'Dammam, Al-Faisaliyah', 'Hana  +966-50-115', 'A-',  'Aspirin',     'Tawuniya',    'INS-005'),
(6,  '1988-11-14', 'female', '+966-50-001-0006', 'Riyadh, Al-Woroud',     'Joud  +966-50-116', 'O-',  NULL,          'Bupa Arabia', 'INS-006'),
(7,  '1975-06-25', 'male',   '+966-50-001-0007', 'Riyadh, Al-Sulimaniyah','Hala  +966-50-117', 'B+',  'Latex',       'Medgulf',     'INS-007'),
(8,  '1995-01-09', 'female', '+966-50-001-0008', 'Jeddah, Al-Hamra',      'Lama  +966-50-118', 'A+',  NULL,          'Tawuniya',    'INS-008'),
(9,  '1983-09-17', 'male',   '+966-50-001-0009', 'Riyadh, Al-Rabwah',     'Dina  +966-50-119', 'O+',  'Ibuprofen',   'Bupa Arabia', 'INS-009'),
(10, '2005-02-28', 'female', '+966-50-001-0010', 'Riyadh, Al-Naseem',     'Mona  +966-50-110', 'AB-', NULL,          'Medgulf',     'INS-010');

INSERT INTO doctors (user_id, specialization, license_number, hospital_affiliation, contact_phone) VALUES
(11, 'Cardiology',  'LIC-CARD-001', 'King Faisal Specialist Hospital', '+966-11-111-0001'),
(12, 'Neurology',   'LIC-NEUR-002', 'King Abdulaziz Medical City',     '+966-11-111-0002'),
(13, 'Pediatrics',  'LIC-PEDI-003', 'King Fahad Medical City',         '+966-11-111-0003'),
(14, 'Orthopedics', 'LIC-ORTH-004', 'King Faisal Specialist Hospital', '+966-11-111-0004'),
(15, 'General',     'LIC-GENR-005', 'National Guard Hospital',         '+966-11-111-0005');

INSERT INTO staff (user_id, department, job_title, contact_phone) VALUES
(16, 'Reception', 'Head Receptionist', '+966-11-222-0001');

INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status, type, notes) VALUES
(1, 1, '2026-04-10 09:00:00', 'completed', 'Checkup',     'Routine cardiac checkup. BP 120/80.'),
(2, 2, '2026-04-11 10:30:00', 'completed', 'Follow-up',   'MRI results reviewed. No abnormalities.'),
(3, 4, '2026-04-12 08:00:00', 'completed', 'Follow-up',   'Post-surgery knee evaluation.'),
(4, 3, '2026-04-15 11:00:00', 'scheduled', 'Checkup',     'Annual pediatric checkup.'),
(5, 5, '2026-04-15 14:00:00', 'scheduled', 'Follow-up',   'Blood test follow-up.'),
(6, 1, '2026-04-16 09:30:00', 'scheduled', 'Checkup',     'ECG monitoring session.'),
(7, 2, '2026-04-17 13:00:00', 'scheduled', 'Consultation','Headache diagnosis.'),
(1, 1, '2026-03-05 09:00:00', 'completed', 'Checkup',     'Stress test completed successfully.'),
(8, 1, '2026-04-20 10:00:00', 'scheduled', 'Checkup',     'Echocardiogram scheduled.'),
(9, 5, '2026-04-08 15:00:00', 'completed', 'Consultation','Flu symptoms. Medication prescribed.'),
(10,3, '2026-04-09 11:30:00', 'completed', 'Checkup',     'Vaccination administered.'),
(2, 2, '2026-03-20 10:00:00', 'cancelled', 'Follow-up',   'Patient cancelled due to travel.'),
(5, 5, '2026-03-28 14:00:00', 'completed', 'General',     'General consultation.'),
(3, 4, '2026-04-22 08:30:00', 'scheduled', 'Follow-up',   'Physical therapy follow-up.');

INSERT INTO medical_records (patient_id, doctor_id, visit_date, diagnosis, prescription, treatment_notes, test_results, record_type) VALUES
(1, 1, '2026-04-10', 'Mild hypertension',        'Amlodipine 5mg daily',       'Monitor BP weekly',        'BP: 140/90',      'checkup'),
(2, 2, '2026-04-11', 'Tension headaches',         'Ibuprofen 400mg as needed',  'Physiotherapy recommended','MRI: No lesions',  'follow-up'),
(3, 4, '2026-04-12', 'Post-op knee recovery',     'Naproxen 500mg twice daily', 'Range of motion improving','X-ray: Stable',    'follow-up'),
(4, 3, '2026-04-15', 'Healthy – no concerns',     'None',                       'Continue checkups',        'Normal CBC',       'checkup'),
(5, 5, '2026-04-08', 'Influenza type A',           'Oseltamivir 75mg',           'Rest and fluids',          'Rapid flu test +', 'checkup'),
(6, 1, '2026-04-16', 'Arrhythmia – under review', 'Metoprolol 25mg daily',      'Holter monitor 24 hrs',    'ECG: Irregular',   'checkup'),
(7, 2, '2026-04-17', 'Migraine without aura',      'Sumatriptan 50mg',           'Avoid screen time >2hrs',  'CT: Normal',       'consultation'),
(1, 1, '2026-03-05', 'Stable cardiac function',    'Continue Amlodipine',        'Stress test passed',       'Echo: EF 60%',     'checkup'),
(9, 5, '2026-04-08', 'Acute upper respiratory',    'Amoxicillin 500mg',          'Steam inhalation',         'Throat swab -ve',  'checkup'),
(10,3, '2026-04-09', 'Routine vaccination',         'None',                       'MMR administered',         'Normal',           'checkup');

INSERT INTO plans (name, price, billing_cycle, max_users, max_patients, storage_gb, features, is_popular) VALUES
('Starter',      49.99,  'monthly', 5,   500,    10,  '["Patient records management","Appointment scheduling","Basic reporting","Email support"]', FALSE),
('Professional', 149.99, 'monthly', 25,  5000,   50,  '["Everything in Starter","Doctor portal access","Advanced analytics","Priority support","Lab results integration"]', TRUE),
('Enterprise',   399.99, 'monthly', 999, 999999, 500, '["Everything in Professional","Unlimited accounts","Multi-hospital support","24/7 dedicated support","HIPAA compliance"]', FALSE);

INSERT INTO feedback (name, email, subject, message, status) VALUES
('Ahmed Al-Rashidi',  'ahmed@hospital.sa',   'Login issue',       'Cannot log in after password reset.',           'open'),
('Sara Al-Ghamdi',    'sara@clinic.sa',      'Feature request',   'Please add bulk patient import from Excel.',    'open'),
('Khalid Al-Otaibi',  'khalid@medcenter.sa', 'Billing question',  'Is the annual plan billed upfront?',           'resolved'),
('Fatima Al-Zahrani', 'fatima@hospital.sa',  'Performance issue', 'Dashboard loads slowly with date filters.',    'open'),
('Omar Al-Harbi',     'omar@clinic.sa',      'Excellent service', 'Appointment module saved us hours every week.','closed');
