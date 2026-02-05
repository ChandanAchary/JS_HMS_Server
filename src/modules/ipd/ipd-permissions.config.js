/**
 * IPD Module Permissions Configuration
 * Define all IPD-related permissions and role mappings
 */

export const IPD_PERMISSIONS = {
  // Patient Admission
  IPD_ADMIT_PATIENT: {
    description: 'Admit patient to IPD ward',
    category: 'ADMISSION',
    riskLevel: 'MEDIUM',
  },
  IPD_VIEW_ADMISSION: {
    description: 'View admission details',
    category: 'ADMISSION',
    riskLevel: 'LOW',
  },
  IPD_UPDATE_ADMISSION: {
    description: 'Update admission information',
    category: 'ADMISSION',
    riskLevel: 'MEDIUM',
  },

  // Vital Signs Monitoring
  IPD_RECORD_VITALS: {
    description: 'Record patient vital signs',
    category: 'MONITORING',
    riskLevel: 'LOW',
  },
  IPD_VIEW_VITALS: {
    description: 'View patient vital signs',
    category: 'MONITORING',
    riskLevel: 'LOW',
  },
  IPD_MANAGE_MONITORING: {
    description: 'Manage continuous monitoring',
    category: 'MONITORING',
    riskLevel: 'MEDIUM',
  },

  // Clinical Orders
  IPD_CREATE_ORDER: {
    description: 'Create clinical orders (labs, medications, procedures)',
    category: 'ORDERS',
    riskLevel: 'MEDIUM',
  },
  IPD_VIEW_ORDER: {
    description: 'View clinical orders',
    category: 'ORDERS',
    riskLevel: 'LOW',
  },
  IPD_UPDATE_ORDER: {
    description: 'Update order status',
    category: 'ORDERS',
    riskLevel: 'MEDIUM',
  },
  IPD_ADMINISTER_MEDICATION: {
    description: 'Record medication administration',
    category: 'MEDICATIONS',
    riskLevel: 'HIGH',
  },

  // Clinical Notes
  IPD_CREATE_CLINICAL_NOTE: {
    description: 'Create clinical notes (progress notes, assessments)',
    category: 'DOCUMENTATION',
    riskLevel: 'MEDIUM',
  },
  IPD_VIEW_CLINICAL_NOTE: {
    description: 'View clinical notes',
    category: 'DOCUMENTATION',
    riskLevel: 'LOW',
  },
  IPD_EDIT_CLINICAL_NOTE: {
    description: 'Edit own clinical notes',
    category: 'DOCUMENTATION',
    riskLevel: 'MEDIUM',
  },
  IPD_CREATE_ASSESSMENT: {
    description: 'Create clinical assessments',
    category: 'DOCUMENTATION',
    riskLevel: 'MEDIUM',
  },
  IPD_CREATE_DISCHARGE_SUMMARY: {
    description: 'Create discharge summary',
    category: 'DOCUMENTATION',
    riskLevel: 'HIGH',
  },

  // Clinical Alerts & Warnings
  IPD_CREATE_ALERT: {
    description: 'Create clinical alerts',
    category: 'ALERTS',
    riskLevel: 'MEDIUM',
  },
  IPD_VIEW_ALERT: {
    description: 'View clinical alerts',
    category: 'ALERTS',
    riskLevel: 'LOW',
  },
  IPD_ACKNOWLEDGE_ALERT: {
    description: 'Acknowledge/resolve alerts',
    category: 'ALERTS',
    riskLevel: 'MEDIUM',
  },

  // Consent Management
  IPD_CREATE_CONSENT: {
    description: 'Create consent forms',
    category: 'CONSENT',
    riskLevel: 'HIGH',
  },
  IPD_VIEW_CONSENT: {
    description: 'View consent forms',
    category: 'CONSENT',
    riskLevel: 'MEDIUM',
  },
  IPD_SIGN_CONSENT: {
    description: 'Witness/sign consent forms',
    category: 'CONSENT',
    riskLevel: 'HIGH',
  },

  // Patient Movement & Discharge
  IPD_MANAGE_PATIENT_MOVEMENT: {
    description: 'Transfer patient within hospital',
    category: 'MOVEMENT',
    riskLevel: 'MEDIUM',
  },
  IPD_VIEW_PATIENT_LOCATION: {
    description: 'View patient location',
    category: 'MOVEMENT',
    riskLevel: 'LOW',
  },
  IPD_DISCHARGE_PATIENT: {
    description: 'Discharge patient from IPD',
    category: 'DISCHARGE',
    riskLevel: 'HIGH',
  },

  // Bed Management
  IPD_VIEW_BED_STATUS: {
    description: 'View bed occupancy status',
    category: 'BED_MANAGEMENT',
    riskLevel: 'LOW',
  },
  IPD_MANAGE_BED: {
    description: 'Manage bed allocation and maintenance',
    category: 'BED_MANAGEMENT',
    riskLevel: 'MEDIUM',
  },

  // Reporting & Analytics
  IPD_VIEW_CENSUS: {
    description: 'View ward/hospital census reports',
    category: 'REPORTING',
    riskLevel: 'LOW',
  },
  IPD_VIEW_DASHBOARD: {
    description: 'View IPD dashboards',
    category: 'REPORTING',
    riskLevel: 'LOW',
  },
  IPD_EXPORT_RECORDS: {
    description: 'Export patient records',
    category: 'REPORTING',
    riskLevel: 'HIGH',
  },
};

/**
 * IPD Role Permission Mapping
 * Define which roles have access to which IPD permissions
 */
export const IPD_ROLE_PERMISSIONS = {
  // Doctor role - Full clinical access
  DOCTOR: [
    // Admissions
    'IPD_ADMIT_PATIENT',
    'IPD_VIEW_ADMISSION',
    'IPD_UPDATE_ADMISSION',

    // Vitals
    'IPD_VIEW_VITALS',
    'IPD_MANAGE_MONITORING',

    // Orders
    'IPD_CREATE_ORDER',
    'IPD_VIEW_ORDER',
    'IPD_UPDATE_ORDER',

    // Clinical Notes
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',
    'IPD_EDIT_CLINICAL_NOTE',
    'IPD_CREATE_ASSESSMENT',
    'IPD_CREATE_DISCHARGE_SUMMARY',

    // Alerts
    'IPD_CREATE_ALERT',
    'IPD_VIEW_ALERT',
    'IPD_ACKNOWLEDGE_ALERT',

    // Consent
    'IPD_CREATE_CONSENT',
    'IPD_VIEW_CONSENT',
    'IPD_SIGN_CONSENT',

    // Movement
    'IPD_MANAGE_PATIENT_MOVEMENT',
    'IPD_VIEW_PATIENT_LOCATION',
    'IPD_DISCHARGE_PATIENT',

    // Reporting
    'IPD_VIEW_CENSUS',
    'IPD_VIEW_DASHBOARD',
  ],

  // Nurse role - Vital signs and clinical documentation
  NURSE: [
    // Admissions
    'IPD_VIEW_ADMISSION',

    // Vitals
    'IPD_RECORD_VITALS',
    'IPD_VIEW_VITALS',

    // Orders
    'IPD_VIEW_ORDER',
    'IPD_ADMINISTER_MEDICATION',

    // Clinical Notes
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',
    'IPD_EDIT_CLINICAL_NOTE',
    'IPD_CREATE_ASSESSMENT',

    // Alerts
    'IPD_VIEW_ALERT',
    'IPD_ACKNOWLEDGE_ALERT',

    // Consent
    'IPD_VIEW_CONSENT',
    'IPD_SIGN_CONSENT',

    // Movement
    'IPD_VIEW_PATIENT_LOCATION',

    // Reporting
    'IPD_VIEW_DASHBOARD',
  ],

  // Pharmacist role - Medication management
  PHARMACIST: [
    // Orders
    'IPD_VIEW_ORDER',
    'IPD_UPDATE_ORDER',

    // Clinical Notes
    'IPD_VIEW_CLINICAL_NOTE',

    // Alerts
    'IPD_VIEW_ALERT',

    // Reporting
    'IPD_VIEW_DASHBOARD',
  ],

  // Lab Technician role - Order fulfillment
  LAB_TECHNICIAN: [
    // Orders
    'IPD_VIEW_ORDER',
    'IPD_UPDATE_ORDER',

    // Reporting
    'IPD_VIEW_DASHBOARD',
  ],

  // Radiologist role - Imaging orders
  RADIOLOGIST: [
    // Orders
    'IPD_VIEW_ORDER',
    'IPD_UPDATE_ORDER',

    // Clinical Notes
    'IPD_VIEW_CLINICAL_NOTE',

    // Reporting
    'IPD_VIEW_DASHBOARD',
  ],

  // Physiotherapist role - Assessment and care plans
  PHYSIOTHERAPIST: [
    // Vitals
    'IPD_VIEW_VITALS',

    // Clinical Notes
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',
    'IPD_CREATE_ASSESSMENT',

    // Alerts
    'IPD_VIEW_ALERT',

    // Reporting
    'IPD_VIEW_DASHBOARD',
  ],

  // Dietician role - Nutrition planning
  DIETICIAN: [
    // Orders
    'IPD_VIEW_ORDER',

    // Clinical Notes
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',
    'IPD_CREATE_ASSESSMENT',

    // Alerts
    'IPD_VIEW_ALERT',

    // Reporting
    'IPD_VIEW_DASHBOARD',
  ],

  // Bed Manager role - Bed allocation
  BED_MANAGER: [
    // Admissions
    'IPD_VIEW_ADMISSION',

    // Vitals
    'IPD_VIEW_VITALS',

    // Bed Management
    'IPD_VIEW_BED_STATUS',
    'IPD_MANAGE_BED',

    // Movement
    'IPD_VIEW_PATIENT_LOCATION',

    // Reporting
    'IPD_VIEW_CENSUS',
    'IPD_VIEW_DASHBOARD',
  ],

  // Ward In-Charge role - Ward supervision
  WARD_IN_CHARGE: [
    // Admissions
    'IPD_ADMIT_PATIENT',
    'IPD_VIEW_ADMISSION',
    'IPD_UPDATE_ADMISSION',

    // Vitals
    'IPD_RECORD_VITALS',
    'IPD_VIEW_VITALS',

    // Orders
    'IPD_CREATE_ORDER',
    'IPD_VIEW_ORDER',

    // Clinical Notes
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',

    // Alerts
    'IPD_VIEW_ALERT',
    'IPD_ACKNOWLEDGE_ALERT',

    // Consent
    'IPD_VIEW_CONSENT',

    // Movement
    'IPD_VIEW_PATIENT_LOCATION',
    'IPD_MANAGE_PATIENT_MOVEMENT',

    // Bed Management
    'IPD_VIEW_BED_STATUS',
    'IPD_MANAGE_BED',

    // Reporting
    'IPD_VIEW_CENSUS',
    'IPD_VIEW_DASHBOARD',
  ],

  // Senior Doctor role - Clinical oversight
  SENIOR_DOCTOR: [
    // All permissions except sensitive export
    'IPD_ADMIT_PATIENT',
    'IPD_VIEW_ADMISSION',
    'IPD_UPDATE_ADMISSION',
    'IPD_RECORD_VITALS',
    'IPD_VIEW_VITALS',
    'IPD_MANAGE_MONITORING',
    'IPD_CREATE_ORDER',
    'IPD_VIEW_ORDER',
    'IPD_UPDATE_ORDER',
    'IPD_ADMINISTER_MEDICATION',
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',
    'IPD_EDIT_CLINICAL_NOTE',
    'IPD_CREATE_ASSESSMENT',
    'IPD_CREATE_DISCHARGE_SUMMARY',
    'IPD_CREATE_ALERT',
    'IPD_VIEW_ALERT',
    'IPD_ACKNOWLEDGE_ALERT',
    'IPD_CREATE_CONSENT',
    'IPD_VIEW_CONSENT',
    'IPD_SIGN_CONSENT',
    'IPD_MANAGE_PATIENT_MOVEMENT',
    'IPD_VIEW_PATIENT_LOCATION',
    'IPD_DISCHARGE_PATIENT',
    'IPD_VIEW_BED_STATUS',
    'IPD_MANAGE_BED',
    'IPD_VIEW_CENSUS',
    'IPD_VIEW_DASHBOARD',
  ],

  // Patient (self) - Limited view of own records
  PATIENT: [
    'IPD_VIEW_ADMISSION', // Own admission only
    'IPD_VIEW_VITALS', // Own vitals only
    'IPD_VIEW_CLINICAL_NOTE', // Own notes only
    'IPD_VIEW_CONSENT', // Own consents only
    'IPD_VIEW_PATIENT_LOCATION', // Own location only
  ],

  // Admin - Full access
  ADMIN: [
    'IPD_ADMIT_PATIENT',
    'IPD_VIEW_ADMISSION',
    'IPD_UPDATE_ADMISSION',
    'IPD_RECORD_VITALS',
    'IPD_VIEW_VITALS',
    'IPD_MANAGE_MONITORING',
    'IPD_CREATE_ORDER',
    'IPD_VIEW_ORDER',
    'IPD_UPDATE_ORDER',
    'IPD_ADMINISTER_MEDICATION',
    'IPD_CREATE_CLINICAL_NOTE',
    'IPD_VIEW_CLINICAL_NOTE',
    'IPD_EDIT_CLINICAL_NOTE',
    'IPD_CREATE_ASSESSMENT',
    'IPD_CREATE_DISCHARGE_SUMMARY',
    'IPD_CREATE_ALERT',
    'IPD_VIEW_ALERT',
    'IPD_ACKNOWLEDGE_ALERT',
    'IPD_CREATE_CONSENT',
    'IPD_VIEW_CONSENT',
    'IPD_SIGN_CONSENT',
    'IPD_MANAGE_PATIENT_MOVEMENT',
    'IPD_VIEW_PATIENT_LOCATION',
    'IPD_DISCHARGE_PATIENT',
    'IPD_VIEW_BED_STATUS',
    'IPD_MANAGE_BED',
    'IPD_VIEW_CENSUS',
    'IPD_VIEW_DASHBOARD',
    'IPD_EXPORT_RECORDS',
  ],
};

/**
 * IPD Data Access Policies
 * Determine what data each role can access
 */
export const IPD_DATA_ACCESS_POLICIES = {
  // Doctors can see only their assigned patients and ward patients
  DOCTOR: {
    admissions: 'assigned_and_ward',
    vitals: 'assigned_and_ward',
    notes: 'assigned_and_ward',
    orders: 'assigned_and_ward',
    alerts: 'assigned_and_ward',
  },

  // Nurses can see all ward patients
  NURSE: {
    admissions: 'ward',
    vitals: 'ward',
    notes: 'ward',
    orders: 'ward',
    alerts: 'ward',
  },

  // Pharmacist sees only medication orders in their assigned wards
  PHARMACIST: {
    orders: 'ward_medications',
    admissions: 'ward',
  },

  // Lab Technician sees only lab orders
  LAB_TECHNICIAN: {
    orders: 'hospital_lab',
  },

  // Radiologist sees only imaging orders
  RADIOLOGIST: {
    orders: 'hospital_imaging',
  },

  // Physiotherapist sees only their assigned patients
  PHYSIOTHERAPIST: {
    admissions: 'assigned',
    vitals: 'assigned',
    notes: 'assigned',
  },

  // Bed Manager sees all bed information hospital-wide
  BED_MANAGER: {
    admissions: 'hospital',
    beds: 'hospital',
  },

  // Ward In-Charge sees all in their ward
  WARD_IN_CHARGE: {
    admissions: 'ward',
    vitals: 'ward',
    notes: 'ward',
    orders: 'ward',
    alerts: 'ward',
    beds: 'ward',
  },

  // Senior Doctor sees all hospital patients
  SENIOR_DOCTOR: {
    admissions: 'hospital',
    vitals: 'hospital',
    notes: 'hospital',
    orders: 'hospital',
    alerts: 'hospital',
  },

  // Patient sees only own records
  PATIENT: {
    admissions: 'self',
    vitals: 'self',
    notes: 'self',
    consents: 'self',
  },

  // Admin sees everything
  ADMIN: {
    admissions: 'hospital',
    vitals: 'hospital',
    notes: 'hospital',
    orders: 'hospital',
    alerts: 'hospital',
    beds: 'hospital',
    consents: 'hospital',
  },
};
