// routes/dashboard.js – Live Statistics Dashboard (unique feature)
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const [[counts]] = await Promise.all([
      db.run(`SELECT
        (SELECT COUNT(*) FROM patients)     AS total_patients,
        (SELECT COUNT(*) FROM doctors)      AS total_doctors,
        (SELECT COUNT(*) FROM appointments) AS total_appointments,
        (SELECT COUNT(*) FROM medical_records) AS total_records,
        (SELECT COUNT(*) FROM users)        AS total_users`)
    ]);

    const apptByStatus = await db.run(`
      SELECT status, COUNT(*) AS total FROM appointments GROUP BY status`);

    const apptByMonth = await db.run(`
      SELECT TO_CHAR(appointment_datetime, 'Mon YYYY') AS month,
             TO_CHAR(appointment_datetime, 'YYYY-MM') AS sort_key,
             COUNT(*) AS total
      FROM appointments
      GROUP BY TO_CHAR(appointment_datetime, 'Mon YYYY'),
               TO_CHAR(appointment_datetime, 'YYYY-MM')
      ORDER BY sort_key DESC LIMIT 6`);

    const topDoctors = await db.run(`
      SELECT ud.full_name AS doctor, d.specialization,
             COUNT(a.appointment_id) AS appointments
      FROM doctors d
      JOIN users ud ON d.user_id=ud.user_id
      LEFT JOIN appointments a ON d.doctor_id=a.doctor_id
      GROUP BY d.doctor_id, ud.full_name, d.specialization
      ORDER BY appointments DESC LIMIT 5`);

    const recentAppointments = await db.run(`
      SELECT up.full_name AS patient, ud.full_name AS doctor,
             TO_CHAR(a.appointment_datetime, 'DD Mon YYYY HH24:MI') AS dt,
             a.status, a.type
      FROM appointments a
      JOIN patients p ON a.patient_id=p.patient_id
      JOIN users up   ON p.user_id=up.user_id
      JOIN doctors d  ON a.doctor_id=d.doctor_id
      JOIN users ud   ON d.user_id=ud.user_id
      ORDER BY a.appointment_datetime DESC LIMIT 8`);

    const patientsByGender = await db.run(`
      SELECT gender, COUNT(*) AS total FROM patients GROUP BY gender`);

    const recordsByType = await db.run(`
      SELECT record_type, COUNT(*) AS total FROM medical_records GROUP BY record_type ORDER BY total DESC`);

    res.render('dashboard', {
      title: 'Live Dashboard',
      counts, apptByStatus, apptByMonth, topDoctors,
      recentAppointments, patientsByGender, recordsByType
    });
  } catch (err) {
    res.render('dashboard', {
      title: 'Dashboard', error: err.message,
      counts: {}, apptByStatus: [], apptByMonth: [], topDoctors: [],
      recentAppointments: [], patientsByGender: [], recordsByType: []
    });
  }
});

module.exports = router;
