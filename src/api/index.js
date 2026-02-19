/**
 * API Routes Aggregator
 * Combines all module routes under /api
 */

import express from 'express';
import logger from '../utils/logger.js';

// Module Routes
import { createAuthRoutes } from '../routes/auth.routes.js';
import { createPasswordRoutes } from '../routes/password.routes.js';
import { employeeRoutes } from '../routes/employee.routes.js';
import { doctorRoutes } from '../routes/doctor.routes.js';
import { patientRoutes } from '../routes/patient.routes.js';
import { attendanceRoutes } from '../routes/attendance.routes.js';
import { billingRoutes } from '../routes/billing.routes.js';
import { adminRoutes } from '../routes/admin.routes.js';
import { onboardingRoutes } from '../routes/onboarding.routes.js';
import { routes as publicRegistrationRoutes } from '../routes/publicRegistration.routes.js';
import { setupRoutes } from '../routes/setup.routes.js';
import { diagnosticsRoutes } from '../routes/diagnostics.routes.js';
import { departmentRoutes } from '../routes/department.routes.js';
import { queueRoutes } from '../routes/queue.routes.js';
import { visitRouter } from '../routes/visit.routes.js';
import { opdRoutes } from '../routes/opd.routes.js';
import { pharmacyRoutes } from '../routes/pharmacy.routes.js';
import { reportRoutes } from '../routes/reports.routes.js';

/**
 * Initialize all API routes
 * @param {PrismaClient} prisma - Prisma client for database operations
 * @returns {Router} Express router with all routes
 */
export function initializeApiRoutes(prisma) {
  const router = express.Router();

  // Root API endpoint - returns API info
  router.get('/', (req, res) => {
    res.json(getApiInfo());
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // =====================
  // Public Routes (no auth)
  // =====================

  // Setup routes (initial system configuration)
  router.use('/setup', setupRoutes);

  // Auth routes (login, register, password reset - some protected)
  router.use('/auth', createAuthRoutes(prisma));

  // Password management routes (forgot password, reset, change with OTP)
  router.use('/password', createPasswordRoutes(prisma));

  // Public registration routes (no auth required)
  router.use('/public', publicRegistrationRoutes);

  // Onboarding routes (public join requests, token registration)
  router.use('/onboarding', onboardingRoutes);

  // Department routes (listing public, some protected)
  router.use('/departments', departmentRoutes);

  // =====================
  // Protected Routes
  // =====================

  // Employee routes (protected internally)
  router.use('/employees', employeeRoutes);

  // Doctor routes (protected internally)
  router.use('/doctors', doctorRoutes);

  // Patient routes (protected internally)
  router.use('/patients', patientRoutes);

  // Attendance routes (protected internally)
  router.use('/attendance', attendanceRoutes);

  // Billing routes (protected internally)
  router.use('/billing', billingRoutes);

  // Diagnostics routes (protected internally)
  router.use('/diagnostics', diagnosticsRoutes);

  // Queue management routes (protected internally)
  router.use('/queue', queueRoutes);

  // Visit management routes (protected internally)
  router.use('/visits', visitRouter);

  // OPD (Out-Patient Department) routes - vitals, clinical notes, prescriptions (protected internally)
  router.use('/opd', opdRoutes);

  // Pharmacy routes - drug catalog, inventory, dispensing (protected internally)
  router.use('/pharmacy', pharmacyRoutes);

  // Reports routes - analytics, auditing, clinical/financial reports (protected internally)
  router.use('/reports', reportRoutes);

  // Admin routes (protected internally with adminOnly)
  router.use('/admin', adminRoutes);

  logger.info('[API] Routes initialized - 18 modules mounted');

  return router;
}

/**
 * Get API info
 * Useful for API documentation
 */
export function getApiInfo() {
  return {
    baseUrl: '/api',
    status: 'stable',
    modules: [
      'setup',
      'auth',
      'password',
      'employees',
      'doctors',
      'patients',
      'attendance',
      'billing',
      'diagnostics',
      'queue',
      'visits',
      'opd',
      'pharmacy',
      'reports',
      'departments',
      'admin',
      'onboarding',
      'public'
    ]
  };
}



















