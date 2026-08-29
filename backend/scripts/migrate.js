const pool = require('../src/database/db');
const runMigrations = require('../src/database/runMigrations');

runMigrations(pool)
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());