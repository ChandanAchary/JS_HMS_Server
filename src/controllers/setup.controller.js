/**
 * Setup Controller
 * HTTP handlers for enterprise 3-phase setup flow
 * 
 * PHASE 1: ADMIN REGISTRATION
 * - POST /api/setup/register-admin (register & send OTP)
 * - POST /api/setup/verify-admin-otp (verify OTP, create admin)
 * 
 * PHASE 2: ADMIN LOGIN
 * - POST /api/auth/login (login, check hospitalSetupRequired flag)
 * 
 * PHASE 3: HOSPITAL CONFIGURATION
 * - POST /api/setup/configure-hospital (create hospital)
 * - GET /api/setup/hospital-setup-status (check hospital config status)
 * - GET /api/setup/onboarding-status (check all setup phases)
 */

import { SetupService } from '../services/setup.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';
import { HttpStatus } from '../constants/HttpStatus.js';
import {
  validateAdminData,
  validateHospitalData,
  validateOTP
} from './setup.validators.js';
import logger from '../utils/logger.js';

/**
 * Check if system setup is required
 * GET /api/setup/status
 */
export const checkSetupStatus = async (req, res, next) => {
  try {
    const service = new SetupService(req.prisma);
    const status = await service.checkSetupStatus();

    res.status(HttpStatus.OK).json(
      ApiResponse.success(status, 'Setup status retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PHASE 1: Register Admin (Step 1)
 * POST /api/setup/register-admin
 * 
 * Body: {
 *   name: string,
 *   email: string,
 *   phone: string,
 *   password: string
 * }
 * 
 * Returns: { sessionId, email (masked), message }
 */
export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate admin data
    validateAdminData({ name, email, phone, password, confirmPassword });

    const service = new SetupService(req.prisma);
    const result = await service.registerAdmin({
      name,
      email,
      phone,
      password
    });

    logger.info(`[Setup Phase 1] Admin registration initiated: ${email}`);

    res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PHASE 1: Verify Admin Registration OTP (Step 2)
 * POST /api/setup/verify-admin-otp/:sessionId
 * 
 * Params: sessionId (string)
 * Body: {
 *   otp: string (6 digits)
 * }
 * 
 * Returns: { id, name, email, role, message }
 */
export const verifyAdminRegistrationOTP = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { otp } = req.body;

    // Validate inputs
    validateOTP(otp);

    if (!sessionId) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Session ID is required in URL params')
      );
    }

    const service = new SetupService(req.prisma);
    const result = await service.verifyAdminRegistrationOTP(sessionId, otp);

    logger.info(`[Setup Phase 1] Admin registered successfully: ${result.email}`);

    res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PHASE 3: Configure Hospital (Step 1)
 * POST /api/setup/configure-hospital
 * Protected - Admin only
 * 
 * Body: {
 *   hospitalName: string,
 *   address: string,
 *   contactEmail: string,
 *   contactPhone: string,
 *   city: string,
 *   state: string,
 *   country: string,
 *   registrationType: string,
 *   registrationNumber: string
 * }
 * 
 * Returns: { id, hospitalName, address, city, state, country, message }
 */
export const configureHospital = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const hospitalData = req.body;

    // Validate hospital data
    validateHospitalData(hospitalData);

    const service = new SetupService(req.prisma);
    const result = await service.configureHospital(adminId, hospitalData);

    logger.info(`[Setup Phase 3] Hospital configured: ${result.hospitalName}`);

    res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Hospital Setup Status
 * GET /api/setup/hospital-setup-status
 * Protected - Admin only
 * 
 * Returns: {
 *   isHospitalConfigured: boolean,
 *   hospitalSetupRequired: boolean,
 *   hospital: { id, hospitalName, address, city, state, country }
 * }
 */
export const getHospitalSetupStatus = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const service = new SetupService(req.prisma);
    const status = await service.getHospitalSetupStatus(adminId);

    res.status(HttpStatus.OK).json(
      ApiResponse.success(status, 'Hospital setup status retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Complete Onboarding Status
 * GET /api/setup/onboarding-status
 * Protected - Admin only
 * 
 * Returns: {
 *   phase1: { name, completed, completedAt, admin },
 *   phase2: { name, completed, message },
 *   phase3: { name, completed, completedAt, hospital },
 *   systemReady: boolean,
 *   nextStep: string
 * }
 */
export const getOnboardingStatus = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const service = new SetupService(req.prisma);
    const status = await service.getOnboardingStatus(adminId);

    res.status(HttpStatus.OK).json(
      ApiResponse.success(status, 'Onboarding status retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Legacy endpoints (kept for backward compatibility, but deprecated)
/**
 * @deprecated Use /api/setup/register-admin + /api/setup/verify-admin-otp instead
 */
export const initiateSetup = async (req, res, next) => {
  try {
    res.status(HttpStatus.GONE).json(
      ApiResponse.error('This endpoint is deprecated. Use POST /api/setup/register-admin instead.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @deprecated Use /api/setup/verify-admin-otp instead
 */
export const verifySetupOTP = async (req, res, next) => {
  try {
    res.status(HttpStatus.GONE).json(
      ApiResponse.error('This endpoint is deprecated. Use POST /api/setup/verify-admin-otp instead.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @deprecated No longer supported
 */
export const resendSetupOTP = async (req, res, next) => {
  try {
    res.status(HttpStatus.GONE).json(
      ApiResponse.error('This endpoint is deprecated. Resend OTP during admin registration phase.')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  checkSetupStatus,
  registerAdmin,
  verifyAdminRegistrationOTP,
  configureHospital,
  getHospitalSetupStatus,
  getOnboardingStatus,
  // Legacy
  initiateSetup,
  verifySetupOTP,
  resendSetupOTP
};



















