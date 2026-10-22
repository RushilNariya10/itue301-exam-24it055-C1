/**
 * Task 3 – Main Express Server (server.js)
 *
 * Start with: node server.js  OR  npm start
 *
 * Middleware order:
 *   1. cors
 *   2. express.json
 *   3. requestLogger (global – Task 3)
 *   4. Routes
 *       - /api/v1/auth    → public
 *       - /api/v1/events  → GET public, POST protected via route-level authGuard
 *       - /api/v1/tickets → all protected via router-level authGuard
 *   5. Global error handler (last – Task 3)
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Middleware
const requestLogger = require('./middleware/requestLogger');

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));          // Allow React dev server
app.use(express.json());                  // Parse JSON bodies

// Task 3 – requestLogger applied globally
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'EventHub API is running 🎫' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found.` });
});

// ─── Global Error Handler (Task 3 – last middleware) ─────────────────────────
// Returns structured JSON instead of raw error stack
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  // Generic 500
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Connect MongoDB & Start Server ───────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 EventHub API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
