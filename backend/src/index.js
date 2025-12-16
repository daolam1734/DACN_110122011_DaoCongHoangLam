
import express from 'express';
import dotenv from 'dotenv';
import vienChucRoutes from './routes/vienChuc.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import auditRoutes from './routes/auditHeThong.routes.js';
import authMiddleware from './middlewares/auth.middleware.js';
import auditMiddleware from './middlewares/audit.middleware.js';
import sequelize from './config/sequelize.js';

dotenv.config();

const app = express();

// Simple CORS middleware for local development — must run early so preflight gets proper headers
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin === 'null' ? '*' : origin)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(express.json());

// Simulated SSO/auth middleware: sets req.user when x-user-email or Bearer token present
app.use(authMiddleware);

// Audit middleware (best-effort logging of actions). It is safe if DB not available.
app.use(auditMiddleware);

app.get('/', (req, res) => {
  res.send('Quan ly ho so backend is running!');
});

// Route Nhân sự (read-only)
app.use('/vien-chuc', vienChucRoutes);
// Dashboard
app.use('/dashboard', dashboardRoutes);
// Auth routes
app.use('/auth', authRoutes);
// API scaffolding for admin settings
// Roles routes (DB-backed)
app.use('/api/roles', rolesRoutes);
// Other admin API scaffolding
app.use('/api', apiRoutes);
// Audit logs
app.use('/api/audit', auditRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err.message || err);
  }
});
