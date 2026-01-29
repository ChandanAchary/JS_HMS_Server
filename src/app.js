/**
 * Main Application Configuration
 * Express app setup with all middleware and routes
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './core/utils/logger.js';
import config from './core/config/environment.js';
import { resolveTenant } from './core/middleware/resolveTenant.middleware.js';
import { errorHandler } from './core/middleware/errorHandler.middleware.js';
import { initializeApiRoutes, getApiInfo } from './api/index.js';
// Legacy single-route mounts to maintain backwards compatibility with older clients
import { setupRoutes } from './modules/setup/index.js';
import { ApiResponse } from './shared/dto/ApiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // ===== HEALTH CHECK ENDPOINTS (No auth required) =====
  app.get('/', (req, res) => {
    res.json({
      message: 'Hospital Management System - Single Tenant Backend',
      version: '1.0.0',
      status: 'running',
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
    });
  });

  app.get('/api/info', (req, res) => {
    res.json({
      success: true,
      data: getApiInfo(),
    });
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
