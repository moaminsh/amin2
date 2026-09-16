import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Configure Helmet and Security Headers
 */
export function configureSecurityHeaders(app) {
  // Trust proxy for accurate client IP resolution behind Cloud Run / Nginx reverse proxy
  app.set('trust proxy', 1);

  // Helmet with customized CSP allowing needed CDN assets for Lucide, Google Fonts, MathJax etc.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for existing inline widgets & charts in simulations
            "https://cdn.jsdelivr.net",
            "https://unpkg.com",
            "https://cdnjs.cloudflare.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "data:"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://images.unsplash.com",
            "https://cdn.jsdelivr.net",
            "https://i.pravatar.cc",
            "https://api.dicebear.com"
          ],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"], // Prevent clickjacking while allowing AI Studio preview
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
      },
      crossOriginEmbedderPolicy: false, // Compatibility with preview iframes
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    })
  );

  // Explicit Permissions-Policy
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
}

/**
 * Rate Limiters for Sensitive Endpoints
 */

// Login Rate Limiter: Prevent brute force and credential stuffing (10 attempts per 15 min window)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
  }
});

// File Upload Rate Limiter (30 uploads per 10 min window)
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    message: 'Upload frequency limit reached. Please wait a few minutes before uploading more files.'
  }
});

// General API Rate Limiter (500 requests per 15 min window)
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
