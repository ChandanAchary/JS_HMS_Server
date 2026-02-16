/**
 * Routes Index
 * Exports all application routes
 */

// Auth Routes
export { createAuthRoutes } from './auth.routes.js';
export { createPasswordRoutes } from './password.routes.js';

// Admin Routes
export { default as adminRoutes } from './admin.routes.js';

// Core Department Routes
export { departmentRoutes } from './department.routes.js';

// Staff Management Routes
export { employeeRoutes } from './employee.routes.js';
export { doctorRoutes } from './doctor.routes.js';
export { patientRoutes } from './patient.routes.js';

// Hospital Operations Routes
export { attendanceRoutes } from './attendance.routes.js';
export { billingRoutes } from './billing.routes.js';
export { queueRoutes } from './queue.routes.js';
export { visitRouter } from './visit.routes.js';

// Clinical Services Routes
export { diagnosticsRoutes } from './diagnostics.routes.js';
export { opdRoutes } from './opd.routes.js';
export { pharmacyRoutes } from './pharmacy.routes.js';
export { reportRoutes } from './reports.routes.js';

// Onboarding & Setup Routes
export { routes as publicRegistrationRoutes } from './publicRegistration.routes.js';
export { onboardingRoutes } from './onboarding.routes.js';
export { setupRoutes } from './setup.routes.js';

// IPD Routes
export { ipdRoutes } from './ipd.routes.js';
export { ipdAdmissionQueueRoutes } from './ipd-admission-queue.routes.js';

// Utility Routes
export { emptyRoutes } from './empty.routes.js';
export { templateRoutes } from './template.routes.js';
export { workboardRoutes } from './workboard.routes.js';
export { vitalsRoutes } from './vitals.routes.js';


















