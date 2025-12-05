const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');

// Import routes
// const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
// const watchlistRoutes = require('./routes/watchlists');
// const genreRoutes = require('./routes/genres');
// const recommendationRoutes = require('./routes/recommendations');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes (only movies enabled for now)
app.use('/api/v1/movies', movieRoutes);
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/watchlists', watchlistRoutes);
// app.use('/api/v1/genres', genreRoutes);
// app.use('/api/v1/recommendations', recommendationRoutes);

// 404 handler
app.use((req, res, _next) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      status: 404,
    },
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
