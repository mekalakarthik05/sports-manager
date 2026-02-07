const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const migrDir = path.join(__dirname, '..', '..', 'database', 'migrations');
    const files = fs.readdirSync(migrDir).filter((f) => f.endsWith('.sql')).sort();
    console.log('Found migrations:', files);
    for (const f of files) {
      const p = path.join(migrDir, f);
      const sql = fs.readFileSync(p, 'utf8');
      console.log('Applying', f);
      await pool.query(sql);
      console.log('Applied', f);
    }
    console.log('All migrations applied');
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
