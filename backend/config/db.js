const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST_IP,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectTimeout: 20000,
  waitForConnections: true,
  connectionLimit: 10,
});

// Expose a promise-based pool for async/await usage.
module.exports = pool.promise();
