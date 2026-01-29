/**
 * Setup Module Index
 * Handles initial system setup (first-time installation)
 * 
 * OTP-Verified Flow:
 * 1. GET /api/setup/status - Check if admin exists
 *    - needsSetup: true  → Show setup page
 *    - needsSetup: false → Show login page
 * 
 * 2. POST /api/setup/initiate - Submit admin + hospital data
 *    - Sends OTP to admin email
 *    - Returns sessionId
 * 
 * 3. POST /api/setup/verify-otp - Verify OTP
 *    - Creates hospital + SUPER_ADMIN
 * 
 * 4. POST /api/setup/resend-otp - Resend OTP if needed
 */

import setupRoutesDefault from './setup.routes.js';

export const setupRoutes = setupRoutesDefault;
export { SetupService } from './setup.service.js';
export { 
  checkSetupStatus, 
  initiateSetup, 
  verifySetupOTP, 
  resendSetupOTP 
} from './setup.controller.js';
