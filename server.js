import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { initDatabase } from './src/server/db.js';
import { apiRouter } from './src/server/routes/api.js';
import {
  configureSecurityHeaders,
  loginRateLimiter,
  uploadRateLimiter,
  generalApiLimiter
} from './src/server/securityHeaders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 1. Initialize SQLite Database & Migrations
initDatabase();

// 2. Configure Production-Grade Security Headers (Helmet, CSP, HSTS, Nosniff)
configureSecurityHeaders(app);

// 3. Request Parsing & Secure Cookie Handlers
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Rate Limiting Middleware
app.use('/api/admin/auth/login', loginRateLimiter);
app.use('/api/admin/files/upload', uploadRateLimiter);
app.use('/api/', generalApiLimiter);

// 5. Mount Secure Backend API
app.use('/api', apiRouter);

// 6. Admin Panel Entrypoint (Dedicated admin SPA route)
app.get(['/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 6.1 Direct and Guaranteed Book & Technical PDF Download Endpoints
app.get(['/download/books/:category/:file', '/assets/downloads/books/:category/:file'], (req, res, next) => {
  try {
    const { category, file } = req.params;
    const safeFile = path.basename(file);
    const safeCategory = path.basename(category);
    const filePath = path.join(__dirname, 'assets', 'downloads', 'books', safeCategory, safeFile);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFile)}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(filePath);
    }
  } catch (err) {
    console.error('[Download Error]', err);
  }
  next();
});

app.get(['/download/turbomachinery/:file', '/assets/downloads/turbomachinery/:file'], (req, res, next) => {
  try {
    const { file } = req.params;
    const safeFile = path.basename(file);
    const filePath = path.join(__dirname, 'assets', 'downloads', 'turbomachinery', safeFile);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFile)}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(filePath);
    }
  } catch (err) {
    console.error('[Download Error]', err);
  }
  next();
});

app.get(['/BGD.pdf', '/books/BGD.pdf'], (req, res) => {
  const filePath = path.join(__dirname, 'assets', 'downloads', 'books', 'gas-dynamics', 'BGD.pdf');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="BGD-Gas-Dynamics.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(filePath);
  }
  res.status(404).send('BGD.pdf not found');
});

// 7. Serve Static Assets with automatic .html extension resolution
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'],
  index: 'index.html',
  dotfiles: 'ignore' // Block hidden files (.env, .git, etc.)
}));

// 8. Fallback to public index.html for unknown GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 9. Centralized Error Handler (Prevents stack trace leaks)
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please contact administrator.'
      : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FluidMind] Secure Server running on http://0.0.0.0:${PORT}`);
});

