/**
 * Onboarding Module
 * Join requests, registration, and verification workflows
 */

// Routes (default export)
export { default as onboardingRoutes } from './onboarding.routes.js';

// Service
export { OnboardingService } from './onboarding.service.js';

// Repositories
export { 
  JoinRequestRepository, 
  RegistrationTokenRepository,
  VerificationRepository 
} from './onboarding.repository.js';

// Controller functions
export {
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
} from './onboarding.controller.js';

// DTOs
export {
  formatJoinRequest,
  formatJoinRequestDetails,
  formatApplicationStatus,
  formatTokenValidation,
  formatVerificationItem,
  formatVerificationsQueue,
  formatPublicHospital,
  parseJoinRequestInput,
  parseJoinApplicationInput
} from './onboarding.dto.js';

// Validators
export {
  VALID_ROLES,
  JOIN_REQUEST_STATUSES,
  validateJoinRequest,
  validateJoinApplication,
  validateOtp,
  validateTokenParams,
  validateVerificationType,
  validateEmailQuery
} from './onboarding.validators.js';

// Default export for routes
import onboardingRoutes from './onboarding.routes.js';
export default onboardingRoutes;
