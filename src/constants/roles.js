/**
 * Valid employee roles - employees MUST have one of these specific roles
 * NOT the generic 'EMPLOYEE' role
 */
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
  "NURSE_OPD",
  "NURSE_IPD",
  
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
  NURSE_OPD: "Nurse (OPD)",
  NURSE_IPD: "Nurse (IPD)",
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
  IPD: ['NURSE_IPD', 'WARD_ASSISTANT'],
  OPD: ['NURSE_OPD'],
  SECURITY: ['SECURITY'],
  HOUSEKEEPING: ['HOUSEKEEPING']
};

// Helper function to check if role has diagnostic access
export const isDiagnosticRole = (role) => DIAGNOSTIC_ROLES.includes(role);

// Helper function to get allowed categories for a role
export const getAllowedCategoriesForRole = (role) => {
  return DIAGNOSTIC_ROLE_PERMISSIONS[role] || [];
};

// Helper function to get department for a role
export const getDepartmentForRole = (role) => {
  for (const [dept, roles] of Object.entries(DEPARTMENT_ROLE_MAPPING)) {
    if (roles.includes(role)) return dept;
  }
  return null;
};
