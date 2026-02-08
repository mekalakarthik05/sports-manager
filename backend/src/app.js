const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const sportRoutes = require('./routes/sportRoutes');
const matchRoutes = require('./routes/matchRoutes');
const teamRoutes = require('./routes/teamRoutes');
const pointsRoutes = require('./routes/pointsRoutes');

const app = express(); // ✅ DEFINE APP FIRST

/* =========================
   Middleware
========================= */

app.use(express.json());

const allowedOrigins = [
  'https://sports-manager-one.vercel.app',
  'https://sports-manager-bho3o5wvx-mekalakarthik05s-projects.vercel.app',
  'http://localhost:3000',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ REQUIRED for preflight requests
app.options('*', cors());

/* =========================
   Routes
========================= */

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/points', pointsRoutes);

/* =========================
   Error Handler
========================= */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
