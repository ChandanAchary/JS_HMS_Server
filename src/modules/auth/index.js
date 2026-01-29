/**
 * Auth Module Index
 * Exports all auth module components
 */

// Routes (default export)
export { createAuthRoutes } from './auth.routes.js';

// Controller
export { AuthController } from './auth.controller.js';

// Service
export { AuthService } from './auth.service.js';

// Repository
export { AuthRepository } from './auth.repository.js';

// Validators
export { AuthValidators } from './auth.validators.js';

// DTOs
export {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  ChangePasswordDto,
  VerifyOtpDto,
} from './auth.dto.js';

// For backward compatibility, export routes function as default
import { createAuthRoutes } from './auth.routes.js';
export default createAuthRoutes;
