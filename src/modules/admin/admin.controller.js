/**
 * Admin Controller
 * HTTP request handlers for admin operations
 * 
 * Available routes:
 * AUTH (OTP verified):
 * - POST /api/admin/auth/login           - Step 1: Verify password, send OTP
 * - POST /api/admin/auth/verify-login-otp - Step 2: Verify OTP, get token
 * - POST /api/admin/auth/resend-login-otp - Resend login OTP
 * 
 * PROFILE:
 * - GET /api/admin/profile               - Get profile
 * - PUT /api/admin/profile               - Update profile
 * - PUT /api/admin/profile/photo         - Update profile photo
 * - POST /api/admin/profile/initiate-update - SUPER_ADMIN: Initiate profile update with OTP
 * - POST /api/admin/profile/verify-update   - SUPER_ADMIN: Verify OTP and complete update
 * 
 * ADMIN MANAGEMENT:
 * - POST /api/admin/create-admin         - Create additional admin (max 3 total)
 * - DELETE /api/admin/:id                - Delete admin (SUPER_ADMIN only, cannot self-delete)
 * - POST /api/admin/:id/resend-credentials - Resend credentials to admin via email
 */

import { AdminService } from './admin.service.js';
import ApiResponse from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/constants/HttpStatus.js';

// ==================== AUTH (OTP VERIFIED) ====================

/**
 * Create additional admin
 * POST /api/admin/create-admin
 * Any admin can create up to 2 more admins (max 3 total)
 * Option to send credentials via email: { sendCredentials: true }
 * Body must include: name, email, phone, password, confirmPassword
 */
export const createAdmin = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    
    // Validate admin registration including password confirmation
    const { validateAdminRegister } = await import('./admin.validators.js');
    validateAdminRegister(req.body);
    
    const sendCredentials = req.body.sendCredentials === true;
    const result = await service.createAdmin(
      req.body,
      req.user.id,
      req.user.hospitalId,
      sendCredentials
    );
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, 'Admin created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Step 1: Admin login - verify password, send OTP
 * POST /api/admin/auth/login
 * Request: { emailOrPhone, password }
 * Response: { sessionId, email (masked), message }
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.initiateLogin(req.body);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2: Verify login OTP and get token
 * POST /api/admin/auth/verify-login-otp/:sessionId
 * Params: sessionId (string)
 * Request: { otp }
 * Response: { admin details, token, permissions }
 */
export const verifyLoginOTP = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const { sessionId } = req.params;
    const { otp } = req.body;
    
    if (!sessionId || !otp) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Session ID (in URL) and OTP (in body) are required')
      );
    }
    
    const result = await service.verifyLoginOTP(sessionId, otp.trim());
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Resend login OTP
 * POST /api/admin/auth/resend-login-otp/:sessionId
 * Params: sessionId (string)
 */
export const resendLoginOTP = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Session ID is required in URL params')
      );
    }
    
    const result = await service.resendLoginOTP(sessionId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Resend credentials to existing admin
 * POST /api/admin/:id/resend-credentials
 * Body: { newPassword, confirmPassword }
 * SUPER_ADMIN only
 */
export const resendAdminCredentials = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const { newPassword, confirmPassword } = req.body;
    
    // Validate using the new validator
    const { validateNewPassword } = await import('./admin.validators.js');
    validateNewPassword({ newPassword, confirmPassword });
    
    const result = await service.resendAdminCredentials(
      req.params.id,
      newPassword,
      req.user.id
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Credentials reset and sent via email')
    );
  } catch (error) {
    next(error);
  }
};

// ==================== PROFILE ====================

/**
 * Get admin profile
 * GET /api/v1/admin/profile
 */
export const getAdminProfile = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getProfile(req.user.id, req);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin profile
 * PUT /api/v1/admin/profile
 * For regular admins - direct update
 * For SUPER_ADMIN - use initiate-update + verify-update flow
 */
export const updateAdminProfile = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateProfile(req.user.id, req.body);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate SUPER_ADMIN profile update (OTP required)
 * POST /api/admin/profile/initiate-update
 * Sends OTP to email for verification
 */
export const initiateProfileUpdate = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.initiateProfileUpdate(req.user.id, req.body);
    
    // If OTP not required (non-SUPER_ADMIN), do direct update
    if (!result.requiresOTP) {
      const updateResult = await service.updateProfile(req.user.id, req.body);
      return res.status(HttpStatus.OK).json(
        ApiResponse.success(updateResult, 'Profile updated successfully')
      );
    }
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and complete SUPER_ADMIN profile update
 * POST /api/admin/profile/verify-update/:sessionId
 * Params: sessionId (string)
 * Request: { otp }
 */
export const verifyProfileUpdate = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const { sessionId } = req.params;
    const { otp } = req.body;
    
    if (!sessionId || !otp) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Session ID (in URL) and OTP (in body) are required')
      );
    }
    
    const result = await service.verifyProfileUpdateOTP(sessionId, otp.trim());
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin profile photo
 * PUT /api/v1/admin/profile/photo
 */
export const updateAdminProfilePhoto = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateProfilePhoto(req.user.id, req.file);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete admin
 * DELETE /api/v1/admin/:id
 * SUPER_ADMIN only - cannot delete self
 */
export const deleteAdminById = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.deleteAdmin(req.params.id, req.user.id, req.user.role);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== STAFF MANAGEMENT ====================

/**
 * Get all employees
 * GET /api/v1/admin/employees
 */
export const getAllEmployees = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getAllEmployees(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors
 * GET /api/v1/admin/doctors
 */
export const getAllDoctors = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getAllDoctors(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee profile by admin
 * GET /api/v1/admin/employee/:id
 */
export const getEmployeeProfileByAdmin = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getEmployeeProfile(req.params.id, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor profile by admin
 * GET /api/v1/admin/doctor/:id
 */
export const getDoctorProfileByAdmin = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getDoctorProfile(req.params.id, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete employee
 * DELETE /api/v1/admin/employee/:id
 */
export const deleteEmployee = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.deleteEmployee(req.params.id, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete doctor
 * DELETE /api/v1/admin/doctor/:id
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.deleteDoctor(req.params.id, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee salary
 * PUT /api/v1/admin/employee/:id/salary
 */
export const updateEmployeeSalary = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateEmployeeSalary(
      req.params.id, 
      req.body.salary, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Salary updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor salary
 * PUT /api/v1/admin/doctor/:id/salary
 */
export const updateDoctorSalary = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateDoctorSalary(
      req.params.id, 
      req.body.salary, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Salary updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ==================== DASHBOARD ====================

/**
 * Get dashboard summary
 * GET /api/v1/admin/dashboard-summary
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getDashboardSummary(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's attendance summary
 * GET /api/v1/admin/attendance/today-summary
 */
export const getTodayAttendanceSummary = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getTodayAttendanceSummary(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get present today list
 * GET /api/v1/admin/present-today
 */
export const getPresentToday = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getPresentToday(req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(result);
  } catch (error) {
    if (error.code === 'P2024') {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Database temporarily unavailable due to high load. Please try again in a moment.'
      });
    }
    next(error);
  }
};

// ==================== PERMISSIONS ====================

/**
 * Set delegated permissions
 * PUT /api/v1/admin/users/:id/delegated-permissions
 */
export const setDelegatedPermissions = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.setDelegatedPermissions(
      req.params.id, 
      req.body.permissions, 
      req.user
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get delegated permissions
 * GET /api/v1/admin/users/:id/delegated-permissions
 */
export const getDelegatedPermissions = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getDelegatedPermissions(
      req.params.id, 
      req.user.hospitalId, 
      req.user.role
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== HOSPITAL ====================

/**
 * Get hospital profile
 * GET /api/v1/admin/hospital-profile
 */
export const getHospitalProfile = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getHospitalProfile(req.user.hospitalId, req);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update hospital profile
 * PUT /api/v1/admin/hospital-profile
 */
export const updateHospitalProfile = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateHospitalProfile(req.user.hospitalId, req.body);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update hospital logo
 * PUT /api/v1/admin/hospital-profile/logo
 */
export const updateHospitalLogo = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateHospitalLogo(req.user.hospitalId, req.file);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== ASSIGNMENTS ====================

/**
 * Create assignment
 * POST /api/v1/admin/assignments
 */
export const createAssignment = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.createAssignment(
      req.body, 
      req.user.id, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get assignments for user
 * GET /api/v1/admin/assignments
 */
export const getAssignmentsForUser = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getAssignmentsForUser(
      req.user.id, 
      req.user.role, 
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== FORM TEMPLATES ====================

/**
 * Get default form schema
 * GET /api/v1/admin/forms/default-schema/:role
 */
export const getDefaultSchema = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = service.getDefaultSchema(req.params.role);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize form template
 * POST /api/v1/admin/forms/initialize/:role
 */
export const initializeForm = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.initializeForm(
      req.params.role, 
      req.user.hospitalId, 
      req.user.id
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get form template
 * GET /api/v1/admin/forms/:role
 */
export const getFormTemplate = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getFormTemplate(req.params.role, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all form template fields for editing
 * GET /api/admin/forms/:role/fields
 */
export const getFormTemplateFields = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.getFormTemplateFields(req.params.role, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update form template
 * PUT /api/admin/forms/:role
 * Body: { fields: [...] }
 */
export const updateFormTemplate = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateFormTemplate(
      req.params.role, 
      req.user.hospitalId, 
      req.body.fields
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Form template updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update a form field
 * PATCH /api/admin/forms/:role/fields/:fieldId
 */
export const updateFormField = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.updateFormField(
      req.params.role,
      req.params.fieldId,
      req.user.hospitalId,
      req.body
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Field updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add custom field to form template
 * POST /api/admin/forms/:role/fields
 * Body: { fieldName, fieldLabel, fieldType, isRequired, options, placeholder, helpText, validation }
 */
export const addFormField = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.addFormField(
      req.params.role,
      req.user.hospitalId,
      req.body
    );
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, 'Field added successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a custom form field
 * DELETE /api/admin/forms/:role/fields/:fieldId
 */
export const deleteFormField = async (req, res, next) => {
  try {
    const service = new AdminService(req.tenantPrisma);
    const result = await service.deleteFormField(
      req.params.role,
      req.params.fieldId,
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, 'Field deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  createAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  updateAdminProfilePhoto,
  deleteAdminById,
  getAllEmployees,
  getAllDoctors,
  getEmployeeProfileByAdmin,
  getDoctorProfileByAdmin,
  deleteEmployee,
  deleteDoctor,
  updateEmployeeSalary,
  updateDoctorSalary,
  getDashboardSummary,
  getTodayAttendanceSummary,
  getPresentToday,
  setDelegatedPermissions,
  getDelegatedPermissions,
  getHospitalProfile,
  updateHospitalProfile,
  updateHospitalLogo,
  createAssignment,
  getAssignmentsForUser,
  getDefaultSchema,
  initializeForm,
  getFormTemplate,
  getFormTemplateFields,
  updateFormTemplate,
  updateFormField,
  addFormField,
  deleteFormField
};
