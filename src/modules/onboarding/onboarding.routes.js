/**
 * Onboarding Routes
 * API routes for join requests, registration, and verification
 */

import { Router } from 'express';
import * as onboardingController from './onboarding.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';
import { authorize } from '../../core/middleware/rbac.middleware.js';
import upload, { uploadToCloudinary } from '../../core/middleware/upload.middleware.js';

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Public hospital listing
router.get('/public/hospitals', onboardingController.listPublicHospitals);

// Join request submission
router.post('/public/join-request', onboardingController.submitJoinRequest);
router.post(
  '/public/join-request/submit-form', 
  upload.single('profilePhoto'),
  uploadToCloudinary,
  onboardingController.submitJoinApplication
);
router.get('/public/join-requests/status', onboardingController.getApplicationStatus);

// Token validation and registration
router.get('/register/:role/:token/validate', onboardingController.validateRegistrationToken);
router.post('/register/doctor/:token', onboardingController.registerDoctorWithToken);
router.post('/register/employee/:token', onboardingController.registerEmployeeWithToken);

// Email verification (user must be logged in for some, public for others)
router.post('/send-otp/:role/:id', onboardingController.sendUserEmailVerification);
router.post('/verify-otp/:role/:id', onboardingController.verifyUserEmail);

// ==================== ADMIN ROUTES ====================
router.use('/admin', protect, authorize('ADMIN'));

// Join requests management
router.get('/admin/join-requests', onboardingController.getJoinRequests);
router.post('/admin/join-requests/:id/send-invite', onboardingController.sendRegistrationInviteToRequest);
router.post('/admin/join-requests/:id/approve', onboardingController.approveJoinRequest);
router.post('/admin/join-requests/:id/reject', onboardingController.rejectJoinRequest);

// Verifications
router.get('/admin/verifications', onboardingController.getVerificationsQueue);
router.post('/admin/verify/:type/:id/approve', onboardingController.approveVerification);
router.post('/admin/verify/:type/:id/reject', onboardingController.rejectVerification);

export default router;
