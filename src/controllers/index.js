/**
 * Controllers Index
 * Exports all application controllers
 */

// Auth Controller
export * from './auth.controller.js';
export { PasswordController } from './password.controller.js';

// Admin Controller
export * from './admin.controller.js';

// Core Controllers
export * from './department.controller.js';
export * from './employee.controller.js';
export * from './doctor.controller.js';
export * from './patient.controller.js';

// Operations Controllers
export * from './attendance.controller.js';
export * from './billing.controller.js';
export * from './queue.controller.js';
export * from './visit.controller.js';

// Clinical Controllers
export * from './diagnostics.controller.js';
export   * from './diagnosticReport.controller.js';
export * from './opd-consultation.controller.js';
export * from './opd-dashboard.controller.js';
export * from './opd-login.controller.js';
export * from './pharmacy.controller.js';
export * from './reports.controller.js';

// Onboarding Controllers
export * from './publicRegistration.controller.js';
export * from './onboarding.controller.js';
export * from './setup.controller.js';

// IPD Controllers
export * from './ipd.controller.js';
export { IPDAdmissionQueueController } from './ipd-admission-queue.controller.js';

// Utility Controllers
export * from './template.controller.js';
export * from './vitals.controller.js';
export * from './workboard.controller.js';



















