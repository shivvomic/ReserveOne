const fs = require('fs');
const path = require('path');
const pool = require('../src/database/db');

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schemaSql);
    console.log('Database schema initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database schema:', error.message);
  } finally {
    await pool.end();
  }
}

initializeDatabase();