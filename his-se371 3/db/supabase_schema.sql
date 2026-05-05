
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    user_id      SERIAL PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','doctor','staff','admin')),
    created_date TIMESTAMP    DEFAULT NOW(),
    last_login   TIMESTAMP    NULL
);

CREATE TABLE patients (
    patient_id         SERIAL PRIMARY KEY,
    user_id            INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date_of_birth      DATE NOT NULL,
    gender             VARCHAR(10) NOT NULL CHECK (gender IN ('male','female','other')),
    contact_phone      VARCHAR(20) NOT NULL,
    address            VARCHAR(255) NOT NULL,
    emergency_contact  VARCHAR(100) NOT NULL,
    blood_type         VARCHAR(5)  NOT NULL CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    allergies          TEXT,
    insurance_provider VARCHAR(100),
    insurance_number   VARCHAR(50)
);

CREATE TABLE doctors (
    doctor_id            SERIAL PRIMARY KEY,
    user_id              INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    specialization       VARCHAR(100) NOT NULL,
    license_number       VARCHAR(50)  NOT NULL UNIQUE,
    hospital_affiliation VARCHAR(150) NOT NULL,
    contact_phone        VARCHAR(20)  NOT NULL
);

CREATE TABLE staff (
    staff_id      SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department    VARCHAR(100) NOT NULL,
    job_title     VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20)  NOT NULL
);

CREATE TABLE appointments (
    appointment_id       SERIAL PRIMARY KEY,
    patient_id           INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id            INT NOT NULL REFERENCES doctors(doctor_id)   ON DELETE CASCADE,
    appointment_datetime TIMESTAMP NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    type                 VARCHAR(100) NOT NULL DEFAULT 'General',
    notes                TEXT
);

CREATE TABLE medical_records (
    record_id       SERIAL PRIMARY KEY,
    patient_id      INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id       INT NOT NULL REFERENCES doctors(doctor_id)   ON DELETE CASCADE,
    visit_date      DATE NOT NULL,
    diagnosis       TEXT NOT NULL,
    prescription    TEXT,
    treatment_notes TEXT,
    test_results    TEXT,
    record_type     VARCHAR(20) NOT NULL DEFAULT 'checkup' CHECK (record_type IN ('checkup','emergency','follow-up','surgery','lab','consultation'))
);

-- SEED DATA
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
('Dr. Saad Al-Harbi',    'dr.saad@his.sa',   'pass123', 'doctor', '2026-04-10 08:45:00'),
('Nadia Al-Qurashi',  'nadia@his.sa',  'pass123', 'staff', '2026-04-20 07:30:00'),
('Badr Al-Zahrani',   'badr@his.sa',   'pass123', 'staff', '2026-04-20 07:45:00'),
('Lena Al-Qahtani',   'lena@his.sa',   'pass123', 'staff', '2026-04-19 08:00:00'),
('Sami Al-Otiabi',    'sami@his.sa',   'pass123', 'staff', '2026-04-18 08:15:00'),
('Admin',             'admin@his.sa',  'admin123', 'admin', '2026-04-20 06:00:00');

INSERT INTO patients (user_id,date_of_birth,gender,contact_phone,address,emergency_contact,blood_type,allergies,insurance_provider,insurance_number) VALUES
(1,'1985-04-12','male','+966-50-001-0001','Riyadh, Al-Olaya','Layla +966-50-001-0011','O+','Penicillin','Bupa Arabia','INS-001'),
(2,'1992-08-22','female','+966-50-001-0002','Riyadh, Al-Malaz','Faris +966-50-001-0012','A+',NULL,'Tawuniya','INS-002'),
(3,'1978-12-05','male','+966-50-001-0003','Jeddah, Al-Rawdah','Maha +966-50-001-0013','B-','Sulfa drugs','Medgulf','INS-003'),
(4,'2001-03-30','female','+966-50-001-0004','Riyadh, Al-Naseem','Ali +966-50-001-0014','AB+',NULL,'Bupa Arabia','INS-004'),
(5,'1990-07-18','male','+966-50-001-0005','Dammam, Al-Faisaliyah','Hana +966-50-001-0015','A-','Aspirin','Tawuniya','INS-005'),
(6,'1988-11-14','female','+966-50-001-0006','Riyadh, Al-Woroud','Joud +966-50-001-0016','O-',NULL,'Bupa Arabia','INS-006'),
(7,'1975-06-25','male','+966-50-001-0007','Riyadh, Al-Sulimaniyah','Hala +966-50-001-0017','B+','Latex','Medgulf','INS-007'),
(8,'1995-01-09','female','+966-50-001-0008','Jeddah, Al-Hamra','Lama +966-50-001-0018','A+',NULL,'Tawuniya','INS-008'),
(9,'1983-09-17','male','+966-50-001-0009','Riyadh, Al-Rabwah','Dina +966-50-001-0019','O+','Ibuprofen','Bupa Arabia','INS-009'),
(10,'2005-02-28','female','+966-50-001-0010','Riyadh, Al-Naseem','Mona +966-50-001-0010','AB-',NULL,'Medgulf','INS-010');

INSERT INTO doctors (user_id,specialization,license_number,hospital_affiliation,contact_phone) VALUES
(11,'Cardiology','LIC-CARD-001','King Faisal Specialist Hospital','+966-11-111-0001'),
(12,'Neurology','LIC-NEUR-002','King Abdulaziz Medical City','+966-11-111-0002'),
(13,'Pediatrics','LIC-PEDI-003','King Fahad Medical City','+966-11-111-0003'),
(14,'Orthopedics','LIC-ORTH-004','King Faisal Specialist Hospital','+966-11-111-0004'),
(15,'General','LIC-GENR-005','National Guard Hospital','+966-11-111-0005'),
(16,'Dermatology','LIC-DERM-006','King Abdulaziz Medical City','+966-11-111-0006');

INSERT INTO staff (user_id,department,job_title,contact_phone) VALUES
(17,'Reception','Head Receptionist','+966-11-222-0001'),
(18,'Laboratory','Lab Technician','+966-11-222-0002'),
(19,'Radiology','Radiologist','+966-11-222-0003'),
(20,'Pharmacy','Pharmacist','+966-11-222-0004');

INSERT INTO appointments (patient_id,doctor_id,appointment_datetime,status,type,notes) VALUES
(1,1,'2026-04-10 09:00:00','completed','Checkup','Routine cardiac checkup. BP 120/80.'),
(2,2,'2026-04-11 10:30:00','completed','Follow-up','MRI results reviewed. No abnormalities.'),
(3,4,'2026-04-12 08:00:00','completed','Follow-up','Post-surgery knee evaluation.'),
(4,3,'2026-04-15 11:00:00','scheduled','Checkup','Annual pediatric checkup.'),
(5,5,'2026-04-15 14:00:00','scheduled','Follow-up','Blood test follow-up.'),
(6,1,'2026-04-16 09:30:00','scheduled','Checkup','ECG monitoring session.'),
(7,2,'2026-04-17 13:00:00','scheduled','Consultation','Headache diagnosis consultation.'),
(1,1,'2026-03-05 09:00:00','completed','Checkup','Stress test completed successfully.'),
(8,1,'2026-04-20 10:00:00','scheduled','Checkup','Echocardiogram scheduled.'),
(9,5,'2026-04-08 15:00:00','completed','Consultation','Flu symptoms. Medication prescribed.');

INSERT INTO medical_records (patient_id,doctor_id,visit_date,diagnosis,prescription,treatment_notes,test_results,record_type) VALUES
(1,1,'2026-04-10','Mild hypertension','Amlodipine 5mg daily','Monitor BP weekly','BP: 140/90','checkup'),
(2,2,'2026-04-11','Tension headaches','Ibuprofen 400mg as needed','Physiotherapy recommended','MRI: No lesions','follow-up'),
(3,4,'2026-04-12','Post-op knee recovery','Naproxen 500mg twice daily','Range of motion improving','X-ray: Stable','follow-up'),
(4,3,'2026-04-15','Healthy – no concerns','None','Continue routine checkups','Normal CBC','checkup'),
(5,5,'2026-04-08','Influenza type A','Oseltamivir 75mg twice daily','Rest and fluids advised','Rapid flu test +','checkup'),
(6,1,'2026-04-16','Arrhythmia – under review','Metoprolol 25mg daily','Holter monitor for 24 hrs','ECG: Irregular','checkup'),
(7,2,'2026-04-17','Migraine without aura','Sumatriptan 50mg as needed','Avoid screen time','CT: Normal','consultation'),
(1,1,'2026-03-05','Stable cardiac function','Continue Amlodipine','Stress test passed','Echo: EF 60%','checkup');
