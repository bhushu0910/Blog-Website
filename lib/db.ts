import mysql from 'mysql2/promise';

const host = process.env.DB_HOST || 'localhost';
const isRemote = host !== 'localhost' && host !== '127.0.0.1';

const pool = mysql.createPool({
  host,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'defaultdb',
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
