const { Pool } = require('pg');

// DATABASE_URL must be set (e.g. Neon: postgresql://user:pass@host/neondb?sslmode=require)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
});

module.exports = { pool };
