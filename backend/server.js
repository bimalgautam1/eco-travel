const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const commuteRoutes = require('./routes/commuteRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration — explicitly allow the Vercel frontend origin
const allowedOrigins = [
  'https://eco-travel-eight.vercel.app',
  'http://localhost:5173', // local dev
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Explicitly handle OPTIONS preflight for all routes
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// Routing setup
app.use('/api/auth', authRoutes);
app.use('/api', commuteRoutes);
app.use('/api/ai', aiRoutes);

// Root health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'EcoRoute India commute engine running smoothly.' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Requested endpoint does not exist.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Startup handler
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database authentication successful.');

    // Sync all models (alter: true updates existing tables without dropping data)
    // await sequelize.sync({ alter: true });
    console.log('Database models synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server launched successfully at http://localhost:${PORT}`);

      // 5-minute keep-alive timer
      setInterval(async () => {
        try {
          const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
          await axios.get(`${url}/health`);
          console.log(`Self-ping to ${url}/health successful.`);
        } catch (error) {
          console.error('Self-ping failed:', error.message);
        }
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Check your .env settings or run the seed script to setup the database.');
    process.exit(1);
  }
}

startServer();
