require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

if (!env.DATABASE_URL && env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL is not set in production');
}

if (!process.env.JWT_SECRET) {
  const msg = 'JWT_SECRET is not set – using insecure default key (dev only).';
  if (env.NODE_ENV === 'production') {
    // In production, fail fast rather than silently using a weak key.
    throw new Error(msg);
  } else {
    console.warn(msg);
  }
}

module.exports = env;
