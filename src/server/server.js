//cd "C:\Users\mfpet\OneDrive\Desktop\PSURF 2025\MedLearn LMS"
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

import usersRouter from './routes/usersRoute.js';
import companiesRouter from './routes/companiesRoute.js';
import inquiriesRouter from './routes/inquiriesRoute.js';

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
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// public session check
app.get('/api/session', (req, res) => {
  if (req.session?.user){
    return res.json(req.session.user); 
  } 
  res.sendStatus(401);
});

// API routes
app.use(usersRouter);
app.use(companiesRouter);
app.use(inquiriesRouter);

// auth guards
function requireAuth(req, res, next) {
  if (!req.session?.user) return res.sendStatus(401);
  next();
}

function requireManager(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.session?.user || req.session.user.role !== 'm' || req.session.user.role !== 'a') {
      return res.sendStatus(403);
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.session?.user || req.session.user.role !== 'a') {
      return res.sendStatus(403);
    }
    next();
  });
}

// serve front-end from dist on a single port
// secure routes are protected and served from /secure
app.use('/secure', requireAuth, express.static(path.join(process.cwd(), 'dist', 'secure')));
app.use('/secure/admin', requireAdmin, express.static(path.join(__dirname, 'src/client/secure/admin')));
app.use('/secure/manager', requireManager, express.static(path.join(__dirname, 'src/client/secure/manager')));

app.use(express.static(path.join(process.cwd(), 'dist')));

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { requireAuth , requireManager, requireAdmin }; // Exporting auth functions for use in routes
