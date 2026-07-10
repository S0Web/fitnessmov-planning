// Fuseau horaire de la salle : à définir AVANT tout usage de Date
// (le conteneur Railway est en UTC ; sans ça, la déconnexion "6h du matin"
// tombe à 8h heure française l'été).
process.env.TZ = process.env.TZ || 'Europe/Paris';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

require('./db/database');
const { seedDefaults } = require('./db/seedDefaults');
seedDefaults(); // remplit le catalogue de cours si la base est vierge (nouvelle salle)

const { requireAuth }   = require('./middleware/auth');
const { router: authRouter } = require('./routes/auth');
const configRouter    = require('./routes/config');
const healthRouter    = require('./routes/health');
const coachesRouter   = require('./routes/coaches');
const coursRouter     = require('./routes/coursTypes');
const seancesRouter   = require('./routes/seances');
const pointeursRouter = require('./routes/pointeurs');
const dashboardRouter = require('./routes/dashboard');
const appUsersRouter  = require('./routes/appUsers');
const tasksRouter     = require('./routes/tasks');
const personnelCreneauxRouter = require('./routes/personnelCreneaux');
const adminRouter     = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes publiques
app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use('/api/auth',   authRouter);

// Routes protégées
app.use('/api/coaches',     requireAuth, coachesRouter);
app.use('/api/cours-types', requireAuth, coursRouter);
app.use('/api/seances',     requireAuth, seancesRouter);
app.use('/api/pointeurs',   requireAuth, pointeursRouter);
app.use('/api/dashboard',   requireAuth, dashboardRouter);
app.use('/api/app-users',   appUsersRouter);
app.use('/api/tasks',       requireAuth, tasksRouter);
app.use('/api/personnel-creneaux',  requireAuth, personnelCreneauxRouter);
app.use('/api/admin', adminRouter);

// Servir le front
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
      const { execSync } = require('child_process');
      try {
        execSync(
          `FOR /F "tokens=5" %P IN ('netstat -a -n -o ^| findstr :${PORT}') DO TaskKill /F /PID %P`,
          { shell: 'cmd.exe', stdio: 'ignore' }
        );
      } catch (_) {}
      setTimeout(() => startServer(retry + 1), 800);
    } else {
      process.exit(1);
    }
  });
}
startServer();
