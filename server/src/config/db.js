const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let activePool = null;

function createConnectionPool(customPassword) {
  const pwd = customPassword !== undefined ? customPassword : (process.env.DB_PASSWORD || '');
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: pwd,
    database: process.env.DB_NAME || 'medicore_transactional',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: true
  });
}

activePool = createConnectionPool();

// Dynamic proxy so existing code using pool.query / pool.getConnection always uses activePool
const pool = new Proxy({}, {
  get(target, prop) {
    if (activePool && typeof activePool[prop] === 'function') {
      return activePool[prop].bind(activePool);
    }
    return activePool ? activePool[prop] : undefined;
  }
});

async function runSqlFile(conn, filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const statements = content
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await conn.query(statement);
    } catch (err) {
      // Ignore drop if not exists or already exists
      if (!err.message.includes('already exists') && !err.message.includes("Unknown table")) {
        console.warn(`[Init SQL] ${err.message}`);
      }
    }
  }
}

// Automatically verify database and tables, creating schema & sample data if needed
async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    try {
      // 1. Check if core tables exist (e.g. department)
      const [tables] = await conn.query("SHOW TABLES LIKE 'department'");
      if (tables.length === 0) {
        console.log('Database empty. Executing schema.sql and sample_data.sql...');
        const schemaFile = path.join(__dirname, '../../../database/schema.sql');
        const sampleFile = path.join(__dirname, '../../../database/sample_data.sql');
        await runSqlFile(conn, schemaFile);
        await runSqlFile(conn, sampleFile);
      }

      // 2. Create app_user table if it doesn't exist
      await conn.query(`
        CREATE TABLE IF NOT EXISTS app_user (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient')),
          doctor_id INT NULL,
          patient_id INT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE SET NULL,
          FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE SET NULL
        )
      `);

      // 3. Add additive columns photo_mime and report_mime if missing
      try {
        await conn.query(`ALTER TABLE patient ADD COLUMN photo_mime VARCHAR(50) DEFAULT 'image/jpeg'`);
      } catch (err) {}

      try {
        await conn.query(`ALTER TABLE lab_order_test ADD COLUMN report_mime VARCHAR(50) DEFAULT 'image/jpeg'`);
      } catch (err) {}

      // 4. Seed demo accounts if empty
      const [users] = await conn.query('SELECT COUNT(*) AS cnt FROM app_user');
      if (users[0].cnt === 0) {
        const hash = await bcrypt.hash('password123', 10);
        await conn.query(`
          INSERT INTO app_user (username, password_hash, role, doctor_id, patient_id) VALUES
          ('admin', ?, 'Admin', NULL, NULL),
          ('reception', ?, 'Receptionist', NULL, NULL),
          ('dr.rajesh', ?, 'Doctor', 1, NULL),
          ('billing', ?, 'Billing', NULL, NULL),
          ('patient.rohan', ?, 'Patient', NULL, 1)
        `, [hash, hash, hash, hash, hash]);
        console.log('✓ Demo users seeded (password123)');
      }
      console.log('✓ Database connected and verified');
      return true;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Database connection / init warning:', err.message);
    return false;
  }
}

// Function to test connecting with a candidate password and persist it to .env
async function tryConnectWithPassword(candidatePassword) {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';

  try {
    // 1. Test basic connection
    const rawConn = await mysql.createConnection({
      host,
      port,
      user,
      password: candidatePassword
    });

    // 2. Check if database medicore_transactional exists
    const [dbs] = await rawConn.query("SHOW DATABASES LIKE 'medicore_transactional'");
    if (dbs.length === 0) {
      console.log('Creating medicore_transactional database...');
      await rawConn.query("CREATE DATABASE medicore_transactional");
    }
    await rawConn.end();

    // 3. Update env and re-create pool
    process.env.DB_PASSWORD = candidatePassword;
    const envPath = path.join(__dirname, '../../.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envContent.includes('DB_PASSWORD=')) {
      envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${candidatePassword}`);
    } else {
      envContent += `\nDB_PASSWORD=${candidatePassword}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');

    // Close previous pool if possible
    if (activePool) {
      try { await activePool.end(); } catch (e) {}
    }

    activePool = createConnectionPool(candidatePassword);
    await initDatabase();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message, errno: err.errno };
  }
}

module.exports = {
  pool,
  initDatabase,
  tryConnectWithPassword
};
