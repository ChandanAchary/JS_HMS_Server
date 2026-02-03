/**
 * Indian Medical System Specific Templates
 * Comprehensive templates for all diagnostic tests in Indian hospitals
 * 
 * Template Types:
 * - TABULAR: Table-based results (blood tests, biochemistry)
 * - QUALITATIVE: Reactive/Non-reactive results (serology)
 * - NARRATIVE: Free-text reports (imaging, pathology)
 * - HYBRID: Combination of tables and narrative (culture, biopsy)
 * 
 * Compliance: NABL (ISO 15189), NABH, HL7 FHIR
 */

import {
  TEMPLATE_TYPES,
  DIAGNOSTIC_CATEGORIES,
  DEPARTMENTS,
  SUB_DEPARTMENTS,
  SPECIMEN_TYPES,
  TUBE_TYPES,
  INTERPRETATION_CODES,
  QUALITATIVE_RESULTS,
  CRITICAL_VALUES,
  LOINC_CODES,
  SNOMED_CODES,
  COMMON_ANTIBIOTICS,
  SENSITIVITY_RESULTS,
  NABL_SCOPES
} from '../../../../constants/diagnosticTemplates.js';

// ============================================================================
// COMMON CONFIGURATIONS
// ============================================================================

const COMMON_HEADER_CONFIG = {
  showLogo: true,
  showHospitalName: true,
  showHospitalAddress: true,
  showHospitalPhone: true,
  showPatientInfo: true,
  showDoctorInfo: true,
  showSpecimenInfo: true,
  showBarcodeId: true,
  showReportDate: true,
  showCollectionDate: true,
  accreditationInfo: {
    showNablLogo: true,
    nablNumber: null // Hospital specific
  }
};

const COMMON_FOOTER_CONFIG = {
  showSignature: true,
  showQRCode: false,
  showPageNumber: true,
  showPrintedBy: true,
  showPrintedAt: true,
  disclaimer: "This report is electronically generated and valid without signature. For queries, contact the laboratory.",
  nablDisclaimer: "Tests performed as per NABL accredited methods where applicable."
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
    normal: "#4CAF50",
    abnormal: "#FF9800",
    critical: "#F44336",
    low: "#2196F3",
    high: "#FF5722"
  },
  interpretationColors: {
    NORMAL: "#4CAF50",
    LOW: "#2196F3",
    HIGH: "#FF5722",
    CRITICAL_LOW: "#F44336",
    CRITICAL_HIGH: "#F44336",
    ABNORMAL: "#FF9800"
  }
};

const SIGN_OFF_CONFIG = {
  requiresTechnicianEntry: true,
  requiresQCCheck: true,
  requiresPathologistReview: true,
  requiresDigitalSignature: false,
  autoLockOnSignOff: true,
  amendmentAllowed: true,
  amendmentRequiresApproval: true
};

// ============================================================================
// QUALITATIVE TEMPLATES (Serology - Indian Specific)
// ============================================================================

/**
 * Widal Test Template (Typhoid Fever - Very common in India)
 */
export const WIDAL_TEMPLATE = {
  templateCode: "SEROLOGY_WIDAL_V1",
  templateName: "Widal Test Report",
  description: "Widal agglutination test for Typhoid fever diagnosis",
  category: DIAGNOSTIC_CATEGORIES.SEROLOGY,
  department: DEPARTMENTS.LAB,
  subDepartment: SUB_DEPARTMENTS.SEROLOGY,
  templateType: TEMPLATE_TYPES.QUALITATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "SEROLOGY REPORT",
    subtitle: "Widal Agglutination Test"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.SERUM],
    tubeTypes: ['PLAIN', 'SST'],
    tubeColors: ['RED', 'RED_GOLD'],
    volume: "3ml",
    fastingRequired: false
  },
  
  sections: [
    {
      sectionId: "PATIENT_INFO",
      title: "Patient Information",
      layout: "INFO_BLOCK",
      order: 1
    },
    {
      sectionId: "SPECIMEN_INFO",
      title: "Specimen Details",
      layout: "KEY_VALUE",
      order: 2
    },
    {
      sectionId: "RESULTS",
      title: "Widal Titre Results",
      layout: "TABLE",
      order: 3
    },
    {
      sectionId: "INTERPRETATION",
      title: "Interpretation",
      layout: "TEXT",
      order: 4
    }
  ],
  
  fields: [
    {
      code: "TYPHI_O",
      label: "Salmonella typhi O (TO)",
      type: "select",
      options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320", ">1:320"],
      unit: "Titre",
      required: true,
      significantTitre: "1:80",
      order: 1
    },
    {
      code: "TYPHI_H",
      label: "Salmonella typhi H (TH)",
      type: "select",
      options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320", ">1:320"],
      unit: "Titre",
      required: true,
      significantTitre: "1:160",
      order: 2
    },
    {
      code: "PARATYPHI_AH",
      label: "Salmonella paratyphi AH",
      type: "select",
      options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320", ">1:320"],
      unit: "Titre",
      required: true,
      significantTitre: "1:160",
      order: 3
    },
    {
      code: "PARATYPHI_BH",
      label: "Salmonella paratyphi BH",
      type: "select",
      options: ["<1:20", "1:20", "1:40", "1:80", "1:160", "1:320", ">1:320"],
      unit: "Titre",
      required: true,
      significantTitre: "1:160",
      order: 4
    }
  ],
  
  referenceRanges: {
    TYPHI_O: { significantTitre: "≥1:80", note: "Four-fold rise in paired sera is diagnostic" },
    TYPHI_H: { significantTitre: "≥1:160", note: "Single high titre suggestive" },
    PARATYPHI_AH: { significantTitre: "≥1:160" },
    PARATYPHI_BH: { significantTitre: "≥1:160" }
  },
  
  interpretationRules: [
    {
      condition: "TYPHI_O >= '1:160' || TYPHI_H >= '1:320'",
      interpretation: "Significant titre suggestive of Typhoid fever. Clinical correlation advised."
    },
    {
      condition: "TYPHI_O >= '1:80' && TYPHI_H >= '1:160'",
      interpretation: "Titre suggestive of recent Salmonella typhi infection. Repeat test in 1 week for titre rise."
    },
    {
      condition: "TYPHI_O < '1:80' && TYPHI_H < '1:160'",
      interpretation: "Non-significant titre. Does not rule out early or treated typhoid."
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Tube agglutination method",
    note: "Widal test has limited sensitivity and specificity. Blood culture is the gold standard."
  },
  
  complianceConfig: {
    nablAccredited: true,
    nablScope: [NABL_SCOPES.SEROLOGY_IMMUNOLOGY],
    testMethodology: "Tube Agglutination Method"
  },
  
  fhirMapping: {
    resourceType: "DiagnosticReport",
    category: "laboratory",
    codeSystem: "LOINC",
    loincCode: "23836-4"
  },
  
  signOffConfig: {
    requiresTechnicianEntry: true,
    requiresQCCheck: false,
    requiresPathologistReview: true,
    autoLockOnSignOff: true
  },
  
  status: "ACTIVE",
  isSystemTemplate: true,
  isDefault: false
};

/**
 * Dengue NS1 Antigen + Serology Template (Endemic in India)
 */
export const DENGUE_TEMPLATE = {
  templateCode: "SEROLOGY_DENGUE_V1",
  templateName: "Dengue Test Report",
  description: "Dengue NS1 Antigen and IgM/IgG Antibody detection",
  category: DIAGNOSTIC_CATEGORIES.SEROLOGY,
  department: DEPARTMENTS.LAB,
  subDepartment: SUB_DEPARTMENTS.SEROLOGY,
  templateType: TEMPLATE_TYPES.QUALITATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "SEROLOGY REPORT",
    subtitle: "Dengue Detection Panel"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.SERUM],
    tubeTypes: ['SST', 'PLAIN'],
    volume: "3ml",
    fastingRequired: false
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "RESULTS", title: "Test Results", layout: "TABLE", order: 2 },
    { sectionId: "INTERPRETATION", title: "Interpretation", layout: "TEXT", order: 3 }
  ],
  
  fields: [
    {
      code: "DENGUE_NS1",
      label: "Dengue NS1 Antigen",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.POSITIVE, QUALITATIVE_RESULTS.NEGATIVE],
      required: true,
      clinicalWindow: "Day 1-7 of fever",
      criticalValue: QUALITATIVE_RESULTS.POSITIVE,
      order: 1
    },
    {
      code: "DENGUE_IGM",
      label: "Dengue IgM Antibody",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.REACTIVE, QUALITATIVE_RESULTS.NON_REACTIVE],
      required: true,
      clinicalWindow: "Day 5 onwards",
      order: 2
    },
    {
      code: "DENGUE_IGG",
      label: "Dengue IgG Antibody",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.REACTIVE, QUALITATIVE_RESULTS.NON_REACTIVE],
      required: true,
      clinicalWindow: "Secondary infection indicator",
      order: 3
    }
  ],
  
  interpretationRules: [
    {
      condition: "DENGUE_NS1 === 'POSITIVE' && DENGUE_IGM === 'NON_REACTIVE'",
      interpretation: "Primary Dengue Infection (Acute phase, Day 1-5). Monitor platelet count closely."
    },
    {
      condition: "DENGUE_NS1 === 'POSITIVE' && DENGUE_IGM === 'REACTIVE'",
      interpretation: "Active Dengue Infection. High risk for severe dengue if IgG positive."
    },
    {
      condition: "DENGUE_NS1 === 'NEGATIVE' && DENGUE_IGM === 'REACTIVE'",
      interpretation: "Probable Dengue Infection (Day 5+). NS1 may become negative after Day 5."
    },
    {
      condition: "DENGUE_IGG === 'REACTIVE' && DENGUE_IGM === 'REACTIVE'",
      interpretation: "Secondary Dengue Infection. Higher risk of Dengue Hemorrhagic Fever/Dengue Shock Syndrome."
    }
  ],
  
  criticalValueRules: {
    DENGUE_NS1: { type: 'QUALITATIVE', criticalValue: 'POSITIVE', requiresNotification: true }
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Immunochromatographic Assay (Rapid Card Test)",
    note: "Negative result does not rule out Dengue. Repeat test if clinical suspicion persists."
  },
  
  status: "ACTIVE",
  isSystemTemplate: true,
  isDefault: false
};

/**
 * Malaria Antigen Detection Template
 */
export const MALARIA_TEMPLATE = {
  templateCode: "SEROLOGY_MALARIA_V1",
  templateName: "Malaria Antigen Test Report",
  description: "Rapid Diagnostic Test for P. falciparum and P. vivax",
  category: DIAGNOSTIC_CATEGORIES.SEROLOGY,
  department: DEPARTMENTS.LAB,
  templateType: TEMPLATE_TYPES.QUALITATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "PARASITOLOGY REPORT",
    subtitle: "Malaria Antigen Detection"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "RESULTS", title: "Test Results", layout: "TABLE", order: 2 },
    { sectionId: "COMMENTS", title: "Comments", layout: "TEXT", order: 3 }
  ],
  
  fields: [
    {
      code: "PF_HRP2",
      label: "P. falciparum (HRP-2 Antigen)",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.POSITIVE, QUALITATIVE_RESULTS.NEGATIVE],
      required: true,
      criticalValue: QUALITATIVE_RESULTS.POSITIVE,
      order: 1
    },
    {
      code: "PAN_PLDH",
      label: "Pan Malaria (pLDH Antigen)",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.POSITIVE, QUALITATIVE_RESULTS.NEGATIVE],
      required: true,
      order: 2
    },
    {
      code: "PV_PLDH",
      label: "P. vivax (Pv-pLDH Antigen)",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.POSITIVE, QUALITATIVE_RESULTS.NEGATIVE],
      required: false,
      order: 3
    }
  ],
  
  interpretationRules: [
    {
      condition: "PF_HRP2 === 'POSITIVE'",
      interpretation: "Plasmodium falciparum malaria detected. URGENT: Initiate treatment immediately."
    },
    {
      condition: "PF_HRP2 === 'NEGATIVE' && PAN_PLDH === 'POSITIVE'",
      interpretation: "Non-falciparum malaria detected (likely P. vivax or P. ovale)."
    }
  ],
  
  criticalValueRules: {
    PF_HRP2: { type: 'QUALITATIVE', criticalValue: 'POSITIVE', requiresNotification: true, reason: 'Cerebral malaria risk' }
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    note: "Microscopy (GIEMSA smear) is recommended for parasite count. Card test may remain positive after treatment."
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * HIV Screening Template
 */
export const HIV_TEMPLATE = {
  templateCode: "SEROLOGY_HIV_V1",
  templateName: "HIV Screening Test Report",
  description: "HIV-1 and HIV-2 Antibody Detection (NACO Guidelines)",
  category: DIAGNOSTIC_CATEGORIES.SEROLOGY,
  department: DEPARTMENTS.LAB,
  subDepartment: SUB_DEPARTMENTS.SEROLOGY,
  templateType: TEMPLATE_TYPES.QUALITATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "SEROLOGY REPORT",
    subtitle: "HIV Antibody Screening",
    showConfidentialityWarning: true
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "RESULTS", title: "Screening Result", layout: "TABLE", order: 2 },
    { sectionId: "INTERPRETATION", title: "Interpretation", layout: "TEXT", order: 3 }
  ],
  
  fields: [
    {
      code: "HIV_SCREENING",
      label: "HIV 1 & 2 Antibody",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.REACTIVE, QUALITATIVE_RESULTS.NON_REACTIVE],
      required: true,
      order: 1
    }
  ],
  
  interpretationRules: [
    {
      condition: "HIV_SCREENING === 'NON_REACTIVE'",
      interpretation: "Non-Reactive for HIV-1 and HIV-2 antibodies. Window period of 3 months should be considered."
    },
    {
      condition: "HIV_SCREENING === 'REACTIVE'",
      interpretation: "Reactive for HIV antibodies. Sample referred for confirmatory testing as per NACO guidelines."
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Fourth Generation ELISA (Antigen/Antibody combination)",
    disclaimer: "This is a screening test. Reactive results must be confirmed by NACO-approved confirmatory tests.",
    confidentialityNote: "This report is strictly confidential and should be handled as per NACO guidelines."
  },
  
  complianceConfig: {
    nablAccredited: true,
    nacoGuidelines: true,
    reportFormat: "NACO_HIV_FORMAT"
  },
  
  fhirMapping: {
    loincCode: LOINC_CODES.HIV_1_2_ANTIBODY,
    codeSystem: "LOINC"
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * Hepatitis B Surface Antigen (HBsAg)
 */
export const HBSAG_TEMPLATE = {
  templateCode: "SEROLOGY_HBSAG_V1",
  templateName: "Hepatitis B Surface Antigen (HBsAg) Report",
  description: "HBsAg screening test for Hepatitis B infection",
  category: DIAGNOSTIC_CATEGORIES.SEROLOGY,
  department: DEPARTMENTS.LAB,
  templateType: TEMPLATE_TYPES.QUALITATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "SEROLOGY REPORT",
    subtitle: "HBsAg Screening"
  },
  
  fields: [
    {
      code: "HBSAG",
      label: "Hepatitis B Surface Antigen (HBsAg)",
      type: "qualitative",
      options: [QUALITATIVE_RESULTS.REACTIVE, QUALITATIVE_RESULTS.NON_REACTIVE],
      required: true
    }
  ],
  
  interpretationRules: [
    {
      condition: "HBSAG === 'REACTIVE'",
      interpretation: "HBsAg Reactive indicates Hepatitis B infection (acute or chronic). HBV DNA and HBeAg recommended."
    },
    {
      condition: "HBSAG === 'NON_REACTIVE'",
      interpretation: "HBsAg Non-Reactive. Does not rule out occult HBV or resolved infection."
    }
  ],
  
  fhirMapping: {
    loincCode: LOINC_CODES.HBSAG
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

// ============================================================================
// TABULAR TEMPLATES (Lab Tests - Indian Specific)
// ============================================================================

/**
 * Kidney Function Test (KFT) - Commonly used in India
 */
export const KFT_TEMPLATE = {
  templateCode: "BIOCHEM_KFT_V1",
  templateName: "Kidney Function Test (KFT) Report",
  description: "Renal panel with eGFR calculation",
  category: DIAGNOSTIC_CATEGORIES.BIOCHEMISTRY,
  department: DEPARTMENTS.LAB,
  subDepartment: SUB_DEPARTMENTS.CLINICAL_BIOCHEMISTRY,
  templateType: TEMPLATE_TYPES.TABULAR,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "BIOCHEMISTRY REPORT",
    subtitle: "Kidney Function Test"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.SERUM],
    tubeTypes: ['SST'],
    tubeColors: ['RED_GOLD'],
    volume: "3ml",
    fastingRequired: false
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Details", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "RESULTS", title: "Kidney Function Parameters", layout: "TABLE", order: 2 },
    { sectionId: "INTERPRETATION", title: "Interpretation", layout: "TEXT", order: 3 }
  ],
  
  fields: [
    {
      code: "UREA",
      label: "Blood Urea",
      type: "number",
      unit: "mg/dL",
      required: true,
      validation: { min: 0, max: 300, step: 0.1 },
      loincCode: LOINC_CODES.UREA,
      order: 1
    },
    {
      code: "CREATININE",
      label: "Serum Creatinine",
      type: "number",
      unit: "mg/dL",
      required: true,
      validation: { min: 0, max: 30, step: 0.01 },
      criticalValues: CRITICAL_VALUES.CREATININE,
      loincCode: LOINC_CODES.CREATININE,
      order: 2
    },
    {
      code: "BUN",
      label: "Blood Urea Nitrogen (BUN)",
      type: "calculated",
      unit: "mg/dL",
      formula: "UREA / 2.14",
      order: 3
    },
    {
      code: "URIC_ACID",
      label: "Uric Acid",
      type: "number",
      unit: "mg/dL",
      required: true,
      validation: { min: 0, max: 20, step: 0.1 },
      order: 4
    },
    {
      code: "EGFR",
      label: "eGFR (CKD-EPI)",
      type: "calculated",
      unit: "mL/min/1.73m²",
      formula: "CKD_EPI(CREATININE, AGE, GENDER)",
      order: 5
    }
  ],
  
  referenceRanges: {
    UREA: { all: { min: 15, max: 45 } },
    CREATININE: {
      male: { min: 0.7, max: 1.3 },
      female: { min: 0.6, max: 1.1 }
    },
    BUN: { all: { min: 7, max: 21 } },
    URIC_ACID: {
      male: { min: 3.5, max: 7.2 },
      female: { min: 2.5, max: 6.0 }
    },
    EGFR: {
      all: {
        normal: { min: 90, label: "Normal or High" },
        mild: { min: 60, max: 89, label: "Mildly decreased (CKD Stage 2)" },
        moderate_a: { min: 45, max: 59, label: "Mild-Moderate (CKD Stage 3a)" },
        moderate_b: { min: 30, max: 44, label: "Moderate-Severe (CKD Stage 3b)" },
        severe: { min: 15, max: 29, label: "Severely decreased (CKD Stage 4)" },
        failure: { max: 15, label: "Kidney Failure (CKD Stage 5)" }
      }
    }
  },
  
  calculatedFields: [
    {
      code: "BUN",
      label: "Blood Urea Nitrogen",
      formula: "UREA / 2.14",
      precision: 1
    },
    {
      code: "EGFR",
      label: "eGFR (CKD-EPI 2021)",
      formula: "CKD_EPI_2021(CREATININE, AGE, GENDER)",
      precision: 0,
      note: "CKD-EPI 2021 equation (race-neutral)"
    }
  ],
  
  interpretationRules: [
    {
      condition: "EGFR < 60",
      interpretation: "Decreased eGFR suggests chronic kidney disease. Correlate with proteinuria."
    },
    {
      condition: "CREATININE > 5.0",
      interpretation: "Significantly elevated creatinine. Evaluate for acute kidney injury or ESRD."
    }
  ],
  
  criticalValueRules: {
    CREATININE: { criticalHigh: 10.0, requiresNotification: true }
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Jaffe/Enzymatic method on automated analyzer",
    note: "eGFR calculated using CKD-EPI 2021 equation. Not validated for AKI."
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * Complete Thyroid Profile
 */
export const THYROID_COMPLETE_TEMPLATE = {
  templateCode: "HORMONE_THYROID_V1",
  templateName: "Complete Thyroid Profile Report",
  description: "Comprehensive thyroid panel with TSH, T3, T4, Free T3, Free T4",
  category: DIAGNOSTIC_CATEGORIES.HORMONES,
  department: DEPARTMENTS.LAB,
  templateType: TEMPLATE_TYPES.TABULAR,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "HORMONE ASSAY REPORT",
    subtitle: "Thyroid Function Test"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.SERUM],
    tubeTypes: ['SST'],
    volume: "3ml",
    fastingRequired: false,
    specialInstructions: "Morning sample preferred. Note if patient on thyroid medication."
  },
  
  fields: [
    {
      code: "TSH",
      label: "Thyroid Stimulating Hormone (TSH)",
      type: "number",
      unit: "µIU/mL",
      required: true,
      validation: { min: 0, max: 150, step: 0.001 },
      loincCode: LOINC_CODES.TSH,
      order: 1
    },
    {
      code: "T3_TOTAL",
      label: "Total T3",
      type: "number",
      unit: "ng/dL",
      required: true,
      validation: { min: 0, max: 500, step: 0.1 },
      loincCode: LOINC_CODES.T3_TOTAL,
      order: 2
    },
    {
      code: "T4_TOTAL",
      label: "Total T4",
      type: "number",
      unit: "µg/dL",
      required: true,
      validation: { min: 0, max: 30, step: 0.1 },
      loincCode: LOINC_CODES.T4_TOTAL,
      order: 3
    },
    {
      code: "FT3",
      label: "Free T3",
      type: "number",
      unit: "pg/mL",
      required: false,
      validation: { min: 0, max: 20, step: 0.01 },
      loincCode: LOINC_CODES.T3_FREE,
      order: 4
    },
    {
      code: "FT4",
      label: "Free T4",
      type: "number",
      unit: "ng/dL",
      required: false,
      validation: { min: 0, max: 10, step: 0.01 },
      loincCode: LOINC_CODES.T4_FREE,
      order: 5
    }
  ],
  
  referenceRanges: {
    TSH: {
      adult: { min: 0.4, max: 4.5 },
      pregnant_first_trimester: { min: 0.1, max: 2.5 },
      pregnant_second_trimester: { min: 0.2, max: 3.0 },
      pregnant_third_trimester: { min: 0.3, max: 3.0 },
      neonate: { min: 1.0, max: 20.0 }
    },
    T3_TOTAL: { adult: { min: 80, max: 200 } },
    T4_TOTAL: { adult: { min: 5.0, max: 12.5 } },
    FT3: { adult: { min: 2.0, max: 4.2 } },
    FT4: { adult: { min: 0.8, max: 1.8 } }
  },
  
  interpretationRules: [
    {
      condition: "TSH > 10 && T4_TOTAL < 5",
      interpretation: "Findings consistent with Primary Hypothyroidism. Consider Anti-TPO antibodies."
    },
    {
      condition: "TSH < 0.1 && T3_TOTAL > 200",
      interpretation: "Findings suggestive of Hyperthyroidism. Consider TSI/TRAb for Graves' disease."
    },
    {
      condition: "TSH < 0.4 && T3_TOTAL > 200 && T4_TOTAL < 5",
      interpretation: "Pattern suggests T3 thyrotoxicosis."
    },
    {
      condition: "TSH > 4.5 && T4_TOTAL >= 5 && T4_TOTAL <= 12.5",
      interpretation: "Subclinical hypothyroidism. Consider repeat test in 6-8 weeks."
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Chemiluminescence Immunoassay (CLIA)",
    note: "Thyroid function varies with pregnancy, age, and medications. Clinical correlation required."
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * Complete Blood Count (CBC) with ESR
 */
export const CBC_COMPLETE_TEMPLATE = {
  templateCode: "HEMATOLOGY_CBC_V1",
  templateName: "Complete Blood Count (CBC) with ESR",
  description: "Full hemogram with differential count and ESR",
  category: DIAGNOSTIC_CATEGORIES.HEMATOLOGY,
  department: DEPARTMENTS.LAB,
  subDepartment: SUB_DEPARTMENTS.HEMATOLOGY,
  templateType: TEMPLATE_TYPES.TABULAR,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "HEMATOLOGY REPORT",
    subtitle: "Complete Blood Count"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.EDTA_BLOOD],
    tubeTypes: ['EDTA'],
    tubeColors: ['PURPLE'],
    volume: "2ml",
    fastingRequired: false,
    processingTime: "Within 4 hours of collection"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Details", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "RBC_PANEL", title: "Red Blood Cell Parameters", layout: "TABLE", order: 2 },
    { sectionId: "WBC_PANEL", title: "White Blood Cell Parameters", layout: "TABLE", order: 3 },
    { sectionId: "PLATELET_PANEL", title: "Platelet Parameters", layout: "TABLE", order: 4 },
    { sectionId: "ESR", title: "Erythrocyte Sedimentation Rate", layout: "TABLE", order: 5 },
    { sectionId: "INTERPRETATION", title: "Interpretation", layout: "TEXT", order: 6 }
  ],
  
  fields: [
    // RBC Parameters
    {
      code: "HB",
      label: "Hemoglobin",
      type: "number",
      unit: "g/dL",
      sectionId: "RBC_PANEL",
      required: true,
      validation: { min: 0, max: 25, step: 0.1 },
      criticalValues: CRITICAL_VALUES.HEMOGLOBIN,
      loincCode: LOINC_CODES.HEMOGLOBIN,
      order: 1
    },
    {
      code: "RBC",
      label: "RBC Count",
      type: "number",
      unit: "million/µL",
      sectionId: "RBC_PANEL",
      required: true,
      validation: { min: 0, max: 10, step: 0.01 },
      loincCode: LOINC_CODES.RBC_COUNT,
      order: 2
    },
    {
      code: "PCV",
      label: "Packed Cell Volume (HCT)",
      type: "number",
      unit: "%",
      sectionId: "RBC_PANEL",
      required: true,
      validation: { min: 0, max: 70, step: 0.1 },
      criticalValues: CRITICAL_VALUES.HEMATOCRIT,
      loincCode: LOINC_CODES.HEMATOCRIT,
      order: 3
    },
    {
      code: "MCV",
      label: "MCV",
      type: "number",
      unit: "fL",
      sectionId: "RBC_PANEL",
      required: true,
      loincCode: LOINC_CODES.MCV,
      order: 4
    },
    {
      code: "MCH",
      label: "MCH",
      type: "number",
      unit: "pg",
      sectionId: "RBC_PANEL",
      required: true,
      loincCode: LOINC_CODES.MCH,
      order: 5
    },
    {
      code: "MCHC",
      label: "MCHC",
      type: "number",
      unit: "g/dL",
      sectionId: "RBC_PANEL",
      required: true,
      loincCode: LOINC_CODES.MCHC,
      order: 6
    },
    {
      code: "RDW_CV",
      label: "RDW-CV",
      type: "number",
      unit: "%",
      sectionId: "RBC_PANEL",
      required: false,
      order: 7
    },
    
    // WBC Parameters
    {
      code: "WBC",
      label: "Total WBC Count",
      type: "number",
      unit: "/µL",
      sectionId: "WBC_PANEL",
      required: true,
      validation: { min: 0, max: 100000, step: 100 },
      criticalValues: CRITICAL_VALUES.WBC_COUNT,
      loincCode: LOINC_CODES.WBC_COUNT,
      order: 8
    },
    {
      code: "NEUTROPHILS",
      label: "Neutrophils",
      type: "number",
      unit: "%",
      sectionId: "WBC_PANEL",
      required: true,
      order: 9
    },
    {
      code: "LYMPHOCYTES",
      label: "Lymphocytes",
      type: "number",
      unit: "%",
      sectionId: "WBC_PANEL",
      required: true,
      order: 10
    },
    {
      code: "MONOCYTES",
      label: "Monocytes",
      type: "number",
      unit: "%",
      sectionId: "WBC_PANEL",
      required: true,
      order: 11
    },
    {
      code: "EOSINOPHILS",
      label: "Eosinophils",
      type: "number",
      unit: "%",
      sectionId: "WBC_PANEL",
      required: true,
      order: 12
    },
    {
      code: "BASOPHILS",
      label: "Basophils",
      type: "number",
      unit: "%",
      sectionId: "WBC_PANEL",
      required: true,
      order: 13
    },
    
    // Platelet Parameters
    {
      code: "PLATELET",
      label: "Platelet Count",
      type: "number",
      unit: "/µL",
      sectionId: "PLATELET_PANEL",
      required: true,
      validation: { min: 0, max: 2000000, step: 1000 },
      criticalValues: CRITICAL_VALUES.PLATELET_COUNT,
      loincCode: LOINC_CODES.PLATELET_COUNT,
      order: 14
    },
    {
      code: "MPV",
      label: "Mean Platelet Volume",
      type: "number",
      unit: "fL",
      sectionId: "PLATELET_PANEL",
      required: false,
      order: 15
    },
    
    // ESR
    {
      code: "ESR",
      label: "ESR (Westergren Method)",
      type: "number",
      unit: "mm/1st hr",
      sectionId: "ESR",
      required: true,
      loincCode: LOINC_CODES.ESR,
      order: 16
    }
  ],
  
  referenceRanges: {
    HB: {
      male: { adult: { min: 13.0, max: 17.0 } },
      female: { adult: { min: 12.0, max: 16.0 }, pregnant: { min: 11.0, max: 14.0 } },
      child: { min: 11.0, max: 14.0 },
      neonate: { min: 14.0, max: 22.0 }
    },
    RBC: {
      male: { min: 4.5, max: 5.9 },
      female: { min: 4.0, max: 5.2 }
    },
    PCV: {
      male: { min: 40, max: 54 },
      female: { min: 36, max: 48 }
    },
    MCV: { all: { min: 80, max: 100 } },
    MCH: { all: { min: 27, max: 32 } },
    MCHC: { all: { min: 32, max: 36 } },
    RDW_CV: { all: { min: 11.5, max: 14.5 } },
    WBC: { adult: { min: 4000, max: 11000 }, child: { min: 5000, max: 15000 } },
    NEUTROPHILS: { all: { min: 40, max: 70 } },
    LYMPHOCYTES: { all: { min: 20, max: 45 } },
    MONOCYTES: { all: { min: 2, max: 10 } },
    EOSINOPHILS: { all: { min: 1, max: 6 } },
    BASOPHILS: { all: { min: 0, max: 2 } },
    PLATELET: { all: { min: 150000, max: 450000 } },
    MPV: { all: { min: 7.5, max: 11.5 } },
    ESR: {
      male: { below50: { max: 15 }, above50: { max: 20 } },
      female: { below50: { max: 20 }, above50: { max: 30 } }
    }
  },
  
  calculatedFields: [
    {
      code: "ANC",
      label: "Absolute Neutrophil Count",
      formula: "(NEUTROPHILS / 100) * WBC",
      unit: "/µL"
    },
    {
      code: "ALC",
      label: "Absolute Lymphocyte Count",
      formula: "(LYMPHOCYTES / 100) * WBC",
      unit: "/µL"
    },
    {
      code: "AEC",
      label: "Absolute Eosinophil Count",
      formula: "(EOSINOPHILS / 100) * WBC",
      unit: "/µL"
    }
  ],
  
  interpretationRules: [
    {
      condition: "HB < 10 && MCV < 80",
      interpretation: "Microcytic hypochromic anemia. Consider iron deficiency. Suggest Iron studies, Peripheral smear."
    },
    {
      condition: "HB < 10 && MCV > 100",
      interpretation: "Macrocytic anemia. Consider Vitamin B12/Folate deficiency or liver disease."
    },
    {
      condition: "WBC > 15000 && NEUTROPHILS > 75",
      interpretation: "Neutrophilic leukocytosis. Suggestive of bacterial infection. Correlate clinically."
    },
    {
      condition: "PLATELET < 100000",
      interpretation: "Thrombocytopenia. Investigate cause - viral infection, dengue, ITP, drug-induced."
    },
    {
      condition: "EOSINOPHILS > 10",
      interpretation: "Eosinophilia. Consider parasitic infection, allergic conditions, or drug reaction."
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Automated Hematology Analyzer (5-part differential)",
    equipmentInfo: "Sysmex/Mindray/Beckman Coulter"
  },
  
  complianceConfig: {
    nablAccredited: true,
    nablScope: [NABL_SCOPES.HEMATOLOGY]
  },
  
  status: "ACTIVE",
  isSystemTemplate: true,
  isDefault: true
};

// ============================================================================
// HYBRID TEMPLATES (Culture & Sensitivity, Biopsy)
// ============================================================================

/**
 * Culture and Sensitivity Template (Universal - Urine/Blood/Wound/Sputum)
 */
export const CULTURE_SENSITIVITY_TEMPLATE = {
  templateCode: "MICROBIOLOGY_CULTURE_V1",
  templateName: "Culture and Sensitivity Report",
  description: "Universal culture report with antibiotic sensitivity panel",
  category: DIAGNOSTIC_CATEGORIES.MICROBIOLOGY,
  department: DEPARTMENTS.MICROBIOLOGY,
  subDepartment: SUB_DEPARTMENTS.MICROBIOLOGY,
  templateType: TEMPLATE_TYPES.HYBRID,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "MICROBIOLOGY REPORT",
    subtitle: "Culture and Sensitivity"
  },
  
  specimenConfig: {
    sampleTypes: [
      SPECIMEN_TYPES.URINE,
      SPECIMEN_TYPES.BLOOD,
      SPECIMEN_TYPES.WOUND_SWAB,
      SPECIMEN_TYPES.SPUTUM,
      SPECIMEN_TYPES.STOOL,
      SPECIMEN_TYPES.THROAT_SWAB,
      SPECIMEN_TYPES.CSF,
      SPECIMEN_TYPES.PLEURAL_FLUID
    ],
    allowMultipleSpecimens: true
  },
  
  supportsMultiSpecimen: true,
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "SPECIMEN_INFO", title: "Specimen Details", layout: "KEY_VALUE", order: 2 },
    { sectionId: "MACROSCOPY", title: "Macroscopic Examination", layout: "TEXT", order: 3 },
    { sectionId: "MICROSCOPY", title: "Microscopic Examination", layout: "TEXT", order: 4 },
    { sectionId: "CULTURE_RESULT", title: "Culture Result", layout: "TEXT", order: 5 },
    { sectionId: "ORGANISMS", title: "Organisms Isolated", layout: "REPEATABLE", order: 6 },
    { sectionId: "SENSITIVITY", title: "Antibiotic Sensitivity", layout: "TABLE", order: 7 },
    { sectionId: "COMMENTS", title: "Comments", layout: "TEXT", order: 8 }
  ],
  
  fields: [
    // Specimen Info
    {
      code: "SPECIMEN_TYPE",
      label: "Specimen Type",
      type: "select",
      options: Object.values(SPECIMEN_TYPES).filter(s => s !== 'IMAGING' && s !== 'NONE'),
      sectionId: "SPECIMEN_INFO",
      required: true,
      order: 1
    },
    {
      code: "COLLECTION_DATE",
      label: "Collection Date & Time",
      type: "datetime",
      sectionId: "SPECIMEN_INFO",
      required: true,
      order: 2
    },
    
    // Microscopy
    {
      code: "PUS_CELLS",
      label: "Pus Cells",
      type: "text",
      unit: "/HPF",
      sectionId: "MICROSCOPY",
      placeholder: "e.g., 10-15, >100, Plenty",
      order: 3
    },
    {
      code: "RBC_MICRO",
      label: "RBCs",
      type: "text",
      unit: "/HPF",
      sectionId: "MICROSCOPY",
      order: 4
    },
    {
      code: "EPITHELIAL_CELLS",
      label: "Epithelial Cells",
      type: "text",
      unit: "/HPF",
      sectionId: "MICROSCOPY",
      order: 5
    },
    {
      code: "GRAM_STAIN",
      label: "Gram Stain",
      type: "textarea",
      sectionId: "MICROSCOPY",
      placeholder: "Gram positive cocci in clusters, Gram negative bacilli, etc.",
      order: 6
    },
    
    // Culture Result
    {
      code: "CULTURE_RESULT",
      label: "Culture Result",
      type: "select",
      options: [
        QUALITATIVE_RESULTS.NO_GROWTH,
        QUALITATIVE_RESULTS.GROWTH_PRESENT,
        QUALITATIVE_RESULTS.SIGNIFICANT_GROWTH
      ],
      sectionId: "CULTURE_RESULT",
      required: true,
      order: 7
    },
    {
      code: "COLONY_COUNT",
      label: "Colony Count (for Urine)",
      type: "text",
      sectionId: "CULTURE_RESULT",
      placeholder: "e.g., >10^5 CFU/ml, 10^4 CFU/ml",
      conditionalShow: "SPECIMEN_TYPE === 'URINE'",
      order: 8
    }
  ],
  
  // Repeatable section for multiple organisms
  repeatableSections: [
    {
      sectionId: "ORGANISM",
      label: "Organism Isolated",
      maxRepeats: 5,
      fields: [
        {
          code: "ORGANISM_NAME",
          label: "Organism",
          type: "select",
          options: Object.values(COMMON_ORGANISMS),
          allowCustom: true,
          required: true
        },
        {
          code: "COLONY_MORPHOLOGY",
          label: "Colony Morphology",
          type: "text"
        },
        {
          code: "SIGNIFICANCE",
          label: "Clinical Significance",
          type: "select",
          options: ["Pathogen", "Commensal", "Contaminant", "Colonizer"]
        }
      ],
      sensitivityPanel: {
        antibiotics: COMMON_ANTIBIOTICS,
        resultOptions: Object.values(SENSITIVITY_RESULTS)
      }
    }
  ],
  
  criticalValueRules: {
    POSITIVE_BLOOD_CULTURE: { type: 'QUALITATIVE', criticalValue: 'GROWTH_PRESENT', requiresNotification: true },
    POSITIVE_CSF_CULTURE: { type: 'QUALITATIVE', criticalValue: 'GROWTH_PRESENT', requiresNotification: true }
  },
  
  interpretationRules: [
    {
      condition: "SPECIMEN_TYPE === 'URINE' && COLONY_COUNT === '>10^5 CFU/ml' && PUS_CELLS > 10",
      interpretation: "Significant bacteriuria with pyuria. Consistent with Urinary Tract Infection."
    },
    {
      condition: "SPECIMEN_TYPE === 'BLOOD' && CULTURE_RESULT === 'GROWTH_PRESENT'",
      interpretation: "CRITICAL: Positive blood culture. Immediate physician notification required."
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "BACTEC/BacTAlert for blood culture. Conventional culture on appropriate media.",
    note: "Sensitivity reported as per CLSI guidelines. S=Sensitive, I=Intermediate, R=Resistant"
  },
  
  complianceConfig: {
    nablAccredited: true,
    nablScope: [NABL_SCOPES.MICROBIOLOGY],
    clsiGuidelines: true
  },
  
  signOffConfig: {
    requiresTechnicianEntry: true,
    requiresQCCheck: true,
    requiresMicrobiologistReview: true,
    autoLockOnSignOff: true,
    amendmentAllowed: true
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * Histopathology Biopsy Report Template
 */
export const HISTOPATHOLOGY_TEMPLATE = {
  templateCode: "PATHOLOGY_BIOPSY_V1",
  templateName: "Histopathology Biopsy Report",
  description: "Tissue biopsy examination report with microscopic findings",
  category: DIAGNOSTIC_CATEGORIES.HISTOPATHOLOGY,
  department: DEPARTMENTS.PATHOLOGY,
  subDepartment: SUB_DEPARTMENTS.HISTOPATHOLOGY,
  templateType: TEMPLATE_TYPES.HYBRID,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "HISTOPATHOLOGY REPORT",
    subtitle: "Biopsy Examination"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.TISSUE, SPECIMEN_TYPES.BIOPSY],
    allowMultipleSpecimens: true,
    preservative: "10% Formalin"
  },
  
  supportsMultiSpecimen: true,
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "CLINICAL_INFO", title: "Clinical Information", layout: "KEY_VALUE", order: 2 },
    { sectionId: "SPECIMEN_INFO", title: "Specimen Details", layout: "KEY_VALUE", order: 3 },
    { sectionId: "GROSS_EXAMINATION", title: "Gross Examination (Macroscopy)", layout: "TEXT", order: 4 },
    { sectionId: "MICROSCOPIC_EXAMINATION", title: "Microscopic Examination", layout: "TEXT", order: 5 },
    { sectionId: "SPECIAL_STAINS", title: "Special Stains / IHC", layout: "TABLE", order: 6 },
    { sectionId: "DIAGNOSIS", title: "Diagnosis", layout: "TEXT", order: 7 },
    { sectionId: "COMMENTS", title: "Comments", layout: "TEXT", order: 8 },
    { sectionId: "IMAGES", title: "Microscopic Images", layout: "IMAGE_GALLERY", order: 9 }
  ],
  
  fields: [
    // Clinical Info
    {
      code: "CLINICAL_HISTORY",
      label: "Clinical History",
      type: "textarea",
      sectionId: "CLINICAL_INFO",
      required: true,
      order: 1
    },
    {
      code: "CLINICAL_DIAGNOSIS",
      label: "Clinical Diagnosis",
      type: "text",
      sectionId: "CLINICAL_INFO",
      order: 2
    },
    {
      code: "SITE_OF_BIOPSY",
      label: "Site of Biopsy",
      type: "text",
      sectionId: "SPECIMEN_INFO",
      required: true,
      order: 3
    },
    {
      code: "LATERALITY",
      label: "Laterality",
      type: "select",
      options: ["Left", "Right", "Bilateral", "Midline", "Not Applicable"],
      sectionId: "SPECIMEN_INFO",
      order: 4
    },
    
    // Gross Examination
    {
      code: "GROSS_DESCRIPTION",
      label: "Gross Description",
      type: "richtext",
      sectionId: "GROSS_EXAMINATION",
      required: true,
      placeholder: "Describe specimen appearance, size, color, consistency, cut surface...",
      order: 5
    },
    {
      code: "SPECIMEN_SIZE",
      label: "Specimen Size",
      type: "text",
      unit: "cm",
      sectionId: "GROSS_EXAMINATION",
      placeholder: "e.g., 2 x 1.5 x 1 cm",
      order: 6
    },
    {
      code: "BLOCKS_SUBMITTED",
      label: "Blocks Submitted",
      type: "text",
      sectionId: "GROSS_EXAMINATION",
      placeholder: "e.g., A1-A3 (3 blocks)",
      order: 7
    },
    
    // Microscopic Examination
    {
      code: "MICROSCOPIC_FINDINGS",
      label: "Microscopic Findings",
      type: "richtext",
      sectionId: "MICROSCOPIC_EXAMINATION",
      required: true,
      order: 8
    },
    
    // Diagnosis
    {
      code: "HISTOPATHOLOGICAL_DIAGNOSIS",
      label: "Histopathological Diagnosis",
      type: "richtext",
      sectionId: "DIAGNOSIS",
      required: true,
      order: 9
    },
    {
      code: "TUMOR_GRADE",
      label: "Tumor Grade (if applicable)",
      type: "select",
      options: ["Grade I (Well differentiated)", "Grade II (Moderately differentiated)", "Grade III (Poorly differentiated)", "Grade IV (Undifferentiated)", "Not Applicable"],
      sectionId: "DIAGNOSIS",
      conditionalShow: "IS_MALIGNANT",
      order: 10
    },
    {
      code: "MARGIN_STATUS",
      label: "Margin Status",
      type: "select",
      options: ["Free of tumor", "Involved by tumor", "Close to margin (<1mm)", "Not assessable", "Not Applicable"],
      sectionId: "DIAGNOSIS",
      order: 11
    },
    {
      code: "TNM_STAGING",
      label: "TNM Staging (if applicable)",
      type: "text",
      sectionId: "DIAGNOSIS",
      placeholder: "e.g., pT2N0Mx",
      order: 12
    },
    
    // Comments
    {
      code: "PATHOLOGIST_COMMENTS",
      label: "Comments",
      type: "textarea",
      sectionId: "COMMENTS",
      order: 13
    }
  ],
  
  repeatableSections: [
    {
      sectionId: "SPECIAL_STAIN",
      label: "Special Stain / IHC Marker",
      maxRepeats: 20,
      fields: [
        { code: "STAIN_NAME", label: "Stain / Marker", type: "text", required: true },
        { code: "RESULT", label: "Result", type: "select", options: ["Positive", "Negative", "Weak Positive", "Focal Positive", "Not Done"] },
        { code: "PATTERN", label: "Pattern", type: "text", placeholder: "e.g., Membranous, Cytoplasmic, Nuclear" }
      ]
    }
  ],
  
  attachmentConfig: {
    allowImages: true,
    maxImages: 10,
    allowPDF: true,
    imageTypes: ["H&E", "IHC", "Special Stain", "Gross Photo"]
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    disclaimer: "This report is based on the material submitted. Final diagnosis should be correlated with clinical findings.",
    methodology: "Routine H&E staining, IHC where indicated"
  },
  
  complianceConfig: {
    nablAccredited: true,
    nablScope: [NABL_SCOPES.HISTOPATHOLOGY],
    capGuidelines: true
  },
  
  signOffConfig: {
    requiresTechnicianEntry: true,
    requiresHistotechnologistReview: true,
    requiresPathologistReview: true,
    requiresSeniorPathologistReview: false,
    autoLockOnSignOff: true,
    amendmentAllowed: true,
    amendmentRequiresApproval: true
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

// ============================================================================
// NARRATIVE TEMPLATES (Imaging - Indian Radiology Standards)
// ============================================================================

/**
 * X-Ray Chest Template
 */
export const XRAY_CHEST_TEMPLATE = {
  templateCode: "RADIOLOGY_XRAY_CHEST_V1",
  templateName: "X-Ray Chest Report",
  description: "Chest X-Ray PA and lateral view report",
  category: DIAGNOSTIC_CATEGORIES.RADIOLOGY,
  department: DEPARTMENTS.RADIOLOGY,
  subDepartment: SUB_DEPARTMENTS.GENERAL_XRAY,
  templateType: TEMPLATE_TYPES.NARRATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "RADIOLOGY REPORT",
    subtitle: "X-Ray Chest"
  },
  
  specimenConfig: {
    sampleTypes: [SPECIMEN_TYPES.IMAGING],
    type: "IMAGING"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "EXAM_DETAILS", title: "Examination Details", layout: "KEY_VALUE", order: 2 },
    { sectionId: "CLINICAL_HISTORY", title: "Clinical History", layout: "TEXT", order: 3 },
    { sectionId: "TECHNIQUE", title: "Technique", layout: "TEXT", order: 4 },
    { sectionId: "FINDINGS", title: "Findings", layout: "RICH_TEXT", order: 5 },
    { sectionId: "IMPRESSION", title: "Impression", layout: "TEXT", order: 6 },
    { sectionId: "RECOMMENDATION", title: "Recommendation", layout: "TEXT", order: 7 },
    { sectionId: "IMAGES", title: "Key Images", layout: "IMAGE_GALLERY", order: 8 }
  ],
  
  fields: [
    {
      code: "EXAMINATION",
      label: "Examination",
      type: "select",
      options: ["X-Ray Chest PA View", "X-Ray Chest AP View", "X-Ray Chest PA & Lateral", "X-Ray Chest AP Erect", "X-Ray Chest Supine"],
      sectionId: "EXAM_DETAILS",
      required: true,
      order: 1
    },
    {
      code: "CLINICAL_INDICATION",
      label: "Clinical History / Indication",
      type: "textarea",
      sectionId: "CLINICAL_HISTORY",
      required: true,
      placeholder: "e.g., Cough x 2 weeks, fever, breathlessness",
      order: 2
    },
    {
      code: "COMPARISON",
      label: "Comparison",
      type: "text",
      sectionId: "TECHNIQUE",
      placeholder: "Prior study dated...",
      order: 3
    },
    {
      code: "TECHNIQUE_NOTES",
      label: "Technical Quality",
      type: "select",
      options: ["Adequate", "Suboptimal - rotated", "Suboptimal - underexposed", "Suboptimal - overexposed", "Portable examination"],
      sectionId: "TECHNIQUE",
      order: 4
    },
    
    // Structured Findings
    {
      code: "LUNGS",
      label: "Lungs",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Both lung fields are clear. No evidence of consolidation, mass, or nodule. No pleural effusion.",
      order: 5
    },
    {
      code: "HEART",
      label: "Heart & Mediastinum",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Heart size is within normal limits. Mediastinal contours are normal.",
      order: 6
    },
    {
      code: "DIAPHRAGM",
      label: "Diaphragm",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Both hemidiaphragms are normal in position and contour. Costophrenic angles are clear.",
      order: 7
    },
    {
      code: "BONES",
      label: "Bony Thorax",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Visualized bones appear normal. No focal bony lesion seen.",
      order: 8
    },
    {
      code: "SOFT_TISSUE",
      label: "Soft Tissues",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Soft tissues appear unremarkable.",
      order: 9
    },
    
    // Impression & Recommendation
    {
      code: "IMPRESSION_TEXT",
      label: "Impression",
      type: "richtext",
      sectionId: "IMPRESSION",
      required: true,
      placeholder: "Summarize key findings...",
      order: 10
    },
    {
      code: "RECOMMENDATION_TEXT",
      label: "Recommendation",
      type: "textarea",
      sectionId: "RECOMMENDATION",
      placeholder: "Clinical correlation recommended. / CT Chest suggested for further evaluation. / Follow-up X-Ray in 6 weeks.",
      order: 11
    }
  ],
  
  attachmentConfig: {
    allowImages: true,
    maxImages: 5,
    allowDICOM: true
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    disclaimer: "This report is based on the submitted images. Clinical correlation is essential.",
    radiologyNote: "Key images attached for reference."
  },
  
  signOffConfig: {
    requiresTechnicianEntry: false,
    requiresQCCheck: false,
    requiresRadiologistReview: true,
    autoLockOnSignOff: true
  },
  
  fhirMapping: {
    resourceType: "ImagingStudy",
    snomedCode: SNOMED_CODES.XRAY_CHEST
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * USG Abdomen Template
 */
export const USG_ABDOMEN_TEMPLATE = {
  templateCode: "RADIOLOGY_USG_ABD_V1",
  templateName: "USG Abdomen Report",
  description: "Ultrasound examination of whole abdomen",
  category: DIAGNOSTIC_CATEGORIES.RADIOLOGY,
  department: DEPARTMENTS.RADIOLOGY,
  subDepartment: SUB_DEPARTMENTS.ULTRASOUND,
  templateType: TEMPLATE_TYPES.NARRATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "RADIOLOGY REPORT",
    subtitle: "Ultrasonography - Abdomen"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "CLINICAL_HISTORY", title: "Clinical History", layout: "TEXT", order: 2 },
    { sectionId: "FINDINGS", title: "Findings", layout: "TEXT", order: 3 },
    { sectionId: "IMPRESSION", title: "Impression", layout: "TEXT", order: 4 }
  ],
  
  fields: [
    {
      code: "CLINICAL_INDICATION",
      label: "Clinical Indication",
      type: "textarea",
      sectionId: "CLINICAL_HISTORY",
      required: true,
      order: 1
    },
    
    // Organ-wise Findings
    {
      code: "LIVER",
      label: "Liver",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Liver is normal in size with smooth margins. Parenchymal echotexture is homogeneous. No focal lesion seen. Intrahepatic biliary radicles are not dilated.",
      order: 2
    },
    {
      code: "GALLBLADDER",
      label: "Gall Bladder",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Gall bladder is well distended with normal wall thickness. No calculus or polyp seen. CBD is not dilated.",
      order: 3
    },
    {
      code: "PANCREAS",
      label: "Pancreas",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Pancreas is normal in size and echotexture. Main pancreatic duct is not dilated.",
      order: 4
    },
    {
      code: "SPLEEN",
      label: "Spleen",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Spleen is normal in size with homogeneous echotexture. No focal lesion seen.",
      order: 5
    },
    {
      code: "RIGHT_KIDNEY",
      label: "Right Kidney",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Right kidney is normal in size, shape and position. Cortico-medullary differentiation is maintained. No calculus, mass or hydronephrosis.",
      order: 6
    },
    {
      code: "LEFT_KIDNEY",
      label: "Left Kidney",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Left kidney is normal in size, shape and position. Cortico-medullary differentiation is maintained. No calculus, mass or hydronephrosis.",
      order: 7
    },
    {
      code: "URINARY_BLADDER",
      label: "Urinary Bladder",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Urinary bladder is well distended with normal wall thickness. No calculus or mass seen.",
      order: 8
    },
    {
      code: "PROSTATE_UTERUS",
      label: "Prostate / Uterus & Adnexa",
      type: "richtext",
      sectionId: "FINDINGS",
      genderDependent: true,
      order: 9
    },
    {
      code: "AORTA_IVC",
      label: "Aorta & IVC",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Aorta and IVC appear normal.",
      order: 10
    },
    {
      code: "FREE_FLUID",
      label: "Peritoneal Cavity",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "No free fluid in peritoneal cavity.",
      order: 11
    },
    
    {
      code: "IMPRESSION_TEXT",
      label: "Impression",
      type: "richtext",
      sectionId: "IMPRESSION",
      required: true,
      order: 12
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    disclaimer: "Ultrasound is operator-dependent. Findings should be correlated clinically."
  },
  
  signOffConfig: {
    requiresRadiologistReview: true,
    autoLockOnSignOff: true
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * CT Head Template
 */
export const CT_HEAD_TEMPLATE = {
  templateCode: "RADIOLOGY_CT_HEAD_V1",
  templateName: "CT Head Report",
  description: "Non-contrast and/or Contrast CT Head examination",
  category: DIAGNOSTIC_CATEGORIES.RADIOLOGY,
  department: DEPARTMENTS.RADIOLOGY,
  subDepartment: SUB_DEPARTMENTS.CT_SCAN,
  templateType: TEMPLATE_TYPES.NARRATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "RADIOLOGY REPORT",
    subtitle: "CT Head"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "EXAM_DETAILS", title: "Examination Details", layout: "KEY_VALUE", order: 2 },
    { sectionId: "CLINICAL_HISTORY", title: "Clinical History", layout: "TEXT", order: 3 },
    { sectionId: "TECHNIQUE", title: "Technique", layout: "TEXT", order: 4 },
    { sectionId: "FINDINGS", title: "Findings", layout: "RICH_TEXT", order: 5 },
    { sectionId: "IMPRESSION", title: "Impression", layout: "TEXT", order: 6 }
  ],
  
  fields: [
    {
      code: "EXAMINATION_TYPE",
      label: "Examination",
      type: "select",
      options: ["CT Head Plain", "CT Head with Contrast", "CT Head Plain + Contrast"],
      sectionId: "EXAM_DETAILS",
      required: true,
      order: 1
    },
    {
      code: "CLINICAL_INDICATION",
      label: "Clinical Indication",
      type: "textarea",
      sectionId: "CLINICAL_HISTORY",
      required: true,
      placeholder: "e.g., Head injury, stroke, headache",
      order: 2
    },
    {
      code: "TECHNIQUE_DETAILS",
      label: "Technique",
      type: "text",
      sectionId: "TECHNIQUE",
      defaultValue: "Axial sections from foramen magnum to vertex without IV contrast.",
      order: 3
    },
    {
      code: "COMPARISON",
      label: "Comparison",
      type: "text",
      sectionId: "TECHNIQUE",
      placeholder: "Prior CT dated...",
      order: 4
    },
    
    // Findings
    {
      code: "BRAIN_PARENCHYMA",
      label: "Brain Parenchyma",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Brain parenchyma shows normal attenuation. No evidence of infarct, hemorrhage or mass lesion. Grey-white matter differentiation is preserved.",
      order: 5
    },
    {
      code: "VENTRICLES",
      label: "Ventricular System",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Ventricular system is normal in size and configuration. No midline shift.",
      order: 6
    },
    {
      code: "EXTRA_AXIAL",
      label: "Extra-axial Spaces",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Extra-axial spaces are within normal limits. No subdural or epidural collection.",
      order: 7
    },
    {
      code: "SKULL_BASE",
      label: "Skull & Skull Base",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Calvarium and skull base appear intact. No fracture seen.",
      order: 8
    },
    {
      code: "PNS",
      label: "Paranasal Sinuses",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Visualized paranasal sinuses are clear.",
      order: 9
    },
    {
      code: "ORBITS",
      label: "Orbits",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Orbits appear unremarkable.",
      order: 10
    },
    
    {
      code: "IMPRESSION_TEXT",
      label: "Impression",
      type: "richtext",
      sectionId: "IMPRESSION",
      required: true,
      order: 11
    }
  ],
  
  criticalValueRules: {
    ACUTE_STROKE: { type: 'NARRATIVE', requiresNotification: true },
    INTRACRANIAL_HEMORRHAGE: { type: 'NARRATIVE', requiresNotification: true },
    MASS_EFFECT: { type: 'NARRATIVE', requiresNotification: true }
  },
  
  fhirMapping: {
    resourceType: "ImagingStudy",
    snomedCode: SNOMED_CODES.CT_SCAN
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * MRI Brain Template
 */
export const MRI_BRAIN_TEMPLATE = {
  templateCode: "RADIOLOGY_MRI_BRAIN_V1",
  templateName: "MRI Brain Report",
  description: "MRI Brain with or without contrast",
  category: DIAGNOSTIC_CATEGORIES.RADIOLOGY,
  department: DEPARTMENTS.RADIOLOGY,
  subDepartment: SUB_DEPARTMENTS.MRI,
  templateType: TEMPLATE_TYPES.NARRATIVE,
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "RADIOLOGY REPORT",
    subtitle: "MRI Brain"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "CLINICAL_HISTORY", title: "Clinical History", layout: "TEXT", order: 2 },
    { sectionId: "TECHNIQUE", title: "Technique", layout: "TEXT", order: 3 },
    { sectionId: "FINDINGS", title: "Findings", layout: "RICH_TEXT", order: 4 },
    { sectionId: "IMPRESSION", title: "Impression", layout: "TEXT", order: 5 },
    { sectionId: "RECOMMENDATION", title: "Recommendation", layout: "TEXT", order: 6 }
  ],
  
  fields: [
    {
      code: "EXAMINATION_TYPE",
      label: "Examination",
      type: "select",
      options: ["MRI Brain Plain", "MRI Brain with Contrast", "MRI Brain Plain + Contrast", "MRI Brain with MRA", "MRI Brain Epilepsy Protocol"],
      sectionId: "EXAM_DETAILS",
      required: true,
      order: 1
    },
    {
      code: "FIELD_STRENGTH",
      label: "Field Strength",
      type: "select",
      options: ["1.5 Tesla", "3.0 Tesla"],
      sectionId: "TECHNIQUE",
      order: 2
    },
    {
      code: "SEQUENCES",
      label: "Sequences Performed",
      type: "text",
      sectionId: "TECHNIQUE",
      defaultValue: "Axial T1W, T2W, FLAIR, DWI, ADC, Sagittal T1W, Coronal FLAIR",
      order: 3
    },
    {
      code: "CONTRAST",
      label: "Contrast",
      type: "text",
      sectionId: "TECHNIQUE",
      placeholder: "e.g., Gadolinium 10ml IV administered",
      order: 4
    },
    
    // Detailed Findings
    {
      code: "BRAIN_PARENCHYMA",
      label: "Brain Parenchyma",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Brain parenchyma shows normal signal intensity on T1W, T2W and FLAIR sequences. No abnormal signal intensity or restricted diffusion. No mass lesion or space occupying lesion.",
      order: 5
    },
    {
      code: "VENTRICLES",
      label: "Ventricular System",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Ventricular system is normal in size and morphology. No midline shift.",
      order: 6
    },
    {
      code: "WHITE_MATTER",
      label: "White Matter",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Periventricular and deep white matter show no abnormal signal intensity.",
      order: 7
    },
    {
      code: "BASAL_GANGLIA",
      label: "Basal Ganglia & Thalami",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Basal ganglia and thalami are normal in signal intensity.",
      order: 8
    },
    {
      code: "POSTERIOR_FOSSA",
      label: "Posterior Fossa",
      type: "richtext",
      sectionId: "FINDINGS",
      defaultValue: "Cerebellum and brainstem appear normal. CP angles are clear. Fourth ventricle is normal.",
      order: 9
    },
    {
      code: "SELLAR_REGION",
      label: "Sellar / Parasellar Region",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Pituitary gland appears normal. No sellar or parasellar mass.",
      order: 10
    },
    {
      code: "EXTRA_AXIAL",
      label: "Extra-axial Spaces",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "No extra-axial collection. Sulci and cisterns are normal.",
      order: 11
    },
    {
      code: "ORBITS",
      label: "Orbits",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Visualized portions of orbits are unremarkable.",
      order: 12
    },
    {
      code: "CALVARIUM",
      label: "Calvarium & Paranasal Sinuses",
      type: "text",
      sectionId: "FINDINGS",
      defaultValue: "Calvarium and visualized paranasal sinuses are normal.",
      order: 13
    },
    
    {
      code: "IMPRESSION_TEXT",
      label: "Impression",
      type: "richtext",
      sectionId: "IMPRESSION",
      required: true,
      order: 14
    },
    {
      code: "RECOMMENDATION_TEXT",
      label: "Recommendation",
      type: "textarea",
      sectionId: "RECOMMENDATION",
      order: 15
    }
  ],
  
  fhirMapping: {
    resourceType: "ImagingStudy",
    snomedCode: SNOMED_CODES.MRI
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

// ============================================================================
// CARDIOLOGY TEMPLATES
// ============================================================================

/**
 * ECG Report Template
 */
export const ECG_REPORT_TEMPLATE = {
  templateCode: "CARDIOLOGY_ECG_V1",
  templateName: "ECG Report",
  description: "12-Lead Electrocardiogram interpretation report",
  category: DIAGNOSTIC_CATEGORIES.CARDIOLOGY,
  department: DEPARTMENTS.CARDIOLOGY,
  subDepartment: SUB_DEPARTMENTS.ECG,
  templateType: TEMPLATE_TYPES.TABULAR, // ECG has structured parameters
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "CARDIOLOGY REPORT",
    subtitle: "12-Lead Electrocardiogram"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "CLINICAL_INFO", title: "Clinical Information", layout: "KEY_VALUE", order: 2 },
    { sectionId: "ECG_PARAMETERS", title: "ECG Parameters", layout: "TABLE", order: 3 },
    { sectionId: "INTERPRETATION", title: "Interpretation", layout: "TEXT", order: 4 },
    { sectionId: "ECG_IMAGE", title: "ECG Strip", layout: "IMAGE_GALLERY", order: 5 }
  ],
  
  fields: [
    // Clinical Info
    {
      code: "CLINICAL_INDICATION",
      label: "Indication",
      type: "text",
      sectionId: "CLINICAL_INFO",
      order: 1
    },
    {
      code: "MEDICATIONS",
      label: "Current Cardiac Medications",
      type: "text",
      sectionId: "CLINICAL_INFO",
      order: 2
    },
    
    // ECG Parameters
    {
      code: "HEART_RATE",
      label: "Heart Rate",
      type: "number",
      unit: "bpm",
      sectionId: "ECG_PARAMETERS",
      required: true,
      validation: { min: 20, max: 300 },
      order: 3
    },
    {
      code: "RHYTHM",
      label: "Rhythm",
      type: "select",
      options: ["Normal Sinus Rhythm", "Sinus Tachycardia", "Sinus Bradycardia", "Atrial Fibrillation", "Atrial Flutter", "SVT", "Ventricular Tachycardia", "Junctional Rhythm", "Paced Rhythm", "Other"],
      sectionId: "ECG_PARAMETERS",
      required: true,
      order: 4
    },
    {
      code: "PR_INTERVAL",
      label: "PR Interval",
      type: "number",
      unit: "ms",
      sectionId: "ECG_PARAMETERS",
      validation: { min: 0, max: 500 },
      order: 5
    },
    {
      code: "QRS_DURATION",
      label: "QRS Duration",
      type: "number",
      unit: "ms",
      sectionId: "ECG_PARAMETERS",
      validation: { min: 0, max: 300 },
      order: 6
    },
    {
      code: "QT_INTERVAL",
      label: "QT Interval",
      type: "number",
      unit: "ms",
      sectionId: "ECG_PARAMETERS",
      order: 7
    },
    {
      code: "QTC_INTERVAL",
      label: "QTc Interval",
      type: "calculated",
      unit: "ms",
      formula: "BAZETT(QT_INTERVAL, HEART_RATE)",
      sectionId: "ECG_PARAMETERS",
      order: 8
    },
    {
      code: "AXIS",
      label: "QRS Axis",
      type: "select",
      options: ["Normal Axis", "Left Axis Deviation", "Right Axis Deviation", "Extreme Axis Deviation", "Indeterminate"],
      sectionId: "ECG_PARAMETERS",
      order: 9
    },
    {
      code: "P_WAVE",
      label: "P Wave",
      type: "text",
      sectionId: "ECG_PARAMETERS",
      defaultValue: "Normal",
      order: 10
    },
    {
      code: "ST_SEGMENT",
      label: "ST Segment",
      type: "text",
      sectionId: "ECG_PARAMETERS",
      defaultValue: "Isoelectric",
      order: 11
    },
    {
      code: "T_WAVE",
      label: "T Wave",
      type: "text",
      sectionId: "ECG_PARAMETERS",
      defaultValue: "Normal",
      order: 12
    },
    
    // Interpretation
    {
      code: "ECG_INTERPRETATION",
      label: "Interpretation",
      type: "richtext",
      sectionId: "INTERPRETATION",
      required: true,
      order: 13
    }
  ],
  
  referenceRanges: {
    HEART_RATE: { adult: { min: 60, max: 100 } },
    PR_INTERVAL: { all: { min: 120, max: 200 } },
    QRS_DURATION: { all: { max: 120 } },
    QTC_INTERVAL: {
      male: { max: 450 },
      female: { max: 460 }
    }
  },
  
  calculatedFields: [
    {
      code: "QTC_INTERVAL",
      label: "QTc (Bazett)",
      formula: "QT_INTERVAL / SQRT(60 / HEART_RATE * 1000)",
      unit: "ms"
    }
  ],
  
  criticalValueRules: {
    ST_ELEVATION: { type: 'PATTERN', pattern: 'ST Elevation', requiresNotification: true },
    VENTRICULAR_TACHYCARDIA: { type: 'RHYTHM', value: 'Ventricular Tachycardia', requiresNotification: true },
    COMPLETE_HEART_BLOCK: { type: 'PATTERN', requiresNotification: true }
  },
  
  attachmentConfig: {
    allowImages: true,
    maxImages: 2,
    imageTypes: ["ECG Strip", "12-Lead Printout"]
  },
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    disclaimer: "ECG interpretation should be correlated with clinical findings."
  },
  
  fhirMapping: {
    snomedCode: SNOMED_CODES.ECG
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

/**
 * 2D Echocardiography Template
 */
export const ECHO_REPORT_TEMPLATE = {
  templateCode: "CARDIOLOGY_ECHO_V1",
  templateName: "2D Echocardiography Report",
  description: "Comprehensive echocardiography examination report",
  category: DIAGNOSTIC_CATEGORIES.CARDIOLOGY,
  department: DEPARTMENTS.CARDIOLOGY,
  subDepartment: SUB_DEPARTMENTS.ECHO,
  templateType: TEMPLATE_TYPES.HYBRID, // Has both tabular parameters and narrative
  
  headerConfig: {
    ...COMMON_HEADER_CONFIG,
    reportTitle: "CARDIOLOGY REPORT",
    subtitle: "2D Echocardiography with Doppler"
  },
  
  sections: [
    { sectionId: "PATIENT_INFO", title: "Patient Information", layout: "INFO_BLOCK", order: 1 },
    { sectionId: "CLINICAL_INFO", title: "Clinical Information", layout: "KEY_VALUE", order: 2 },
    { sectionId: "LV_PARAMETERS", title: "Left Ventricular Parameters", layout: "TABLE", order: 3 },
    { sectionId: "RV_PARAMETERS", title: "Right Ventricular Parameters", layout: "TABLE", order: 4 },
    { sectionId: "VALVES", title: "Valve Assessment", layout: "TABLE", order: 5 },
    { sectionId: "DOPPLER", title: "Doppler Assessment", layout: "TABLE", order: 6 },
    { sectionId: "FINDINGS", title: "Detailed Findings", layout: "RICH_TEXT", order: 7 },
    { sectionId: "IMPRESSION", title: "Impression", layout: "TEXT", order: 8 }
  ],
  
  fields: [
    // LV Parameters
    {
      code: "LVEF",
      label: "LV Ejection Fraction",
      type: "number",
      unit: "%",
      sectionId: "LV_PARAMETERS",
      required: true,
      validation: { min: 0, max: 100 },
      order: 1
    },
    {
      code: "LVIDD",
      label: "LVIDd",
      type: "number",
      unit: "cm",
      sectionId: "LV_PARAMETERS",
      order: 2
    },
    {
      code: "LVIDS",
      label: "LVIDs",
      type: "number",
      unit: "cm",
      sectionId: "LV_PARAMETERS",
      order: 3
    },
    {
      code: "IVS",
      label: "IVS Thickness",
      type: "number",
      unit: "cm",
      sectionId: "LV_PARAMETERS",
      order: 4
    },
    {
      code: "LVPW",
      label: "LVPW Thickness",
      type: "number",
      unit: "cm",
      sectionId: "LV_PARAMETERS",
      order: 5
    },
    {
      code: "LV_MASS",
      label: "LV Mass Index",
      type: "calculated",
      unit: "g/m²",
      sectionId: "LV_PARAMETERS",
      order: 6
    },
    
    // RV Parameters
    {
      code: "TAPSE",
      label: "TAPSE",
      type: "number",
      unit: "cm",
      sectionId: "RV_PARAMETERS",
      order: 7
    },
    {
      code: "RV_FUNCTION",
      label: "RV Function",
      type: "select",
      options: ["Normal", "Mildly reduced", "Moderately reduced", "Severely reduced"],
      sectionId: "RV_PARAMETERS",
      order: 8
    },
    
    // Valves
    {
      code: "MV_ASSESSMENT",
      label: "Mitral Valve",
      type: "select",
      options: ["Normal", "Mild MR", "Moderate MR", "Severe MR", "Mild MS", "Moderate MS", "Severe MS", "MVP"],
      sectionId: "VALVES",
      order: 9
    },
    {
      code: "AV_ASSESSMENT",
      label: "Aortic Valve",
      type: "select",
      options: ["Normal", "Mild AR", "Moderate AR", "Severe AR", "Mild AS", "Moderate AS", "Severe AS", "Bicuspid AV"],
      sectionId: "VALVES",
      order: 10
    },
    {
      code: "TV_ASSESSMENT",
      label: "Tricuspid Valve",
      type: "select",
      options: ["Normal", "Mild TR", "Moderate TR", "Severe TR"],
      sectionId: "VALVES",
      order: 11
    },
    {
      code: "PV_ASSESSMENT",
      label: "Pulmonary Valve",
      type: "select",
      options: ["Normal", "Mild PR", "Moderate PR"],
      sectionId: "VALVES",
      order: 12
    },
    
    // Doppler
    {
      code: "E_A_RATIO",
      label: "E/A Ratio",
      type: "number",
      sectionId: "DOPPLER",
      order: 13
    },
    {
      code: "PASP",
      label: "PASP (Estimated)",
      type: "number",
      unit: "mmHg",
      sectionId: "DOPPLER",
      order: 14
    },
    {
      code: "DIASTOLIC_DYSFUNCTION",
      label: "Diastolic Dysfunction",
      type: "select",
      options: ["Normal", "Grade I", "Grade II", "Grade III", "Indeterminate"],
      sectionId: "DOPPLER",
      order: 15
    },
    
    // Findings & Impression
    {
      code: "DETAILED_FINDINGS",
      label: "Detailed Findings",
      type: "richtext",
      sectionId: "FINDINGS",
      order: 16
    },
    {
      code: "IMPRESSION_TEXT",
      label: "Impression",
      type: "richtext",
      sectionId: "IMPRESSION",
      required: true,
      order: 17
    }
  ],
  
  referenceRanges: {
    LVEF: { all: { min: 55, max: 70 } },
    LVIDD: {
      male: { min: 4.2, max: 5.8 },
      female: { min: 3.8, max: 5.2 }
    },
    IVS: { all: { max: 1.1 } },
    LVPW: { all: { max: 1.1 } },
    TAPSE: { all: { min: 1.6 } },
    PASP: { all: { max: 30 } }
  },
  
  interpretationRules: [
    {
      condition: "LVEF < 40",
      interpretation: "Severe LV systolic dysfunction"
    },
    {
      condition: "LVEF >= 40 && LVEF < 50",
      interpretation: "Moderate LV systolic dysfunction"
    },
    {
      condition: "PASP > 40",
      interpretation: "Pulmonary hypertension"
    }
  ],
  
  footerConfig: {
    ...COMMON_FOOTER_CONFIG,
    methodology: "Transthoracic 2D Echocardiography with M-Mode and Doppler"
  },
  
  fhirMapping: {
    snomedCode: SNOMED_CODES.ECHOCARDIOGRAM
  },
  
  status: "ACTIVE",
  isSystemTemplate: true
};

// ============================================================================
// EXPORT ALL INDIAN TEMPLATES
// ============================================================================

export const INDIAN_TEMPLATES = [
  // Qualitative (Serology)
  WIDAL_TEMPLATE,
  DENGUE_TEMPLATE,
  MALARIA_TEMPLATE,
  HIV_TEMPLATE,
  HBSAG_TEMPLATE,
  
  // Tabular (Lab Tests)
  KFT_TEMPLATE,
  THYROID_COMPLETE_TEMPLATE,
  CBC_COMPLETE_TEMPLATE,
  
  // Hybrid (Culture, Biopsy)
  CULTURE_SENSITIVITY_TEMPLATE,
  HISTOPATHOLOGY_TEMPLATE,
  
  // Narrative (Imaging)
  XRAY_CHEST_TEMPLATE,
  USG_ABDOMEN_TEMPLATE,
  CT_HEAD_TEMPLATE,
  MRI_BRAIN_TEMPLATE,
  
  // Cardiology
  ECG_REPORT_TEMPLATE,
  ECHO_REPORT_TEMPLATE
];

// Export individual templates
export {
  COMMON_HEADER_CONFIG,
  COMMON_FOOTER_CONFIG,
  COMMON_PRINT_CONFIG,
  COMMON_STYLING,
  SIGN_OFF_CONFIG
};

// Get template by code
export function getIndianTemplateByCode(code) {
  return INDIAN_TEMPLATES.find(t => t.templateCode === code);
}

// Get templates by category
export function getIndianTemplatesByCategory(category) {
  return INDIAN_TEMPLATES.filter(t => t.category === category);
}

// Get templates by type
export function getIndianTemplatesByType(templateType) {
  return INDIAN_TEMPLATES.filter(t => t.templateType === templateType);
}

export default INDIAN_TEMPLATES;
