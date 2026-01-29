/**
 * Admin Module
 * Hospital administration, staff management, dashboard
 * 
 * Available Routes:
 * AUTH (OTP Verified):
 * - POST /api/admin/auth/login           - Step 1: Verify password, send OTP
 * - POST /api/admin/auth/verify-login-otp - Step 2: Verify OTP, get token
 * - POST /api/admin/auth/resend-login-otp - Resend login OTP
 * 
 * PROFILE:
 * - GET /api/admin/profile               - Get admin profile
 * - PUT /api/admin/profile               - Update admin profile
 * - POST /api/admin/profile/initiate-update - SUPER_ADMIN OTP flow start
 * - POST /api/admin/profile/verify-update   - SUPER_ADMIN OTP verify
 * - PUT /api/admin/profile/photo         - Update profile photo
 * 
 * ADMIN MANAGEMENT:
 * - POST /api/admin/create-admin         - Create additional admin (max 3)
 * - DELETE /api/admin/:id                - Delete admin (SUPER_ADMIN only)
 * - POST /api/admin/:id/resend-credentials - Resend admin credentials
 */

// Routes (default export)
export { default as adminRoutes } from './admin.routes.js';

// Service
export { AdminService } from './admin.service.js';

// Repositories
export { 
  AdminRepository, 
  HospitalRepository, 
  AssignmentRepository,
  FormTemplateRepository,
  PayrollRepository 
} from './admin.repository.js';

// Controller functions
export {
  // Auth (OTP verified)
  createAdmin,
  loginAdmin,
  verifyLoginOTP,
  resendLoginOTP,
  resendAdminCredentials,
  // Profile
  getAdminProfile,
  updateAdminProfile,
  initiateProfileUpdate,
  verifyProfileUpdate,
  updateAdminProfilePhoto,
  deleteAdminById,
  // Staff
  getAllEmployees,
  getAllDoctors,
  getEmployeeProfileByAdmin,
  getDoctorProfileByAdmin,
  deleteEmployee,
  deleteDoctor,
  updateEmployeeSalary,
  updateDoctorSalary,
  // Dashboard
  getDashboardSummary,
  getTodayAttendanceSummary,
  getPresentToday,
  // Permissions
  setDelegatedPermissions,
  getDelegatedPermissions,
  // Hospital
  getHospitalProfile,
  updateHospitalProfile,
  updateHospitalLogo,
  createAssignment,
  getAssignmentsForUser,
  getDefaultSchema,
  initializeForm,
  getFormTemplate
} from './admin.controller.js';

// DTOs
export {
  formatAdminProfile,
  formatAdminLoginResponse,
  formatHospitalProfile,
  formatEmployeeForAdmin,
  formatDoctorForAdmin,
  formatDashboardSummary,
  formatPresentTodayItem,
  formatAttendanceSummaryItem,
  formatAssignment,
  formatFormTemplate,
  formatPayrollDetails
} from './admin.dto.js';

// Validators
export {
  validateAdminRegister,
  validateAdminLogin,
  validateProfileUpdate,
  validateSalaryUpdate,
  validateAssignmentCreate,
  validateDelegatedPermissions,
  validateHospitalUpdate,
  validateFormRole,
  validatePayrollInput
} from './admin.validators.js';

// Default export for routes
import adminRoutes from './admin.routes.js';
export default adminRoutes;
