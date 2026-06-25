const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/database');

const healthRouter    = require('./routes/health');
const coachesRouter   = require('./routes/coaches');
const coursRouter     = require('./routes/coursTypes');
const seancesRouter   = require('./routes/seances');
const pointeursRouter = require('./routes/pointeurs');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/health',      healthRouter);
app.use('/api/coaches',     coachesRouter);
app.use('/api/cours-types', coursRouter);
app.use('/api/seances',     seancesRouter);
app.use('/api/pointeurs',   pointeursRouter);
app.use('/api/dashboard',  dashboardRouter);

// Servir le front en production
const clientDist = path.join(__dirname, '../public');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur', message: err.message });
});

function startServer(retry = 0) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Fitnessmov Planning — http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retry < 3) {
      console.log(`⚠️  Port ${PORT} occupé — libération...`);
      const { execSync } = require('child_process');
      try {
        execSync(
          `FOR /F "tokens=5" %P IN ('netstat -a -n -o ^| findstr :${PORT}') DO TaskKill /F /PID %P`,
          { shell: 'cmd.exe', stdio: 'ignore' }
        );
      } catch (_) {}
      setTimeout(() => startServer(retry + 1), 800);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  });
}
startServer();
