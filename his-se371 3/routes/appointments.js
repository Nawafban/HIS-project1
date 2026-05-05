// routes/appointments.js – Nawaf Alfraikh (222110778)
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { Appointment } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rows     = await db.run(`
      SELECT a.*, up.full_name AS patient_name, ud.full_name AS doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users up   ON p.user_id = up.user_id
      JOIN doctors d  ON a.doctor_id = d.doctor_id
      JOIN users ud   ON d.user_id = ud.user_id
      ORDER BY a.appointment_datetime DESC`);
    const patients = await db.run('SELECT p.patient_id, u.full_name FROM patients p JOIN users u ON p.user_id=u.user_id');
    const doctors  = await db.run('SELECT d.doctor_id, u.full_name, d.specialization FROM doctors d JOIN users u ON d.user_id=u.user_id');
    res.render('appointments', { appointments: rows, patients, doctors, title: 'Appointments', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('appointments', { appointments: [], patients: [], doctors: [], title: 'Appointments', success: null, error: 'Database error: ' + err.message });
  }
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, appointment_datetime, type, notes } = req.body;
  try {
    await Appointment.create({ patient_id, doctor_id, appointment_datetime, type, notes: notes || null });
    res.redirect('/appointments?success=Appointment+scheduled');
  } catch (err) {
    res.redirect('/appointments?error=' + encodeURIComponent('Failed: ' + err.message));
  }
});

router.put('/:id', async (req, res) => {
  const { status, type, notes, appointment_datetime } = req.body;
  try {
    await Appointment.update({ status, type, notes: notes || null, appointment_datetime }, { where: { appointment_id: req.params.id } });
    res.redirect('/appointments?success=Appointment+updated');
  } catch (err) {
    res.redirect('/appointments?error=Update+failed');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.destroy({ where: { appointment_id: req.params.id } });
    res.redirect('/appointments?success=Appointment+deleted');
  } catch (err) {
    res.redirect('/appointments?error=Delete+failed');
  }
});

module.exports = router;
