// db.js – Sequelize ORM + PostgreSQL (Supabase)
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST,
    port:    parseInt(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Convenience helper – runs raw SQL with ? placeholders converted to $1,$2...
sequelize.run = async (sql, params = []) => {
  // Convert MySQL ? placeholders to PostgreSQL $1, $2...
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  const [rows] = await sequelize.query(pgSql, {
    bind: params,
    type: Sequelize.QueryTypes.RAW,
  });
  return Array.isArray(rows) ? rows : [];
};

module.exports = sequelize;
