/**
 * Central Role-Based Access Control (RBAC) Authority
 * 
 * Single source of truth for role → permissions mapping.
 * 
 * KEY PRINCIPLES:
 * 1. Permission names are semantic: VIEW_PATIENTS, MANAGE_EMPLOYEES, etc.
 * 2. SUPER_ADMIN has all permissions
 * 3. Tokens include `permissions` array; RBAC checks use permissions, not roles
 * 4. Fallback to this mapping if token missing permissions
 * 5. All new code should use permission checks, not role string checks
 * 
 * MIGRATION: Old role-based checks (authorize('DOCTOR')) are deprecated in favor of
 *            permission checks (authorizePermission('MANAGE_PATIENTS')). See rbac.middleware.js
 */

/**
 * Consolidated permission definitions
 * Unified from multiple sources to ensure consistency across:
 * - Clinical operations (OPD, Diagnostics)
 * - Billing & Reports
 * - Employee management
 * - General dashboard/profile
 */
export const PERMISSIONS = {
  // === ADMIN & SYSTEM ===
  ADMINISTER_TENANT: 'ADMINISTER_TENANT',
  ADMINISTER_SYSTEM: 'ADMINISTER_SYSTEM',
  
  // === EMPLOYEE MANAGEMENT ===
  MANAGE_EMPLOYEE: 'MANAGE_EMPLOYEE',
  VIEW_EMPLOYEES: 'VIEW_EMPLOYEES',
  INVITE_USER: 'INVITE_USER',
  
  // === PATIENT & CLINICAL ===
  MANAGE_PATIENTS: 'MANAGE_PATIENTS',
  VIEW_PATIENTS: 'VIEW_PATIENTS',
  RECORD_VITALS: 'RECORD_VITALS',        // Nurses, OPD assistants
  PROVIDE_CONSULTATION: 'PROVIDE_CONSULTATION', // Doctors
  
  // === DIAGNOSTICS & LAB ===
  GENERATE_REPORT: 'GENERATE_REPORT',    // Lab tech, pathologists
  VIEW_REPORTS: 'VIEW_REPORTS',
  MANAGE_DIAGNOSTICS: 'MANAGE_DIAGNOSTICS',
  APPROVE_QC: 'APPROVE_QC',              // QC approval for lab results
  REVIEW_PATHOLOGY: 'REVIEW_PATHOLOGY',  // Pathologist review
  
  // === OPD OPERATIONS ===
  OPD_ACCESS: 'OPD_ACCESS',              // Base OPD section access
  MANAGE_QUEUE: 'MANAGE_QUEUE',          // Queue coordination
  ACCESS_ALL_QUEUES: 'ACCESS_ALL_QUEUES', // Admin override
  OPD_VIEW_HISTORY: 'OPD_VIEW_HISTORY',  // View patient OPD history
  OPD_ADD_CONSULTATION: 'OPD_ADD_CONSULTATION', // Add consultation notes
  OPD_MANAGE_PRESCRIPTION: 'OPD_MANAGE_PRESCRIPTION', // Manage prescriptions
  OPD_ORDER_TESTS: 'OPD_ORDER_TESTS',    // Order diagnostic tests
  OPD_MANAGE_REFERRALS: 'OPD_MANAGE_REFERRALS', // Manage patient referrals
  
  // === BILLING ===
  BILLING_ACCESS: 'BILLING_ACCESS',
  MANAGE_BILLING: 'MANAGE_BILLING',
  MANAGE_SUBSCRIPTIONS: 'MANAGE_SUBSCRIPTIONS',
  
  // === REPORTS ===
  PRINT_REPORT: 'PRINT_REPORT',
  DISPATCH_REPORT: 'DISPATCH_REPORT',
  
  // === PROFILE ===
  VIEW_PROFILE: 'VIEW_PROFILE',
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  
  // === ATTENDANCE ===
  VIEW_ATTENDANCE: 'VIEW_ATTENDANCE',
  MARK_ATTENDANCE: 'MARK_ATTENDANCE',
  
  // === PAYROLL ===
  VIEW_PAYROLL: 'VIEW_PAYROLL',
  MANAGE_PAYROLL: 'MANAGE_PAYROLL',
  
  // === IPD (IN-PATIENT DEPARTMENT) ===
  // Admission & Bed Management
  IPD_ADMIT_PATIENT: 'IPD_ADMIT_PATIENT',           // Receptionist, IPD Admin
  IPD_VIEW_PATIENT: 'IPD_VIEW_PATIENT',             // All IPD staff
  IPD_EDIT_PATIENT: 'IPD_EDIT_PATIENT',             // Doctor, IPD Admin
  IPD_MANAGE_BEDS: 'IPD_MANAGE_BEDS',               // IPD Admin, Receptionist
  IPD_VIEW_BEDS: 'IPD_VIEW_BEDS',                   // All IPD staff
  
  // Clinical Management
  IPD_WRITE_NOTES: 'IPD_WRITE_NOTES',               // Doctor, Nurse
  IPD_VIEW_NOTES: 'IPD_VIEW_NOTES',                 // All IPD staff
  IPD_MANAGE_ORDERS: 'IPD_MANAGE_ORDERS',           // Doctor, IPD Admin
  IPD_VIEW_ORDERS: 'IPD_VIEW_ORDERS',               // All IPD staff
  IPD_MANAGE_MEDICATIONS: 'IPD_MANAGE_MEDICATIONS', // Nurse, Pharmacy
  IPD_VIEW_MAR: 'IPD_VIEW_MAR',                     // Nurse, Doctor, IPD Admin (Medication Admin Record)
  
  // Care Management
  IPD_CREATE_CARE_PLAN: 'IPD_CREATE_CARE_PLAN',     // Doctor, IPD Admin
  IPD_VIEW_CARE_PLAN: 'IPD_VIEW_CARE_PLAN',         // All IPD staff
  IPD_MANAGE_PROCEDURES: 'IPD_MANAGE_PROCEDURES',   // Doctor, IPD Admin
  
  // Patient Movement
  IPD_TRANSFER_PATIENT: 'IPD_TRANSFER_PATIENT',     // Doctor, IPD Admin, Receptionist
  IPD_VIEW_TRANSFERS: 'IPD_VIEW_TRANSFERS',         // All IPD staff
  
  // Discharge Management
  IPD_DISCHARGE_PATIENT: 'IPD_DISCHARGE_PATIENT',   // Doctor, IPD Admin
  IPD_VIEW_DISCHARGE: 'IPD_VIEW_DISCHARGE',         // All IPD staff
  IPD_PRINT_DISCHARGE_SUMMARY: 'IPD_PRINT_DISCHARGE_SUMMARY', // Doctor, Receptionist
  
  // Alerts & Compliance
  IPD_MANAGE_ALERTS: 'IPD_MANAGE_ALERTS',           // Nurse, Doctor, IPD Admin
  IPD_VIEW_ALERTS: 'IPD_VIEW_ALERTS',               // All IPD staff
  IPD_VIEW_AUDIT_LOG: 'IPD_VIEW_AUDIT_LOG',         // IPD Admin
  
  // Consent & Documentation
  IPD_MANAGE_CONSENT: 'IPD_MANAGE_CONSENT',         // Receptionist, IPD Admin
  IPD_VIEW_CONSENT: 'IPD_VIEW_CONSENT',             // All IPD staff
  
  // IPD-Specific Billing (integrated with billing module)
  IPD_VIEW_BILLING: 'IPD_VIEW_BILLING',             // Billing staff, IPD Admin
  IPD_MANAGE_CHARGES: 'IPD_MANAGE_CHARGES',         // Billing staff, IPD Admin
};

/**
 * Role-to-permissions mapping
 * 
 * Structure:
 * - System roles: SUPER_ADMIN, ADMIN
 * - Hospital roles: TENANT_ADMIN, HR_MANAGER
 * - Clinical roles: DOCTOR, NURSE, OPD_ASSISTANT, OPD_COORDINATOR, OPD_MANAGER
 * - Diagnostic roles: PATHOLOGY, LAB_TECHNICIAN, XRAY, CT_SCAN, MRI, ULTRASOUND, ECG, ENDOSCOPY
 * - Billing roles: BILLING_ENTRY, BILLING_EXIT
 * - Generic: EMPLOYEE, RECEPTIONIST
 */
export const ROLE_PERMISSIONS = {
  // System roles (unrestricted)
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS),
  
  // Hospital management
  TENANT_ADMIN: [
    PERMISSIONS.ADMINISTER_TENANT,
    PERMISSIONS.MANAGE_EMPLOYEE,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_SUBSCRIPTIONS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_REPORT,
    PERMISSIONS.DISPATCH_REPORT,
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
  
  HR_MANAGER: [
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.MANAGE_EMPLOYEE,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_PAYROLL,
  ],
  
  // Clinical: Doctors
  DOCTOR: [
    PERMISSIONS.OPD_ACCESS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.PROVIDE_CONSULTATION,
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.OPD_VIEW_HISTORY,
    PERMISSIONS.OPD_ADD_CONSULTATION,
    PERMISSIONS.OPD_MANAGE_PRESCRIPTION,
    PERMISSIONS.OPD_ORDER_TESTS,
    PERMISSIONS.OPD_MANAGE_REFERRALS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.VIEW_ATTENDANCE,
  ],
  
  // Clinical: Nurses & OPD support
  NURSE: [
    PERMISSIONS.OPD_ACCESS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.RECORD_VITALS,
    PERMISSIONS.OPD_VIEW_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  // OPD Operations
  OPD_ASSISTANT: [
    PERMISSIONS.OPD_ACCESS,
    PERMISSIONS.RECORD_VITALS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.OPD_VIEW_HISTORY,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  OPD_COORDINATOR: [
    PERMISSIONS.OPD_ACCESS,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.OPD_VIEW_HISTORY,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  // Nurse specific to OPD
  NURSE_OPD: [
    PERMISSIONS.OPD_ACCESS,
    PERMISSIONS.RECORD_VITALS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.OPD_VIEW_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  OPD_MANAGER: [
    PERMISSIONS.OPD_ACCESS,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.ACCESS_ALL_QUEUES,
    PERMISSIONS.RECORD_VITALS,
    PERMISSIONS.PROVIDE_CONSULTATION,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.OPD_VIEW_HISTORY,
    PERMISSIONS.OPD_ADD_CONSULTATION,
    PERMISSIONS.OPD_MANAGE_PRESCRIPTION,
    PERMISSIONS.OPD_ORDER_TESTS,
    PERMISSIONS.OPD_MANAGE_REFERRALS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  RECEPTIONIST: [
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  // Diagnostics: Core lab role
  PATHOLOGY: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.APPROVE_QC,
    PERMISSIONS.REVIEW_PATHOLOGY,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  LAB_TECHNICIAN: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.APPROVE_QC,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  // Diagnostic imaging roles
  XRAY: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  CT_SCAN: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  MRI: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  ULTRASOUND: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  ECG: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  ENDOSCOPY: [
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_DIAGNOSTICS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  // Billing
  BILLING_ENTRY: [
    PERMISSIONS.BILLING_ACCESS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  BILLING_EXIT: [
    PERMISSIONS.BILLING_ACCESS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  // Generic employee role (base permissions)
  EMPLOYEE: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.VIEW_ATTENDANCE,
  ],
  
  // IPD-Specific Roles
  IPD_DOCTOR: [
    PERMISSIONS.IPD_ADMIT_PATIENT,
    PERMISSIONS.IPD_VIEW_PATIENT,
    PERMISSIONS.IPD_EDIT_PATIENT,
    PERMISSIONS.IPD_VIEW_BEDS,
    PERMISSIONS.IPD_WRITE_NOTES,
    PERMISSIONS.IPD_VIEW_NOTES,
    PERMISSIONS.IPD_MANAGE_ORDERS,
    PERMISSIONS.IPD_VIEW_ORDERS,
    PERMISSIONS.IPD_CREATE_CARE_PLAN,
    PERMISSIONS.IPD_VIEW_CARE_PLAN,
    PERMISSIONS.IPD_MANAGE_PROCEDURES,
    PERMISSIONS.IPD_TRANSFER_PATIENT,
    PERMISSIONS.IPD_VIEW_TRANSFERS,
    PERMISSIONS.IPD_DISCHARGE_PATIENT,
    PERMISSIONS.IPD_VIEW_DISCHARGE,
    PERMISSIONS.IPD_PRINT_DISCHARGE_SUMMARY,
    PERMISSIONS.IPD_MANAGE_ALERTS,
    PERMISSIONS.IPD_VIEW_ALERTS,
    PERMISSIONS.IPD_VIEW_CONSENT,
    PERMISSIONS.IPD_VIEW_BILLING,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  IPD_NURSE: [
    PERMISSIONS.IPD_VIEW_PATIENT,
    PERMISSIONS.IPD_VIEW_BEDS,
    PERMISSIONS.IPD_WRITE_NOTES,
    PERMISSIONS.IPD_VIEW_NOTES,
    PERMISSIONS.IPD_VIEW_ORDERS,
    PERMISSIONS.IPD_MANAGE_MEDICATIONS,
    PERMISSIONS.IPD_VIEW_MAR,
    PERMISSIONS.IPD_VIEW_CARE_PLAN,
    PERMISSIONS.IPD_VIEW_TRANSFERS,
    PERMISSIONS.IPD_VIEW_DISCHARGE,
    PERMISSIONS.IPD_MANAGE_ALERTS,
    PERMISSIONS.IPD_VIEW_ALERTS,
    PERMISSIONS.IPD_VIEW_CONSENT,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  IPD_ADMIN: [
    PERMISSIONS.IPD_ADMIT_PATIENT,
    PERMISSIONS.IPD_VIEW_PATIENT,
    PERMISSIONS.IPD_EDIT_PATIENT,
    PERMISSIONS.IPD_MANAGE_BEDS,
    PERMISSIONS.IPD_VIEW_BEDS,
    PERMISSIONS.IPD_WRITE_NOTES,
    PERMISSIONS.IPD_VIEW_NOTES,
    PERMISSIONS.IPD_MANAGE_ORDERS,
    PERMISSIONS.IPD_VIEW_ORDERS,
    PERMISSIONS.IPD_MANAGE_MEDICATIONS,
    PERMISSIONS.IPD_VIEW_MAR,
    PERMISSIONS.IPD_CREATE_CARE_PLAN,
    PERMISSIONS.IPD_VIEW_CARE_PLAN,
    PERMISSIONS.IPD_MANAGE_PROCEDURES,
    PERMISSIONS.IPD_TRANSFER_PATIENT,
    PERMISSIONS.IPD_VIEW_TRANSFERS,
    PERMISSIONS.IPD_DISCHARGE_PATIENT,
    PERMISSIONS.IPD_VIEW_DISCHARGE,
    PERMISSIONS.IPD_PRINT_DISCHARGE_SUMMARY,
    PERMISSIONS.IPD_MANAGE_ALERTS,
    PERMISSIONS.IPD_VIEW_ALERTS,
    PERMISSIONS.IPD_VIEW_AUDIT_LOG,
    PERMISSIONS.IPD_MANAGE_CONSENT,
    PERMISSIONS.IPD_VIEW_CONSENT,
    PERMISSIONS.IPD_VIEW_BILLING,
    PERMISSIONS.IPD_MANAGE_CHARGES,
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  
  IPD_RECEPTIONIST: [
    PERMISSIONS.IPD_ADMIT_PATIENT,
    PERMISSIONS.IPD_VIEW_PATIENT,
    PERMISSIONS.IPD_MANAGE_BEDS,
    PERMISSIONS.IPD_VIEW_BEDS,
    PERMISSIONS.IPD_VIEW_NOTES,
    PERMISSIONS.IPD_VIEW_ORDERS,
    PERMISSIONS.IPD_TRANSFER_PATIENT,
    PERMISSIONS.IPD_VIEW_TRANSFERS,
    PERMISSIONS.IPD_VIEW_DISCHARGE,
    PERMISSIONS.IPD_PRINT_DISCHARGE_SUMMARY,
    PERMISSIONS.IPD_MANAGE_CONSENT,
    PERMISSIONS.IPD_VIEW_CONSENT,
    PERMISSIONS.IPD_VIEW_BILLING,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
};

/**
 * Get permissions for a given role
 * @param {string} role - Role name (e.g., 'DOCTOR', 'ADMIN')
 * @returns {string[]} Array of permission strings
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  const perms = ROLE_PERMISSIONS[role];
  return Array.isArray(perms) ? perms : [];
}

/**
 * Check if a role has a specific permission
 * @param {string} role - Role name
 * @param {string} permission - Permission name
 * @returns {boolean} True if role has permission
 */
export function roleHasPermission(role, permission) {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Check if user has required permission(s)
 * @param {string[]} userPermissions - Array of permission strings from user token
 * @param {string|string[]} requiredPermissions - Single permission or array
 * @param {boolean} requireAll - If true, user must have ALL permissions; if false, user must have ANY (default: false)
 * @returns {boolean} True if user has required permission(s)
 */
export function hasPermission(userPermissions, requiredPermissions, requireAll = false) {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  if (required.length === 0) return true;
  
  const userSet = new Set(userPermissions);
  
  if (requireAll) {
    return required.every(perm => userSet.has(perm));
  } else {
    return required.some(perm => userSet.has(perm));
  }
}

/**
 * DEPRECATED: For backward compatibility only
 * Use hasPermission() or roleHasPermission() instead
 * @deprecated Use hasPermission() instead
 */
export function hasPermissions(userPermissions, requiredPermissions, requireAll = true) {
  return hasPermission(userPermissions, requiredPermissions, requireAll);
}

// ==================== EMPLOYEE & ROLE DEFINITIONS ====================
// Valid employee roles - employees MUST have one of these specific roles
export const EMPLOYEE_ROLES = [
  // Billing
  "BILLING_ENTRY",
  "BILLING_EXIT",
  
  // Diagnosis
  "XRAY",
  "MRI",
  "CT_SCAN",
  "PATHOLOGY",
  
  // Nursing
  "NURSE",
  
  // Other Roles
  "RECEPTION",
  "PHARMACY",
  "WARD_ASSISTANT",
  "LAB_TECHNICIAN",
  "SECURITY",
  "HOUSEKEEPING",
  "ULTRASOUND",
  "ECG",
  "ENDOSCOPY"
];

// Doctor Specialization Constants
export const DOCTOR_SPECIALIZATIONS = [
  "GENERAL_PHYSICIAN",
  "CARDIOLOGIST",
  "NEUROLOGIST",
  "ORTHOPEDIC",
  "GYNECOLOGIST",
  "PEDIATRICIAN",
  "RADIOLOGIST",
  "PATHOLOGIST",
  "ANESTHESIOLOGIST",
  "DERMATOLOGIST",
  "ENT",
  "OPHTHALMOLOGIST",
  "SURGEON",
  "PSYCHIATRIST"
];

// Display name mappings
export const ROLE_DISPLAY_NAMES = {
  BILLING_ENTRY: "Billing Entry",
  BILLING_EXIT: "Billing Exit",
  XRAY: "X-Ray",
  MRI: "MRI",
  CT_SCAN: "CT Scan",
  PATHOLOGY: "Pathology",
  NURSE: "Nurse",
  RECEPTION: "Reception",
  PHARMACY: "Pharmacy",
  WARD_ASSISTANT: "Ward Assistant",
  LAB_TECHNICIAN: "Lab Technician",
  SECURITY: "Security",
  HOUSEKEEPING: "Housekeeping"
};

export const SPECIALIZATION_DISPLAY_NAMES = {
  GENERAL_PHYSICIAN: "General Physician",
  CARDIOLOGIST: "Cardiologist",
  NEUROLOGIST: "Neurologist",
  ORTHOPEDIC: "Orthopedic",
  GYNECOLOGIST: "Gynecologist",
  PEDIATRICIAN: "Pediatrician",
  RADIOLOGIST: "Radiologist",
  PATHOLOGIST: "Pathologist",
  ANESTHESIOLOGIST: "Anesthesiologist",
  DERMATOLOGIST: "Dermatologist",
  ENT: "ENT",
  OPHTHALMOLOGIST: "Ophthalmologist",
  SURGEON: "Surgeon",
  PSYCHIATRIST: "Psychiatrist"
};

// ==================== DIAGNOSTIC ROLES ====================
export const DIAGNOSTIC_ROLES = [
  "XRAY",
  "MRI", 
  "CT_SCAN",
  "PATHOLOGY",
  "LAB_TECHNICIAN",
  "ULTRASOUND",
  "ECG",
  "ENDOSCOPY"
];

// Mapping diagnostic roles to their allowed test categories
export const DIAGNOSTIC_ROLE_PERMISSIONS = {
  XRAY: ['IMAGING'],
  MRI: ['IMAGING'],
  CT_SCAN: ['IMAGING'],
  ULTRASOUND: ['IMAGING'],
  PATHOLOGY: ['PATHOLOGY', 'BLOOD_TEST', 'URINE', 'STOOL'],
  LAB_TECHNICIAN: ['BLOOD_TEST', 'URINE', 'STOOL', 'HORMONES', 'SEROLOGY', 'MICROBIOLOGY'],
  ECG: ['CARDIAC'],
  ENDOSCOPY: ['ENDOSCOPY']
};

// ==================== HOSPITAL DEPARTMENTS ====================
export const HOSPITAL_DEPARTMENTS = [
  {
    code: 'DIAGNOSTICS',
    name: 'Diagnostics',
    description: 'Laboratory & imaging diagnostic services',
    icon: 'microscope',
    subDepartments: ['LAB', 'RADIOLOGY', 'CARDIOLOGY', 'PATHOLOGY'],
    requiresSpecialLogin: true
  },
  {
    code: 'OPD',
    name: 'Out Patient Department (OPD)',
    description: 'Out-patient consultation and treatment',
    icon: 'stethoscope',
    subDepartments: [],
    requiresSpecialLogin: false
  },
  {
    code: 'IPD',
    name: 'In Patient Department (IPD)',
    description: 'In-patient care and ward management',
    icon: 'bed',
    subDepartments: ['ICU', 'GENERAL_WARD', 'PRIVATE_WARD'],
    requiresSpecialLogin: false
  },
  {
    code: 'BILLING',
    name: 'Billing',
    description: 'Patient billing and payment processing',
    icon: 'receipt',
    subDepartments: ['BILLING_ENTRY', 'BILLING_EXIT'],
    requiresSpecialLogin: true
  },
  {
    code: 'PHARMACY',
    name: 'Pharmacy',
    description: 'Medication dispensing and inventory',
    icon: 'pill',
    subDepartments: [],
    requiresSpecialLogin: true
  },
  {
    code: 'RECEPTION',
    name: 'Reception',
    description: 'Patient registration and inquiries',
    icon: 'desk',
    subDepartments: [],
    requiresSpecialLogin: false
  },
  {
    code: 'EMERGENCY',
    name: 'Emergency',
    description: 'Emergency care services',
    icon: 'alert-triangle',
    subDepartments: [],
    requiresSpecialLogin: false
  }
];

// ==================== DIAGNOSTIC TEST CATEGORIES ====================
export const DIAGNOSTIC_CATEGORIES = {
  // Laboratory Tests
  COMMON_LABORATORY: {
    name: 'Common Laboratory Tests',
    description: 'Blood, Urine, and Stool examinations',
    department: 'LAB',
    icon: 'test-tube',
    allowedRoles: ['LAB_TECHNICIAN', 'PATHOLOGY'],
    tests: [
      { code: 'CBC', name: 'Complete Blood Count (CBC)', category: 'BLOOD_TEST' },
      { code: 'FBS', name: 'Blood Glucose/Sugar', category: 'BLOOD_TEST' },
      { code: 'LIPID', name: 'Lipid Panel', category: 'BLOOD_TEST' },
      { code: 'TFT', name: 'Thyroid Panel (T3, T4, TSH)', category: 'HORMONES' },
      { code: 'LFT', name: 'Liver Function Tests (LFTs)', category: 'BLOOD_TEST' },
      { code: 'KFT', name: 'Kidney Function Tests (KFTs)', category: 'BLOOD_TEST' },
      { code: 'URINALYSIS', name: 'Urinalysis', category: 'URINE' },
      { code: 'CRP', name: 'C-Reactive Protein (CRP)', category: 'BLOOD_TEST' },
      { code: 'HBA1C', name: 'HbA1c (Glycated Hemoglobin)', category: 'BLOOD_TEST' },
      { code: 'ESR', name: 'Erythrocyte Sedimentation Rate', category: 'BLOOD_TEST' },
      { code: 'STOOL', name: 'Stool Examination', category: 'STOOL' },
      { code: 'URIC_ACID', name: 'Uric Acid', category: 'BLOOD_TEST' }
    ]
  },
  
  // Imaging & Scans
  IMAGING_SCANS: {
    name: 'Imaging & Scans',
    description: 'Radiological and imaging examinations',
    department: 'RADIOLOGY',
    icon: 'image',
    allowedRoles: ['XRAY', 'MRI', 'CT_SCAN', 'ULTRASOUND'],
    tests: [
      { code: 'XRAY', name: 'X-Ray', category: 'IMAGING', roleRequired: 'XRAY' },
      { code: 'CT', name: 'CT Scan', category: 'IMAGING', roleRequired: 'CT_SCAN' },
      { code: 'MRI', name: 'MRI', category: 'IMAGING', roleRequired: 'MRI' },
      { code: 'USG', name: 'Ultrasound', category: 'IMAGING', roleRequired: 'ULTRASOUND' },
      { code: 'PET', name: 'PET Scan', category: 'IMAGING' },
      { code: 'MAMMOGRAPHY', name: 'Mammography', category: 'IMAGING' },
      { code: 'DEXA', name: 'DEXA (Bone Density)', category: 'IMAGING' },
      { code: 'FLUOROSCOPY', name: 'Fluoroscopy', category: 'IMAGING' }
    ]
  },
  
  // Cardiac Tests
  CARDIAC_TESTS: {
    name: 'Heart & Cardiac Tests',
    description: 'Cardiovascular examinations',
    department: 'CARDIOLOGY',
    icon: 'heart',
    allowedRoles: ['ECG', 'LAB_TECHNICIAN'],
    tests: [
      { code: 'ECG', name: 'ECG/EKG (Electrocardiogram)', category: 'CARDIAC', roleRequired: 'ECG' },
      { code: 'ECHO', name: 'Echocardiogram (2D Echo)', category: 'CARDIAC' },
      { code: 'TMT', name: 'Treadmill Test (TMT/Stress Test)', category: 'CARDIAC' },
      { code: 'HOLTER', name: 'Holter Monitoring (24hr)', category: 'CARDIAC' },
      { code: 'ABPM', name: 'Ambulatory BP Monitoring', category: 'CARDIAC' },
      { code: 'TROPONIN', name: 'Cardiac Troponin', category: 'BLOOD_TEST' },
      { code: 'BNP', name: 'BNP/NT-proBNP', category: 'BLOOD_TEST' }
    ]
  },
  
  // Endoscopic & Procedural
  ENDOSCOPIC_PROCEDURAL: {
    name: 'Endoscopic & Procedural Tests',
    description: 'Minimally invasive diagnostic procedures',
    department: 'ENDOSCOPY',
    icon: 'camera',
    allowedRoles: ['ENDOSCOPY', 'PATHOLOGY'],
    tests: [
      { code: 'COLONOSCOPY', name: 'Colonoscopy', category: 'ENDOSCOPY' },
      { code: 'GASTROSCOPY', name: 'Gastroscopy (Upper GI Endoscopy)', category: 'ENDOSCOPY' },
      { code: 'BRONCHOSCOPY', name: 'Bronchoscopy', category: 'ENDOSCOPY' },
      { code: 'CYSTOSCOPY', name: 'Cystoscopy', category: 'ENDOSCOPY' },
      { code: 'ERCP', name: 'ERCP', category: 'ENDOSCOPY' },
      { code: 'LAPAROSCOPY', name: 'Laparoscopy (Diagnostic)', category: 'ENDOSCOPY' }
    ]
  },
  
  // Pathology & Biopsy
  PATHOLOGY_BIOPSY: {
    name: 'Pathology & Biopsy',
    description: 'Tissue examination and histopathology',
    department: 'PATHOLOGY',
    icon: 'clipboard',
    allowedRoles: ['PATHOLOGY'],
    tests: [
      { code: 'BIOPSY', name: 'Biopsy (Tissue)', category: 'PATHOLOGY' },
      { code: 'FNAC', name: 'FNAC (Fine Needle Aspiration)', category: 'PATHOLOGY' },
      { code: 'PAP_SMEAR', name: 'Pap Smear', category: 'PATHOLOGY' },
      { code: 'BONE_MARROW', name: 'Bone Marrow Aspiration/Biopsy', category: 'PATHOLOGY' },
      { code: 'HISTOPATH', name: 'Histopathology', category: 'PATHOLOGY' },
      { code: 'CYTOLOGY', name: 'Cytology', category: 'PATHOLOGY' },
      { code: 'IHC', name: 'Immunohistochemistry', category: 'PATHOLOGY' }
    ]
  },
  
  // Neurology Tests
  NEUROLOGY_TESTS: {
    name: 'Neurology & Brain Tests',
    description: 'Neurological examinations',
    department: 'NEUROLOGY',
    icon: 'brain',
    allowedRoles: ['LAB_TECHNICIAN'],
    tests: [
      { code: 'EEG', name: 'EEG (Electroencephalogram)', category: 'NEUROLOGY' },
      { code: 'EMG', name: 'EMG/NCV (Nerve Conduction)', category: 'NEUROLOGY' },
      { code: 'VEP', name: 'Visual Evoked Potential', category: 'NEUROLOGY' },
      { code: 'BAEP', name: 'Brainstem Auditory Evoked Potential', category: 'NEUROLOGY' }
    ]
  },
  
  // Microbiology & Serology
  MICROBIOLOGY_SEROLOGY: {
    name: 'Microbiology & Serology',
    description: 'Infectious disease and antibody testing',
    department: 'LAB',
    icon: 'bug',
    allowedRoles: ['LAB_TECHNICIAN', 'PATHOLOGY'],
    tests: [
      { code: 'CULTURE', name: 'Culture & Sensitivity', category: 'MICROBIOLOGY' },
      { code: 'WIDAL', name: 'Widal Test', category: 'SEROLOGY' },
      { code: 'HIV', name: 'HIV Antibody Test', category: 'SEROLOGY' },
      { code: 'HBSAG', name: 'HBsAg (Hepatitis B)', category: 'SEROLOGY' },
      { code: 'HCV', name: 'HCV Antibody (Hepatitis C)', category: 'SEROLOGY' },
      { code: 'DENGUE', name: 'Dengue NS1/IgM/IgG', category: 'SEROLOGY' },
      { code: 'MALARIA', name: 'Malaria (Rapid/Smear)', category: 'SEROLOGY' },
      { code: 'TYPHOID', name: 'Typhidot/Typhi IgM', category: 'SEROLOGY' },
      { code: 'COVID', name: 'COVID-19 RT-PCR/Antigen', category: 'SEROLOGY' },
      { code: 'VDRL', name: 'VDRL/RPR (Syphilis)', category: 'SEROLOGY' }
    ]
  },
  
  // Special Tests
  SPECIAL_TESTS: {
    name: 'Specialized & Genetic Tests',
    description: 'Advanced diagnostic testing',
    department: 'LAB',
    icon: 'dna',
    allowedRoles: ['LAB_TECHNICIAN', 'PATHOLOGY'],
    tests: [
      { code: 'KARYOTYPE', name: 'Karyotyping', category: 'GENETIC' },
      { code: 'PRENATAL', name: 'Prenatal Screening (Triple/Quad)', category: 'GENETIC' },
      { code: 'TUMOR_MARKER', name: 'Tumor Markers (CA125, CEA, AFP, PSA)', category: 'BLOOD_TEST' },
      { code: 'ALLERGY', name: 'Allergy Testing (IgE Panel)', category: 'SEROLOGY' },
      { code: 'AUTOIMMUNE', name: 'Autoimmune Panel (ANA, RF, Anti-CCP)', category: 'SEROLOGY' },
      { code: 'VITAMIN', name: 'Vitamin Panel (D, B12, Folate)', category: 'BLOOD_TEST' },
      { code: 'HORMONE_PANEL', name: 'Hormone Panel (FSH, LH, Prolactin)', category: 'HORMONES' }
    ]
  }
};

// ==================== RESULT ENTRY WORKFLOW STATUS ====================
export const RESULT_ENTRY_STATUS = {
  PENDING_SAMPLE: 'PENDING_SAMPLE',        // Sample not yet collected
  SAMPLE_COLLECTED: 'SAMPLE_COLLECTED',    // Sample collected, awaiting processing
  IN_PROGRESS: 'IN_PROGRESS',              // Result entry in progress
  PENDING_QC: 'PENDING_QC',                // Awaiting quality check
  QC_APPROVED: 'QC_APPROVED',              // QC passed, ready for review
  PENDING_REVIEW: 'PENDING_REVIEW',        // Awaiting pathologist/radiologist review
  REVIEWED: 'REVIEWED',                    // Reviewed by specialist
  APPROVED: 'APPROVED',                    // Approved for release
  RELEASED: 'RELEASED',                    // Released to patient
  AMENDED: 'AMENDED',                      // Report amended after release
  REJECTED: 'REJECTED',                    // Rejected, needs re-test
  CANCELLED: 'CANCELLED'                   // Order cancelled
};

// ==================== DEPARTMENT ROLE MAPPING ====================
export const DEPARTMENT_ROLE_MAPPING = {
  DIAGNOSTICS: [...DIAGNOSTIC_ROLES],
  BILLING: ['BILLING_ENTRY', 'BILLING_EXIT'],
  PHARMACY: ['PHARMACY'],
  RECEPTION: ['RECEPTION'],
  IPD: ['NURSE', 'WARD_ASSISTANT'],
  OPD: ['NURSE'],
  SECURITY: ['SECURITY'],
  HOUSEKEEPING: ['HOUSEKEEPING']
};

// ==================== USER ROLES ENUM ====================
export const UserRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  EMPLOYEE: 'EMPLOYEE',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  BILLING_OFFICER: 'BILLING_OFFICER',
  ACCOUNTS_MANAGER: 'ACCOUNTS_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  PATIENT: 'PATIENT',
};

/**
 * User Status Enum
 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
  PENDING_ACTIVATION: 'PENDING_ACTIVATION',
};

/**
 * Roles with billing access
 */
export const BILLING_ROLES = [
  UserRoles.BILLING_OFFICER,
  UserRoles.ACCOUNTS_MANAGER,
  UserRoles.FINANCE_MANAGER,
  UserRoles.ADMIN,
];

/**
 * Admin roles
 */
export const ADMIN_ROLES = [
  UserRoles.ADMIN,
  UserRoles.SUPER_ADMIN,
];

/**
 * Clinical staff roles
 */
export const CLINICAL_ROLES = [
  UserRoles.DOCTOR,
  UserRoles.NURSE,
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if role has diagnostic access
 */
export const isDiagnosticRole = (role) => DIAGNOSTIC_ROLES.includes(role);

/**
 * Get allowed categories for a role
 */
export const getAllowedCategoriesForRole = (role) => {
  return DIAGNOSTIC_ROLE_PERMISSIONS[role] || [];
};

/**
 * Get department for a role
 */
export const getDepartmentForRole = (role) => {
  for (const [dept, roles] of Object.entries(DEPARTMENT_ROLE_MAPPING)) {
    if (roles.includes(role)) return dept;
  }
  return null;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (userRole, targetRole) => {
  if (userRole === UserRoles.SUPER_ADMIN) return true;
  return userRole === targetRole;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (userRole, roles = []) => {
  if (userRole === UserRoles.SUPER_ADMIN) return true;
  return roles.includes(userRole);
};

export const isBillingRole = (role) => BILLING_ROLES.includes(role);
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const isClinicalRole = (role) => CLINICAL_ROLES.includes(role);

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  roleHasPermission,
  hasPermission,
  hasPermissions,
  // Role definitions
  EMPLOYEE_ROLES,
  DOCTOR_SPECIALIZATIONS,
  ROLE_DISPLAY_NAMES,
  SPECIALIZATION_DISPLAY_NAMES,
  DIAGNOSTIC_ROLES,
  DIAGNOSTIC_ROLE_PERMISSIONS,
  HOSPITAL_DEPARTMENTS,
  DIAGNOSTIC_CATEGORIES,
  RESULT_ENTRY_STATUS,
  DEPARTMENT_ROLE_MAPPING,
  UserRoles,
  UserStatus,
  BILLING_ROLES,
  ADMIN_ROLES,
  CLINICAL_ROLES,
  // Helper functions
  isDiagnosticRole,
  getAllowedCategoriesForRole,
  getDepartmentForRole,
  hasRole,
  hasAnyRole,
  isBillingRole,
  isAdminRole,
  isClinicalRole,
};

















