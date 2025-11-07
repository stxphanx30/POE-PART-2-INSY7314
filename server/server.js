// server.js
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');
const { generalLimiter, sanitizeInput, errorHandler } = require('./middleware/security');

dotenv.config();
connectDB(); // Uses config/database.js which should read process.env.MONGO_URI

const app = express();

// If behind a proxy (nginx, caddy, heroku), keep this
app.set('trust proxy', 1);

// --- SECURITY HEADERS ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// --- CORS ---
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://internationalpayment.com']
    : ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- BODY PARSERS ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- LOGGER ---
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// --- RATE LIMITING + SANITIZATION ---
app.use(generalLimiter);
app.use(sanitizeInput);

// ------------------------
// SESSION CONFIGURATION
// ------------------------
const isSecure = (process.env.FORCE_SECURE === 'true') || (process.env.NODE_ENV === 'production');
const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE_MS || `${30 * 60 * 1000}`, 10); // default 30 min
const sessionSameSite = process.env.SESSION_SAMESITE || 'lax';
const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

if (!mongoUrl) {
  console.error('FATAL: No Mongo connection string found. Set MONGO_URI or MONGO_URL in .env');
  process.exit(1);
}
app.use(session({
  name: process.env.SESSION_NAME || 'sessionId',
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true, // refresh cookie expiration on each request
  cookie: {
    httpOnly: true,
    secure: isSecure,     // depends on env (true in production or if FORCE_SECURE=true)
    sameSite: sessionSameSite,
    maxAge: sessionMaxAge
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, 
    collectionName: process.env.SESSION_COLLECTION || 'sessions',
    ttl: Math.floor(sessionMaxAge / 1000)
  })
}));

// // ------------------------
// // CSRF PROTECTION to be reviewed
// // ------------------------
// // 
// app.use(csurf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] }));

// // Make CSRF token available to client (non HttpOnly cookie so curl / client JS can read it)
// app.use((req, res, next) => {
//   try {
//     const token = req.csrfToken();
//     res.cookie('XSRF-TOKEN', token, {
//       httpOnly: false,      // readable by client (important for curl / frontend)
//       secure: isSecure,
//       sameSite: sessionSameSite,
//       maxAge: sessionMaxAge
//     });
//   } catch (err) {
//     // If token generation fails on routes that don't have a session yet, ignore silently
//     // (e.g., some static routes). CSRF will still be enforced on state-changing routes.
//   }
//   next();
// });

// Attach session user if available
app.use((req, res, next) => {
  if (req.session && req.session.user) req.user = req.session.user;
  next();
});

// ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running securely',
    timestamp: new Date().toISOString()
  });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ERROR HANDLER
app.use(errorHandler);

// HTTPS SERVER START
const PORT = process.env.PORT || 5000;
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'config/ssl/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'config/ssl/localhost.pem'))
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS server running securely on port ${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at: https://localhost:${PORT}/api`);
});

// UNHANDLED REJECTIONS
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
