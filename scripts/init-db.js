const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.log('No .env.local loaded automatically in script');
}

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'blog_database';

async function initDB() {
  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);
  let connection;

  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('Connected to MySQL successfully.');

    // Execute schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Executing database schema initialization...');
    await connection.query(schemaSql);
    console.log('Schema created/verified successfully.');

    await connection.query(`USE \`${database}\``);

    // Seed default admin
    const defaultAdminUsername = 'admin';
    const defaultAdminPassword = 'Admin@123456';

    const [rows] = await connection.query('SELECT * FROM admins WHERE username = ?', [defaultAdminUsername]);

    if (rows.length === 0) {
      console.log(`Seeding initial admin account: ${defaultAdminUsername}`);
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      await connection.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [defaultAdminUsername, hashedPassword]
      );
      console.log('Initial admin created successfully!');
      console.log(`Default credentials -> Username: ${defaultAdminUsername} | Password: ${defaultAdminPassword}`);
    } else {
      console.log('Admin account already exists.');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:');
    console.error(error);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n--> TROUBLESHOOTING: Connection refused. Is your local MySQL server service started on port 3306?');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n--> TROUBLESHOOTING: Access denied. Please check your DB_USER and DB_PASSWORD in .env.local.');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDB();
