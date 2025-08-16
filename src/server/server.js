//cd "C:\\Users\\mfpet\\OneDrive\\Desktop\\PSURF 2025\\MedLearn LMS"
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

import usersRouter from './routes/usersRoute.js';
import companiesRouter from './routes/companiesRoute.js';
import inquiriesRouter from './routes/inquiriesRoute.js';
import onboardingRouter from './routes/onboardingRoute.js';
import mxRouter from './routes/mxRoute.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// parse JSON & cookies
app.use(express.json());
app.use(cookieParser());

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // true behind HTTPS/proxy
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// public session check
app.get('/api/session', (req, res) => {
  if (req.session?.user) return res.json(req.session.user);
  res.sendStatus(401);
});

// auth guards (exported for reuse)
function requireAuth(req, res, next) {
  if (!req.session?.user) return res.sendStatus(401);
  next();
}
function requireManager(req, res, next) {
  requireAuth(req, res, () => {
    const role = req.session.user.role;
    if (role !== 'Manager' && role !== 'Admin') return res.sendStatus(403);
    next();
  });
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.session.user.role !== 'Admin') return res.sendStatus(403);
    next();
  });
}

// static uploads (local dev) — served at /uploads
const uploadsRoot = path.resolve(__dirname, '../client/public/assets/uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });
app.use('/uploads', express.static(uploadsRoot, {
  index: false,
  maxAge: '7d',
  etag: true,
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// API routes
app.use(usersRouter);
app.use(companiesRouter);
app.use(inquiriesRouter);
app.use(onboardingRouter);
app.use(mxRouter);

// serve front-end
app.use('/secure/admin', requireAdmin, express.static(path.join(process.cwd(), 'dist', 'secure', 'admin')));
app.use('/secure', requireAuth, express.static(path.join(process.cwd(), 'dist', 'secure')));
//no manager files to serve right now, but might be soem in the future
//app.use('/secure/manager',requireManager,express.static(path.join(process.cwd(), 'dist', 'secure', 'manager')));
app.use(express.static(path.join(process.cwd(), 'dist')));

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { requireAuth, requireManager, requireAdmin };