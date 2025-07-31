// cd "C:\Users\mfpet\OneDrive\Desktop\PSURF 2025\MedLearn LMS"
import express        from 'express';
import cookieParser   from 'cookie-parser';
import session        from 'express-session';
import dotenv         from 'dotenv';
import path           from 'path';

import usersRouter     from './routes/usersRoute.js';
import companiesRouter from './routes/companiesRoute.js';
import inquiriesRouter from './routes/inquiriesRoute.js';

dotenv.config();

const app  = express();
const PORT = process.env.SERVER_PORT || 3000;

// serve all built front-end files from dist/
app.use(express.static(path.join(process.cwd(), 'dist')));

// parse JSON & cookies
app.use(express.json());
app.use(cookieParser());

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie:{
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// public session check
app.get('/api/session', (req, res) => {
  if (req.session?.user) return res.json(req.session.user);
  res.sendStatus(401);
});

// auth guard
export function requireAuth(req, res, next) {
  if (!req.session?.user) return res.sendStatus(401);
  next();
}

// serve secure pages under /secure
app.use(
  '/secure',
  requireAuth,
  express.static(path.join(process.cwd(), 'dist', 'secure'))
);

// API routes
app.use(usersRouter);
app.use(companiesRouter);
app.use(inquiriesRouter);

// start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
