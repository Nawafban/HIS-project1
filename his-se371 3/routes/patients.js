// routes/patients.js – Nawaf Alfraikh (222110778)
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { User, Patient } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rows = await db.run(`
      SELECT p.*, u.full_name, u.email
      FROM patients p JOIN users u ON p.user_id = u.user_id
      ORDER BY p.patient_id DESC`);
    res.render('patients', { patients: rows, title: 'Patients', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('patients', { patients: [], title: 'Patients', success: null, error: 'Database error: ' + err.message });
  }
});

router.post('/', async (req, res) => {
  const { full_name, email, date_of_birth, gender, contact_phone, address, emergency_contact, blood_type, allergies, insurance_provider, insurance_number } = req.body;
  try {
    const user = await User.create({ full_name, email, password: 'changeme123', role: 'patient' });
    await Patient.create({ user_id: user.user_id, date_of_birth, gender, contact_phone, address, emergency_contact, blood_type, allergies: allergies || null, insurance_provider: insurance_provider || null, insurance_number: insurance_number || null });
    res.redirect('/patients?success=Patient+registered+successfully');
  } catch (err) {
    res.redirect('/patients?error=' + encodeURIComponent('Failed: ' + err.message));
  }
});

router.put('/:id', async (req, res) => {
  const { contact_phone, address, emergency_contact, blood_type, allergies, insurance_provider, insurance_number } = req.body;
  try {
    await Patient.update({ contact_phone, address, emergency_contact, blood_type, allergies: allergies || null, insurance_provider: insurance_provider || null, insurance_number: insurance_number || null }, { where: { patient_id: req.params.id } });
    res.redirect('/patients?success=Patient+updated+successfully');
  } catch (err) {
    res.redirect('/patients?error=Update+failed');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pat = await Patient.findByPk(req.params.id);
    await Patient.destroy({ where: { patient_id: req.params.id } });
    if (pat) await User.destroy({ where: { user_id: pat.user_id } });
    res.redirect('/patients?success=Patient+deleted');
  } catch (err) {
    res.redirect('/patients?error=Delete+failed');
  }
});

module.exports = router;
