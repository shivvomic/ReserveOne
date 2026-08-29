const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initTestDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('Test database schema initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize test database schema:', error.message);
  } finally {
    await pool.end();
  }
}

initTestDatabase();