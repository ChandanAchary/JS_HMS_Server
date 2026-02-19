/**
 * OPD Module Routes
 * Central router for all OPD-related endpoints
 */

import express from 'express';
import { OpdLoginController } from '../controllers/opd-login.controller.js';
import dashboardRouter from './opd-dashboard.routes.js';
import vitalsRouter from './vitals.routes.js';
import consultationRouter from './opd-consultation.routes.js';
import { getPrisma } from '../core/database/tenantDb.js';

const router = express.Router();
const prisma = getPrisma();
const loginController = new OpdLoginController(prisma);

// Root endpoint - returns OPD module info
router.get('/', (req, res) => {
  res.json({ module: 'opd', status: 'active', endpoints: ['POST /login', 'GET /queue', 'POST /vitals', 'GET /consultation-notes'] });
});

/**
 * @route   POST /api/opd/login
 * @desc    OPD Staff Login - Email/Phone + Password
 * @access  Public (no auth required)
 * @body    { emailOrPhone: string, password: string }
 * @returns { token, user, permissions }
 */
router.post('/login', (req, res, next) => loginController.login(req, res, next));

// Mount OPD dashboard routes (queue management, patient operations)
router.use('/', dashboardRouter);

// Mount vitals routes
router.use('/vitals', vitalsRouter);

// Mount consultation routes (consultation notes, prescriptions, test orders, patient history)
router.use('/', consultationRouter);

export { router as opdRoutes };
export default router;
