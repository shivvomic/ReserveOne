const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test') });
const { Pool } = require('pg');
const runMigrations = require('../src/database/runMigrations');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

runMigrations(pool)
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());