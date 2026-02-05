// Doctor qualifications dropdown options
export const DOCTOR_QUALIFICATIONS = [
  "MBBS",
  "MD",
  "MS",
  "BDS",
  "MDS",
  "BAMS",
  "BHMS",
  "DM",
  "MCh",
  "DNB",
  "Diploma",
  "Fellowship"
];

// Doctor specializations dropdown options
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

// Employee qualifications dropdown options
export const EMPLOYEE_QUALIFICATIONS = [
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "BSc Nursing",
  "GNM",
  "MSc Nursing",
  "DMLT",
  "BMLT",
  "B.Pharm",
  "D.Pharm",
  "Paramedical Course",
  "Any Graduate"
];

// Employee roles dropdown options
export const EMPLOYEE_ROLES = [
  { label: "Billing", options: ["BILLING_ENTRY", "BILLING_EXIT"] },
  { label: "Diagnosis", options: ["XRAY", "MRI", "CT_SCAN", "PATHOLOGY"] },
  { label: "Nursing", options: ["NURSE"] },
  { label: "Other Roles", options: ["RECEPTION", "PHARMACY", "WARD_ASSISTANT", "LAB_TECHNICIAN", "SECURITY", "HOUSEKEEPING"] }
];

// Flatten employee roles for dropdown
export const EMPLOYEE_ROLES_FLAT = [
  "BILLING_ENTRY", "BILLING_EXIT",
  "XRAY", "MRI", "CT_SCAN", "PATHOLOGY",
  "NURSE",
  "RECEPTION", "PHARMACY", "WARD_ASSISTANT", "LAB_TECHNICIAN", "SECURITY", "HOUSEKEEPING"
];

// Default Doctor form fields
export const defaultDoctorFields = [
  {
    fieldName: "profilePhoto",
    fieldLabel: "Profile Photo",
    fieldType: "file",
    isEnabled: true,
    isRequired: true,
    placeholder: "Upload your professional photo",
    helpText: "Upload a clear passport-size photo (JPEG/JPG, max 5MB)",
    validation: {
      allowedTypes: ["image/jpeg"],
      maxSize: 5242880
    },
    order: 1
  },
  {
    fieldName: "fullName",
    fieldLabel: "Full Name",
    fieldType: "text",
    isEnabled: true,
    isRequired: true,
    placeholder: "Enter your full name as per official documents",
    helpText: "Enter your complete name",
    validation: { min: 3, max: 100 },
    order: 2
  },
  {
    fieldName: "dateOfBirth",
    fieldLabel: "Date of Birth",
    fieldType: "date",
    isEnabled: true,
    isRequired: true,
    placeholder: "Select your date of birth",
    helpText: "Your age will be calculated automatically",
    validation: { format: "YYYY-MM-DD" },
    order: 3
  },
  {
    fieldName: "age",
    fieldLabel: "Age",
    fieldType: "text",
    isEnabled: true,
    isRequired: false,
    placeholder: "Auto-calculated from DOB",
    helpText: "This will be calculated automatically based on your DOB",
    order: 4
  },
  {
    fieldName: "email",
    fieldLabel: "Email Address",
    fieldType: "email",
    isEnabled: true,
    isRequired: true,
    placeholder: "your.email@example.com",
    helpText: "Enter a valid email address",
    validation: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
    order: 5
  },
  {
    fieldName: "mobileNumber",
    fieldLabel: "Mobile Number",
    fieldType: "tel",
    isEnabled: true,
    isRequired: true,
    placeholder: "+91 98765 43210",
    helpText: "Enter your 10-digit mobile number",
    validation: { pattern: "^[0-9]{10,15}$" },
    order: 6
  },
  {
    fieldName: "qualification",
    fieldLabel: "Qualification",
    fieldType: "dropdown",
    isEnabled: true,
    isRequired: true,
    placeholder: "Select your qualification",
    helpText: "Select your highest medical qualification",
    options: { values: DOCTOR_QUALIFICATIONS },
    order: 7
  },
  {
    fieldName: "specialization",
    fieldLabel: "Specialization",
    fieldType: "dropdown",
    isEnabled: true,
    isRequired: true,
    placeholder: "Select your specialization",
    helpText: "Select your medical specialization",
    options: { values: DOCTOR_SPECIALIZATIONS },
    order: 8
  },
  {
    fieldName: "medicalLicenseNumber",
    fieldLabel: "Medical License Number",
    fieldType: "text",
    isEnabled: true,
    isRequired: true,
    placeholder: "Enter your medical council registration number",
    helpText: "Enter your valid medical license/registration number",
    validation: { min: 5, max: 50 },
    order: 9
  }
];

// Default Employee form fields
export const defaultEmployeeFields = [
  {
    fieldName: "profilePhoto",
    fieldLabel: "Profile Photo",
    fieldType: "file",
    isEnabled: true,
    isRequired: true,
    placeholder: "Upload your photo",
    helpText: "Upload a clear passport-size photo (JPEG/JPG, max 5MB)",
    validation: {
      allowedTypes: ["image/jpeg"],
      maxSize: 5242880
    },
    order: 1
  },
  {
    fieldName: "fullName",
    fieldLabel: "Full Name",
    fieldType: "text",
    isEnabled: true,
    isRequired: true,
    placeholder: "Enter your full name",
    helpText: "Enter your complete name",
    validation: { min: 3, max: 100 },
    order: 2
  },
  {
    fieldName: "dateOfBirth",
    fieldLabel: "Date of Birth",
    fieldType: "date",
    isEnabled: true,
    isRequired: true,
    placeholder: "Select your date of birth",
    helpText: "Your age will be calculated automatically",
    validation: { format: "YYYY-MM-DD" },
    order: 3
  },
  {
    fieldName: "age",
    fieldLabel: "Age",
    fieldType: "text",
    isEnabled: true,
    isRequired: false,
    placeholder: "Auto-calculated from DOB",
    helpText: "This will be calculated automatically based on your DOB",
    order: 4
  },
  {
    fieldName: "email",
    fieldLabel: "Email Address",
    fieldType: "email",
    isEnabled: true,
    isRequired: true,
    placeholder: "your.email@example.com",
    helpText: "Enter a valid email address",
    validation: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
    order: 5
  },
  {
    fieldName: "mobileNumber",
    fieldLabel: "Mobile Number",
    fieldType: "tel",
    isEnabled: true,
    isRequired: true,
    placeholder: "+91 98765 43210",
    helpText: "Enter your 10-digit mobile number",
    validation: { pattern: "^[0-9]{10,15}$" },
    order: 6
  },
  {
    fieldName: "qualification",
    fieldLabel: "Qualification",
    fieldType: "dropdown",
    isEnabled: true,
    isRequired: true,
    placeholder: "Select your qualification",
    helpText: "Select your educational qualification",
    options: { values: EMPLOYEE_QUALIFICATIONS },
    order: 7
  },
  {
    fieldName: "roleApplied",
    fieldLabel: "Role Applied For",
    fieldType: "dropdown",
    isEnabled: true,
    isRequired: true,
    placeholder: "Select the role you're applying for",
    helpText: "Choose the position you want to apply for",
    options: { values: EMPLOYEE_ROLES_FLAT },
    order: 8
  }
];