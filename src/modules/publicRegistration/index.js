/**
 * Public Registration Module Index
 * Exports all public registration functionality
 */

// Routes (default export)
export { default as routes } from './publicRegistration.routes.js';

// Service
export { PublicRegistrationService } from './publicRegistration.service.js';
export { default as PublicRegistrationServiceDefault } from './publicRegistration.service.js';

// Repositories
export {
  PublicHospitalRepository,
  PublicFormTemplateRepository,
  PublicJoinRequestRepository
} from './publicRegistration.repository.js';

// Controllers
export {
  getRegistrationForm,
  submitApplication,
  checkApplicationStatus
} from './publicRegistration.controller.js';

// DTOs
export {
  formatPublicHospitalList,
  formatPublicHospitalDetails,
  formatRegistrationForm,
  formatApplicationSubmitted,
  formatApplicationStatus,
  parseFormData,
  extractProfilePhotoUrl,
  extractFormFields
} from './publicRegistration.dto.js';

// Validators
export {
  VALID_ROLES,
  validateRole,
  validateFormDataExists,
  validateApplicationFields,
  validateStatusCheckInput,
  validateHospitalId
} from './publicRegistration.validators.js';

// Default export - routes
import routes from './publicRegistration.routes.js';
export default routes;
