// models/index.js – Sequelize model loader + associations
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// ── USER ─────────────────────────────────────────────────────
const User = sequelize.define('User', {
  user_id:      { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  full_name:    { type: DataTypes.STRING(100),  allowNull: false },
  email:        { type: DataTypes.STRING(150),  allowNull: false, unique: true },
  password:     { type: DataTypes.STRING(255),  allowNull: false },
  role:         { type: DataTypes.ENUM('patient','doctor','staff','admin'), defaultValue: 'patient' },
  created_date: { type: DataTypes.DATE,         defaultValue: DataTypes.NOW },
  last_login:   { type: DataTypes.DATE,         allowNull: true },
}, { tableName: 'users', timestamps: false });

// ── PATIENT ───────────────────────────────────────────────────
const Patient = sequelize.define('Patient', {
  patient_id:         { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER,     allowNull: false },
  date_of_birth:      { type: DataTypes.DATEONLY,    allowNull: false },
  gender:             { type: DataTypes.ENUM('male','female','other'), allowNull: false },
  contact_phone:      { type: DataTypes.STRING(20),  allowNull: false },
  address:            { type: DataTypes.STRING(255), allowNull: false },
  emergency_contact:  { type: DataTypes.STRING(100), allowNull: false },
  blood_type:         { type: DataTypes.ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'), allowNull: false },
  allergies:          { type: DataTypes.TEXT,        allowNull: true },
  insurance_provider: { type: DataTypes.STRING(100), allowNull: true },
  insurance_number:   { type: DataTypes.STRING(50),  allowNull: true },
}, { tableName: 'patients', timestamps: false });

// ── DOCTOR ────────────────────────────────────────────────────
const Doctor = sequelize.define('Doctor', {
  doctor_id:            { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:              { type: DataTypes.INTEGER,     allowNull: false },
  specialization:       { type: DataTypes.STRING(100), allowNull: false },
  license_number:       { type: DataTypes.STRING(50),  allowNull: false, unique: true },
  hospital_affiliation: { type: DataTypes.STRING(150), allowNull: false },
  contact_phone:        { type: DataTypes.STRING(20),  allowNull: false },
}, { tableName: 'doctors', timestamps: false });

// ── STAFF ─────────────────────────────────────────────────────
const Staff = sequelize.define('Staff', {
  staff_id:      { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:       { type: DataTypes.INTEGER,     allowNull: false },
  department:    { type: DataTypes.STRING(100), allowNull: false },
  job_title:     { type: DataTypes.STRING(100), allowNull: false },
  contact_phone: { type: DataTypes.STRING(20),  allowNull: false },
}, { tableName: 'staff', timestamps: false });

// ── APPOINTMENT ───────────────────────────────────────────────
const Appointment = sequelize.define('Appointment', {
  appointment_id:       { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  patient_id:           { type: DataTypes.INTEGER,     allowNull: false },
  doctor_id:            { type: DataTypes.INTEGER,     allowNull: false },
  appointment_datetime: { type: DataTypes.DATE,        allowNull: false },
  status:               { type: DataTypes.ENUM('scheduled','completed','cancelled'), defaultValue: 'scheduled' },
  type:                 { type: DataTypes.STRING(100), defaultValue: 'General' },
  notes:                { type: DataTypes.TEXT,        allowNull: true },
}, { tableName: 'appointments', timestamps: false });

// ── MEDICAL RECORD ────────────────────────────────────────────
const MedicalRecord = sequelize.define('MedicalRecord', {
  record_id:       { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  patient_id:      { type: DataTypes.INTEGER,     allowNull: false },
  doctor_id:       { type: DataTypes.INTEGER,     allowNull: false },
  visit_date:      { type: DataTypes.DATEONLY,    allowNull: false },
  diagnosis:       { type: DataTypes.TEXT,        allowNull: false },
  prescription:    { type: DataTypes.TEXT,        allowNull: true },
  treatment_notes: { type: DataTypes.TEXT,        allowNull: true },
  test_results:    { type: DataTypes.TEXT,        allowNull: true },
  record_type:     { type: DataTypes.ENUM('checkup','emergency','follow-up','surgery','lab','consultation'), defaultValue: 'checkup' },
}, { tableName: 'medical_records', timestamps: false });

// ── PLAN (SE371 requirement) ──────────────────────────────────
const Plan = sequelize.define('Plan', {
  plan_id:       { type: DataTypes.INTEGER,                          primaryKey: true, autoIncrement: true },
  name:          { type: DataTypes.STRING(100),                      allowNull: false },
  price:         { type: DataTypes.DECIMAL(10, 2),                   allowNull: false },
  billing_cycle: { type: DataTypes.ENUM('monthly','annual'),         defaultValue: 'monthly' },
  max_users:     { type: DataTypes.INTEGER,                          allowNull: false },
  max_patients:  { type: DataTypes.INTEGER,                          allowNull: false },
  storage_gb:    { type: DataTypes.INTEGER,                          allowNull: false },
  features:      { type: DataTypes.TEXT,                             allowNull: false },
  is_popular:    { type: DataTypes.BOOLEAN,                          defaultValue: false },
  created_at:    { type: DataTypes.DATE,                             defaultValue: DataTypes.NOW },
  updated_at:    { type: DataTypes.DATE,                             defaultValue: DataTypes.NOW },
}, { tableName: 'plans', timestamps: false });

// ── FEEDBACK (SE371 requirement) ──────────────────────────────
const Feedback = sequelize.define('Feedback', {
  feedback_id: { type: DataTypes.INTEGER,                                    primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100),                                allowNull: false },
  email:       { type: DataTypes.STRING(150),                                allowNull: false },
  subject:     { type: DataTypes.STRING(200),                                allowNull: false },
  message:     { type: DataTypes.TEXT,                                       allowNull: false },
  status:      { type: DataTypes.ENUM('open','resolved','closed'),           defaultValue: 'open' },
  created_at:  { type: DataTypes.DATE,                                       defaultValue: DataTypes.NOW },
}, { tableName: 'feedback', timestamps: false });

// ── ASSOCIATIONS ──────────────────────────────────────────────
Patient.belongsTo(User,    { foreignKey: 'user_id' });
Doctor.belongsTo(User,     { foreignKey: 'user_id' });
Staff.belongsTo(User,      { foreignKey: 'user_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });
Appointment.belongsTo(Doctor,  { foreignKey: 'doctor_id' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id' });
MedicalRecord.belongsTo(Doctor,  { foreignKey: 'doctor_id' });

module.exports = { User, Patient, Doctor, Staff, Appointment, MedicalRecord, Plan, Feedback };
