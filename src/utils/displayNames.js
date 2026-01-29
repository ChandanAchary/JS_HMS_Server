// Employee role constants
export const EMPLOYEE_ROLES = [
  "BILLING_ENTRY",
  "BILLING_EXIT",
  "XRAY",
  "MRI",
  "CT_SCAN",
  "PATHOLOGY",
  "NURSE_OPD",
  "NURSE_IPD",
  "RECEPTION",
  "PHARMACY",
  "WARD_ASSISTANT",
  "LAB_TECHNICIAN",
  "SECURITY",
  "HOUSEKEEPING"
];

// Display name mappings for roles and specializations
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

export const getRoleDisplayName = (role) => {
  return ROLE_DISPLAY_NAMES[role] || role;
};

export const getSpecializationDisplayName = (specialization) => {
  return SPECIALIZATION_DISPLAY_NAMES[specialization] || specialization;
};

// Employee qualification constants
export const EMPLOYEE_QUALIFICATIONS = [
  "RN",
  "CNA",
  "CRNA",
  "BSc Nursing",
  "MSc Nursing",
  "EMT",
  "BMLT",
  "DMLT",
  "CPT",
  "CMT",
  "BPT",
  "MPT",
  "PT",
  "BSc",
  "MSc",
  "MPH",
  "PharmD",
  "BAMS",
  "BHMS",
  "MS",
  "MCh"
];

export const QUALIFICATION_DISPLAY_NAMES = {
  RN: "RN – Registered Nurse",
  CNA: "CNA – Certified Nursing Assistant",
  CRNA: "CRNA – Certified Registered Nurse Anesthetist",
  "BSc Nursing": "BSc Nursing – Bachelor of Science in Nursing",
  "MSc Nursing": "MSc Nursing – Master of Science in Nursing",
  EMT: "EMT – Emergency Medical Technician",
  BMLT: "BMLT – Bachelor of Medical Laboratory Technology",
  DMLT: "DMLT – Diploma in Medical Laboratory Technology",
  CPT: "CPT – Certified Phlebotomy Technician",
  CMT: "CMT – Certified Medical Transcriptionist",
  BPT: "BPT – Bachelor of Physiotherapy",
  MPT: "MPT – Master of Physiotherapy",
  PT: "PT – Physiotherapist",
  BSc: "BSc – Bachelor of Science",
  MSc: "MSc – Master of Science",
  MPH: "MPH – Master of Public Health",
  PharmD: "PharmD – Doctor of Pharmacy",
  BAMS: "BAMS – Bachelor of Ayurvedic Medicine and Surgery",
  BHMS: "BHMS – Bachelor of Homeopathic Medicine and Surgery",
  MS: "MS – Master of Surgery",
  MCh: "MCh – Master of Surgery (Super-specialty)"
};

export const getQualificationDisplayName = (q) => {
  return QUALIFICATION_DISPLAY_NAMES[q] || q;
};