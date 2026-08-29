const express = require('express');
const cors = require('cors');
const pool = require('./database/db');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const resourceRoutes = require('./routes/resourceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, message: 'Database connected', serverTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

app.use('/api/auth', authRoutes);

app.use('/api/resources', resourceRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/users', userRoutes);

app.use('/api/dashboard', statsRoutes);

app.use('/api/events', eventsRoutes);

app.use('/api/admin', adminRoutes);

// Unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler — always registered last
app.use(errorHandler);

module.exports = app;