const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const caPath = path.join(__dirname, 'aiven-ca.pem');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ...(fs.existsSync(caPath) && { ssl: { ca: fs.readFileSync(caPath) } }),
});

module.exports = pool.promise();