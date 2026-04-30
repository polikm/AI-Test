const mysql = require('mysql2/promise');

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_assessment',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

const query = async (sql, params = []) => {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const getConnection = async () => {
  const pool = getPool();
  return await pool.getConnection();
};

module.exports = { query, getPool, getConnection };
