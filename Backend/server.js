// Modulos Requeridos
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { periodicCleanup } = require('./utils/cleanup');
require('dotenv').config(); // Cargar variables de entorno

// Iniciar Express
const app = express();

// Basic security headers
app.use(helmet());

// Global rate limiter (light) to protect from brute force on all routes (adjust thresholds)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use(apiLimiter);

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());


const parseList = (val) =>
    !val ? [] : String(val).split(',').map(s => s.trim()).filter(Boolean);

const envOrigins = parseList(process.env.CORS_ALLOWED_ORIGINS);
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

console.log('[CORS] allowed origins:', allowedOrigins);


const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // wildcard allow
    if (allowedOrigins.includes('*')) return callback(null, true);

    // direct match
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // try matching without trailing slash or with/without port variants (simple heuristic)
    try {
      const normalized = (o) => String(o).replace(/\/$/, '');
      if (allowedOrigins.map(normalized).includes(normalized(origin))) return callback(null, true);
    } catch (e) {
      /* ignore */
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
};

// Apply CORS and enable preflight for all routes
app.use(cors(corsOptions));
app.options('/{*any}', cors(corsOptions)); // preflight

// Health Check
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Archivos de rutas
const loginRoute = require('./routes/loginRoute');
const userRoute = require('./routes/userRoute');
const confirmRoute = require('./routes/confirmRoute');
const familyRoute = require('./routes/familyRoute');
const authRoute = require('./routes/authRoute');
const mediaRoute = require('./routes/mediaRoute');
const inviteRoute = require('./routes/inviteRoute');

// Usar rutas (CORS already applied)
app.use('/api/users', userRoute); // Rutas para usuarios (protegidas)
app.use('/api/signup', loginRoute); // Rutas para login y registro (no protegidas)
app.use('/api', confirmRoute); // Ruta para confirmación de email
app.use('/api/family', familyRoute); // Ruta para la gestión de familias
app.use('/api/auth', authRoute); // Rutas para autenticación y tokens
app.use('/api/media', mediaRoute); // Rutas para gestión de medios
app.use('/api/confirm', confirmRoute); // Ruta para confirmación de email
app.use('/api/invites', inviteRoute); // Rutas para gestión de invitaciones

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const cleanupDays = Number(process.env.UNCONFIRMED_DELETE_DAYS || 30);
// normalize and trim env var to avoid stray whitespace / casing issues
const rawTestMode = (process.env.TEST_CLEANUP || '').toString().trim().toLowerCase();
const testMode = rawTestMode === 'true';
const rawTestInterval = (process.env.TEST_CLEANUP_INTERVAL_MS || '').toString().trim();
const testInterval = Number(rawTestInterval) || 60 * 1000; // default 60s for testing

(async () => {
  try {
    // run once immediately at startup
    console.log(`[cleanup] running initial cleanup (days=${cleanupDays})`);
    await periodicCleanup({ days: cleanupDays });

    // schedule next runs
    const intervalMs = testMode ? testInterval : 24 * 60 * 60 * 1000;
    console.log(`[cleanup] env.TEST_CLEANUP='${rawTestMode}', testMode=${testMode}, scheduled periodicCleanup every ${intervalMs} ms (days=${cleanupDays})`);

    // Defensive: ensure intervalMs is a positive integer and not suspiciously small when testMode is false
    if (!Number.isFinite(intervalMs) || intervalMs < 1000) {
      console.warn(`[cleanup] invalid intervalMs=${intervalMs}, defaulting to 24h`);
      setInterval(() => periodicCleanup({ days: cleanupDays }), 24 * 60 * 60 * 1000);
    } else {
      setInterval(() => periodicCleanup({ days: cleanupDays }), intervalMs);
    }
  } catch (err) {
    console.error('[cleanup] failed to schedule periodic cleanup', err);
  }
})();