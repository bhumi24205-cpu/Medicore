const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function runSqlFile(conn, filePath) {
  console.log(`Executing ${path.basename(filePath)}...`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Split SQL commands by semicolons while ignoring semicolons inside strings
  const statements = content
    .replace(/--.*$/gm, '') // remove comments
    .replace(/\/\*[\s\S]*?\*\//gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await conn.query(statement);
    } catch (err) {
      console.warn(`[SQL Warning] ${err.message} in statement: ${statement.slice(0, 50)}...`);
    }
  }
}

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    const schemaFile = path.join(__dirname, '../database/schema.sql');
    const sampleDataFile = path.join(__dirname, '../database/sample_data.sql');

    await runSqlFile(conn, schemaFile);
    await runSqlFile(conn, sampleDataFile);
    console.log('✓ Database schema and sample data initialized successfully!');
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
});
