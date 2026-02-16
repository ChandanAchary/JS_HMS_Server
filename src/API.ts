/**
 * Hospital Management System - API Routes
 * Client-side API endpoint definitions
 * 
 * Usage:
 * import { API_ROUTES } from '@/API';
 * const url = API_ROUTES.AUTH.LOGIN;
 */

const BASE_URL = `${process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:3000'}/api`;

// ============================================================
// API ROUTES DEFINITION
// ============================================================

export const API_ROUTES = {
  // =========================
  // AUTHENTICATION
  // =========================
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    GET_PROFILE: `${BASE_URL}/auth/me`,
    DEBUG: `${BASE_URL}/auth/debug`,
    
    // Role-specific login (legacy)
    ROLE_LOGIN: (role: string) => `${BASE_URL}/auth/${role}/login`,
  },

  // =========================
  // ADMIN MANAGEMENT
  // =========================
  ADMIN: {
    // Authentication
    AUTH_LOGIN: `${BASE_URL}/admin/auth/login`,
    AUTH_VERIFY_LOGIN_OTP: (sessionId: string) => `${BASE_URL}/admin/auth/verify-login-otp/${sessionId}`,
    AUTH_RESEND_LOGIN_OTP: (sessionId: string) => `${BASE_URL}/admin/auth/resend-login-otp/${sessionId}`,
    
    // Profile Management
    GET_PROFILE: `${BASE_URL}/admin/profile`,
    UPDATE_PROFILE: `${BASE_URL}/admin/profile`,
    INITIATE_PROFILE_UPDATE: `${BASE_URL}/admin/profile/initiate-update`,
    VERIFY_PROFILE_UPDATE: (sessionId: string) => `${BASE_URL}/admin/profile/verify-update/${sessionId}`,
    UPDATE_PROFILE_PHOTO: `${BASE_URL}/admin/profile/photo`,
    
    // Admin Management (SUPER_ADMIN only)
    CREATE_ADMIN: `${BASE_URL}/admin/create-admin`,
    DELETE_ADMIN: (id: string) => `${BASE_URL}/admin/${id}`,
    RESEND_CREDENTIALS: (id: string) => `${BASE_URL}/admin/${id}/resend-credentials`,
    
    // Staff Management
    GET_EMPLOYEES: `${BASE_URL}/admin/employees`,
    GET_DOCTORS: `${BASE_URL}/admin/doctors`,
    GET_EMPLOYEE: (id: string) => `${BASE_URL}/admin/employee/${id}`,
    GET_DOCTOR: (id: string) => `${BASE_URL}/admin/doctor/${id}`,
    DELETE_EMPLOYEE: (id: string) => `${BASE_URL}/admin/employee/${id}`,
    DELETE_DOCTOR: (id: string) => `${BASE_URL}/admin/doctor/${id}`,
    UPDATE_EMPLOYEE_SALARY: (id: string) => `${BASE_URL}/admin/employee/${id}/salary`,
    UPDATE_DOCTOR_SALARY: (id: string) => `${BASE_URL}/admin/doctor/${id}/salary`,
    
    // Dashboard & Analytics
    GET_DASHBOARD_SUMMARY: `${BASE_URL}/admin/dashboard-summary`,
    GET_TODAY_ATTENDANCE: `${BASE_URL}/admin/attendance/today-summary`,
    GET_PRESENT_TODAY: `${BASE_URL}/admin/present-today`,
    
    // Permissions
    SET_DELEGATED_PERMISSIONS: (userId: string) => `${BASE_URL}/admin/users/${userId}/delegated-permissions`,
    GET_DELEGATED_PERMISSIONS: (userId: string) => `${BASE_URL}/admin/users/${userId}/delegated-permissions`,
    
    // Hospital Profile
    GET_HOSPITAL_PROFILE: `${BASE_URL}/admin/hospital-profile`,
    UPDATE_HOSPITAL_PROFILE: `${BASE_URL}/admin/hospital-profile`,
    UPDATE_HOSPITAL_LOGO: `${BASE_URL}/admin/hospital-profile/logo`,
    
    // Assignments
    CREATE_ASSIGNMENT: `${BASE_URL}/admin/assignments`,
    GET_ASSIGNMENTS: `${BASE_URL}/admin/assignments`,
    
    // Form Templates
    GET_DEFAULT_SCHEMA: (role: string) => `${BASE_URL}/admin/forms/default-schema/${role}`,
    INITIALIZE_FORM: (role: string) => `${BASE_URL}/admin/forms/initialize/${role}`,
    GET_FORM_TEMPLATE: (role: string) => `${BASE_URL}/admin/forms/${role}`,
    GET_FORM_FIELDS: (role: string) => `${BASE_URL}/admin/forms/${role}/fields`,
    UPDATE_FORM_TEMPLATE: (role: string) => `${BASE_URL}/admin/forms/${role}`,
    ADD_FORM_FIELD: (role: string) => `${BASE_URL}/admin/forms/${role}/fields`,
    UPDATE_FORM_FIELD: (role: string, fieldId: string) => `${BASE_URL}/admin/forms/${role}/fields/${fieldId}`,
    DELETE_FORM_FIELD: (role: string, fieldId: string) => `${BASE_URL}/admin/forms/${role}/fields/${fieldId}`,
  },

  // =========================
  // EMPLOYEE MANAGEMENT
  // =========================
  EMPLOYEE: {
    LOGIN: (hospitalId: string) => `${BASE_URL}/employees/login/${hospitalId}`,
    GET_PROFILE: `${BASE_URL}/employees/profile`,
    UPDATE_PROFILE: `${BASE_URL}/employees/profile`,
    UPDATE_PROFILE_PIC: `${BASE_URL}/employees/profile`,
    DELETE_ACCOUNT: `${BASE_URL}/employees/profile`,
    LOGOUT: `${BASE_URL}/employees/logout`,
    
    // Admin endpoints
    LIST_ALL: `${BASE_URL}/employees`,
    LIST_PAGINATED: `${BASE_URL}/employees/paginated`,
    GET_BY_ID: (id: string) => `${BASE_URL}/employees/${id}`,
    UPDATE_SALARY: (id: string) => `${BASE_URL}/employees/${id}/salary`,
    UPDATE_PERMISSIONS: (id: string) => `${BASE_URL}/employees/${id}/delegated-permissions`,
    DELETE: (id: string) => `${BASE_URL}/employees/${id}`,
  },

  // =========================
  // DOCTOR MANAGEMENT
  // =========================
  DOCTOR: {
    LOGIN: (hospitalId: string) => `${BASE_URL}/doctors/login/${hospitalId}`,
    GET_PROFILE: `${BASE_URL}/doctors/profile`,
    UPDATE_PROFILE: `${BASE_URL}/doctors/profile`,
    UPDATE_PROFILE_PIC: `${BASE_URL}/doctors/profile`,
    DELETE_ACCOUNT: `${BASE_URL}/doctors/profile`,
    LOGOUT: `${BASE_URL}/doctors/logout`,
    
    // Admin endpoints
    LIST_ALL: `${BASE_URL}/doctors`,
    LIST_PAGINATED: `${BASE_URL}/doctors/paginated`,
    GET_BY_ID: (id: string) => `${BASE_URL}/doctors/${id}`,
    UPDATE_SALARY: (id: string) => `${BASE_URL}/doctors/${id}/salary`,
    UPDATE_PERMISSIONS: (id: string) => `${BASE_URL}/doctors/${id}/delegated-permissions`,
    DELETE: (id: string) => `${BASE_URL}/doctors/${id}`,
  },

  // =========================
  // PATIENT MANAGEMENT
  // =========================
  PATIENT: {
    LIST_ALL: `${BASE_URL}/patients`,
    SEARCH: `${BASE_URL}/patients/search`,
    LIST_PAGINATED: `${BASE_URL}/patients/paginated`,
    GET_BY_ID: (patientId: string) => `${BASE_URL}/patients/${patientId}`,
  },

  // =========================
  // BILLING MANAGEMENT
  // =========================
  BILLING: {
    LOGIN: `${BASE_URL}/billing/login`,
    GET_CATALOG: `${BASE_URL}/billing/catalog`,
    
    // Patient Management
    CREATE_PATIENT: `${BASE_URL}/billing/patients`,
    SEARCH_PATIENTS: `${BASE_URL}/billing/patients/search`,
    GET_PATIENT: (patientId: string) => `${BASE_URL}/billing/patients/${patientId}`,
    
    // Bill Management
    CREATE_BILL: (patientId: string) => `${BASE_URL}/billing/patients/${patientId}/bills`,
    LIST_BILLS: (patientId: string) => `${BASE_URL}/billing/patients/${patientId}/bills`,
    GET_BILL: (billId: string) => `${BASE_URL}/billing/bills/${billId}`,
    GET_BILL_BY_PATIENT: (patientId: string, billId: string) => `${BASE_URL}/billing/patients/${patientId}/bills/${billId}`,
    
    // Payments
    RECEIVE_PAYMENT: (billId: string) => `${BASE_URL}/billing/bills/${billId}/payment`,
  },

  // =========================
  // OPD (Outpatient Department)
  // =========================
  OPD: {
    LOGIN: `${BASE_URL}/opd/login`,
    
    // Dashboard
    GET_DASHBOARD: `${BASE_URL}/opd/dashboard`,
    GET_QUEUE_DISPLAY: `${BASE_URL}/opd/queue-display`,
    
    // Vitals
    RECORD_VITALS: `${BASE_URL}/opd/vitals/record`,
    GET_VITALS: (patientId: string) => `${BASE_URL}/opd/vitals/${patientId}`,
    
    // Consultation
    CREATE_CONSULTATION: `${BASE_URL}/opd/consultation/create`,
    GET_CONSULTATION: (consultationId: string) => `${BASE_URL}/opd/consultation/${consultationId}`,
    UPDATE_CONSULTATION: (consultationId: string) => `${BASE_URL}/opd/consultation/${consultationId}`,
    
    // Prescriptions
    CREATE_PRESCRIPTION: `${BASE_URL}/opd/prescription/create`,
    GET_PRESCRIPTIONS: (consultationId: string) => `${BASE_URL}/opd/prescriptions/${consultationId}`,
    
    // Test Orders
    CREATE_TEST_ORDER: `${BASE_URL}/opd/test-order/create`,
    GET_TEST_ORDERS: (patientId: string) => `${BASE_URL}/opd/test-orders/${patientId}`,
    
    // Patient History
    GET_PATIENT_HISTORY: (patientId: string) => `${BASE_URL}/opd/patient-history/${patientId}`,
  },

  // =========================
  // IPD (Inpatient Department)
  // =========================
  IPD: {
    // Admissions
    CREATE_ADMISSION: `${BASE_URL}/ipd/admissions`,
    GET_ADMISSION: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}`,
    LIST_ADMISSIONS: `${BASE_URL}/ipd/admissions`,
    
    // Vital Signs
    RECORD_VITALS: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/vitals`,
    GET_VITALS: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/vitals`,
    GET_VITALS_TREND: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/vitals/trend`,
    START_MONITORING: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/monitoring/start`,
    
    // Clinical Orders
    CREATE_ORDER: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/orders`,
    GET_ORDERS: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/orders`,
    RECORD_MEDICATION_ADMINISTRATION: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/medications/administration`,
    
    // Clinical Notes
    CREATE_PROGRESS_NOTE: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/notes`,
    GET_PROGRESS_NOTES: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/notes`,
    
    // Assessments
    CREATE_ASSESSMENT: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/assessments`,
    
    // Discharge Summary
    CREATE_DISCHARGE_SUMMARY: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/discharge-summary`,
    
    // Alerts
    CREATE_ALERT: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/alerts`,
    GET_ALERTS: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/alerts`,
    ACKNOWLEDGE_ALERT: (alertId: string) => `${BASE_URL}/ipd/alerts/${alertId}/acknowledge`,
    
    // Consents
    CREATE_CONSENT: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/consents`,
    GET_CONSENTS: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/consents`,
    SIGN_CONSENT: (consentId: string) => `${BASE_URL}/ipd/consents/${consentId}/sign`,
    
    // Patient Movement
    RECORD_ENTRY: (admissionId: string, wardId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/wards/${wardId}/entry`,
    TRANSFER_PATIENT: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/transfer`,
    DISCHARGE_PATIENT: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/discharge`,
    GET_PATIENT_LOCATION: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/location`,
    
    // Bed Management
    GET_BED_STATUS: (wardId: string) => `${BASE_URL}/ipd/wards/${wardId}/beds`,
    UPDATE_BED_STATUS: (bedId: string) => `${BASE_URL}/ipd/beds/${bedId}/status`,
    
    // Census
    GET_WARD_CENSUS: (wardId: string) => `${BASE_URL}/ipd/wards/${wardId}/census`,
    
    // Dashboard
    GET_ADMISSION_DASHBOARD: (admissionId: string) => `${BASE_URL}/ipd/admissions/${admissionId}/dashboard`,
    GET_WARD_DASHBOARD: (wardId: string) => `${BASE_URL}/ipd/wards/${wardId}/dashboard`,
  },

  // =========================
  // DIAGNOSTICS (Lab & Pathology)
  // =========================
  DIAGNOSTICS: {
    // Diagnostic Tests (Master Catalog)
    GET_ALL_TESTS: `${BASE_URL}/diagnostics/tests`,
    GET_TESTS_BY_CATEGORY: `${BASE_URL}/diagnostics/tests/by-category`,
    GET_TEST: (testId: string) => `${BASE_URL}/diagnostics/tests/${testId}`,
    CREATE_TEST: `${BASE_URL}/diagnostics/tests`,
    UPDATE_TEST: (testId: string) => `${BASE_URL}/diagnostics/tests/${testId}`,
    DELETE_TEST: (testId: string) => `${BASE_URL}/diagnostics/tests/${testId}`,
    GET_TEST_ENTRY_FORM: (testId: string) => `${BASE_URL}/diagnostics/tests/${testId}/entry-form`,
    GET_REPORT_PRINT_CONFIG: `${BASE_URL}/diagnostics/report-print-config`,
    
    // Diagnostic Orders
    GET_ALL_ORDERS: `${BASE_URL}/diagnostics/orders`,
    GET_ORDER: (orderId: string) => `${BASE_URL}/diagnostics/orders/${orderId}`,
    CREATE_DOCTOR_ORDER: `${BASE_URL}/diagnostics/orders/doctor-ordered`,
    CREATE_SELF_INITIATED_ORDER: `${BASE_URL}/diagnostics/orders/self-initiated`,
    CANCEL_ORDER: (orderId: string) => `${BASE_URL}/diagnostics/orders/${orderId}/cancel`,
    GET_PATIENT_ORDERS: (patientId: string) => `${BASE_URL}/diagnostics/patients/${patientId}/orders`,
    
    // Sample Collection
    GET_PENDING_COLLECTIONS: `${BASE_URL}/diagnostics/collection/pending`,
    COLLECT_SAMPLE: `${BASE_URL}/diagnostics/collection/collect`,
    REJECT_SAMPLE: (orderItemId: string) => `${BASE_URL}/diagnostics/collection/${orderItemId}/reject`,
    
    // Results Management
    ENTER_RESULT: `${BASE_URL}/diagnostics/results/enter`,
    QC_CHECK_RESULT: `${BASE_URL}/diagnostics/results/qc-check`,
    PATHOLOGIST_REVIEW: `${BASE_URL}/diagnostics/results/pathologist-review`,
    RELEASE_RESULT: (resultId: string) => `${BASE_URL}/diagnostics/results/${resultId}/release`,
    GET_PENDING_QC_RESULTS: `${BASE_URL}/diagnostics/results/pending-qc`,
    GET_PENDING_REVIEW_RESULTS: `${BASE_URL}/diagnostics/results/pending-review`,
    GET_PATIENT_RESULTS: (patientId: string) => `${BASE_URL}/diagnostics/patients/${patientId}/results`,
    
    // External Prescriptions
    UPLOAD_PRESCRIPTION: `${BASE_URL}/diagnostics/prescription/upload`,
    MAP_PRESCRIPTION_TESTS: (prescriptionId: string) => `${BASE_URL}/diagnostics/prescription/${prescriptionId}/map-tests`,
    
    // Lab Slots
    GENERATE_SLOTS: `${BASE_URL}/diagnostics/slots/generate`,
    GET_AVAILABLE_SLOTS: `${BASE_URL}/diagnostics/slots/available`,
    BOOK_SLOT: `${BASE_URL}/diagnostics/slots/book`,
    
    // Reports
    GET_DAILY_SUMMARY: `${BASE_URL}/diagnostics/reports/daily-summary`,
    GET_TAT_ANALYSIS: `${BASE_URL}/diagnostics/reports/tat-analysis`,
    
    // Billing Integration
    ADD_TO_BILL: (orderId: string) => `${BASE_URL}/diagnostics/billing/${orderId}/add-to-bill`,
    GET_BILL_CHARGES: (billId: string) => `${BASE_URL}/diagnostics/billing/${billId}/charges`,
    APPLY_INSURANCE: (orderId: string) => `${BASE_URL}/diagnostics/billing/${orderId}/apply-insurance`,
    APPLY_DISCOUNT: (orderId: string) => `${BASE_URL}/diagnostics/billing/${orderId}/apply-discount`,
    VERIFY_INSURANCE_COVERAGE: `${BASE_URL}/diagnostics/insurance/verify-coverage`,
  },

  // =========================
  // PHARMACY
  // =========================
  PHARMACY: {
    // Drug Management
    GET_DRUGS: `${BASE_URL}/pharmacy/drugs`,
    CREATE_DRUG: `${BASE_URL}/pharmacy/drugs`,
    GET_DRUG: (drugId: string) => `${BASE_URL}/pharmacy/drugs/${drugId}`,
    UPDATE_DRUG: (drugId: string) => `${BASE_URL}/pharmacy/drugs/${drugId}`,
    DELETE_DRUG: (drugId: string) => `${BASE_URL}/pharmacy/drugs/${drugId}`,
    
    // Inventory Management
    GET_INVENTORY_BY_DRUG: (drugId: string) => `${BASE_URL}/pharmacy/inventory/drug/${drugId}`,
    GET_INVENTORY: `${BASE_URL}/pharmacy/inventory`,
    ADD_INVENTORY: `${BASE_URL}/pharmacy/inventory`,
    UPDATE_INVENTORY: (inventoryId: string) => `${BASE_URL}/pharmacy/inventory/${inventoryId}`,
    
    // Transactions
    GET_TRANSACTIONS: `${BASE_URL}/pharmacy/transactions`,
    GET_LOW_STOCK_ALERTS: `${BASE_URL}/pharmacy/alerts/low-stock`,
    GET_EXPIRING_DRUGS: `${BASE_URL}/pharmacy/alerts/expiring`,
    
    // Prescription Dispensing
    DISPENSE_PRESCRIPTION: `${BASE_URL}/pharmacy/dispense`,
    GET_DISPENSES: `${BASE_URL}/pharmacy/dispenses`,
    GET_DISPENSE: (dispenseId: string) => `${BASE_URL}/pharmacy/dispenses/${dispenseId}`,
    
    // Reports
    GET_INVENTORY_REPORT: `${BASE_URL}/pharmacy/reports/inventory-status`,
    GET_STOCK_MOVEMENT_REPORT: `${BASE_URL}/pharmacy/reports/stock-movement`,
    GET_EXPIRY_REPORT: `${BASE_URL}/pharmacy/reports/expiry-analysis`,
  },

  // =========================
  // QUEUE MANAGEMENT
  // =========================
  QUEUE: {
    // Service Queue Management
    CREATE_SERVICE_QUEUE: `${BASE_URL}/queue/service-queues`,
    GET_SERVICE_QUEUES: `${BASE_URL}/queue/service-queues`,
    GET_SERVICE_QUEUE: (id: string) => `${BASE_URL}/queue/service-queues/${id}`,
    UPDATE_SERVICE_QUEUE: (id: string) => `${BASE_URL}/queue/service-queues/${id}`,
    TOGGLE_SERVICE_QUEUE: (id: string) => `${BASE_URL}/queue/service-queues/${id}/toggle`,
    GET_QUEUE_DISPLAY: (id: string) => `${BASE_URL}/queue/service-queues/${id}/display`,
    CALL_NEXT_PATIENT: (id: string) => `${BASE_URL}/queue/service-queues/${id}/call-next`,
    
    // Patient Queue Operations
    CHECK_IN_PATIENT: `${BASE_URL}/queue/check-in`,
    AUTO_QUEUE: `${BASE_URL}/queue/auto-queue`,
    GET_PATIENT_QUEUES: (patientId: string) => `${BASE_URL}/queue/patient/${patientId}`,
    
    // Queue Entry Operations
    GET_QUEUE_STATUS: (id: string) => `${BASE_URL}/queue/entries/${id}/status`,
    START_SERVING: (id: string) => `${BASE_URL}/queue/entries/${id}/start-serving`,
    COMPLETE_SERVICE: (id: string) => `${BASE_URL}/queue/entries/${id}/complete`,
    SKIP_PATIENT: (id: string) => `${BASE_URL}/queue/entries/${id}/skip`,
    RECALL_PATIENT: (id: string) => `${BASE_URL}/queue/entries/${id}/recall`,
    TRANSFER_PATIENT: (id: string) => `${BASE_URL}/queue/entries/${id}/transfer`,
    CANCEL_PATIENT: (id: string) => `${BASE_URL}/queue/entries/${id}/cancel`,
    CHANGE_PRIORITY: (id: string) => `${BASE_URL}/queue/entries/${id}/change-priority`,
    
    // Analytics
    GET_ANALYTICS: `${BASE_URL}/queue/analytics`,
    RESET_DAILY_QUEUES: `${BASE_URL}/queue/reset-daily`,
    
    // Public Routes (No Auth)
    PUBLIC_QUEUE_DISPLAY: (queueCode: string) => `${BASE_URL}/queue/public/display/${queueCode}`,
    PUBLIC_QUEUE_STATUS: (queueNumber: string) => `${BASE_URL}/queue/public/status/${queueNumber}`,
  },

  // =========================
  // VISITS
  // =========================
  VISIT: {
    REGISTER_PATIENT_ENTRY: `${BASE_URL}/visits/patient-entry`,
    GET_ALL_VISITS: `${BASE_URL}/visits`,
    GET_VISIT: (visitId: string) => `${BASE_URL}/visits/${visitId}`,
    UPDATE_VISIT_STATUS: (visitId: string) => `${BASE_URL}/visits/${visitId}/status`,
    
    // Queue Endpoints
    GET_OPD_QUEUE: `${BASE_URL}/visits/queue/opd`,
    GET_IPD_QUEUE: `${BASE_URL}/visits/queue/ipd`,
    GET_DIAGNOSTICS_QUEUE: `${BASE_URL}/visits/queue/diagnostics`,
    GET_SERVICES_QUEUE: `${BASE_URL}/visits/queue/services`,
  },

  // =========================
  // REPORTS
  // =========================
  REPORTS: {
    // Patient Reports
    GET_VISIT_STATISTICS: `${BASE_URL}/reports/patient/visit-statistics`,
    GET_DEMOGRAPHICS: `${BASE_URL}/reports/patient/demographics`,
    GET_BILLING_SUMMARY: `${BASE_URL}/reports/patient/billing-summary`,
    
    // Clinical Reports
    GET_OPD_ANALYSIS: `${BASE_URL}/reports/clinical/opd-analysis`,
    GET_IPD_OCCUPANCY: `${BASE_URL}/reports/clinical/ipd-occupancy`,
    GET_DIAGNOSTIC_STATS: `${BASE_URL}/reports/clinical/diagnostic-stats`,
    
    // Financial Reports
    GET_REVENUE_REPORT: `${BASE_URL}/reports/financial/revenue`,
    GET_OUTSTANDING_BILLS: `${BASE_URL}/reports/financial/outstanding-bills`,
    GET_SERVICE_REVENUE: `${BASE_URL}/reports/financial/service-revenue`,
    
    // Staff Reports
    GET_ATTENDANCE_SUMMARY: `${BASE_URL}/reports/staff/attendance-summary`,
    GET_STAFF_PERFORMANCE: `${BASE_URL}/reports/staff/performance`,
    
    // Audit Reports
    GET_AUDIT_LOGS: `${BASE_URL}/reports/audit/activity-logs`,
    GET_USER_ACTIVITY: `${BASE_URL}/reports/audit/user-activity`,
    GET_SYSTEM_EVENTS: `${BASE_URL}/reports/audit/system-events`,
    
    // Export
    EXPORT_CSV: `${BASE_URL}/reports/export/csv`,
    EXPORT_PDF: `${BASE_URL}/reports/export/pdf`,
  },

  // =========================
  // ATTENDANCE
  // =========================
  ATTENDANCE: {
    MARK_ATTENDANCE: `${BASE_URL}/attendance/mark`,
    GET_ATTENDANCE: `${BASE_URL}/attendance`,
    GET_EMPLOYEE_ATTENDANCE: (employeeId: string) => `${BASE_URL}/attendance/employee/${employeeId}`,
    GET_DOCTOR_ATTENDANCE: (doctorId: string) => `${BASE_URL}/attendance/doctor/${doctorId}`,
  },

  // =========================
  // DEPARTMENT MANAGEMENT
  // =========================
  DEPARTMENT: {
    LIST_ALL: `${BASE_URL}/departments`,
    CREATE: `${BASE_URL}/departments`,
    GET_BY_ID: (id: string) => `${BASE_URL}/departments/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/departments/${id}`,
    DELETE: (id: string) => `${BASE_URL}/departments/${id}`,
  },

  // =========================
  // PASSWORD MANAGEMENT
  // =========================
  PASSWORD: {
    REQUEST_RESET: `${BASE_URL}/password/request-reset`,
    VERIFY_OTP: `${BASE_URL}/password/verify-otp`,
    RESET_PASSWORD: `${BASE_URL}/password/reset`,
  },

  // =========================
  // SETUP & ONBOARDING
  // =========================
  SETUP: {
    INITIALIZE: `${BASE_URL}/setup/initialize`,
    GET_STATUS: `${BASE_URL}/setup/status`,
  },

  ONBOARDING: {
    GET_CURRENT_STEP: `${BASE_URL}/onboarding/current-step`,
    COMPLETE_STEP: (step: string) => `${BASE_URL}/onboarding/complete/${step}`,
    GET_ONBOARDING_DATA: `${BASE_URL}/onboarding/data`,
  },

  // =========================
  // PUBLIC REGISTRATION
  // =========================
  PUBLIC_REGISTRATION: {
    REGISTER: `${BASE_URL}/public/register`,
    VERIFY_EMAIL: `${BASE_URL}/public/verify-email`,
    RESEND_VERIFICATION: `${BASE_URL}/public/resend-verification`,
  },

  // =========================
  // DIAGNOSTIC REPORT TEMPLATES
  // =========================
  TEMPLATE: {
    LIST_ALL: `${BASE_URL}/templates`,
    GET_BY_ID: (id: string) => `${BASE_URL}/templates/${id}`,
    CREATE: `${BASE_URL}/templates`,
    UPDATE: (id: string) => `${BASE_URL}/templates/${id}`,
    DELETE: (id: string) => `${BASE_URL}/templates/${id}`,
    DUPLICATE: (id: string) => `${BASE_URL}/templates/${id}/duplicate`,
  },

  // =========================
  // WORKBOARD (Result Entry Workflow)
  // =========================
  WORKBOARD: {
    GET_PENDING_ENTRIES: `${BASE_URL}/workboard/pending`,
    START_ENTRY: (orderId: string) => `${BASE_URL}/workboard/${orderId}/start`,
    SUBMIT_ENTRY: (orderId: string) => `${BASE_URL}/workboard/${orderId}/submit`,
    GET_ENTRY_STATUS: (orderId: string) => `${BASE_URL}/workboard/${orderId}/status`,
  },

  // =========================
  // IPD ADMISSION QUEUE
  // =========================
  IPD_QUEUE: {
    LIST_PENDING: `${BASE_URL}/ipd-admission-queue/pending`,
    GET_QUEUE_ENTRY: (id: string) => `${BASE_URL}/ipd-admission-queue/${id}`,
    ADMIT_FROM_QUEUE: (id: string) => `${BASE_URL}/ipd-admission-queue/${id}/admit`,
    CANCEL_QUEUE_ENTRY: (id: string) => `${BASE_URL}/ipd-admission-queue/${id}/cancel`,
  },

  // =========================
  // VITAL SIGNS
  // =========================
  VITALS: {
    RECORD: `${BASE_URL}/vitals/record`,
    GET_LATEST: (patientId: string) => `${BASE_URL}/vitals/patient/${patientId}/latest`,
    GET_HISTORY: (patientId: string) => `${BASE_URL}/vitals/patient/${patientId}/history`,
    GET_TREND: (patientId: string) => `${BASE_URL}/vitals/patient/${patientId}/trend`,
  },

} as const;

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'hospital-auth-jwt-token',
  REFRESH_TOKEN: 'hospital-refresh-jwt-token',
  USER_DATA: 'hospital-user-data',
  USER_PERMISSIONS: 'hospital-user-permissions',
  USER_ROLE: 'hospital-user-role',
  HOSPITAL_ID: 'hospital-id',
  HOSPITAL_DATA: 'hospital-data',
  LAST_VISIT: 'hospital-last-visit',
  THEME_PREFERENCE: 'hospital-theme-preference',
} as const;

// ============================================================
// API ERROR CODES
// ============================================================

export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, any>;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get base URL for API endpoints
 * Supports both React and Vite environments
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    if (typeof (window as any).import?.meta?.env?.VITE_API_URL !== 'undefined') {
      return (window as any).import.meta.env.VITE_API_URL;
    }
    // React env variables
    if ((window as any).process?.env?.REACT_APP_API_URL) {
      return (window as any).process.env.REACT_APP_API_URL;
    }
  }
  return 'http://localhost:3000';
}

/**
 * Build URL with query parameters
 */
export function buildUrl(path: string, query?: Record<string, any>): string {
  const url = new URL(path, `${getBaseUrl()}/api`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * Get authorization header
 */
export function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
    : null;
  
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default API_ROUTES;
