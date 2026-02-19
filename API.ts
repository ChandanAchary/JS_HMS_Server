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

    // Geofence Settings
    GET_GEOFENCE_SETTINGS: `${BASE_URL}/admin/geofence-settings`,
    UPDATE_GEOFENCE_SETTINGS: `${BASE_URL}/admin/geofence-settings`,
    PINCODE_LOOKUP: (pincode: string) => `${BASE_URL}/admin/pincode-lookup/${pincode}`,


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
    LOGIN: `${BASE_URL}/employees/login`,
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
    LOGIN: `${BASE_URL}/doctors/login`,
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

    // Dashboard & Queue (opd-dashboard.routes.js)
    GET_DASHBOARD: `${BASE_URL}/opd/opdDashboard`,
    GET_STATISTICS: `${BASE_URL}/opd/statistics`,
    GET_NEXT_PATIENT: `${BASE_URL}/opd/next-patient`,
    GET_PATIENT_DETAILS: (visitId: string) => `${BASE_URL}/opd/patient/${visitId}`,
    CALL_PATIENT: (queueId: string) => `${BASE_URL}/opd/call-patient/${queueId}`,
    START_SERVING: (queueId: string) => `${BASE_URL}/opd/start-serving/${queueId}`,
    COMPLETE_SERVICE: (queueId: string) => `${BASE_URL}/opd/complete-service/${queueId}`,
    SKIP_PATIENT: (queueId: string) => `${BASE_URL}/opd/skip-patient/${queueId}`,

    // Vitals (mounted at /api/opd/vitals — vitals.routes.js)
    RECORD_VITALS: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals`,
    GET_VITALS: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals`,
    GET_VITALS_STATUS: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals/status`,
    GET_VITALS_COMPARISON: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals/comparison`,
    UPDATE_VITALS: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals`,
    GET_VITALS_HISTORY: (patientId: string) => `${BASE_URL}/opd/vitals/history/${patientId}`,

    // Consultation Notes (opd-consultation.routes.js)
    ADD_CONSULTATION_NOTE: (visitId: string) => `${BASE_URL}/opd/consultation/${visitId}/note`,
    GET_CONSULTATION_NOTE: (visitId: string) => `${BASE_URL}/opd/consultation/${visitId}/note`,
    UPDATE_CONSULTATION_NOTE: (noteId: string) => `${BASE_URL}/opd/consultation/note/${noteId}`,

    // Prescriptions
    CREATE_PRESCRIPTION: (visitId: string) => `${BASE_URL}/opd/prescription/${visitId}`,
    GET_PRESCRIPTIONS_BY_VISIT: (visitId: string) => `${BASE_URL}/opd/prescription/visit/${visitId}`,
    GET_PRESCRIPTION: (prescriptionId: string) => `${BASE_URL}/opd/prescription/${prescriptionId}`,
    UPDATE_PRESCRIPTION_STATUS: (prescriptionId: string) => `${BASE_URL}/opd/prescription/${prescriptionId}/status`,

    // Test Orders
    CREATE_TEST_ORDER: (visitId: string) => `${BASE_URL}/opd/test-order/${visitId}`,
    GET_TEST_ORDERS_BY_VISIT: (visitId: string) => `${BASE_URL}/opd/test-order/visit/${visitId}`,
    UPDATE_TEST_ORDER_STATUS: (orderId: string) => `${BASE_URL}/opd/test-order/${orderId}/status`,

    // Patient History
    GET_PATIENT_HISTORY: (patientId: string) => `${BASE_URL}/opd/patient/${patientId}/history`,
    GET_COMPLETE_VISIT: (visitId: string) => `${BASE_URL}/opd/visit/${visitId}/complete`,
  },

  // =========================
  // IPD (Inpatient Department)
  // Note: Routes are factory-based (createIPDRoutes) and not yet mounted
  // in the main api router. Paths shown below match the factory definitions.
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
    // Self routes (authenticated user's own attendance)
    CHECK_IN: `${BASE_URL}/attendance/check-in`,
    CHECK_OUT: `${BASE_URL}/attendance/check-out`,
    GET_TODAY: `${BASE_URL}/attendance/today`,
    GET_MY_HISTORY: `${BASE_URL}/attendance/my-history`,

    // Admin routes
    GET_ADMIN_SUMMARY: `${BASE_URL}/attendance/admin/summary`,
    GET_USER_DETAILS: (userId: string) => `${BASE_URL}/attendance/admin/${userId}`,
  },

  // =========================
  // DEPARTMENT MANAGEMENT
  // =========================
  DEPARTMENT: {
    // Public routes
    LIST_ALL: `${BASE_URL}/departments`,
    GET_BY_CODE: (code: string) => `${BASE_URL}/departments/${code}`,

    // Diagnostic department
    DIAGNOSTICS_LOGIN: `${BASE_URL}/departments/diagnostics/login`,
    GET_DIAGNOSTIC_CATEGORIES: `${BASE_URL}/departments/diagnostics/categories`,
    GET_DIAGNOSTIC_WORKLIST: `${BASE_URL}/departments/diagnostics/worklist`,
    GET_DIAGNOSTIC_DASHBOARD_STATS: `${BASE_URL}/departments/diagnostics/dashboard-stats`,
  },

  // =========================
  // PASSWORD MANAGEMENT
  // =========================
  PASSWORD: {
    // Forgot password flow (public)
    FORGOT: `${BASE_URL}/password/forgot`,
    RESET: `${BASE_URL}/password/reset`,

    // First login password change (protected)
    FIRST_LOGIN_SEND_OTP: `${BASE_URL}/password/first-login/send-otp`,
    FIRST_LOGIN_CHANGE: `${BASE_URL}/password/first-login/change`,

    // Regular password change with OTP (protected)
    CHANGE_SEND_OTP: `${BASE_URL}/password/change/send-otp`,
    CHANGE: `${BASE_URL}/password/change`,
  },

  // =========================
  // SETUP & ONBOARDING
  // =========================
  SETUP: {
    // Phase 1: Admin registration (public)
    GET_STATUS: `${BASE_URL}/setup/status`,
    REGISTER_ADMIN: `${BASE_URL}/setup/register-admin`,
    VERIFY_ADMIN_OTP: (sessionId: string) => `${BASE_URL}/setup/verify-admin-otp/${sessionId}`,

    // Phase 3: Hospital configuration (protected - admin only)
    GET_HOSPITAL_SETUP_STATUS: `${BASE_URL}/setup/hospital-setup-status`,
    CONFIGURE_HOSPITAL: `${BASE_URL}/setup/configure-hospital`,
    GET_ONBOARDING_STATUS: `${BASE_URL}/setup/onboarding-status`,
  },

  ONBOARDING: {
    // Public routes
    LIST_PUBLIC_HOSPITALS: `${BASE_URL}/onboarding/public/hospitals`,
    SUBMIT_JOIN_REQUEST: `${BASE_URL}/onboarding/public/join-request`,
    SUBMIT_JOIN_APPLICATION: `${BASE_URL}/onboarding/public/join-request/submit-form`,
    GET_APPLICATION_STATUS: `${BASE_URL}/onboarding/public/join-requests/status`,

    // Token-based registration
    VALIDATE_REGISTRATION_TOKEN: (role: string, token: string) => `${BASE_URL}/onboarding/register/${role}/${token}/validate`,
    REGISTER_DOCTOR: (token: string) => `${BASE_URL}/onboarding/register/doctor/${token}`,
    REGISTER_EMPLOYEE: (token: string) => `${BASE_URL}/onboarding/register/employee/${token}`,

    // Email verification
    SEND_OTP: (role: string, id: string) => `${BASE_URL}/onboarding/send-otp/${role}/${id}`,
    VERIFY_OTP: (role: string, id: string) => `${BASE_URL}/onboarding/verify-otp/${role}/${id}`,

    // Admin routes (protected)
    GET_JOIN_REQUESTS: `${BASE_URL}/onboarding/admin/join-requests`,
    GET_JOIN_REQUEST: (id: string) => `${BASE_URL}/onboarding/admin/join-requests/${id}`,
    UPDATE_JOIN_REQUEST: (id: string) => `${BASE_URL}/onboarding/admin/join-requests/${id}`,
    SEND_INVITE_TO_REQUEST: (id: string) => `${BASE_URL}/onboarding/admin/join-requests/${id}/send-invite`,
    APPROVE_JOIN_REQUEST: (id: string) => `${BASE_URL}/onboarding/admin/join-requests/${id}/approve`,
    REJECT_JOIN_REQUEST: (id: string) => `${BASE_URL}/onboarding/admin/join-requests/${id}/reject`,
    GET_VERIFICATIONS_QUEUE: `${BASE_URL}/onboarding/admin/verifications`,
    APPROVE_VERIFICATION: (type: string, id: string) => `${BASE_URL}/onboarding/admin/verify/${type}/${id}/approve`,
    REJECT_VERIFICATION: (type: string, id: string) => `${BASE_URL}/onboarding/admin/verify/${type}/${id}/reject`,
  },

  // =========================
  // PUBLIC REGISTRATION
  // =========================
  PUBLIC_REGISTRATION: {
    GET_REGISTRATION_FORM: (role: string) => `${BASE_URL}/public/join/registration-form/${role}`,
    APPLY: (role: string) => `${BASE_URL}/public/join/apply/${role}`,
    CHECK_APPLICATION_STATUS: `${BASE_URL}/public/join/application-status`,
  },

  // =========================
  // DIAGNOSTIC REPORT TEMPLATES
  // Mounted at: /api/diagnostics/templates (via diagnostics router)
  // =========================
  TEMPLATE: {
    // Read routes
    LIST_ALL: `${BASE_URL}/diagnostics/templates`,
    GET_GROUPED: `${BASE_URL}/diagnostics/templates/grouped`,
    GET_FOR_TEST: `${BASE_URL}/diagnostics/templates/for-test`,
    GET_ENTRY_FORM: `${BASE_URL}/diagnostics/templates/entry-form`,
    GET_PRINT_CONFIG: `${BASE_URL}/diagnostics/templates/print-config`,
    GET_ENTRY_FIELDS: (templateCode: string) => `${BASE_URL}/diagnostics/templates/entry-fields/${templateCode}`,
    GET_REFERENCE_RANGES: (templateCode: string) => `${BASE_URL}/diagnostics/templates/reference-ranges/${templateCode}`,
    GET_BY_ID: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}`,

    // Create routes
    CREATE: `${BASE_URL}/diagnostics/templates`,
    CLONE: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/clone`,

    // Update routes
    UPDATE: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}`,
    UPDATE_SECTIONS: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/sections`,
    UPDATE_ENTRY_FIELDS: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/entry-fields`,
    UPDATE_STYLING: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/styling`,
    SET_AS_DEFAULT: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/set-default`,
    CREATE_VERSION: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/version`,

    // Delete / deactivate routes
    DEACTIVATE: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}/deactivate`,
    DELETE: (templateId: string) => `${BASE_URL}/diagnostics/templates/${templateId}`,

    // Admin / initialization
    SEED: `${BASE_URL}/diagnostics/templates/seed`,
    INITIALIZE: `${BASE_URL}/diagnostics/templates/initialize`,
  },

  // =========================
  // WORKBOARD (Diagnostics Result Entry Workflow)
  // Mounted at: /api/diagnostics/workboard (via diagnostics router)
  // =========================
  WORKBOARD: {
    GET_WORKLIST: (category: string) => `${BASE_URL}/diagnostics/workboard/worklist/${category}`,
    GET_ENTRY_FORM: (resultId: string) => `${BASE_URL}/diagnostics/workboard/entry-form/${resultId}`,

    // Result entry
    SAVE_RESULT: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}`,
    SUBMIT_FOR_REVIEW: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}/submit`,

    // QC workflow
    QC_APPROVE: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}/qc-approve`,
    QC_REJECT: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}/qc-reject`,

    // Review & release
    REVIEW_APPROVE: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}/review-approve`,
    RELEASE: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}/release`,
    AMEND: (resultId: string) => `${BASE_URL}/diagnostics/workboard/results/${resultId}/amend`,
  },

  // =========================
  // IPD ADMISSION QUEUE
  // Note: Routes are factory-based (createAdmissionQueueRouter) and not yet
  // mounted in the main api router. Paths shown are from the factory definition.
  // =========================
  IPD_QUEUE: {
    CREATE_REQUEST: `${BASE_URL}/ipd/queue/request`,
    LIST_PENDING: `${BASE_URL}/ipd/queue/pending`,
    GET_PATIENT_REQUESTS: (patientId: string) => `${BASE_URL}/ipd/queue/patient/${patientId}`,
    GET_REQUEST: (requestId: string) => `${BASE_URL}/ipd/queue/request/${requestId}`,
    APPROVE_REQUEST: (requestId: string) => `${BASE_URL}/ipd/queue/request/${requestId}/approve`,
    REJECT_REQUEST: (requestId: string) => `${BASE_URL}/ipd/queue/request/${requestId}/reject`,
    GET_STATS: `${BASE_URL}/ipd/queue/stats`,
  },

  // =========================
  // VITAL SIGNS
  // Note: Vitals are served via the OPD module at /api/opd/vitals/
  // Use OPD.RECORD_VITALS, OPD.GET_VITALS, OPD.GET_VITALS_HISTORY etc.
  // =========================
  VITALS: {
    RECORD: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals`,
    GET_BY_VISIT: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals`,
    GET_STATUS: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals/status`,
    GET_COMPARISON: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals/comparison`,
    UPDATE: (visitId: string) => `${BASE_URL}/opd/vitals/${visitId}/vitals`,
    GET_HISTORY: (patientId: string) => `${BASE_URL}/opd/vitals/history/${patientId}`,
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
