/**
 * Department Constants
 * Extended department configuration with icons, descriptions, and features
 */

import { 
  HOSPITAL_DEPARTMENTS, 
  DIAGNOSTIC_CATEGORIES,
  DEPARTMENT_ROLE_MAPPING 
} from '../rbac/rolePermissions.js';

// Re-export from roles.js
export { HOSPITAL_DEPARTMENTS, DIAGNOSTIC_CATEGORIES, DEPARTMENT_ROLE_MAPPING };

// Extended department configuration with features
export const DEPARTMENT_FEATURES = {
  DIAGNOSTICS: {
    code: 'DIAGNOSTICS',
    name: 'Diagnostics',
    fullName: 'Diagnostic Services',
    description: 'Laboratory tests, imaging, and diagnostic procedures',
    icon: 'microscope',
    color: '#3B82F6', // Blue
    features: [
      'Laboratory Tests (Blood, Urine, Stool)',
      'Imaging & Radiology (X-Ray, CT, MRI, USG)',
      'Cardiac Tests (ECG, Echo)',
      'Pathology & Biopsy',
      'Sample Collection & Processing',
      'Result Entry & Reporting'
    ],
    requiresLogin: true,
    loginEndpoint: '/api/departments/diagnostics/login',
    dashboardPath: '/diagnostics/dashboard',
    subDepartments: [
      { code: 'LAB', name: 'Laboratory', icon: 'test-tube' },
      { code: 'RADIOLOGY', name: 'Radiology', icon: 'image' },
      { code: 'CARDIOLOGY', name: 'Cardiology', icon: 'heart' },
      { code: 'PATHOLOGY', name: 'Pathology', icon: 'clipboard' },
      { code: 'ENDOSCOPY', name: 'Endoscopy', icon: 'camera' }
    ]
  },
  
  OPD: {
    code: 'OPD',
    name: 'OPD',
    fullName: 'Out Patient Department',
    description: 'Out-patient consultations, appointments, and treatments',
    icon: 'stethoscope',
    color: '#10B981', // Green
    features: [
      'Patient Registration',
      'Doctor Consultations',
      'Appointment Scheduling',
      'Prescription Management',
      'Referrals'
    ],
    requiresLogin: false,
    dashboardPath: '/opd/dashboard',
    subDepartments: []
  },
  
  IPD: {
    code: 'IPD',
    name: 'IPD',
    fullName: 'In Patient Department',
    description: 'In-patient care, ward management, and patient monitoring',
    icon: 'bed',
    color: '#8B5CF6', // Purple
    features: [
      'Patient Admission',
      'Ward Management',
      'Bed Allocation',
      'Patient Monitoring',
      'Nursing Care',
      'Discharge Processing'
    ],
    requiresLogin: false,
    dashboardPath: '/ipd/dashboard',
    subDepartments: [
      { code: 'ICU', name: 'ICU', icon: 'activity' },
      { code: 'GENERAL_WARD', name: 'General Ward', icon: 'bed' },
      { code: 'PRIVATE_WARD', name: 'Private Ward', icon: 'home' }
    ]
  },
  
  BILLING: {
    code: 'BILLING',
    name: 'Billing',
    fullName: 'Billing Department',
    description: 'Patient billing, payments, and financial records',
    icon: 'receipt',
    color: '#F59E0B', // Amber
    features: [
      'Bill Generation',
      'Payment Processing',
      'Insurance Claims',
      'Refunds',
      'Financial Reports'
    ],
    requiresLogin: true,
    loginEndpoint: '/api/billing/login',
    dashboardPath: '/billing/dashboard',
    subDepartments: [
      { code: 'BILLING_ENTRY', name: 'Billing Entry', icon: 'file-plus' },
      { code: 'BILLING_EXIT', name: 'Billing Exit', icon: 'file-minus' }
    ]
  },
  
  PHARMACY: {
    code: 'PHARMACY',
    name: 'Pharmacy',
    fullName: 'Pharmacy Department',
    description: 'Medication dispensing, inventory, and drug information',
    icon: 'pill',
    color: '#EF4444', // Red
    features: [
      'Prescription Dispensing',
      'Drug Inventory',
      'Drug Interaction Check',
      'Patient Counseling',
      'Stock Management'
    ],
    requiresLogin: true,
    loginEndpoint: '/api/departments/pharmacy/login',
    dashboardPath: '/pharmacy/dashboard',
    subDepartments: []
  },
  
  RECEPTION: {
    code: 'RECEPTION',
    name: 'Reception',
    fullName: 'Reception & Front Desk',
    description: 'Patient registration, inquiries, and visitor management',
    icon: 'desk',
    color: '#06B6D4', // Cyan
    features: [
      'Patient Registration',
      'Appointment Booking',
      'Visitor Management',
      'General Inquiries',
      'Token Generation'
    ],
    requiresLogin: false,
    dashboardPath: '/reception/dashboard',
    subDepartments: []
  },
  
  EMERGENCY: {
    code: 'EMERGENCY',
    name: 'Emergency',
    fullName: 'Emergency Department',
    description: 'Emergency care and trauma services',
    icon: 'alert-triangle',
    color: '#DC2626', // Red-600
    features: [
      'Triage',
      'Emergency Treatment',
      'Trauma Care',
      'Ambulance Services',
      'Emergency Admission'
    ],
    requiresLogin: false,
    dashboardPath: '/emergency/dashboard',
    subDepartments: []
  }
};

// Department display order for frontend listing
export const DEPARTMENT_DISPLAY_ORDER = [
  'DIAGNOSTICS',
  'OPD',
  'IPD',
  'BILLING',
  'PHARMACY',
  'RECEPTION',
  'EMERGENCY'
];

// Get all departments for listing
export const getAllDepartments = () => {
  return DEPARTMENT_DISPLAY_ORDER.map(code => DEPARTMENT_FEATURES[code]);
};

// Get department by code
export const getDepartmentByCode = (code) => {
  return DEPARTMENT_FEATURES[code] || null;
};

// Check if department requires special login
export const departmentRequiresLogin = (code) => {
  const dept = DEPARTMENT_FEATURES[code];
  return dept ? dept.requiresLogin : false;
};

// Get roles allowed for a department
export const getRolesForDepartment = (code) => {
  return DEPARTMENT_ROLE_MAPPING[code] || [];
};


















