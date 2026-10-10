require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const notFound = require('./middleware/notFoundMiddleware');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = Number(process.env.PORT) || 5000;
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function isAllowedClientOrigin(origin) {
  if (!process.env.CLIENT_URL) {
    return false;
  }

  try {
    const configuredOrigin = new URL(process.env.CLIENT_URL);
    const requestOrigin = new URL(origin);

    if (configuredOrigin.origin === requestOrigin.origin) {
      return true;
    }

    return configuredOrigin.protocol === requestOrigin.protocol
      && configuredOrigin.port === requestOrigin.port
      && loopbackHosts.has(configuredOrigin.hostname)
      && loopbackHosts.has(requestOrigin.hostname);
  } catch (_error) {
    return false;
  }
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || isAllowedClientOrigin(origin));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected ? 'TaskFlow API is healthy.' : 'Database is unavailable.',
    data: {
      database: databaseConnected ? 'connected' : 'disconnected'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('TaskFlow API cannot start: JWT_SECRET must be configured with at least 32 characters.');
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`TaskFlow API listening on port ${port}.`);
    });
    server.on('error', (error) => {
      console.error('TaskFlow HTTP server failed to start:', error.code || error.name);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error('TaskFlow API could not start because the database connection failed:', error.name || 'Error');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
