// server.js – SE371 Hospital Information System
// ORM: Sequelize + MySQL
require('dotenv').config();
const express        = require('express');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const session        = require('express-session');
const path           = require('path');
const db             = require('./db');
const { User, Patient } = require('./models');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: 'his_se371_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => { res.locals.user = req.session.user || null; next(); });

const auth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

// ── AUTH ─────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { title: 'Login', error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, password } });
    if (!user) return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
    req.session.user = user.dataValues;
    res.redirect('/');
  } catch (err) {
    res.render('login', { title: 'Login', error: 'Database error: ' + err.message });
  }
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

// ── PROFILE ──────────────────────────────────────────────────
app.get('/profile', auth, async (req, res) => {
  try {
    const user = req.session.user;
    let extra = null;
    if (user.role === 'patient') {
      const rows = await db.run(`SELECT p.*, u.full_name, u.email FROM patients p JOIN users u ON p.user_id=u.user_id WHERE p.user_id=?`, [user.user_id]);
      extra = rows[0] || null;
    } else if (user.role === 'doctor') {
      const rows = await db.run(`SELECT d.*, u.full_name, u.email FROM doctors d JOIN users u ON d.user_id=u.user_id WHERE d.user_id=?`, [user.user_id]);
      extra = rows[0] || null;
    }
    res.render('profile', { title: 'My Profile', user, extra, success: req.query.success || null, error: null });
  } catch (err) {
    res.render('profile', { title: 'My Profile', user: req.session.user, extra: null, success: null, error: err.message });
  }
});

app.post('/profile/edit', auth, async (req, res) => {
  const { full_name, email } = req.body;
  try {
    await User.update({ full_name, email }, { where: { user_id: req.session.user.user_id } });
    const user = await User.findByPk(req.session.user.user_id);
    req.session.user = user.dataValues;
    res.redirect('/profile?success=Profile+updated+successfully');
  } catch (err) {
    res.redirect('/profile?error=' + encodeURIComponent(err.message));
  }
});

// ── PATIENT RECORDS PAGE ─────────────────────────────────────
app.get('/records/patient/:pid', auth, async (req, res) => {
  try {
    const records = await db.run(`
      SELECT r.*, ud.full_name AS doctor_name, d.specialization
      FROM medical_records r
      JOIN doctors d ON r.doctor_id=d.doctor_id
      JOIN users ud  ON d.user_id=ud.user_id
      WHERE r.patient_id=? ORDER BY r.visit_date DESC`, [req.params.pid]);
    const patRows = await db.run(`SELECT p.*, u.full_name, u.email FROM patients p JOIN users u ON p.user_id=u.user_id WHERE p.patient_id=?`, [req.params.pid]);
    const patient = patRows[0];
    res.render('patient_records', { records, patient, title: `Records – ${patient ? patient.full_name : 'Patient'}` });
  } catch (err) { res.status(500).send('Error: ' + err.message); }
});

// ── MAIN ROUTES ──────────────────────────────────────────────
app.get('/', auth, (req, res) => res.render('index', { title: 'HIS – Hospital Information System' }));
app.use('/dashboard',    auth, require('./routes/dashboard'));
app.use('/search',       auth, require('./routes/search'));
app.use('/patients',     auth, require('./routes/patients'));
app.use('/doctors',      auth, require('./routes/doctors'));
app.use('/appointments', auth, require('./routes/appointments'));
app.use('/records',      auth, require('./routes/records'));
app.use('/users',        auth, require('./routes/users'));
app.use('/plans',        auth, require('./routes/plans'));
app.use('/feedback',     auth, require('./routes/feedback'));

app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));

app.listen(PORT, () => console.log(`✅  HIS SE371 running → http://localhost:${PORT}`));
