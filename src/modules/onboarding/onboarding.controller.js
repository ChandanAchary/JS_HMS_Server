/**
 * Onboarding Controller
 * HTTP request handlers for onboarding operations
 */

import { OnboardingService } from './onboarding.service.js';
import ApiResponse from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/constants/HttpStatus.js';

// ==================== EMAIL VERIFICATION ====================

/**
 * Send email verification OTP
 * POST /api/v1/onboarding/send-otp/:role/:id
 */
export const sendUserEmailVerification = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.sendEmailVerification(req.params.role, req.params.id);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email OTP
 * POST /api/v1/onboarding/verify-otp/:role/:id
 */
export const verifyUserEmail = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.verifyEmail(req.params.role, req.params.id, req.body.otp);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== JOIN REQUESTS ====================

/**
 * Submit join request (public)
 * POST /api/v1/onboarding/public/join-request
 */
export const submitJoinRequest = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.submitJoinRequest(req.body);
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Submit full join application (public)
 * POST /api/v1/onboarding/public/join-request/submit-form
 */
export const submitJoinApplication = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.submitJoinApplication(req.body, req.file);
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get join requests for hospital (admin)
 * GET /api/v1/onboarding/admin/join-requests
 */
export const getJoinRequests = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.getJoinRequests(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get application status (public)
 * GET /api/v1/onboarding/public/join-requests/status?email=...
 */
export const getApplicationStatus = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.getApplicationStatus(req.query.email);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Send registration invite (admin)
 * POST /api/v1/onboarding/admin/join-requests/:id/send-invite
 */
export const sendRegistrationInviteToRequest = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.sendRegistrationInvite(req.params.id, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reject join request (admin)
 * POST /api/v1/onboarding/admin/join-requests/:id/reject
 */
export const rejectJoinRequest = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.rejectJoinRequest(
      req.params.id, 
      req.body.reason, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Approve join request (admin)
 * POST /api/v1/onboarding/admin/join-requests/:id/approve
 */
export const approveJoinRequest = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.approveJoinRequest(
      req.params.id, 
      req.user.id, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== TOKEN REGISTRATION ====================

/**
 * Validate registration token (public)
 * GET /api/v1/onboarding/register/:role/:token/validate
 */
export const validateRegistrationToken = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.validateRegistrationToken(req.params.token, req.params.role);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Register doctor with token (public)
 * POST /api/v1/onboarding/register/doctor/:token
 */
export const registerDoctorWithToken = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.registerDoctorWithToken(req.params.token, req.body);
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Register employee with token (public)
 * POST /api/v1/onboarding/register/employee/:token
 */
export const registerEmployeeWithToken = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.registerEmployeeWithToken(req.params.token, req.body);
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== VERIFICATIONS ====================

/**
 * Get verifications queue (admin)
 * GET /api/v1/onboarding/admin/verifications
 */
export const getVerificationsQueue = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.getVerificationsQueue(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Approve verification (admin)
 * POST /api/v1/onboarding/admin/verify/:type/:id/approve
 */
export const approveVerification = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.approveVerification(
      req.params.type, 
      req.params.id, 
      req.user.id, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reject verification (admin)
 * POST /api/v1/onboarding/admin/verify/:type/:id/reject
 */
export const rejectVerification = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.rejectVerification(
      req.params.type, 
      req.params.id, 
      req.body.reason, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== PUBLIC ====================

/**
 * List public hospitals
 * GET /api/v1/onboarding/public/hospitals
 */
export const listPublicHospitals = async (req, res, next) => {
  try {
    const service = new OnboardingService(req.tenantPrisma);
    const result = await service.listPublicHospitals();
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

export default {
  sendUserEmailVerification,
  verifyUserEmail,
  submitJoinRequest,
  submitJoinApplication,
  getJoinRequests,
  getApplicationStatus,
  sendRegistrationInviteToRequest,
  rejectJoinRequest,
  approveJoinRequest,
  validateRegistrationToken,
  registerDoctorWithToken,
  registerEmployeeWithToken,
  getVerificationsQueue,
  approveVerification,
  rejectVerification,
  listPublicHospitals
};
