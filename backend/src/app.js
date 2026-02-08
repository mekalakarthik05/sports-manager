const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const sportRoutes = require('./routes/sportRoutes');
const matchRoutes = require('./routes/matchRoutes');
const teamRoutes = require('./routes/teamRoutes');
const pointsRoutes = require('./routes/pointsRoutes');

const app = express(); 


app.use(express.json());

const allowedOrigins = ['http://localhost:3000'];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      
      if (
        origin.endsWith('.vercel.app') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.options('*', cors());



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
