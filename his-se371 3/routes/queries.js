// routes/queries.js – 5 members × (5 basic + 5 advanced) = 50 queries
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  const run = async (title, sql, params = []) => {
    try {
      const rows = await db.run(sql, params);
      return { title, rows, error: null };
    } catch (err) {
      return { title, rows: [], error: err.message };
    }
  };

  // ── NAWAF ALFRAIKH – Patients ──────────────────────────────
  const nawaf = { name: 'Nawaf Alfraikh', id: '222110778', entity: 'Patients',
    basic: [
      await run('All Patients with Contact Info',
        `SELECT p.patient_id, u.full_name, u.email, p.date_of_birth, p.gender, p.blood_type FROM patients p JOIN users u ON p.user_id=u.user_id`),
      await run('Patients with Blood Type O+',
        `SELECT p.patient_id, u.full_name, p.blood_type, p.contact_phone, p.insurance_provider FROM patients p JOIN users u ON p.user_id=u.user_id WHERE p.blood_type='O+'`),
      await run('Patients Sorted by Age (Oldest First)',
        `SELECT p.patient_id, u.full_name, p.date_of_birth, DATE_PART('year', AGE(p.date_of_birth::date)) AS age FROM patients p JOIN users u ON p.user_id=u.user_id ORDER BY age DESC`),
      await run('Patients with Known Allergies',
        `SELECT p.patient_id, u.full_name, p.blood_type, p.allergies, p.insurance_provider FROM patients p JOIN users u ON p.user_id=u.user_id WHERE p.allergies IS NOT NULL`),
      await run('All Patients with Emergency Contacts',
        `SELECT p.patient_id, u.full_name, u.email, p.contact_phone, p.emergency_contact FROM patients p JOIN users u ON p.user_id=u.user_id ORDER BY u.full_name ASC`),
    ],
    advanced: [
      await run('Patient Count by Gender',
        `SELECT p.gender, COUNT(*) AS total_patients FROM patients p GROUP BY p.gender ORDER BY total_patients DESC`),
      await run('Patient Count by Blood Type',
        `SELECT p.blood_type, COUNT(*) AS total FROM patients p GROUP BY p.blood_type HAVING COUNT(*)>=1 ORDER BY total DESC`),
      await run('Total Appointments per Patient',
        `SELECT u.full_name AS patient, COUNT(a.appointment_id) AS total_appointments FROM patients p JOIN users u ON p.user_id=u.user_id LEFT JOIN appointments a ON p.patient_id=a.patient_id GROUP BY p.patient_id, u.full_name ORDER BY total_appointments DESC`),
      await run('Patients with No Appointments',
        `SELECT u.full_name AS patient, p.blood_type, p.allergies FROM patients p JOIN users u ON p.user_id=u.user_id WHERE p.patient_id NOT IN (SELECT DISTINCT patient_id FROM appointments)`),
      await run('Appointments & Records Count per Patient',
        `SELECT u.full_name AS patient, COUNT(a.appointment_id) AS appointments, COUNT(r.record_id) AS medical_records FROM patients p JOIN users u ON p.user_id=u.user_id LEFT JOIN appointments a ON p.patient_id=a.patient_id LEFT JOIN medical_records r ON p.patient_id=r.patient_id GROUP BY p.patient_id, u.full_name ORDER BY appointments DESC`),
    ]
  };

  // ── ABDULLAH ALANI – Doctors ───────────────────────────────
  const abdullah = { name: 'Mohammed Alshaibani', id: 'N/A', entity: 'Doctors',
    basic: [
      await run('All Doctors with Specializations',
        `SELECT d.doctor_id, u.full_name, d.specialization, d.license_number, d.hospital_affiliation, d.contact_phone FROM doctors d JOIN users u ON d.user_id=u.user_id ORDER BY d.specialization`),
      await run('Cardiologist Doctors',
        `SELECT d.doctor_id, u.full_name, d.specialization, d.hospital_affiliation FROM doctors d JOIN users u ON d.user_id=u.user_id WHERE d.specialization='Cardiology'`),
      await run('Doctors at King Faisal Hospital',
        `SELECT d.doctor_id, u.full_name, d.specialization, d.license_number, d.hospital_affiliation FROM doctors d JOIN users u ON d.user_id=u.user_id WHERE d.hospital_affiliation ILIKE '%King Faisal%'`),
      await run('Top 3 Doctors Alphabetically',
        `SELECT d.doctor_id, u.full_name, d.specialization, d.contact_phone FROM doctors d JOIN users u ON d.user_id=u.user_id ORDER BY u.full_name ASC LIMIT 3`),
      await run('Doctor Count by Specialization',
        `SELECT d.specialization, COUNT(*) AS doctors_in_specialty FROM doctors d GROUP BY d.specialization ORDER BY doctors_in_specialty DESC`),
    ],
    advanced: [
      await run('Total Appointments per Doctor',
        `SELECT ud.full_name AS doctor, d.specialization, COUNT(a.appointment_id) AS total_appointments FROM doctors d JOIN users ud ON d.user_id=ud.user_id LEFT JOIN appointments a ON d.doctor_id=a.doctor_id GROUP BY d.doctor_id, ud.full_name, d.specialization ORDER BY total_appointments DESC`),
      await run('Doctors with 2+ Completed Appointments',
        `SELECT ud.full_name AS doctor, d.specialization, COUNT(a.appointment_id) AS completed_count FROM doctors d JOIN users ud ON d.user_id=ud.user_id JOIN appointments a ON d.doctor_id=a.doctor_id WHERE a.status='completed' GROUP BY d.doctor_id, ud.full_name, d.specialization HAVING COUNT(a.appointment_id)>=2 ORDER BY completed_count DESC`),
      await run('Average Appointments per Specialty',
        `SELECT d.specialization, AVG(cnt) OVER (PARTITION BY d.specialization) AS avg_per_specialty, ud.full_name AS doctor FROM doctors d JOIN users ud ON d.user_id=ud.user_id LEFT JOIN (SELECT doctor_id, COUNT(*) AS cnt FROM appointments GROUP BY doctor_id) ac ON d.doctor_id=ac.doctor_id`),
      await run('Doctors with No Appointments',
        `SELECT ud.full_name AS doctor, d.specialization FROM doctors d JOIN users ud ON d.user_id=ud.user_id WHERE d.doctor_id NOT IN (SELECT DISTINCT doctor_id FROM appointments)`),
      await run('Top Doctor by Appointment Count',
        `SELECT ud.full_name AS top_doctor, d.specialization, COUNT(a.appointment_id) AS appointments FROM doctors d JOIN users ud ON d.user_id=ud.user_id JOIN appointments a ON d.doctor_id=a.doctor_id GROUP BY d.doctor_id, ud.full_name, d.specialization ORDER BY appointments DESC LIMIT 1`),
    ]
  };

  // ── KHALED ALFEHAID – Appointments ────────────────────────
  const khaled = { name: 'Nawaf Alfraikh', id: '222110778', entity: 'Appointments',
    basic: [
      await run('All Appointments with Patient & Doctor',
        `SELECT a.appointment_id, up.full_name AS patient, ud.full_name AS doctor, a.appointment_datetime, a.status, a.type FROM appointments a JOIN patients p ON a.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id JOIN doctors d ON a.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id ORDER BY a.appointment_datetime DESC`),
      await run('Upcoming Scheduled Appointments',
        `SELECT a.appointment_id, up.full_name AS patient, ud.full_name AS doctor, a.appointment_datetime, a.type, a.notes FROM appointments a JOIN patients p ON a.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id JOIN doctors d ON a.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id WHERE a.status='scheduled' ORDER BY a.appointment_datetime ASC`),
      await run('All Completed Appointments',
        `SELECT a.appointment_id, up.full_name AS patient, ud.full_name AS doctor, a.appointment_datetime, a.status FROM appointments a JOIN patients p ON a.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id JOIN doctors d ON a.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id WHERE a.status='completed'`),
      await run('Appointment Count by Type',
        `SELECT a.type, COUNT(*) AS total FROM appointments a GROUP BY a.type ORDER BY total DESC`),
      await run('Appointments After April 15 2026',
        `SELECT a.appointment_id, up.full_name AS patient, a.appointment_datetime, a.status, a.notes FROM appointments a JOIN patients p ON a.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id WHERE a.appointment_datetime >= '2026-04-15' ORDER BY a.appointment_datetime ASC`),
    ],
    advanced: [
      await run('Appointment Count by Status',
        `SELECT a.status, COUNT(*) AS total FROM appointments a GROUP BY a.status ORDER BY total DESC`),
      await run('Monthly Appointment Trends',
        `SELECT TO_CHAR(a.appointment_datetime, 'YYYY-MM') AS month, COUNT(*) AS total_appointments FROM appointments a GROUP BY TO_CHAR(a.appointment_datetime, 'YYYY-MM') ORDER BY month DESC`),
      await run('Total & Completed Appointments per Patient',
        `SELECT up.full_name AS patient, COUNT(a.appointment_id) AS total_appointments, SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END) AS completed FROM appointments a JOIN patients p ON a.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id GROUP BY a.patient_id, up.full_name ORDER BY total_appointments DESC`),
      await run('Doctor Completion Rate (%)',
        `SELECT ud.full_name AS doctor, COUNT(a.appointment_id) AS total, ROUND(100.0*SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END)/COUNT(*),1) AS completion_pct FROM appointments a JOIN doctors d ON a.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id GROUP BY a.doctor_id, ud.full_name ORDER BY completion_pct DESC`),
      await run('Doctors with 2+ Scheduled Appointments',
        `SELECT ud.full_name AS doctor, d.specialization, COUNT(a.appointment_id) AS scheduled_count FROM appointments a JOIN doctors d ON a.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id WHERE a.status='scheduled' GROUP BY a.doctor_id, ud.full_name, d.specialization HAVING COUNT(a.appointment_id)>=2`),
    ]
  };

  // ── FARIS ALMUSAIRIEY – Medical Records ───────────────────
  const faris = { name: 'Omar Alwahashi', id: '223111219', entity: 'Medical Records',
    basic: [
      await run('All Medical Records with Patient & Doctor',
        `SELECT r.record_id, up.full_name AS patient, ud.full_name AS doctor, r.visit_date, r.diagnosis, r.record_type FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id JOIN doctors d ON r.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id ORDER BY r.visit_date DESC`),
      await run('Checkup Records Only',
        `SELECT r.record_id, up.full_name AS patient, r.visit_date, r.diagnosis, r.prescription FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id WHERE r.record_type='checkup' ORDER BY r.visit_date DESC`),
      await run('Records for Patient #1',
        `SELECT r.record_id, up.full_name AS patient, ud.full_name AS doctor, r.visit_date, r.diagnosis FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id JOIN doctors d ON r.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id WHERE r.patient_id=1`),
      await run('Records from April 2026 Onwards',
        `SELECT r.record_id, up.full_name AS patient, r.visit_date, r.diagnosis FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id WHERE r.visit_date >= '2026-04-01' ORDER BY r.visit_date DESC`),
      await run('Record Count by Type',
        `SELECT r.record_type, COUNT(*) AS total FROM medical_records r GROUP BY r.record_type ORDER BY total DESC`),
    ],
    advanced: [
      await run('Records & Distinct Types per Patient',
        `SELECT up.full_name AS patient, COUNT(r.record_id) AS total_records, COUNT(DISTINCT r.record_type) AS distinct_types FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id GROUP BY r.patient_id, up.full_name ORDER BY total_records DESC`),
      await run('Records Created per Doctor',
        `SELECT ud.full_name AS doctor, d.specialization, COUNT(r.record_id) AS records_created FROM medical_records r JOIN doctors d ON r.doctor_id=d.doctor_id JOIN users ud ON d.user_id=ud.user_id GROUP BY r.doctor_id, ud.full_name, d.specialization ORDER BY records_created DESC`),
      await run('Patients with 2 or More Records',
        `SELECT up.full_name AS patient, COUNT(r.record_id) AS records FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id GROUP BY r.patient_id, up.full_name HAVING COUNT(r.record_id)>=2`),
      await run('Records for Patients with Completed Appointments',
        `SELECT up.full_name AS patient, r.diagnosis, r.visit_date FROM medical_records r JOIN patients p ON r.patient_id=p.patient_id JOIN users up ON p.user_id=up.user_id WHERE r.patient_id IN (SELECT DISTINCT patient_id FROM appointments WHERE status='completed') ORDER BY r.visit_date DESC`),
      await run('Unique Patients & Doctors per Record Type',
        `SELECT r.record_type, COUNT(*) AS total, COUNT(DISTINCT r.patient_id) AS unique_patients, COUNT(DISTINCT r.doctor_id) AS unique_doctors FROM medical_records r GROUP BY r.record_type ORDER BY total DESC`),
    ]
  };

  // ── OMAR ALWAHASHI – Users & Staff ────────────────────────
  const omar = { name: 'Omar Alwahashi', id: '223111219', entity: 'Users & Staff',
    basic: [
      await run('All Users by Registration Date',
        `SELECT user_id, full_name, email, role, created_date, last_login FROM users ORDER BY created_date DESC`),
      await run('All Doctors (User Accounts)',
        `SELECT user_id, full_name, email, role, last_login FROM users WHERE role='doctor' ORDER BY full_name`),
      await run('All Patients (User Accounts)',
        `SELECT user_id, full_name, email, role, last_login FROM users WHERE role='patient' ORDER BY full_name`),
      await run('All Staff with Departments',
        `SELECT s.staff_id, u.full_name, s.department, s.job_title, s.contact_phone FROM staff s JOIN users u ON s.user_id=u.user_id ORDER BY s.department`),
      await run('Top 5 Most Recently Logged In',
        `SELECT user_id, full_name, email, role, last_login FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT 5`),
    ],
    advanced: [
      await run('User Count by Role',
        `SELECT role, COUNT(*) AS total_users FROM users GROUP BY role ORDER BY total_users DESC`),
      await run('Staff Count by Department',
        `SELECT s.department, COUNT(*) AS staff_count FROM staff s GROUP BY s.department ORDER BY staff_count DESC`),
      await run('Roles with 2 or More Users',
        `SELECT role, COUNT(*) AS total FROM users GROUP BY role HAVING COUNT(*)>=2 ORDER BY total DESC`),
      await run('Users Linked to Patients or Doctors',
        `SELECT u.full_name, u.email, u.role, u.last_login FROM users u WHERE u.user_id IN (SELECT user_id FROM patients UNION SELECT user_id FROM doctors) ORDER BY u.role, u.full_name`),
      await run('Registration Range & Count by Role',
        `SELECT u.role, MIN(u.created_date) AS earliest_registration, MAX(u.created_date) AS latest_registration, COUNT(*) AS total FROM users u GROUP BY u.role ORDER BY total DESC`),
    ]
  };

  res.render('queries', { title: 'SQL Queries – Phase 5', members: [nawaf, abdullah, khaled, faris, omar] });
});

module.exports = router;
