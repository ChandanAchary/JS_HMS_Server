/**
 * Main Application Configuration
 * Express app setup with all middleware and routes
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import logger from './utils/logger.js';
import config from './core/config/environment.js';
import { resolveTenant } from './middlewares/resolveTenant.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { initializeApiRoutes, getApiInfo } from './api/index.js';
import { setupSwagger } from './core/config/swaggerSetup.js';
// Legacy single-route mounts to maintain backwards compatibility with older clients
import { setupRoutes } from './routes/setup.routes.js';
import { ApiResponse } from './shared/ApiResponse.js';



/**
 * Create and configure Express application
 * @param {PrismaClient} prisma - Prisma database client
 * @returns {Express.Application} Configured Express app
 */
export function createApp(prisma) {
  const app = express();

  // ===== SECURITY & PARSING MIDDLEWARE =====
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===== REQUEST LOGGING MIDDLEWARE =====
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });



  // ===== TENANT RESOLUTION MIDDLEWARE =====
  // Loads the single hospital and injects Prisma client
  app.use(resolveTenant);

  // ===== STATIC FILES =====
  // Serve uploads folder so frontend can load images
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ===== API ROUTES =====
  // Mount API routes directly under /api
  app.use('/api', initializeApiRoutes(prisma));

  // ===== ROOT ROUTE =====
  // Keep root friendly for browsers / service checks by redirecting to the API base.
  // Render (and other hosts) often hit `/` for the primary URL — return a helpful redirect.
  app.get('/', (req, res) => {
    return res.redirect('/api');
  });

  // ===== SWAGGER DOCUMENTATION =====
  // API documentation available at /api-docs
  // JSON spec available at /api-spec.json
  setupSwagger(app);

  // Redirect legacy /setup requests to /api/setup while keeping mount
  // This preserves backward compatibility and guides clients to the new API base.
  app.use('/setup', (req, res, next) => {
    // If request already points to /api, continue
    if (req.originalUrl && req.originalUrl.startsWith('/api')) return next();
    const target = '/api' + req.originalUrl;
    return res.redirect(307, target);
  });

  // Mount legacy setup routes at /setup for backwards compatibility
  app.use('/setup', setupRoutes);

  // ===== LEGACY ROUTES COMPATIBILITY =====
  // TODO: Keep old route structures for migration period
  // Then remove once all modules are refactored
  // app.use('/auth', authRoutes);
  // app.use('/employees', employeeRoutes);
  // etc...

  // ===== 404 HANDLER =====
  app.use((req, res) => {
    res.status(404).json(
      ApiResponse.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`)
    );
  });

  // ===== ERROR HANDLER (Must be last) =====
  app.use(errorHandler);

  logger.info('✓ Express app configured successfully');

  return app;
}

export default createApp;



















