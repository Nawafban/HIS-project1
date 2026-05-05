// routes/records.js – Omar Alwahashi (223111219)
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { MedicalRecord } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rows     = await db.run(`
      SELECT r.*, up.full_name AS patient_name, ud.full_name AS doctor_name
      FROM medical_records r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users up   ON p.user_id = up.user_id
      JOIN doctors d  ON r.doctor_id = d.doctor_id
      JOIN users ud   ON d.user_id = ud.user_id
      ORDER BY r.visit_date DESC`);
    const patients = await db.run('SELECT p.patient_id, u.full_name FROM patients p JOIN users u ON p.user_id=u.user_id');
    const doctors  = await db.run('SELECT d.doctor_id, u.full_name FROM doctors d JOIN users u ON d.user_id=u.user_id');
    res.render('records', { records: rows, patients, doctors, title: 'Medical Records', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('records', { records: [], patients: [], doctors: [], title: 'Medical Records', success: null, error: 'Database error: ' + err.message });
  }
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, visit_date, diagnosis, prescription, treatment_notes, test_results, record_type } = req.body;
  try {
    await MedicalRecord.create({ patient_id, doctor_id, visit_date, diagnosis, prescription: prescription || null, treatment_notes: treatment_notes || null, test_results: test_results || null, record_type });
    res.redirect('/records?success=Medical+record+added');
  } catch (err) {
    res.redirect('/records?error=' + encodeURIComponent('Failed: ' + err.message));
  }
});

router.put('/:id', async (req, res) => {
  const { diagnosis, prescription, treatment_notes, test_results, record_type } = req.body;
  try {
    await MedicalRecord.update({ diagnosis, prescription: prescription || null, treatment_notes: treatment_notes || null, test_results: test_results || null, record_type }, { where: { record_id: req.params.id } });
    res.redirect('/records?success=Record+updated');
  } catch (err) {
    res.redirect('/records?error=Update+failed');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await MedicalRecord.destroy({ where: { record_id: req.params.id } });
    res.redirect('/records?success=Record+deleted');
  } catch (err) {
    res.redirect('/records?error=Delete+failed');
  }
});

router.get('/patient/:pid', async (req, res) => {
  try {
    const records = await db.run(`
      SELECT r.*, ud.full_name AS doctor_name, d.specialization
      FROM medical_records r
      JOIN doctors d  ON r.doctor_id = d.doctor_id
      JOIN users ud   ON d.user_id   = ud.user_id
      WHERE r.patient_id = ?
      ORDER BY r.visit_date DESC`, [req.params.pid]);
    const patRows = await db.run(`SELECT p.*, u.full_name, u.email FROM patients p JOIN users u ON p.user_id=u.user_id WHERE p.patient_id=?`, [req.params.pid]);
    const patient = patRows[0];
    res.render('patient_records', { records, patient, title: `Records – ${patient ? patient.full_name : 'Patient'}` });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

module.exports = router;
