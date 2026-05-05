// routes/doctors.js – Mohammed Alshaibani
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { User, Doctor } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rows = await db.run(`
      SELECT d.*, u.full_name, u.email
      FROM doctors d JOIN users u ON d.user_id = u.user_id
      ORDER BY d.doctor_id`);
    res.render('doctors', { doctors: rows, title: 'Doctors', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('doctors', { doctors: [], title: 'Doctors', success: null, error: 'Database error: ' + err.message });
  }
});

router.post('/', async (req, res) => {
  const { full_name, email, specialization, license_number, hospital_affiliation, contact_phone } = req.body;
  try {
    const user = await User.create({ full_name, email, password: 'changeme123', role: 'doctor' });
    await Doctor.create({ user_id: user.user_id, specialization, license_number, hospital_affiliation, contact_phone });
    res.redirect('/doctors?success=Doctor+added+successfully');
  } catch (err) {
    res.redirect('/doctors?error=' + encodeURIComponent('Failed: ' + err.message));
  }
});

router.put('/:id', async (req, res) => {
  const { specialization, license_number, hospital_affiliation, contact_phone } = req.body;
  try {
    await Doctor.update({ specialization, license_number, hospital_affiliation, contact_phone }, { where: { doctor_id: req.params.id } });
    res.redirect('/doctors?success=Doctor+updated');
  } catch (err) {
    res.redirect('/doctors?error=Update+failed');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findByPk(req.params.id);
    await Doctor.destroy({ where: { doctor_id: req.params.id } });
    if (doc) await User.destroy({ where: { user_id: doc.user_id } });
    res.redirect('/doctors?success=Doctor+deleted');
  } catch (err) {
    res.redirect('/doctors?error=Delete+failed');
  }
});

module.exports = router;
