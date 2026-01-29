/**
 * Server Entry Point
 * Initialize database and start Express server
 */

import 'dotenv/config';
import { connectDB, getPrisma } from './src/core/database/tenantDb.js';
import config from './src/core/config/environment.js';
import createApp from './src/app.js';
import logger from './src/core/utils/logger.js';

const PORT = config.PORT;
const NODE_ENV = config.NODE_ENV;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    logger.info(`[Server] Connecting to database in ${NODE_ENV} mode...`);
    await connectDB();
    logger.info('[Server] ✓ Database connected');

    // Get Prisma client
    const prisma = getPrisma();

    // Create Express app
    const app = createApp(prisma);

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════╗
║   Hospital Management System - Server Running  ║
╠════════════════════════════════════════════════╣
║ Server:     http://localhost:${PORT}
║ Environment: ${NODE_ENV}
║ API Base:   http://localhost:${PORT}/api
╚════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('[Server] SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('[Server] ✓ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('[Server] SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('[Server] ✓ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

// Start server
startServer();

export { startServer };
