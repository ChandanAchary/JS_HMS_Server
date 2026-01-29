/**
 * Setup Routes
 * Enterprise 3-Phase Setup Flow
 * 
 * PHASE 1: Admin Registration (No Auth Required)
 * ├─ GET /api/setup/status - Check if setup needed
 * ├─ POST /api/setup/register-admin - Register admin, send OTP
 * └─ POST /api/setup/verify-admin-otp - Verify OTP, create admin
 * 
 * PHASE 2: Admin Login
 * └─ POST /api/auth/login - Login returns hospitalSetupRequired flag if true
 * 
 * PHASE 3: Hospital Configuration (Protected, Admin Only)
 * ├─ GET /api/setup/hospital-setup-status - Check hospital setup status
 * ├─ POST /api/setup/configure-hospital - Create hospital
 * └─ GET /api/setup/onboarding-status - Check all setup phases
 */

import { Router } from 'express';
import {
  checkSetupStatus,
  registerAdmin,
  verifyAdminRegistrationOTP,
  configureHospital,
  getHospitalSetupStatus,
  getOnboardingStatus,
  initiateSetup,
  verifySetupOTP,
  resendSetupOTP
} from './setup.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';
import { authorize } from '../../core/middleware/rbac.middleware.js';

const router = Router();

// ==================== PHASE 1: ADMIN REGISTRATION (PUBLIC) ====================

/**
 * GET /api/setup/status
 * Check if system setup is required
 */
router.get('/status', checkSetupStatus);

/**
 * POST /api/setup/register-admin
 * Register first admin and send OTP to email
 * 
 * Body: {
 *   name: string (min 2 chars),
 *   email: string (valid email),
 *   phone: string (10+ digits),
 *   password: string (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 * }
 */
router.post('/register-admin', registerAdmin);

/**
 * POST /api/setup/verify-admin-otp/:sessionId
 * Verify OTP and create admin account
 * 
 * Params: sessionId (string)
 * Body: {
 *   otp: string (6 digits)
 * }
 */
router.post('/verify-admin-otp/:sessionId', verifyAdminRegistrationOTP);

// ==================== PHASE 3: HOSPITAL CONFIGURATION (PROTECTED) ====================

/**
 * GET /api/setup/hospital-setup-status
 * Check if hospital is configured for this admin
 * Returns: { isHospitalConfigured, hospitalSetupRequired, hospital }
 */
router.get('/hospital-setup-status', protect, authorize('ADMIN'), getHospitalSetupStatus);

/**
 * POST /api/setup/configure-hospital
 * Create hospital and link to admin
 * 
 * Body: {
 *   hospitalName: string (min 3 chars),
 *   address: string (min 5 chars),
 *   contactEmail: string (valid email),
 *   contactPhone: string (10+ digits),
 *   city: string,
 *   state: string,
 *   country: string,
 *   registrationType: string,
 *   registrationNumber: string
 * }
 */
router.post('/configure-hospital', protect, authorize('ADMIN'), configureHospital);

/**
 * GET /api/setup/onboarding-status
 * Get complete onboarding status (all 3 phases)
 * Returns: { phase1, phase2, phase3, systemReady, nextStep }
 */
router.get('/onboarding-status', protect, authorize('ADMIN'), getOnboardingStatus);

// ==================== LEGACY ENDPOINTS (DEPRECATED) ====================
// These return 410 Gone responses to guide users to new endpoints

/**
 * @deprecated Use POST /api/setup/register-admin instead
 */
router.post('/initiate', initiateSetup);

/**
 * @deprecated Use POST /api/setup/verify-admin-otp instead
 */
router.post('/verify-otp', verifySetupOTP);

/**
 * @deprecated No longer supported in new flow
 */
router.post('/resend-otp', resendSetupOTP);

export default router;
