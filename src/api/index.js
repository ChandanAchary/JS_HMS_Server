/**
 * API Routes Aggregator
 * Combines all module routes under /api
 */

import express from 'express';
import logger from '../core/utils/logger.js';

// Module Routes
import { createAuthRoutes } from '../modules/auth/index.js';
import { employeeRoutes } from '../modules/employee/index.js';
import { doctorRoutes } from '../modules/doctor/index.js';
import { patientRoutes } from '../modules/patient/index.js';
import { attendanceRoutes } from '../modules/attendance/index.js';
import { billingRoutes } from '../modules/billing/index.js';
import { adminRoutes } from '../modules/admin/index.js';
import { onboardingRoutes } from '../modules/onboarding/index.js';
import { routes as publicRegistrationRoutes } from '../modules/publicRegistration/index.js';
import { setupRoutes } from '../modules/setup/index.js';

/**
 * Initialize all API routes
 * @param {PrismaClient} prisma - Prisma client for database operations
 * @returns {Router} Express router with all routes
 */
export function initializeApiRoutes(prisma) {
  const router = express.Router();

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

  // Public registration routes (no auth required)
  router.use('/public', publicRegistrationRoutes);

  // Onboarding routes (public join requests, token registration)
  router.use('/onboarding', onboardingRoutes);

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

  // Admin routes (protected internally with adminOnly)
  router.use('/admin', adminRoutes);

  logger.info('[API] Routes initialized - 10 modules mounted');

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
      'employees',
      'doctors',
      'patients',
      'attendance',
      'billing',
      'admin',
      'onboarding',
      'public'
    ]
  };
}
