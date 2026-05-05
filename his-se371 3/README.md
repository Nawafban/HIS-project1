# HIS – Hospital Information System
### SE371 Full-Stack SaaS – Phase 2
**ORM: Sequelize + MySQL**

| # | Member | Module |
|---|--------|--------|
| 1 | Nawaf Alfraikh | Patients · Appointments · Feedback |
| 2 | Omar Alwahashi | Users · Medical Records |
| 3 | Mohammed Alshaibani | Doctors · Plans |

## Quick Start
```bash
npm install
mysql -u root < db/schema.sql
npm run dev
```
Open http://localhost:3000  |  Login: admin@his.sa / admin123

> Root password is empty. If yours differs: edit DB_PASSWORD in .env

## What is Sequelize?
Sequelize is a Node.js ORM that replaces raw SQL with JavaScript model methods:
- Patient.create({ ... })   instead of INSERT INTO
- User.findAll({ ... })     instead of SELECT *
- Doctor.update({ ... })    instead of UPDATE SET
- Feedback.destroy({ ... }) instead of DELETE FROM

## New Features
- /dashboard  Live stats dashboard with charts (unique feature)
- /search     Global search bar in nav — searches all tables

## SE371 Requirements Met
- Sequelize ORM with MySQL dialect
- Plans table + full CRUD via Plan model
- Feedback table + CRUD + keyword search via Feedback model (Op.like)
- EJS rendering of all DB results
- method-override for PUT/DELETE from HTML forms
