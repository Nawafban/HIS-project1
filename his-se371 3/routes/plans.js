// routes/plans.js – SE371 Requirement – Mohammed Alshaibani
const express = require('express');
const router  = express.Router();
const { Plan } = require('../models');

const parseFeatures = (plan) => {
  try { plan.featuresArr = JSON.parse(plan.features); } catch { plan.featuresArr = []; }
  return plan;
};

// READ all
router.get('/', async (req, res) => {
  try {
    const rows = await Plan.findAll({ order: [['price', 'ASC']] });
    rows.forEach(p => parseFeatures(p.dataValues));
    res.render('plans', { plans: rows.map(r => r.dataValues), title: 'Pricing Plans', success: req.query.success || null, error: null });
  } catch (err) {
    res.render('plans', { plans: [], title: 'Pricing Plans', success: null, error: 'Database error: ' + err.message });
  }
});

// READ one
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).render('404', { title: 'Not Found' });
    parseFeatures(plan.dataValues);
    res.render('plan-details', { plan: plan.dataValues, title: plan.name + ' Plan' });
  } catch (err) {
    res.redirect('/plans');
  }
});

// CREATE
router.post('/', async (req, res) => {
  const { name, price, billing_cycle, max_users, max_patients, storage_gb, features, is_popular } = req.body;
  const featuresJson = JSON.stringify(features.split('\n').map(f => f.trim()).filter(Boolean));
  try {
    await Plan.create({ name, price, billing_cycle, max_users, max_patients, storage_gb, features: featuresJson, is_popular: is_popular === 'on' });
    res.redirect('/plans?success=Plan+created+successfully');
  } catch (err) {
    res.redirect('/plans?error=' + encodeURIComponent('Failed: ' + err.message));
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { name, price, billing_cycle, max_users, max_patients, storage_gb, features, is_popular } = req.body;
  const featuresJson = JSON.stringify(features.split('\n').map(f => f.trim()).filter(Boolean));
  try {
    await Plan.update({ name, price, billing_cycle, max_users, max_patients, storage_gb, features: featuresJson, is_popular: is_popular === 'on' }, { where: { plan_id: req.params.id } });
    res.redirect('/plans?success=Plan+updated');
  } catch (err) {
    res.redirect('/plans?error=Update+failed');
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Plan.destroy({ where: { plan_id: req.params.id } });
    res.redirect('/plans?success=Plan+deleted');
  } catch (err) {
    res.redirect('/plans?error=Delete+failed');
  }
});

module.exports = router;
