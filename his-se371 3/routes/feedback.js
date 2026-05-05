// routes/feedback.js – SE371 Requirement – Nawaf Alfraikh
const express  = require('express');
const router   = express.Router();
const { Op }   = require('sequelize');
const { Feedback } = require('../models');

// READ + keyword search (SE371 requirement: GET with keyword)
router.get('/', async (req, res) => {
  const keyword = req.query.q || '';
  try {
    const where = keyword ? {
      [Op.or]: [
        { name:    { [Op.like]: `%${keyword}%` } },
        { subject: { [Op.like]: `%${keyword}%` } },
        { message: { [Op.like]: `%${keyword}%` } },
      ]
    } : {};
    const rows = await Feedback.findAll({ where, order: [['created_at', 'DESC']] });
    res.render('feedback', { feedback: rows.map(r => r.dataValues), keyword, title: 'Feedback & Support', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('feedback', { feedback: [], keyword: '', title: 'Feedback & Support', success: null, error: 'Database error: ' + err.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await Feedback.create({ name, email, subject, message });
    res.redirect('/feedback?success=Thank+you!+Your+message+has+been+received.');
  } catch (err) {
    res.redirect('/feedback?error=Failed+to+submit');
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.destroy({ where: { feedback_id: req.params.id } });
    res.redirect('/feedback?success=Feedback+deleted');
  } catch (err) {
    res.redirect('/feedback?error=Delete+failed');
  }
});

module.exports = router;
