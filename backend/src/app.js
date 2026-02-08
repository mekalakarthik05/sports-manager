const cors = require('cors');

const allowedOrigins = [
  'https://sports-manager-one.vercel.app',
  'https://sports-manager-bho3o5wvx-mekalakarthik05s-projects.vercel.app',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed from this origin'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// VERY IMPORTANT: handle preflight
app.options('*', cors());
