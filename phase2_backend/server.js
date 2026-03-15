require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const log = require('./utils/logger');

// Route imports
const authRoutes        = require('./routes/auth');
const playersRoutes     = require('./routes/players');
const teamsRoutes       = require('./routes/teams');
const matchesRoutes     = require('./routes/matches');
const tournamentsRoutes = require('./routes/tournaments');
const coachesRoutes     = require('./routes/coaches');
const statisticsRoutes  = require('./routes/statistics');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api/v1';

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  log.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Cricket API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// Serve raw OpenAPI spec as JSON
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(`${API_PREFIX}/auth`,         authRoutes);
app.use(`${API_PREFIX}/players`,      playersRoutes);
app.use(`${API_PREFIX}/teams`,        teamsRoutes);
app.use(`${API_PREFIX}/matches`,      matchesRoutes);
app.use(`${API_PREFIX}/tournaments`,  tournamentsRoutes);
app.use(`${API_PREFIX}/coaches`,      coachesRoutes);
app.use(`${API_PREFIX}/statistics`,   statisticsRoutes);
app.use(`${API_PREFIX}/transactions`, transactionsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  log.info(`🏏 Cricket API running`, {
    port: PORT,
    docs: `http://localhost:${PORT}/api-docs`,
    health: `http://localhost:${PORT}/health`,
  });
});

module.exports = app;