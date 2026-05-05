// routes/search.js – Global Search
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.render('search', { title: 'Search', q: '', results: null });

  const like = `%${q}%`;
  try {
    const patients = await db.run(`
      SELECT 'Patient' AS type, u.full_name AS name, u.email,
             p.blood_type AS detail, p.contact_phone AS extra,
             CONCAT('/patients') AS link
      FROM patients p JOIN users u ON p.user_id=u.user_id
      WHERE u.full_name LIKE ? OR u.email LIKE ? OR p.contact_phone LIKE ? OR p.blood_type LIKE ?`,
      [like, like, like, like]);

    const doctors = await db.run(`
      SELECT 'Doctor' AS type, u.full_name AS name, u.email,
             d.specialization AS detail, d.hospital_affiliation AS extra,
             CONCAT('/doctors') AS link
      FROM doctors d JOIN users u ON d.user_id=u.user_id
      WHERE u.full_name LIKE ? OR d.specialization LIKE ? OR d.hospital_affiliation LIKE ? OR u.email LIKE ?`,
      [like, like, like, like]);

    const appointments = await db.run(`
      SELECT 'Appointment' AS type,
             CONCAT(up.full_name, ' → ', ud.full_name) AS name,
             a.type AS email,
             a.status AS detail,
             DATE_FORMAT(a.appointment_datetime, '%Y-%m-%d %H:%i') AS extra,
             CONCAT('/appointments') AS link
      FROM appointments a
      JOIN patients p ON a.patient_id=p.patient_id
      JOIN users up   ON p.user_id=up.user_id
      JOIN doctors d  ON a.doctor_id=d.doctor_id
      JOIN users ud   ON d.user_id=ud.user_id
      WHERE up.full_name LIKE ? OR ud.full_name LIKE ? OR a.type LIKE ? OR a.status LIKE ? OR a.notes LIKE ?`,
      [like, like, like, like, like]);

    const records = await db.run(`
      SELECT 'Medical Record' AS type,
             up.full_name AS name, r.diagnosis AS email,
             r.record_type AS detail,
             DATE_FORMAT(r.visit_date, '%Y-%m-%d') AS extra,
             CONCAT('/records') AS link
      FROM medical_records r
      JOIN patients p ON r.patient_id=p.patient_id
      JOIN users up   ON p.user_id=up.user_id
      WHERE up.full_name LIKE ? OR r.diagnosis LIKE ? OR r.prescription LIKE ?`,
      [like, like, like]);

    const users = await db.run(`
      SELECT 'User' AS type, full_name AS name, email,
             role AS detail, '' AS extra,
             CONCAT('/users') AS link
      FROM users
      WHERE full_name LIKE ? OR email LIKE ? OR role LIKE ?`,
      [like, like, like]);

    const results = [...patients, ...doctors, ...appointments, ...records, ...users];
    res.render('search', { title: `Search: "${q}"`, q, results });
  } catch (err) {
    res.render('search', { title: 'Search', q, results: [], error: err.message });
  }
});

module.exports = router;
