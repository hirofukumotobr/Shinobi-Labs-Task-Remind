const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Return DATE/DATETIME columns as plain strings (e.g. "2026-07-30") instead
  // of JS Date objects, so no timezone conversion can shift the calendar day.
  dateStrings: true,
});

module.exports = pool;
