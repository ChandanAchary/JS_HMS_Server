/**
 * Admin Routes
 * API routes for admin operations
 * 
 * Routes available:
 * AUTH (OTP Verified - Public):
 * - POST /api/admin/auth/login           ✅ Step 1: Verify password, send OTP
 * - POST /api/admin/auth/verify-login-otp ✅ Step 2: Verify OTP, get token
 * - POST /api/admin/auth/resend-login-otp ✅ Resend login OTP
 * 
 * PROFILE (Protected):
 * - GET /api/admin/profile               ✅ Get profile
 * - PUT /api/admin/profile               ✅ Update profile (regular admins)
 * - POST /api/admin/profile/initiate-update ✅ SUPER_ADMIN: Start OTP flow
 * - POST /api/admin/profile/verify-update   ✅ SUPER_ADMIN: Verify OTP, complete update
 * - PUT /api/admin/profile/photo         ✅ Update profile photo
 * 
 * ADMIN MANAGEMENT (Protected - SUPER_ADMIN):
 * - POST /api/admin/create-admin         ✅ Create additional admin (max 3)
 * - DELETE /api/admin/:id                ✅ Delete admin (cannot self-delete)
 * - POST /api/admin/:id/resend-credentials ✅ Reset & send credentials
 * 
 * REMOVED:
 * - POST /api/admin/invites              ❌
 * - GET /api/admin/invites               ❌
 * - DELETE /api/admin/invites/:id        ❌
 * - GET /api/admin/list                  ❌
 * - POST /api/admin/auth/register        ❌
 */

import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';
import { authorize } from '../../core/middleware/rbac.middleware.js';
import upload, { uploadToCloudinary } from '../../core/middleware/upload.middleware.js';

const router = Router();

// ==================== AUTH (Public - OTP Verified) ====================
// Step 1: Verify password, send OTP to email
router.post('/auth/login', adminController.loginAdmin);
// Step 2: Verify OTP, receive JWT token
router.post('/auth/verify-login-otp/:sessionId', adminController.verifyLoginOTP);
// Resend login OTP
router.post('/auth/resend-login-otp/:sessionId', adminController.resendLoginOTP);

// ==================== Protected Routes ====================
router.use(protect);
router.use(authorize('ADMIN'));

// ==================== PROFILE ====================
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
// SUPER_ADMIN OTP-verified profile update
router.post('/profile/initiate-update', adminController.initiateProfileUpdate);
router.post('/profile/verify-update/:sessionId', adminController.verifyProfileUpdate);
router.put('/profile/photo', upload.single('profilePhoto'), uploadToCloudinary, adminController.updateAdminProfilePhoto);

// ==================== ADMIN MANAGEMENT ====================
// Create additional admin (max 3 total) - option: { sendCredentials: true }
router.post('/create-admin', adminController.createAdmin);
// Delete admin - SUPER_ADMIN only, cannot self-delete
router.delete('/:id', adminController.deleteAdminById);
// Resend credentials to existing admin via email
router.post('/:id/resend-credentials', adminController.resendAdminCredentials);

// ==================== STAFF MANAGEMENT ====================
router.get('/employees', adminController.getAllEmployees);
router.get('/doctors', adminController.getAllDoctors);
router.get('/employee/:id', adminController.getEmployeeProfileByAdmin);
router.get('/doctor/:id', adminController.getDoctorProfileByAdmin);
router.delete('/employee/:id', adminController.deleteEmployee);
router.delete('/doctor/:id', adminController.deleteDoctor);
router.put('/employee/:id/salary', adminController.updateEmployeeSalary);
router.put('/doctor/:id/salary', adminController.updateDoctorSalary);

// ==================== DASHBOARD ====================
router.get('/dashboard-summary', adminController.getDashboardSummary);
router.get('/attendance/today-summary', adminController.getTodayAttendanceSummary);
router.get('/present-today', adminController.getPresentToday);

// ==================== PERMISSIONS ====================
router.put('/users/:id/delegated-permissions', adminController.setDelegatedPermissions);
router.get('/users/:id/delegated-permissions', adminController.getDelegatedPermissions);

// ==================== HOSPITAL ====================
router.get('/hospital-profile', adminController.getHospitalProfile);
router.put('/hospital-profile', adminController.updateHospitalProfile);
router.put('/hospital-profile/logo', upload.single('logo'), uploadToCloudinary, adminController.updateHospitalLogo);

// ==================== ASSIGNMENTS ====================
router.post('/assignments', adminController.createAssignment);
router.get('/assignments', adminController.getAssignmentsForUser);

// ==================== FORM TEMPLATES ====================
router.get('/forms/default-schema/:role', adminController.getDefaultSchema);
router.post('/forms/initialize/:role', adminController.initializeForm);
router.get('/forms/:role', adminController.getFormTemplate);
router.get('/forms/:role/fields', adminController.getFormTemplateFields);
router.put('/forms/:role', adminController.updateFormTemplate);
router.post('/forms/:role/fields', adminController.addFormField);
router.patch('/forms/:role/fields/:fieldId', adminController.updateFormField);
router.delete('/forms/:role/fields/:fieldId', adminController.deleteFormField);

export default router;
