require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const log = require('./utils/logger');

const authRoutes         = require('./routes/auth');
const playersRoutes      = require('./routes/players');
const teamsRoutes        = require('./routes/teams');
const matchesRoutes      = require('./routes/matches');
const tournamentsRoutes  = require('./routes/tournaments');
const coachesRoutes      = require('./routes/coaches');
const statisticsRoutes   = require('./routes/statistics');
const transactionsRoutes = require('./routes/transactions');
const offersRoutes = require('./routes/offers_route');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api/v1';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  log.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Cricket API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use(`${API_PREFIX}/auth`,         authRoutes);
app.use(`${API_PREFIX}/players`,      playersRoutes);
app.use(`${API_PREFIX}/teams`,        teamsRoutes);
app.use(`${API_PREFIX}/matches`,      matchesRoutes);
app.use(`${API_PREFIX}/tournaments`,  tournamentsRoutes);
app.use(`${API_PREFIX}/coaches`,      coachesRoutes);
app.use(`${API_PREFIX}/statistics`,   statisticsRoutes);
app.use(`${API_PREFIX}/transactions`, transactionsRoutes);
app.use(`${API_PREFIX}/offers`,       offersRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`🏏 Cricket API running`, {
    port: PORT,
    docs: `http://localhost:${PORT}/api-docs`,
    health: `http://localhost:${PORT}/health`,
  });
});

module.exports = app;