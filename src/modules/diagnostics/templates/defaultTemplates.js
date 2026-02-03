/**
 * Default Diagnostic Report Templates
 * These are system-level templates that can be customized per hospital
 * 
 * Template Types:
 * - TABULAR: Table-based results (blood tests, biochemistry)
 * - NARRATIVE: Free-text reports (imaging, pathology)
 * - MIXED: Combination of tables and narrative
 * - CUSTOM: Fully customizable structure
 */

// ==================== COMMON CONFIGURATIONS ====================

const COMMON_HEADER_CONFIG = {
  showLogo: true,
  showHospitalName: true,
  showHospitalAddress: true,
  showHospitalPhone: true,
  showPatientInfo: true,
  showDoctorInfo: true,
  showSampleInfo: true,
  showBarcodeId: true,
  showReportDate: true
};

const COMMON_FOOTER_CONFIG = {
  showSignature: true,
  showQRCode: false,
  showPageNumber: true,
  disclaimer: "This report is generated electronically and is valid without signature. For any queries, please contact the laboratory.",
  showPrintedBy: true,
  showPrintedAt: true
};

const COMMON_PRINT_CONFIG = {
  pageSize: "A4",
  orientation: "portrait",
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  headerHeight: 80,
  footerHeight: 60
};

const COMMON_STYLING = {
  fontSize: 10,
  fontFamily: "Arial, sans-serif",
  headerFontSize: 14,
  titleFontSize: 12,
  tableStyle: "bordered",
  colors: {
    primary: "#1976D2",
    secondary: "#424242",
    success: "#4CAF50",
    warning: "#FF9800",
    danger: "#F44336",
    normal: "#4CAF50",
    abnormal: "#FF9800",
    critical: "#F44336"
  },
  interpretationColors: {
    NORMAL: "#4CAF50",
    LOW: "#FF9800",
    HIGH: "#FF9800",
    CRITICAL_LOW: "#F44336",
    CRITICAL_HIGH: "#F44336",
    ABNORMAL: "#FF9800"
  }
};

// ==================== BLOOD TEST TEMPLATES ====================

export const BLOOD_TEST_DEFAULT_TEMPLATE = {
  templateCode: "BLOOD_TEST_DEFAULT",
  templateName: "Blood Test Report - Standard",
  description: "Standard tabular format for blood test results with reference ranges",
  testCategory: "BLOOD_TEST",
  testSubCategory: null,
  templateType: "TABULAR",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "LABORATORY REPORT",
    subtitle: "Hematology & Biochemistry"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "department", label: "Department" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "sample_info",
      title: "Sample Information",
      type: "info_block",
      layout: "inline",
      fields: [
        { key: "sampleId", label: "Sample ID" },
        { key: "sampleType", label: "Sample Type" },
        { key: "collectedAt", label: "Collected On" },
        { key: "receivedAt", label: "Received On" },
        { key: "reportedAt", label: "Reported On" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "test_results",
      title: "Test Results",
      type: "table",
      columns: [
        { key: "parameter", label: "Parameter", width: "30%" },
        { key: "result", label: "Result", width: "15%", align: "center" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Reference Range", width: "25%", align: "center" },
        { key: "status", label: "Status", width: "15%", align: "center" }
      ],
      showInterpretationColor: true,
      highlightAbnormal: true,
      visible: true,
      order: 3
    },
    {
      id: "notes",
      title: "Notes",
      type: "text_block",
      placeholder: "Additional notes or observations...",
      visible: true,
      showIfEmpty: false,
      order: 4
    },
    {
      id: "signature",
      title: "Authorized Signatory",
      type: "signature_block",
      fields: [
        { key: "technicianName", label: "Lab Technician" },
        { key: "pathologistName", label: "Pathologist" },
        { key: "signature", label: "Digital Signature" }
      ],
      visible: true,
      order: 5
    }
  ],
  
  entryFields: [
    { id: "resultValue", label: "Result Value", type: "text", required: true },
    { id: "resultNumeric", label: "Numeric Value", type: "number", required: false },
    { id: "resultUnit", label: "Unit", type: "text", required: false },
    { id: "notes", label: "Notes", type: "textarea", required: false, maxLength: 500 }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    showMethodology: true,
    methodology: "Tests performed using automated analyzers following standard protocols."
  },
  
  styling: {
    ...COMMON_STYLING,
    tableHeaderBg: "#E3F2FD",
    alternateRowBg: "#FAFAFA"
  },
  
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: true
};

// ==================== CBC (Complete Blood Count) TEMPLATE ====================

export const CBC_TEMPLATE = {
  templateCode: "BLOOD_TEST_CBC",
  templateName: "Complete Blood Count (CBC) Report",
  description: "Detailed CBC report with all hematology parameters",
  testCategory: "BLOOD_TEST",
  testSubCategory: "Hematology",
  testCode: "LAB_CBC_001",
  templateType: "TABULAR",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "HEMATOLOGY REPORT",
    subtitle: "Complete Blood Count"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Details",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "sampleId", label: "Sample ID" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "rbc_parameters",
      title: "Red Blood Cell Parameters",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "35%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Normal Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "hemoglobin", label: "Hemoglobin (Hb)", unit: "g/dL" },
        { id: "rbc_count", label: "RBC Count", unit: "million/µL" },
        { id: "hematocrit", label: "Hematocrit (HCT)", unit: "%" },
        { id: "mcv", label: "MCV", unit: "fL" },
        { id: "mch", label: "MCH", unit: "pg" },
        { id: "mchc", label: "MCHC", unit: "g/dL" },
        { id: "rdw", label: "RDW", unit: "%" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "wbc_parameters",
      title: "White Blood Cell Parameters",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "35%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Normal Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "wbc_count", label: "Total WBC Count", unit: "/µL" },
        { id: "neutrophils", label: "Neutrophils", unit: "%" },
        { id: "lymphocytes", label: "Lymphocytes", unit: "%" },
        { id: "monocytes", label: "Monocytes", unit: "%" },
        { id: "eosinophils", label: "Eosinophils", unit: "%" },
        { id: "basophils", label: "Basophils", unit: "%" }
      ],
      visible: true,
      order: 3
    },
    {
      id: "platelet_parameters",
      title: "Platelet Parameters",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "35%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Normal Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "platelet_count", label: "Platelet Count", unit: "/µL" },
        { id: "mpv", label: "MPV", unit: "fL" },
        { id: "pct", label: "PCT", unit: "%" },
        { id: "pdw", label: "PDW", unit: "fL" }
      ],
      visible: true,
      order: 4
    },
    {
      id: "interpretation",
      title: "Interpretation",
      type: "text_block",
      placeholder: "Clinical interpretation of results...",
      visible: true,
      showIfEmpty: false,
      order: 5
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      layout: "horizontal",
      fields: [
        { key: "technicianName", label: "Lab Technician", showSignatureLine: true },
        { key: "pathologistName", label: "Pathologist", showSignatureLine: true }
      ],
      visible: true,
      order: 6
    }
  ],
  
  entryFields: [
    { id: "hemoglobin", label: "Hemoglobin", type: "number", unit: "g/dL", required: true, step: 0.1 },
    { id: "rbc_count", label: "RBC Count", type: "number", unit: "million/µL", required: true, step: 0.01 },
    { id: "hematocrit", label: "Hematocrit", type: "number", unit: "%", required: true, step: 0.1 },
    { id: "mcv", label: "MCV", type: "number", unit: "fL", required: true, step: 0.1 },
    { id: "mch", label: "MCH", type: "number", unit: "pg", required: true, step: 0.1 },
    { id: "mchc", label: "MCHC", type: "number", unit: "g/dL", required: true, step: 0.1 },
    { id: "rdw", label: "RDW", type: "number", unit: "%", required: false, step: 0.1 },
    { id: "wbc_count", label: "Total WBC", type: "number", unit: "/µL", required: true, step: 100 },
    { id: "neutrophils", label: "Neutrophils", type: "number", unit: "%", required: true, step: 0.1 },
    { id: "lymphocytes", label: "Lymphocytes", type: "number", unit: "%", required: true, step: 0.1 },
    { id: "monocytes", label: "Monocytes", type: "number", unit: "%", required: true, step: 0.1 },
    { id: "eosinophils", label: "Eosinophils", type: "number", unit: "%", required: true, step: 0.1 },
    { id: "basophils", label: "Basophils", type: "number", unit: "%", required: true, step: 0.1 },
    { id: "platelet_count", label: "Platelet Count", type: "number", unit: "/µL", required: true, step: 1000 },
    { id: "mpv", label: "MPV", type: "number", unit: "fL", required: false, step: 0.1 },
    { id: "interpretation", label: "Interpretation", type: "textarea", required: false }
  ],
  
  referenceRanges: {
    hemoglobin: {
      male: { min: 13.0, max: 17.0 },
      female: { min: 12.0, max: 16.0 },
      child: { min: 11.0, max: 14.0 }
    },
    rbc_count: {
      male: { min: 4.5, max: 5.5 },
      female: { min: 4.0, max: 5.0 }
    },
    wbc_count: { all: { min: 4000, max: 11000 } },
    platelet_count: { all: { min: 150000, max: 450000 } },
    hematocrit: {
      male: { min: 40, max: 54 },
      female: { min: 36, max: 48 }
    },
    mcv: { all: { min: 80, max: 100 } },
    mch: { all: { min: 27, max: 32 } },
    mchc: { all: { min: 32, max: 36 } },
    rdw: { all: { min: 11.5, max: 14.5 } },
    neutrophils: { all: { min: 40, max: 70 } },
    lymphocytes: { all: { min: 20, max: 45 } },
    monocytes: { all: { min: 2, max: 10 } },
    eosinophils: { all: { min: 1, max: 6 } },
    basophils: { all: { min: 0, max: 2 } },
    mpv: { all: { min: 7.5, max: 11.5 } }
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Analyzed using Automated Hematology Analyzer (5-part differential)"
  },
  
  styling: {
    ...COMMON_STYLING,
    sectionSpacing: 15,
    tableHeaderBg: "#E3F2FD"
  },
  
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== LIVER FUNCTION TEST TEMPLATE ====================

export const LFT_TEMPLATE = {
  templateCode: "BLOOD_TEST_LFT",
  templateName: "Liver Function Test (LFT) Report",
  description: "Comprehensive liver function panel report",
  testCategory: "BLOOD_TEST",
  testSubCategory: "Biochemistry",
  testCode: "LAB_LFT_001",
  templateType: "TABULAR",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "BIOCHEMISTRY REPORT",
    subtitle: "Liver Function Test"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Details",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "sampleId", label: "Sample ID" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "liver_enzymes",
      title: "Liver Enzymes",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "35%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Normal Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "sgot", label: "SGOT (AST)", unit: "U/L" },
        { id: "sgpt", label: "SGPT (ALT)", unit: "U/L" },
        { id: "alp", label: "Alkaline Phosphatase (ALP)", unit: "U/L" },
        { id: "ggt", label: "Gamma GT (GGT)", unit: "U/L" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "bilirubin",
      title: "Bilirubin",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "35%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Normal Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "total_bilirubin", label: "Total Bilirubin", unit: "mg/dL" },
        { id: "direct_bilirubin", label: "Direct Bilirubin", unit: "mg/dL" },
        { id: "indirect_bilirubin", label: "Indirect Bilirubin", unit: "mg/dL" }
      ],
      visible: true,
      order: 3
    },
    {
      id: "proteins",
      title: "Proteins",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "35%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Normal Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "total_protein", label: "Total Protein", unit: "g/dL" },
        { id: "albumin", label: "Albumin", unit: "g/dL" },
        { id: "globulin", label: "Globulin", unit: "g/dL" },
        { id: "ag_ratio", label: "A/G Ratio", unit: "" }
      ],
      visible: true,
      order: 4
    },
    {
      id: "interpretation",
      title: "Interpretation",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 5
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      layout: "horizontal",
      fields: [
        { key: "technicianName", label: "Lab Technician" },
        { key: "pathologistName", label: "Pathologist" }
      ],
      visible: true,
      order: 6
    }
  ],
  
  entryFields: [
    { id: "sgot", label: "SGOT (AST)", type: "number", unit: "U/L", required: true },
    { id: "sgpt", label: "SGPT (ALT)", type: "number", unit: "U/L", required: true },
    { id: "alp", label: "ALP", type: "number", unit: "U/L", required: true },
    { id: "ggt", label: "GGT", type: "number", unit: "U/L", required: false },
    { id: "total_bilirubin", label: "Total Bilirubin", type: "number", unit: "mg/dL", required: true, step: 0.1 },
    { id: "direct_bilirubin", label: "Direct Bilirubin", type: "number", unit: "mg/dL", required: true, step: 0.1 },
    { id: "total_protein", label: "Total Protein", type: "number", unit: "g/dL", required: true, step: 0.1 },
    { id: "albumin", label: "Albumin", type: "number", unit: "g/dL", required: true, step: 0.1 },
    { id: "interpretation", label: "Interpretation", type: "textarea", required: false }
  ],
  
  referenceRanges: {
    sgot: { all: { min: 5, max: 40 } },
    sgpt: { all: { min: 7, max: 56 } },
    alp: { all: { min: 44, max: 147 } },
    ggt: { 
      male: { min: 8, max: 61 },
      female: { min: 5, max: 36 }
    },
    total_bilirubin: { all: { min: 0.1, max: 1.2 } },
    direct_bilirubin: { all: { min: 0.0, max: 0.3 } },
    total_protein: { all: { min: 6.0, max: 8.3 } },
    albumin: { all: { min: 3.5, max: 5.5 } }
  },
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== IMAGING TEMPLATES ====================

export const XRAY_TEMPLATE = {
  templateCode: "IMAGING_XRAY",
  templateName: "X-Ray Report",
  description: "Radiology report template for X-Ray examinations",
  testCategory: "IMAGING",
  testSubCategory: "X-Ray",
  templateType: "NARRATIVE",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "RADIOLOGY REPORT",
    subtitle: "X-Ray Examination"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "examinationDate", label: "Exam Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "exam_details",
      title: "Examination Details",
      type: "key_value",
      fields: [
        { key: "examination", label: "Examination" },
        { key: "view", label: "View/Projection" },
        { key: "clinicalHistory", label: "Clinical History" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "findings",
      title: "Findings",
      type: "text_block",
      placeholder: "Describe radiological findings in detail...",
      minHeight: 150,
      required: true,
      visible: true,
      order: 3
    },
    {
      id: "impressions",
      title: "Impressions",
      type: "text_block",
      placeholder: "Summary of findings and diagnostic impression...",
      minHeight: 80,
      required: true,
      visible: true,
      order: 4
    },
    {
      id: "recommendations",
      title: "Recommendations",
      type: "text_block",
      placeholder: "Follow-up recommendations if any...",
      minHeight: 60,
      required: false,
      visible: true,
      showIfEmpty: false,
      order: 5
    },
    {
      id: "images",
      title: "Attached Images",
      type: "image_gallery",
      maxImages: 10,
      allowCaption: true,
      visible: true,
      showIfEmpty: false,
      order: 6
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      layout: "single",
      fields: [
        { key: "radiologistName", label: "Reporting Radiologist", showSignatureLine: true },
        { key: "qualification", label: "Qualification" },
        { key: "registrationNo", label: "Reg. No." }
      ],
      visible: true,
      order: 7
    }
  ],
  
  entryFields: [
    { id: "examination", label: "Examination", type: "select", required: true,
      options: ["Chest X-Ray", "Abdomen X-Ray", "Spine X-Ray", "Skull X-Ray", "Limb X-Ray", "Other"] },
    { id: "view", label: "View/Projection", type: "select", required: true,
      options: ["PA View", "AP View", "Lateral View", "Oblique View", "PA & Lateral", "Multiple Views"] },
    { id: "clinicalHistory", label: "Clinical History", type: "textarea", required: false },
    { id: "findings", label: "Findings", type: "richtext", required: true, minLength: 50 },
    { id: "impressions", label: "Impressions", type: "textarea", required: true, minLength: 20 },
    { id: "recommendations", label: "Recommendations", type: "textarea", required: false },
    { id: "images", label: "Attach Images", type: "file_upload", accept: "image/*", multiple: true }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    disclaimer: "This report is based on the images provided. Clinical correlation is recommended."
  },
  
  styling: {
    ...COMMON_STYLING,
    narrativeLineHeight: 1.6,
    sectionSpacing: 20
  },
  
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: true
};

// ==================== ULTRASOUND TEMPLATE ====================

export const USG_TEMPLATE = {
  templateCode: "IMAGING_USG",
  templateName: "Ultrasound Report",
  description: "Comprehensive ultrasound examination report",
  testCategory: "IMAGING",
  testSubCategory: "Ultrasound",
  templateType: "NARRATIVE",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "ULTRASOUND REPORT",
    subtitle: "Sonography Examination"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "examinationDate", label: "Exam Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "exam_details",
      title: "Examination Details",
      type: "key_value",
      fields: [
        { key: "examination", label: "Examination" },
        { key: "clinicalIndication", label: "Clinical Indication" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "liver",
      title: "Liver",
      type: "organ_section",
      fields: [
        { key: "size", label: "Size", type: "select", options: ["Normal", "Enlarged", "Small"] },
        { key: "echotexture", label: "Echotexture", type: "select", options: ["Normal", "Coarse", "Heterogeneous", "Fatty"] },
        { key: "findings", label: "Findings", type: "textarea" }
      ],
      visible: true,
      collapsible: true,
      order: 3
    },
    {
      id: "gallbladder",
      title: "Gall Bladder",
      type: "organ_section",
      fields: [
        { key: "status", label: "Status", type: "select", options: ["Normal", "Distended", "Contracted", "Post-cholecystectomy"] },
        { key: "wall", label: "Wall", type: "select", options: ["Normal", "Thickened"] },
        { key: "calculi", label: "Calculi", type: "select", options: ["None", "Single", "Multiple"] },
        { key: "findings", label: "Findings", type: "textarea" }
      ],
      visible: true,
      collapsible: true,
      order: 4
    },
    {
      id: "kidneys",
      title: "Kidneys",
      type: "organ_section",
      fields: [
        { key: "right_size", label: "Right Kidney Size", type: "text", placeholder: "e.g., 10.2 x 4.5 cm" },
        { key: "left_size", label: "Left Kidney Size", type: "text", placeholder: "e.g., 10.5 x 4.8 cm" },
        { key: "cortex", label: "Cortical Echogenicity", type: "select", options: ["Normal", "Increased", "Decreased"] },
        { key: "pelvicalyceal", label: "Pelvicalyceal System", type: "select", options: ["Normal", "Dilated"] },
        { key: "calculi", label: "Calculi", type: "select", options: ["None", "Right", "Left", "Bilateral"] },
        { key: "findings", label: "Findings", type: "textarea" }
      ],
      visible: true,
      collapsible: true,
      order: 5
    },
    {
      id: "spleen",
      title: "Spleen",
      type: "organ_section",
      fields: [
        { key: "size", label: "Size", type: "select", options: ["Normal", "Enlarged"] },
        { key: "echotexture", label: "Echotexture", type: "select", options: ["Normal", "Heterogeneous"] },
        { key: "findings", label: "Findings", type: "textarea" }
      ],
      visible: true,
      collapsible: true,
      order: 6
    },
    {
      id: "other_findings",
      title: "Other Findings",
      type: "text_block",
      placeholder: "Any additional findings...",
      visible: true,
      showIfEmpty: false,
      order: 7
    },
    {
      id: "impressions",
      title: "Impressions",
      type: "text_block",
      placeholder: "Summary impression and diagnosis...",
      required: true,
      visible: true,
      order: 8
    },
    {
      id: "recommendations",
      title: "Recommendations",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 9
    },
    {
      id: "images",
      title: "Sonographic Images",
      type: "image_gallery",
      maxImages: 12,
      visible: true,
      showIfEmpty: false,
      order: 10
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      layout: "single",
      fields: [
        { key: "radiologistName", label: "Reporting Radiologist" },
        { key: "qualification", label: "Qualification" }
      ],
      visible: true,
      order: 11
    }
  ],
  
  entryFields: [
    { id: "examination", label: "Examination Type", type: "select", required: true,
      options: ["USG Abdomen", "USG Pelvis", "USG Whole Abdomen", "USG KUB", "USG Liver", "Other"] },
    { id: "clinicalIndication", label: "Clinical Indication", type: "textarea", required: false },
    { id: "reportText", label: "Detailed Findings", type: "richtext", required: true },
    { id: "impressions", label: "Impressions", type: "textarea", required: true },
    { id: "recommendations", label: "Recommendations", type: "textarea", required: false },
    { id: "images", label: "Attach Images", type: "file_upload", accept: "image/*", multiple: true }
  ],
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== CT SCAN TEMPLATE ====================

export const CT_TEMPLATE = {
  templateCode: "IMAGING_CT",
  templateName: "CT Scan Report",
  description: "Computed Tomography examination report",
  testCategory: "IMAGING",
  testSubCategory: "CT Scan",
  templateType: "NARRATIVE",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "CT SCAN REPORT",
    subtitle: "Computed Tomography"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "examinationDate", label: "Exam Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "exam_details",
      title: "Examination Details",
      type: "key_value",
      fields: [
        { key: "examination", label: "Examination" },
        { key: "contrast", label: "Contrast" },
        { key: "clinicalHistory", label: "Clinical History" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "technique",
      title: "Technique",
      type: "text_block",
      placeholder: "Describe scanning technique, contrast details...",
      visible: true,
      order: 3
    },
    {
      id: "findings",
      title: "Findings",
      type: "text_block",
      placeholder: "Detailed CT findings...",
      minHeight: 200,
      required: true,
      visible: true,
      order: 4
    },
    {
      id: "impressions",
      title: "Impressions",
      type: "text_block",
      required: true,
      visible: true,
      order: 5
    },
    {
      id: "recommendations",
      title: "Recommendations",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 6
    },
    {
      id: "images",
      title: "Key Images",
      type: "image_gallery",
      maxImages: 20,
      visible: true,
      showIfEmpty: false,
      order: 7
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "radiologistName", label: "Reporting Radiologist" },
        { key: "qualification", label: "MD Radiology" }
      ],
      visible: true,
      order: 8
    }
  ],
  
  entryFields: [
    { id: "examination", label: "Examination", type: "select", required: true,
      options: ["CT Brain", "CT Chest", "CT Abdomen", "CT Pelvis", "CT KUB", "CT Spine", "HRCT Chest", "CT Angiography", "Other"] },
    { id: "contrast", label: "Contrast", type: "select", required: true,
      options: ["Plain", "With IV Contrast", "Plain + Contrast", "Oral Contrast Only", "IV + Oral Contrast"] },
    { id: "clinicalHistory", label: "Clinical History", type: "textarea", required: false },
    { id: "technique", label: "Technique", type: "textarea", required: false },
    { id: "reportText", label: "Findings", type: "richtext", required: true, minLength: 100 },
    { id: "impressions", label: "Impressions", type: "textarea", required: true },
    { id: "recommendations", label: "Recommendations", type: "textarea", required: false },
    { id: "images", label: "Attach Images", type: "file_upload", accept: "image/*", multiple: true }
  ],
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== MRI TEMPLATE ====================

export const MRI_TEMPLATE = {
  templateCode: "IMAGING_MRI",
  templateName: "MRI Report",
  description: "Magnetic Resonance Imaging examination report",
  testCategory: "IMAGING",
  testSubCategory: "MRI",
  templateType: "NARRATIVE",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "MRI REPORT",
    subtitle: "Magnetic Resonance Imaging"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "examinationDate", label: "Exam Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "exam_details",
      title: "Examination Details",
      type: "key_value",
      fields: [
        { key: "examination", label: "Examination" },
        { key: "sequences", label: "Sequences" },
        { key: "contrast", label: "Contrast" },
        { key: "clinicalHistory", label: "Clinical History" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "technique",
      title: "Technique",
      type: "text_block",
      visible: true,
      order: 3
    },
    {
      id: "findings",
      title: "Findings",
      type: "text_block",
      minHeight: 250,
      required: true,
      visible: true,
      order: 4
    },
    {
      id: "impressions",
      title: "Impressions",
      type: "text_block",
      required: true,
      visible: true,
      order: 5
    },
    {
      id: "recommendations",
      title: "Recommendations",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 6
    },
    {
      id: "images",
      title: "Representative Images",
      type: "image_gallery",
      maxImages: 25,
      visible: true,
      showIfEmpty: false,
      order: 7
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "radiologistName", label: "Reporting Radiologist" }
      ],
      visible: true,
      order: 8
    }
  ],
  
  entryFields: [
    { id: "examination", label: "Examination", type: "select", required: true,
      options: ["MRI Brain", "MRI Spine (Cervical)", "MRI Spine (Thoracic)", "MRI Spine (Lumbar)", "MRI Abdomen", "MRI Pelvis", "MRI Knee", "MRI Shoulder", "MRA", "MRCP", "Other"] },
    { id: "sequences", label: "Sequences", type: "text", required: false, placeholder: "T1W, T2W, FLAIR, DWI..." },
    { id: "contrast", label: "Contrast", type: "select", required: true,
      options: ["Plain", "With Gadolinium Contrast", "Plain + Contrast"] },
    { id: "clinicalHistory", label: "Clinical History", type: "textarea", required: false },
    { id: "technique", label: "Technique", type: "textarea", required: false },
    { id: "reportText", label: "Findings", type: "richtext", required: true, minLength: 100 },
    { id: "impressions", label: "Impressions", type: "textarea", required: true },
    { id: "recommendations", label: "Recommendations", type: "textarea", required: false },
    { id: "images", label: "Attach Images", type: "file_upload", accept: "image/*", multiple: true }
  ],
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== ECG TEMPLATE ====================

export const ECG_TEMPLATE = {
  templateCode: "CARDIAC_ECG",
  templateName: "ECG Report",
  description: "Electrocardiogram report template",
  testCategory: "CARDIAC",
  testSubCategory: "ECG",
  testCode: "LAB_ECG_001",
  templateType: "MIXED",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "ECG REPORT",
    subtitle: "Electrocardiogram"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "recordingDate", label: "Recording Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "measurements",
      title: "ECG Measurements",
      type: "table",
      columns: [
        { key: "parameter", label: "Parameter", width: "40%" },
        { key: "value", label: "Value", width: "30%", align: "center" },
        { key: "normal", label: "Normal Range", width: "30%", align: "center" }
      ],
      parameters: [
        { id: "heart_rate", label: "Heart Rate", unit: "bpm", normalRange: "60-100" },
        { id: "pr_interval", label: "PR Interval", unit: "ms", normalRange: "120-200" },
        { id: "qrs_duration", label: "QRS Duration", unit: "ms", normalRange: "80-120" },
        { id: "qt_interval", label: "QT Interval", unit: "ms", normalRange: "350-450" },
        { id: "qtc", label: "QTc", unit: "ms", normalRange: "<440 (M), <460 (F)" },
        { id: "axis", label: "QRS Axis", unit: "°", normalRange: "-30 to +90" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "rhythm",
      title: "Rhythm Analysis",
      type: "checklist",
      options: [
        { id: "sinus_rhythm", label: "Normal Sinus Rhythm" },
        { id: "sinus_tachycardia", label: "Sinus Tachycardia" },
        { id: "sinus_bradycardia", label: "Sinus Bradycardia" },
        { id: "afib", label: "Atrial Fibrillation" },
        { id: "aflutter", label: "Atrial Flutter" },
        { id: "pvc", label: "Premature Ventricular Contractions" },
        { id: "pac", label: "Premature Atrial Contractions" },
        { id: "first_degree_block", label: "First Degree AV Block" },
        { id: "second_degree_block", label: "Second Degree AV Block" },
        { id: "third_degree_block", label: "Complete Heart Block" },
        { id: "lbbb", label: "Left Bundle Branch Block" },
        { id: "rbbb", label: "Right Bundle Branch Block" }
      ],
      visible: true,
      order: 3
    },
    {
      id: "findings",
      title: "Additional Findings",
      type: "checklist",
      options: [
        { id: "lvh", label: "Left Ventricular Hypertrophy" },
        { id: "rvh", label: "Right Ventricular Hypertrophy" },
        { id: "st_elevation", label: "ST Elevation" },
        { id: "st_depression", label: "ST Depression" },
        { id: "t_wave_inversion", label: "T Wave Inversion" },
        { id: "q_waves", label: "Pathological Q Waves" },
        { id: "poor_r_progression", label: "Poor R Wave Progression" }
      ],
      visible: true,
      order: 4
    },
    {
      id: "interpretation",
      title: "Interpretation",
      type: "text_block",
      required: true,
      visible: true,
      order: 5
    },
    {
      id: "ecg_strip",
      title: "ECG Strip",
      type: "image_gallery",
      maxImages: 3,
      visible: true,
      order: 6
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "cardiologistName", label: "Reporting Cardiologist" }
      ],
      visible: true,
      order: 7
    }
  ],
  
  entryFields: [
    { id: "heart_rate", label: "Heart Rate", type: "number", unit: "bpm", required: true },
    { id: "pr_interval", label: "PR Interval", type: "number", unit: "ms", required: true },
    { id: "qrs_duration", label: "QRS Duration", type: "number", unit: "ms", required: true },
    { id: "qt_interval", label: "QT Interval", type: "number", unit: "ms", required: true },
    { id: "qtc", label: "QTc", type: "number", unit: "ms", required: true },
    { id: "axis", label: "QRS Axis", type: "number", unit: "°", required: true },
    { id: "rhythm", label: "Rhythm", type: "multiselect", required: true },
    { id: "findings", label: "Additional Findings", type: "multiselect", required: false },
    { id: "interpretation", label: "Interpretation", type: "textarea", required: true },
    { id: "images", label: "ECG Strip", type: "file_upload", accept: "image/*", multiple: true }
  ],
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: true
};

// ==================== ECHO TEMPLATE ====================

export const ECHO_TEMPLATE = {
  templateCode: "CARDIAC_ECHO",
  templateName: "Echocardiogram Report",
  description: "2D Echocardiography report template",
  testCategory: "CARDIAC",
  testSubCategory: "Echocardiography",
  testCode: "LAB_ECHO_001",
  templateType: "MIXED",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "ECHOCARDIOGRAPHY REPORT",
    subtitle: "2D Echo with Doppler"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "studyDate", label: "Study Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "lv_dimensions",
      title: "LV Dimensions & Function",
      type: "table",
      columns: [
        { key: "parameter", label: "Parameter", width: "40%" },
        { key: "value", label: "Value", width: "20%", align: "center" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "normal", label: "Normal", width: "25%", align: "center" }
      ],
      parameters: [
        { id: "lvedd", label: "LVIDd", unit: "mm", normalRange: "35-56" },
        { id: "lvesd", label: "LVIDs", unit: "mm", normalRange: "25-42" },
        { id: "ivsd", label: "IVSd", unit: "mm", normalRange: "6-11" },
        { id: "pwdd", label: "PWd", unit: "mm", normalRange: "6-11" },
        { id: "ef", label: "Ejection Fraction", unit: "%", normalRange: ">55" },
        { id: "fs", label: "Fractional Shortening", unit: "%", normalRange: "25-45" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "chambers",
      title: "Cardiac Chambers",
      type: "table",
      columns: [
        { key: "chamber", label: "Chamber", width: "30%" },
        { key: "size", label: "Size", width: "25%", align: "center" },
        { key: "function", label: "Function", width: "25%", align: "center" },
        { key: "remarks", label: "Remarks", width: "20%" }
      ],
      parameters: [
        { id: "lv", label: "Left Ventricle" },
        { id: "rv", label: "Right Ventricle" },
        { id: "la", label: "Left Atrium" },
        { id: "ra", label: "Right Atrium" }
      ],
      visible: true,
      order: 3
    },
    {
      id: "valves",
      title: "Valvular Assessment",
      type: "table",
      columns: [
        { key: "valve", label: "Valve", width: "20%" },
        { key: "morphology", label: "Morphology", width: "25%" },
        { key: "stenosis", label: "Stenosis", width: "20%", align: "center" },
        { key: "regurgitation", label: "Regurgitation", width: "20%", align: "center" },
        { key: "remarks", label: "Remarks", width: "15%" }
      ],
      parameters: [
        { id: "mv", label: "Mitral Valve" },
        { id: "av", label: "Aortic Valve" },
        { id: "tv", label: "Tricuspid Valve" },
        { id: "pv", label: "Pulmonary Valve" }
      ],
      visible: true,
      order: 4
    },
    {
      id: "doppler",
      title: "Doppler Findings",
      type: "key_value",
      fields: [
        { key: "e_a_ratio", label: "E/A Ratio" },
        { key: "diastolic_function", label: "Diastolic Function" },
        { key: "pasp", label: "PASP (mmHg)" },
        { key: "pericardium", label: "Pericardium" }
      ],
      visible: true,
      order: 5
    },
    {
      id: "impressions",
      title: "Impressions",
      type: "text_block",
      required: true,
      visible: true,
      order: 6
    },
    {
      id: "recommendations",
      title: "Recommendations",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 7
    },
    {
      id: "images",
      title: "Echo Images",
      type: "image_gallery",
      maxImages: 10,
      visible: true,
      showIfEmpty: false,
      order: 8
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "cardiologistName", label: "Reporting Cardiologist" }
      ],
      visible: true,
      order: 9
    }
  ],
  
  entryFields: [
    { id: "lvedd", label: "LVIDd", type: "number", unit: "mm", required: true },
    { id: "lvesd", label: "LVIDs", type: "number", unit: "mm", required: true },
    { id: "ivsd", label: "IVSd", type: "number", unit: "mm", required: true },
    { id: "pwdd", label: "PWd", type: "number", unit: "mm", required: true },
    { id: "ef", label: "Ejection Fraction", type: "number", unit: "%", required: true },
    { id: "lv_size", label: "LV Size", type: "select", options: ["Normal", "Dilated", "Hypertrophied"], required: true },
    { id: "lv_function", label: "LV Function", type: "select", options: ["Normal", "Mild dysfunction", "Moderate dysfunction", "Severe dysfunction"], required: true },
    { id: "rv_size", label: "RV Size", type: "select", options: ["Normal", "Dilated"], required: true },
    { id: "mv_morphology", label: "MV Morphology", type: "text", required: false },
    { id: "mv_regurgitation", label: "MV Regurgitation", type: "select", options: ["None", "Trivial", "Mild", "Moderate", "Severe"], required: true },
    { id: "av_regurgitation", label: "AV Regurgitation", type: "select", options: ["None", "Trivial", "Mild", "Moderate", "Severe"], required: true },
    { id: "pasp", label: "PASP", type: "number", unit: "mmHg", required: false },
    { id: "pericardium", label: "Pericardium", type: "select", options: ["Normal", "Mild effusion", "Moderate effusion", "Large effusion"], required: true },
    { id: "impressions", label: "Impressions", type: "textarea", required: true },
    { id: "recommendations", label: "Recommendations", type: "textarea", required: false },
    { id: "images", label: "Echo Images", type: "file_upload", accept: "image/*,video/*", multiple: true }
  ],
  
  referenceRanges: {
    ef: { all: { min: 55, max: 75 } },
    lvedd: { 
      male: { min: 42, max: 58 },
      female: { min: 38, max: 52 }
    },
    lvesd: {
      male: { min: 25, max: 40 },
      female: { min: 22, max: 35 }
    },
    ivsd: { all: { min: 6, max: 11 } },
    pwdd: { all: { min: 6, max: 11 } }
  },
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== PATHOLOGY TEMPLATE ====================

export const PATHOLOGY_TEMPLATE = {
  templateCode: "PATHOLOGY_HISTOPATH",
  templateName: "Histopathology Report",
  description: "Detailed histopathology examination report",
  testCategory: "PATHOLOGY",
  testSubCategory: "Histopathology",
  templateType: "NARRATIVE",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "HISTOPATHOLOGY REPORT",
    subtitle: "Surgical Pathology"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Surgeon" },
        { key: "specimenDate", label: "Specimen Date" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "specimen_info",
      title: "Specimen Information",
      type: "key_value",
      fields: [
        { key: "specimenType", label: "Specimen Type" },
        { key: "specimenSite", label: "Site/Location" },
        { key: "specimenId", label: "Lab Number" },
        { key: "clinicalHistory", label: "Clinical History" },
        { key: "clinicalDiagnosis", label: "Clinical Diagnosis" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "gross",
      title: "Gross Examination",
      type: "text_block",
      placeholder: "Describe gross appearance, size, weight, consistency...",
      required: true,
      visible: true,
      order: 3
    },
    {
      id: "microscopy",
      title: "Microscopic Examination",
      type: "text_block",
      placeholder: "Detailed microscopic findings...",
      minHeight: 200,
      required: true,
      visible: true,
      order: 4
    },
    {
      id: "ihc",
      title: "Immunohistochemistry (if performed)",
      type: "table",
      columns: [
        { key: "marker", label: "Marker", width: "40%" },
        { key: "result", label: "Result", width: "30%", align: "center" },
        { key: "interpretation", label: "Interpretation", width: "30%" }
      ],
      visible: true,
      showIfEmpty: false,
      order: 5
    },
    {
      id: "diagnosis",
      title: "Histopathological Diagnosis",
      type: "text_block",
      placeholder: "Final pathological diagnosis...",
      required: true,
      visible: true,
      order: 6
    },
    {
      id: "staging",
      title: "TNM Staging (if applicable)",
      type: "key_value",
      fields: [
        { key: "t_stage", label: "T Stage" },
        { key: "n_stage", label: "N Stage" },
        { key: "m_stage", label: "M Stage" },
        { key: "grade", label: "Histological Grade" },
        { key: "margins", label: "Margins" },
        { key: "lymphovascular", label: "Lymphovascular Invasion" }
      ],
      visible: true,
      showIfEmpty: false,
      order: 7
    },
    {
      id: "comments",
      title: "Comments",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 8
    },
    {
      id: "images",
      title: "Microscopy Images",
      type: "image_gallery",
      maxImages: 15,
      allowCaption: true,
      visible: true,
      showIfEmpty: false,
      order: 9
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      layout: "vertical",
      fields: [
        { key: "pathologistName", label: "Reporting Pathologist", showSignatureLine: true },
        { key: "qualification", label: "MD Pathology" },
        { key: "registrationNo", label: "Reg. No." }
      ],
      visible: true,
      order: 10
    }
  ],
  
  entryFields: [
    { id: "specimenType", label: "Specimen Type", type: "text", required: true },
    { id: "specimenSite", label: "Site/Location", type: "text", required: true },
    { id: "clinicalHistory", label: "Clinical History", type: "textarea", required: false },
    { id: "clinicalDiagnosis", label: "Clinical Diagnosis", type: "text", required: false },
    { id: "gross", label: "Gross Examination", type: "richtext", required: true, minLength: 50 },
    { id: "microscopy", label: "Microscopic Examination", type: "richtext", required: true, minLength: 100 },
    { id: "diagnosis", label: "Diagnosis", type: "textarea", required: true },
    { id: "ihc_markers", label: "IHC Markers", type: "array", required: false },
    { id: "tnm_staging", label: "TNM Staging", type: "object", required: false },
    { id: "comments", label: "Comments", type: "textarea", required: false },
    { id: "images", label: "Microscopy Images", type: "file_upload", accept: "image/*", multiple: true }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    disclaimer: "This report represents the pathologist's professional opinion based on the specimen submitted. Clinical correlation is essential."
  },
  
  styling: {
    ...COMMON_STYLING,
    diagnosisFontSize: 12,
    diagnosisFontWeight: "bold"
  },
  
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: true
};

// ==================== URINE TEST TEMPLATE ====================

export const URINE_ROUTINE_TEMPLATE = {
  templateCode: "URINE_ROUTINE",
  templateName: "Urine Routine Examination",
  description: "Complete urine routine and microscopy report",
  testCategory: "URINE",
  testSubCategory: "Routine",
  testCode: "LAB_URINE_001",
  templateType: "TABULAR",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "URINE EXAMINATION REPORT",
    subtitle: "Routine & Microscopy"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "sampleId", label: "Sample ID" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "physical_exam",
      title: "Physical Examination",
      type: "table",
      columns: [
        { key: "parameter", label: "Parameter", width: "50%" },
        { key: "result", label: "Result", width: "30%", align: "center" },
        { key: "normal", label: "Normal", width: "20%", align: "center" }
      ],
      parameters: [
        { id: "color", label: "Color", normalValue: "Pale Yellow" },
        { id: "appearance", label: "Appearance", normalValue: "Clear" },
        { id: "volume", label: "Volume", unit: "ml" },
        { id: "specific_gravity", label: "Specific Gravity", normalRange: "1.005-1.030" },
        { id: "ph", label: "pH", normalRange: "5.0-8.0" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "chemical_exam",
      title: "Chemical Examination",
      type: "table",
      columns: [
        { key: "parameter", label: "Parameter", width: "40%" },
        { key: "result", label: "Result", width: "30%", align: "center" },
        { key: "normal", label: "Normal", width: "30%", align: "center" }
      ],
      parameters: [
        { id: "protein", label: "Protein", normalValue: "Nil" },
        { id: "glucose", label: "Glucose", normalValue: "Nil" },
        { id: "ketones", label: "Ketones", normalValue: "Nil" },
        { id: "blood", label: "Blood", normalValue: "Nil" },
        { id: "bilirubin", label: "Bilirubin", normalValue: "Nil" },
        { id: "urobilinogen", label: "Urobilinogen", normalValue: "Normal" },
        { id: "nitrite", label: "Nitrite", normalValue: "Negative" },
        { id: "leukocyte_esterase", label: "Leukocyte Esterase", normalValue: "Negative" }
      ],
      visible: true,
      order: 3
    },
    {
      id: "microscopy",
      title: "Microscopic Examination",
      type: "table",
      columns: [
        { key: "parameter", label: "Parameter", width: "40%" },
        { key: "result", label: "Result", width: "30%", align: "center" },
        { key: "normal", label: "Normal", width: "30%", align: "center" }
      ],
      parameters: [
        { id: "rbc", label: "RBCs", unit: "/hpf", normalRange: "0-2" },
        { id: "pus_cells", label: "Pus Cells (WBCs)", unit: "/hpf", normalRange: "0-5" },
        { id: "epithelial_cells", label: "Epithelial Cells", unit: "/hpf", normalRange: "Few" },
        { id: "casts", label: "Casts", normalValue: "Nil" },
        { id: "crystals", label: "Crystals", normalValue: "Nil" },
        { id: "bacteria", label: "Bacteria", normalValue: "Nil" },
        { id: "yeast", label: "Yeast Cells", normalValue: "Nil" }
      ],
      visible: true,
      order: 4
    },
    {
      id: "remarks",
      title: "Remarks",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 5
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "technicianName", label: "Lab Technician" },
        { key: "pathologistName", label: "Pathologist" }
      ],
      visible: true,
      order: 6
    }
  ],
  
  entryFields: [
    { id: "color", label: "Color", type: "select", options: ["Pale Yellow", "Yellow", "Dark Yellow", "Amber", "Red/Brown", "Other"], required: true },
    { id: "appearance", label: "Appearance", type: "select", options: ["Clear", "Slightly Turbid", "Turbid", "Cloudy"], required: true },
    { id: "specific_gravity", label: "Specific Gravity", type: "number", step: 0.001, required: true },
    { id: "ph", label: "pH", type: "number", step: 0.1, required: true },
    { id: "protein", label: "Protein", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+", "4+"], required: true },
    { id: "glucose", label: "Glucose", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+", "4+"], required: true },
    { id: "ketones", label: "Ketones", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+"], required: true },
    { id: "blood", label: "Blood", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+"], required: true },
    { id: "bilirubin", label: "Bilirubin", type: "select", options: ["Nil", "1+", "2+", "3+"], required: true },
    { id: "rbc", label: "RBCs (/hpf)", type: "text", required: true },
    { id: "pus_cells", label: "Pus Cells (/hpf)", type: "text", required: true },
    { id: "epithelial_cells", label: "Epithelial Cells", type: "text", required: true },
    { id: "casts", label: "Casts", type: "text", required: true },
    { id: "crystals", label: "Crystals", type: "text", required: true },
    { id: "bacteria", label: "Bacteria", type: "select", options: ["Nil", "Few", "Moderate", "Many"], required: true },
    { id: "remarks", label: "Remarks", type: "textarea", required: false }
  ],
  
  footerConfig: COMMON_FOOTER_CONFIG,
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: true
};

// ==================== THYROID FUNCTION TEST TEMPLATE ====================

export const TFT_TEMPLATE = {
  templateCode: "HORMONE_TFT",
  templateName: "Thyroid Function Test Report",
  description: "Complete thyroid panel report",
  testCategory: "HORMONES",
  testSubCategory: "Thyroid",
  testCode: "LAB_TFT_001",
  templateType: "TABULAR",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "HORMONE ASSAY REPORT",
    subtitle: "Thyroid Function Test"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "sampleId", label: "Sample ID" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "thyroid_panel",
      title: "Thyroid Panel",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "30%" },
        { key: "result", label: "Result", width: "20%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "referenceRange", label: "Reference Range", width: "25%", align: "center" },
        { key: "status", label: "Flag", width: "10%", align: "center" }
      ],
      parameters: [
        { id: "tsh", label: "TSH", unit: "mIU/L" },
        { id: "t3", label: "T3 (Total)", unit: "ng/dL" },
        { id: "t4", label: "T4 (Total)", unit: "µg/dL" },
        { id: "ft3", label: "Free T3", unit: "pg/mL" },
        { id: "ft4", label: "Free T4", unit: "ng/dL" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "interpretation",
      title: "Interpretation",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 3
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "technicianName", label: "Lab Technician" },
        { key: "pathologistName", label: "Pathologist" }
      ],
      visible: true,
      order: 4
    }
  ],
  
  entryFields: [
    { id: "tsh", label: "TSH", type: "number", unit: "mIU/L", required: true, step: 0.01 },
    { id: "t3", label: "T3 (Total)", type: "number", unit: "ng/dL", required: false, step: 0.1 },
    { id: "t4", label: "T4 (Total)", type: "number", unit: "µg/dL", required: false, step: 0.1 },
    { id: "ft3", label: "Free T3", type: "number", unit: "pg/mL", required: false, step: 0.01 },
    { id: "ft4", label: "Free T4", type: "number", unit: "ng/dL", required: false, step: 0.01 },
    { id: "interpretation", label: "Interpretation", type: "textarea", required: false }
  ],
  
  referenceRanges: {
    tsh: { all: { min: 0.4, max: 4.0 } },
    t3: { all: { min: 80, max: 200 } },
    t4: { all: { min: 5.1, max: 14.1 } },
    ft3: { all: { min: 2.3, max: 4.2 } },
    ft4: { all: { min: 0.8, max: 1.8 } }
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Tested using Chemiluminescent Immunoassay (CLIA)"
  },
  
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: true
};

// ==================== LIPID PROFILE TEMPLATE ====================

export const LIPID_TEMPLATE = {
  templateCode: "BLOOD_TEST_LIPID",
  templateName: "Lipid Profile Report",
  description: "Complete lipid panel with cardiovascular risk assessment",
  testCategory: "BLOOD_TEST",
  testSubCategory: "Biochemistry",
  testCode: "LAB_LIPID_001",
  templateType: "TABULAR",
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "BIOCHEMISTRY REPORT",
    subtitle: "Lipid Profile"
  },
  
  sections: [
    {
      id: "patient_info",
      title: "Patient Information",
      type: "info_block",
      layout: "two_column",
      fields: [
        { key: "patientName", label: "Patient Name" },
        { key: "uhid", label: "UHID" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "referringDoctor", label: "Ref. Doctor" },
        { key: "fastingStatus", label: "Fasting Status" }
      ],
      visible: true,
      order: 1
    },
    {
      id: "lipid_panel",
      title: "Lipid Panel",
      type: "table",
      columns: [
        { key: "parameter", label: "Test", width: "30%" },
        { key: "result", label: "Result", width: "15%", align: "right" },
        { key: "unit", label: "Unit", width: "15%", align: "center" },
        { key: "desirable", label: "Desirable", width: "20%", align: "center" },
        { key: "status", label: "Status", width: "20%", align: "center" }
      ],
      parameters: [
        { id: "total_cholesterol", label: "Total Cholesterol", unit: "mg/dL" },
        { id: "triglycerides", label: "Triglycerides", unit: "mg/dL" },
        { id: "hdl", label: "HDL Cholesterol", unit: "mg/dL" },
        { id: "ldl", label: "LDL Cholesterol", unit: "mg/dL" },
        { id: "vldl", label: "VLDL Cholesterol", unit: "mg/dL" },
        { id: "tc_hdl_ratio", label: "TC/HDL Ratio", unit: "" },
        { id: "ldl_hdl_ratio", label: "LDL/HDL Ratio", unit: "" },
        { id: "non_hdl", label: "Non-HDL Cholesterol", unit: "mg/dL" }
      ],
      visible: true,
      order: 2
    },
    {
      id: "risk_assessment",
      title: "Cardiovascular Risk Assessment",
      type: "key_value",
      fields: [
        { key: "risk_category", label: "Risk Category" },
        { key: "target_ldl", label: "Target LDL" }
      ],
      visible: true,
      showIfEmpty: false,
      order: 3
    },
    {
      id: "interpretation",
      title: "Interpretation",
      type: "text_block",
      visible: true,
      showIfEmpty: false,
      order: 4
    },
    {
      id: "signature",
      title: "",
      type: "signature_block",
      fields: [
        { key: "technicianName", label: "Lab Technician" },
        { key: "pathologistName", label: "Pathologist" }
      ],
      visible: true,
      order: 5
    }
  ],
  
  entryFields: [
    { id: "total_cholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", required: true },
    { id: "triglycerides", label: "Triglycerides", type: "number", unit: "mg/dL", required: true },
    { id: "hdl", label: "HDL Cholesterol", type: "number", unit: "mg/dL", required: true },
    { id: "ldl", label: "LDL Cholesterol", type: "number", unit: "mg/dL", required: false, calculated: true },
    { id: "vldl", label: "VLDL Cholesterol", type: "number", unit: "mg/dL", required: false, calculated: true },
    { id: "fastingStatus", label: "Fasting Status", type: "select", options: ["Fasting (12 hrs)", "Non-Fasting"], required: true },
    { id: "interpretation", label: "Interpretation", type: "textarea", required: false }
  ],
  
  referenceRanges: {
    total_cholesterol: { 
      desirable: { max: 200 },
      borderline: { min: 200, max: 239 },
      high: { min: 240 }
    },
    triglycerides: {
      normal: { max: 150 },
      borderline: { min: 150, max: 199 },
      high: { min: 200, max: 499 },
      veryHigh: { min: 500 }
    },
    hdl: {
      male: { low: { max: 40 }, desirable: { min: 40 } },
      female: { low: { max: 50 }, desirable: { min: 50 } }
    },
    ldl: {
      optimal: { max: 100 },
      nearOptimal: { min: 100, max: 129 },
      borderline: { min: 130, max: 159 },
      high: { min: 160, max: 189 },
      veryHigh: { min: 190 }
    }
  },
  
  // Calculated field formulas
  calculations: {
    vldl: "triglycerides / 5",
    ldl: "total_cholesterol - hdl - vldl",
    tc_hdl_ratio: "total_cholesterol / hdl",
    ldl_hdl_ratio: "ldl / hdl",
    non_hdl: "total_cholesterol - hdl"
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    note: "LDL calculated using Friedewald formula. Valid only if Triglycerides < 400 mg/dL"
  },
  
  styling: COMMON_STYLING,
  printConfig: COMMON_PRINT_CONFIG,
  
  isSystemTemplate: true,
  isDefault: false
};

// ==================== EXPORT ALL TEMPLATES ====================

export const DEFAULT_TEMPLATES = [
  // Blood Tests
  BLOOD_TEST_DEFAULT_TEMPLATE,
  CBC_TEMPLATE,
  LFT_TEMPLATE,
  LIPID_TEMPLATE,
  TFT_TEMPLATE,
  
  // Imaging
  XRAY_TEMPLATE,
  USG_TEMPLATE,
  CT_TEMPLATE,
  MRI_TEMPLATE,
  
  // Cardiac
  ECG_TEMPLATE,
  ECHO_TEMPLATE,
  
  // Pathology
  PATHOLOGY_TEMPLATE,
  
  // Urine
  URINE_ROUTINE_TEMPLATE
];

// Template categories for easy lookup
export const TEMPLATE_CATEGORIES = {
  BLOOD_TEST: ['BLOOD_TEST_DEFAULT', 'BLOOD_TEST_CBC', 'BLOOD_TEST_LFT', 'BLOOD_TEST_LIPID'],
  HORMONES: ['HORMONE_TFT'],
  IMAGING: ['IMAGING_XRAY', 'IMAGING_USG', 'IMAGING_CT', 'IMAGING_MRI'],
  CARDIAC: ['CARDIAC_ECG', 'CARDIAC_ECHO'],
  PATHOLOGY: ['PATHOLOGY_HISTOPATH'],
  URINE: ['URINE_ROUTINE'],
  SEROLOGY: []
};

// Get template by code
export function getDefaultTemplateByCode(code) {
  return DEFAULT_TEMPLATES.find(t => t.templateCode === code);
}

// Get templates by category
export function getDefaultTemplatesByCategory(category) {
  return DEFAULT_TEMPLATES.filter(t => t.testCategory === category);
}

// Get default template for category
export function getDefaultTemplateForCategory(category) {
  return DEFAULT_TEMPLATES.find(t => t.testCategory === category && t.isDefault);
}
