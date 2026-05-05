// routes/users.js – Omar Alwahashi (223111219)
const express = require('express');
const router  = express.Router();
const { User } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rows = await User.findAll({ order: [['created_date', 'DESC']] });
    res.render('users', { users: rows, title: 'Users', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('users', { users: [], title: 'Users', success: null, error: 'Database error: ' + err.message });
  }
});

router.post('/', async (req, res) => {
  const { full_name, email, role } = req.body;
  try {
    await User.create({ full_name, email, password: 'changeme123', role });
    res.redirect('/users?success=User+created+successfully');
  } catch (err) {
    res.redirect('/users?error=' + encodeURIComponent('Failed: ' + err.message));
  }
});

router.put('/:id', async (req, res) => {
  const { full_name, email, role } = req.body;
  try {
    await User.update({ full_name, email, role }, { where: { user_id: req.params.id } });
    res.redirect('/users?success=User+updated');
  } catch (err) {
    res.redirect('/users?error=Update+failed');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.destroy({ where: { user_id: req.params.id } });
    res.redirect('/users?success=User+deleted');
  } catch (err) {
    res.redirect('/users?error=Delete+failed:+user+may+have+linked+records');
  }
});

module.exports = router;
