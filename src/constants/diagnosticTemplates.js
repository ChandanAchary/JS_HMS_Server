/**
 * Diagnostic Report Template Constants
 * Universal Template Engine for Indian Medical System
 * 
 * Compliance: NABL (ISO 15189), NABH, HL7 FHIR
 * Coverage: 100% of diagnostic tests in Indian hospitals
 * 
 * @version 2.0.0
 * @author Hospital Management System
 */

// ============================================================================
// TEMPLATE TYPES (Universal Engine - Covers ALL Diagnostic Tests)
// ============================================================================

/**
 * Four universal template patterns that cover 100% of diagnostic tests
 * Any diagnostic test can be rendered using one of these patterns
 */
export const TEMPLATE_TYPES = {
  TABULAR: 'TABULAR',       // CBC, LFT, KFT, Lipid, Electrolytes, Hormones, ECG values
  QUALITATIVE: 'QUALITATIVE', // HIV, HBsAg, Dengue, COVID, Pregnancy, Widal
  NARRATIVE: 'NARRATIVE',    // X-Ray, CT, MRI, Ultrasound, Endoscopy
  HYBRID: 'HYBRID'          // Biopsy, Histopathology, Culture & Sensitivity, Cytology
};

export const TEMPLATE_TYPE_DESCRIPTIONS = {
  TABULAR: 'Table-based results with parameters, values, units, and reference ranges',
  QUALITATIVE: 'Simple positive/negative or reactive/non-reactive results',
  NARRATIVE: 'Free-text reports with findings, impressions, and recommendations',
  HYBRID: 'Combination of tabular and narrative sections (Culture, Biopsy)'
};

// ============================================================================
// DIAGNOSTIC CATEGORIES (Indian Hospital Classification)
// ============================================================================

export const DIAGNOSTIC_CATEGORIES = {
  // Laboratory
  PATHOLOGY: 'PATHOLOGY',
  HEMATOLOGY: 'HEMATOLOGY',
  BIOCHEMISTRY: 'BIOCHEMISTRY',
  SEROLOGY: 'SEROLOGY',
  MICROBIOLOGY: 'MICROBIOLOGY',
  CLINICAL_PATHOLOGY: 'CLINICAL_PATHOLOGY',
  
  // Imaging
  RADIOLOGY: 'RADIOLOGY',
  IMAGING: 'IMAGING',
  
  // Specialized
  CARDIOLOGY: 'CARDIOLOGY',
  NEUROLOGY: 'NEUROLOGY',
  HISTOPATHOLOGY: 'HISTOPATHOLOGY',
  CYTOLOGY: 'CYTOLOGY',
  MOLECULAR: 'MOLECULAR',
  GENETICS: 'GENETICS',
  
  // Others
  HORMONES: 'HORMONES',
  IMMUNOLOGY: 'IMMUNOLOGY',
  TOXICOLOGY: 'TOXICOLOGY'
};

// ============================================================================
// DEPARTMENTS (Hospital Structure)
// ============================================================================

export const DEPARTMENTS = {
  LAB: 'LAB',
  RADIOLOGY: 'RADIOLOGY',
  CARDIOLOGY: 'CARDIOLOGY',
  NEUROLOGY: 'NEUROLOGY',
  PATHOLOGY: 'PATHOLOGY',
  MICROBIOLOGY: 'MICROBIOLOGY',
  BIOCHEMISTRY: 'BIOCHEMISTRY',
  NUCLEAR_MEDICINE: 'NUCLEAR_MEDICINE',
  PULMONOLOGY: 'PULMONOLOGY',
  GASTROENTEROLOGY: 'GASTROENTEROLOGY'
};

export const SUB_DEPARTMENTS = {
  // Lab Sub-departments
  HEMATOLOGY: 'HEMATOLOGY',
  CLINICAL_BIOCHEMISTRY: 'CLINICAL_BIOCHEMISTRY',
  SEROLOGY: 'SEROLOGY',
  IMMUNOLOGY: 'IMMUNOLOGY',
  MICROBIOLOGY: 'MICROBIOLOGY',
  CLINICAL_PATHOLOGY: 'CLINICAL_PATHOLOGY',
  HISTOPATHOLOGY: 'HISTOPATHOLOGY',
  CYTOLOGY: 'CYTOLOGY',
  MOLECULAR_DIAGNOSTICS: 'MOLECULAR_DIAGNOSTICS',
  
  // Radiology Sub-departments
  GENERAL_XRAY: 'GENERAL_XRAY',
  CT_SCAN: 'CT_SCAN',
  MRI: 'MRI',
  ULTRASOUND: 'ULTRASOUND',
  MAMMOGRAPHY: 'MAMMOGRAPHY',
  FLUOROSCOPY: 'FLUOROSCOPY',
  INTERVENTIONAL: 'INTERVENTIONAL',
  
  // Cardiology Sub-departments
  ECG: 'ECG',
  ECHO: 'ECHO',
  TMT: 'TMT',
  HOLTER: 'HOLTER',
  
  // Neurology Sub-departments
  EEG: 'EEG',
  EMG: 'EMG',
  NCV: 'NCV',
  EVOKED_POTENTIALS: 'EVOKED_POTENTIALS'
};

// ============================================================================
// SPECIMEN TYPES (Indian Medical Standards)
// ============================================================================

export const SPECIMEN_TYPES = {
  // Blood
  BLOOD: 'BLOOD',
  WHOLE_BLOOD: 'WHOLE_BLOOD',
  SERUM: 'SERUM',
  PLASMA: 'PLASMA',
  EDTA_BLOOD: 'EDTA_BLOOD',
  CITRATED_BLOOD: 'CITRATED_BLOOD',
  HEPARINIZED_BLOOD: 'HEPARINIZED_BLOOD',
  ARTERIAL_BLOOD: 'ARTERIAL_BLOOD',
  CAPILLARY_BLOOD: 'CAPILLARY_BLOOD',
  
  // Urine
  URINE: 'URINE',
  RANDOM_URINE: 'RANDOM_URINE',
  MIDSTREAM_URINE: 'MIDSTREAM_URINE',
  FIRST_VOID_URINE: 'FIRST_VOID_URINE',
  CATHETER_URINE: 'CATHETER_URINE',
  TWENTY_FOUR_HR_URINE: 'TWENTY_FOUR_HR_URINE',
  SUPRAPUBIC_URINE: 'SUPRAPUBIC_URINE',
  
  // Stool
  STOOL: 'STOOL',
  FRESH_STOOL: 'FRESH_STOOL',
  
  // Swabs
  SWAB: 'SWAB',
  THROAT_SWAB: 'THROAT_SWAB',
  NASAL_SWAB: 'NASAL_SWAB',
  NASOPHARYNGEAL_SWAB: 'NASOPHARYNGEAL_SWAB',
  WOUND_SWAB: 'WOUND_SWAB',
  VAGINAL_SWAB: 'VAGINAL_SWAB',
  URETHRAL_SWAB: 'URETHRAL_SWAB',
  EAR_SWAB: 'EAR_SWAB',
  EYE_SWAB: 'EYE_SWAB',
  RECTAL_SWAB: 'RECTAL_SWAB',
  
  // Body Fluids
  CSF: 'CSF',
  PLEURAL_FLUID: 'PLEURAL_FLUID',
  ASCITIC_FLUID: 'ASCITIC_FLUID',
  SYNOVIAL_FLUID: 'SYNOVIAL_FLUID',
  PERICARDIAL_FLUID: 'PERICARDIAL_FLUID',
  PERITONEAL_FLUID: 'PERITONEAL_FLUID',
  AMNIOTIC_FLUID: 'AMNIOTIC_FLUID',
  
  // Tissue
  TISSUE: 'TISSUE',
  BIOPSY: 'BIOPSY',
  FNAC: 'FNAC',
  BONE_MARROW: 'BONE_MARROW',
  
  // Sputum & Respiratory
  SPUTUM: 'SPUTUM',
  BAL: 'BAL', // Bronchoalveolar lavage
  TRACHEAL_ASPIRATE: 'TRACHEAL_ASPIRATE',
  
  // Others
  SEMEN: 'SEMEN',
  HAIR: 'HAIR',
  NAIL: 'NAIL',
  SKIN_SCRAPING: 'SKIN_SCRAPING',
  CALCULI: 'CALCULI',
  
  // Imaging (No specimen)
  IMAGING: 'IMAGING',
  NONE: 'NONE'
};

// ============================================================================
// TUBE TYPES & COLORS (Collection Tubes)
// ============================================================================

export const TUBE_TYPES = {
  EDTA: { color: 'PURPLE', anticoagulant: 'K2-EDTA', tests: ['CBC', 'HbA1c', 'ESR'] },
  SST: { color: 'RED_GOLD', anticoagulant: 'None + Gel', tests: ['LFT', 'KFT', 'Lipid', 'Thyroid'] },
  PLAIN: { color: 'RED', anticoagulant: 'None', tests: ['Serology', 'Blood Group'] },
  CITRATE: { color: 'BLUE', anticoagulant: 'Sodium Citrate', tests: ['PT', 'APTT', 'D-Dimer'] },
  HEPARIN: { color: 'GREEN', anticoagulant: 'Lithium Heparin', tests: ['Ammonia', 'Lactate'] },
  FLUORIDE: { color: 'GREY', anticoagulant: 'Sodium Fluoride + EDTA', tests: ['Glucose', 'GTT'] },
  SODIUM_CITRATE_ESR: { color: 'BLACK', anticoagulant: 'Sodium Citrate 3.8%', tests: ['ESR'] },
  ACD: { color: 'YELLOW', anticoagulant: 'Acid Citrate Dextrose', tests: ['DNA', 'HLA'] }
};

export const TUBE_COLORS = {
  PURPLE: 'PURPLE',
  RED: 'RED',
  RED_GOLD: 'RED_GOLD',
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  GREY: 'GREY',
  BLACK: 'BLACK',
  YELLOW: 'YELLOW'
};

// ============================================================================
// REPORT STATUS (Workflow States)
// ============================================================================

export const REPORT_STATUS = {
  DRAFT: 'DRAFT',             // Initial state
  ENTERED: 'ENTERED',         // Data entry complete
  QC_PENDING: 'QC_PENDING',   // Awaiting QC check
  QC_PASSED: 'QC_PASSED',     // QC approved
  QC_FAILED: 'QC_FAILED',     // QC rejected, needs re-entry
  REVIEW_PENDING: 'REVIEW_PENDING', // Awaiting pathologist/radiologist review
  APPROVED: 'APPROVED',       // Reviewed and approved
  RELEASED: 'RELEASED',       // Released to patient
  AMENDED: 'AMENDED',         // Post-release amendment
  CANCELLED: 'CANCELLED'      // Report cancelled
};

export const TEMPLATE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
  DEPRECATED: 'DEPRECATED'
};

// ============================================================================
// INTERPRETATION CODES
// ============================================================================

export const INTERPRETATION_CODES = {
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  HIGH: 'HIGH',
  CRITICAL_LOW: 'CRITICAL_LOW',
  CRITICAL_HIGH: 'CRITICAL_HIGH',
  ABNORMAL: 'ABNORMAL',
  BORDERLINE_LOW: 'BORDERLINE_LOW',
  BORDERLINE_HIGH: 'BORDERLINE_HIGH',
  INDETERMINATE: 'INDETERMINATE'
};

// ============================================================================
// QUALITATIVE RESULT VALUES (Standardized)
// ============================================================================

export const QUALITATIVE_RESULTS = {
  // Reactive/Non-reactive
  REACTIVE: 'REACTIVE',
  NON_REACTIVE: 'NON_REACTIVE',
  
  // Positive/Negative
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE',
  WEAKLY_POSITIVE: 'WEAKLY_POSITIVE',
  
  // Present/Absent
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  
  // Detected/Not Detected
  DETECTED: 'DETECTED',
  NOT_DETECTED: 'NOT_DETECTED',
  
  // Culture results
  NO_GROWTH: 'NO_GROWTH',
  GROWTH_PRESENT: 'GROWTH_PRESENT',
  SIGNIFICANT_GROWTH: 'SIGNIFICANT_GROWTH',
  
  // Pregnancy
  PREGNANT: 'PREGNANT',
  NOT_PREGNANT: 'NOT_PREGNANT',
  
  // Widal
  SIGNIFICANT_TITRE: 'SIGNIFICANT_TITRE',
  NON_SIGNIFICANT_TITRE: 'NON_SIGNIFICANT_TITRE',
  
  // General
  NORMAL: 'NORMAL',
  ABNORMAL: 'ABNORMAL',
  BORDERLINE: 'BORDERLINE',
  EQUIVOCAL: 'EQUIVOCAL',
  INDETERMINATE: 'INDETERMINATE'
};

// ============================================================================
// CRITICAL VALUE THRESHOLDS (Indian Standards)
// ============================================================================

/**
 * Critical values that require immediate notification to physician
 * Based on NABL guidelines and Indian medical practice
 */
export const CRITICAL_VALUES = {
  // Hematology
  HEMOGLOBIN: { criticalLow: 7.0, criticalHigh: 20.0, unit: 'g/dL' },
  WBC_COUNT: { criticalLow: 2000, criticalHigh: 30000, unit: '/µL' },
  PLATELET_COUNT: { criticalLow: 50000, criticalHigh: 1000000, unit: '/µL' },
  HEMATOCRIT: { criticalLow: 20, criticalHigh: 60, unit: '%' },
  
  // Biochemistry
  GLUCOSE_FASTING: { criticalLow: 40, criticalHigh: 500, unit: 'mg/dL' },
  GLUCOSE_RANDOM: { criticalLow: 40, criticalHigh: 500, unit: 'mg/dL' },
  SODIUM: { criticalLow: 120, criticalHigh: 160, unit: 'mEq/L' },
  POTASSIUM: { criticalLow: 2.5, criticalHigh: 6.5, unit: 'mEq/L' },
  CALCIUM: { criticalLow: 6.5, criticalHigh: 13.0, unit: 'mg/dL' },
  CREATININE: { criticalHigh: 10.0, unit: 'mg/dL' },
  BILIRUBIN_TOTAL: { criticalHigh: 15.0, unit: 'mg/dL' },
  AMMONIA: { criticalHigh: 100, unit: 'µmol/L' },
  
  // Coagulation
  PT_INR: { criticalHigh: 5.0, unit: '' },
  APTT: { criticalHigh: 100, unit: 'seconds' },
  
  // Blood Gases
  PH: { criticalLow: 7.2, criticalHigh: 7.6, unit: '' },
  PCO2: { criticalLow: 20, criticalHigh: 70, unit: 'mmHg' },
  PO2: { criticalLow: 40, criticalHigh: null, unit: 'mmHg' },
  
  // Cardiac Markers
  TROPONIN_I: { criticalHigh: 0.4, unit: 'ng/mL' },
  TROPONIN_T: { criticalHigh: 0.1, unit: 'ng/mL' },
  CK_MB: { criticalHigh: 10, unit: 'ng/mL' },
  
  // CSF
  CSF_GLUCOSE: { criticalLow: 20, criticalHigh: null, unit: 'mg/dL' },
  CSF_WBC: { criticalHigh: 10, unit: '/µL' },
  
  // Microbiology
  POSITIVE_BLOOD_CULTURE: { type: 'QUALITATIVE', criticalValue: 'POSITIVE' },
  POSITIVE_CSF_CULTURE: { type: 'QUALITATIVE', criticalValue: 'POSITIVE' }
};

// ============================================================================
// REFERENCE RANGE AGE GROUPS (Indian Population)
// ============================================================================

export const AGE_GROUPS = {
  NEONATE: { min: 0, max: 28, unit: 'days', label: 'Neonate' },
  INFANT: { min: 29, max: 365, unit: 'days', label: 'Infant' },
  TODDLER: { min: 1, max: 3, unit: 'years', label: 'Toddler' },
  CHILD: { min: 4, max: 12, unit: 'years', label: 'Child' },
  ADOLESCENT: { min: 13, max: 17, unit: 'years', label: 'Adolescent' },
  ADULT: { min: 18, max: 65, unit: 'years', label: 'Adult' },
  ELDERLY: { min: 66, max: 999, unit: 'years', label: 'Elderly' }
};

export const GENDER_TYPES = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  ALL: 'ALL' // When reference range is same for all genders
};

export const PREGNANCY_STATUS = {
  NOT_PREGNANT: 'NOT_PREGNANT',
  FIRST_TRIMESTER: 'FIRST_TRIMESTER',
  SECOND_TRIMESTER: 'SECOND_TRIMESTER',
  THIRD_TRIMESTER: 'THIRD_TRIMESTER',
  POSTPARTUM: 'POSTPARTUM'
};

// ============================================================================
// COMMON INDIAN DIAGNOSTIC TEST CODES (Frequently Used)
// ============================================================================

export const COMMON_TEST_CODES = {
  // Hematology
  CBC: 'LAB_CBC_001',
  CBC_ESR: 'LAB_CBC_ESR_001',
  ESR: 'LAB_ESR_001',
  HEMOGLOBIN: 'LAB_HB_001',
  BLOOD_GROUP: 'LAB_BLOOD_GROUP_001',
  PERIPHERAL_SMEAR: 'LAB_PS_001',
  RETICULOCYTE_COUNT: 'LAB_RETIC_001',
  
  // Biochemistry
  LFT: 'LAB_LFT_001',
  KFT: 'LAB_KFT_001',
  LIPID_PROFILE: 'LAB_LIPID_001',
  BLOOD_GLUCOSE_FASTING: 'LAB_GLU_F_001',
  BLOOD_GLUCOSE_PP: 'LAB_GLU_PP_001',
  BLOOD_GLUCOSE_RANDOM: 'LAB_GLU_R_001',
  HBA1C: 'LAB_HBA1C_001',
  ELECTROLYTES: 'LAB_ELEC_001',
  URIC_ACID: 'LAB_URIC_001',
  CALCIUM: 'LAB_CALCIUM_001',
  PHOSPHORUS: 'LAB_PHOSPHORUS_001',
  MAGNESIUM: 'LAB_MAGNESIUM_001',
  IRON_STUDIES: 'LAB_IRON_001',
  VITAMIN_D: 'LAB_VIT_D_001',
  VITAMIN_B12: 'LAB_VIT_B12_001',
  
  // Thyroid
  THYROID_PROFILE: 'LAB_THYROID_001',
  TSH: 'LAB_TSH_001',
  T3: 'LAB_T3_001',
  T4: 'LAB_T4_001',
  FREE_T3: 'LAB_FT3_001',
  FREE_T4: 'LAB_FT4_001',
  
  // Serology
  WIDAL: 'LAB_WIDAL_001',
  DENGUE_NS1: 'LAB_DENGUE_NS1_001',
  DENGUE_SEROLOGY: 'LAB_DENGUE_SER_001',
  MALARIA_ANTIGEN: 'LAB_MALARIA_001',
  HIV: 'LAB_HIV_001',
  HBSAG: 'LAB_HBSAG_001',
  HCV: 'LAB_HCV_001',
  VDRL: 'LAB_VDRL_001',
  CRP: 'LAB_CRP_001',
  RA_FACTOR: 'LAB_RA_001',
  ASO_TITRE: 'LAB_ASO_001',
  PREGNANCY_TEST: 'LAB_PREG_001',
  
  // Hormones
  PROLACTIN: 'LAB_PROLACTIN_001',
  LH: 'LAB_LH_001',
  FSH: 'LAB_FSH_001',
  ESTRADIOL: 'LAB_ESTRADIOL_001',
  TESTOSTERONE: 'LAB_TESTOSTERONE_001',
  CORTISOL: 'LAB_CORTISOL_001',
  PSA: 'LAB_PSA_001',
  BETA_HCG: 'LAB_BHCG_001',
  
  // Coagulation
  PT_INR: 'LAB_PT_001',
  APTT: 'LAB_APTT_001',
  BLEEDING_TIME: 'LAB_BT_001',
  CLOTTING_TIME: 'LAB_CT_001',
  D_DIMER: 'LAB_DDIMER_001',
  
  // Urine
  URINE_ROUTINE: 'LAB_URINE_R_001',
  URINE_CULTURE: 'LAB_URINE_C_001',
  TWENTY_FOUR_HR_URINE_PROTEIN: 'LAB_24HR_PROT_001',
  URINE_MICROALBUMIN: 'LAB_MICROALB_001',
  
  // Stool
  STOOL_ROUTINE: 'LAB_STOOL_R_001',
  STOOL_CULTURE: 'LAB_STOOL_C_001',
  STOOL_OCCULT_BLOOD: 'LAB_STOOL_OB_001',
  
  // Microbiology
  BLOOD_CULTURE: 'LAB_BLOOD_C_001',
  SPUTUM_CULTURE: 'LAB_SPUTUM_C_001',
  WOUND_CULTURE: 'LAB_WOUND_C_001',
  AFB_SMEAR: 'LAB_AFB_001',
  
  // Cardiac Markers
  TROPONIN_I: 'LAB_TROP_I_001',
  TROPONIN_T: 'LAB_TROP_T_001',
  CK_MB: 'LAB_CKMB_001',
  BNP: 'LAB_BNP_001',
  NT_PROBNP: 'LAB_NTPRO_001',
  
  // Imaging
  XRAY_CHEST: 'IMG_XRAY_CHEST_001',
  XRAY_ABDOMEN: 'IMG_XRAY_ABD_001',
  XRAY_SPINE: 'IMG_XRAY_SPINE_001',
  CT_HEAD: 'IMG_CT_HEAD_001',
  CT_CHEST: 'IMG_CT_CHEST_001',
  CT_ABDOMEN: 'IMG_CT_ABD_001',
  MRI_BRAIN: 'IMG_MRI_BRAIN_001',
  MRI_SPINE: 'IMG_MRI_SPINE_001',
  USG_ABDOMEN: 'IMG_USG_ABD_001',
  USG_PELVIS: 'IMG_USG_PELV_001',
  USG_OBSTETRIC: 'IMG_USG_OBS_001',
  ECHO: 'CARD_ECHO_001',
  ECG: 'CARD_ECG_001',
  TMT: 'CARD_TMT_001',
  
  // Histopathology
  BIOPSY: 'PATH_BIOPSY_001',
  FNAC: 'PATH_FNAC_001',
  PAP_SMEAR: 'PATH_PAP_001',
  
  // Special
  SEMEN_ANALYSIS: 'LAB_SEMEN_001',
  CSF_ANALYSIS: 'LAB_CSF_001'
};

// ============================================================================
// SECTION LAYOUTS (UI Rendering)
// ============================================================================

export const SECTION_LAYOUTS = {
  INFO_BLOCK: 'INFO_BLOCK',       // Key-value pairs
  KEY_VALUE: 'KEY_VALUE',          // Two-column key-value
  TABLE: 'TABLE',                  // Tabular data
  TEXT: 'TEXT',                    // Free text area
  RICH_TEXT: 'RICH_TEXT',          // Rich text with formatting
  IMAGE_GALLERY: 'IMAGE_GALLERY',  // Image display
  SIGNATURE_BLOCK: 'SIGNATURE_BLOCK', // Digital signature
  REPEATABLE: 'REPEATABLE',        // Repeatable section (Culture)
  TWO_COLUMN: 'TWO_COLUMN',        // Side-by-side layout
  THREE_COLUMN: 'THREE_COLUMN'     // Three columns
};

// ============================================================================
// FIELD TYPES (Form Inputs)
// ============================================================================

export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DECIMAL: 'decimal',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  TEXTAREA: 'textarea',
  RICHTEXT: 'richtext',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  FILE: 'file',
  IMAGE: 'image',
  CALCULATED: 'calculated',
  READONLY: 'readonly',
  QUALITATIVE: 'qualitative' // For reactive/positive type results
};

// ============================================================================
// NABL COMPLIANCE CODES
// ============================================================================

export const NABL_SCOPES = {
  CLINICAL_BIOCHEMISTRY: 'Clinical Biochemistry',
  HEMATOLOGY: 'Hematology',
  CLINICAL_PATHOLOGY: 'Clinical Pathology',
  MICROBIOLOGY: 'Microbiology',
  SEROLOGY_IMMUNOLOGY: 'Serology & Immunology',
  HISTOPATHOLOGY: 'Histopathology',
  CYTOPATHOLOGY: 'Cytopathology',
  GENETICS_MOLECULAR: 'Genetics & Molecular Diagnostics'
};

export const COMPLIANCE_STANDARDS = {
  NABL_15189: 'ISO 15189:2022',
  NABH: 'NABH Hospital Standards',
  CAP: 'CAP Accreditation',
  NABL_17025: 'ISO/IEC 17025'
};

// ============================================================================
// LOINC CODES (Common Indian Tests)
// ============================================================================

export const LOINC_CODES = {
  // Hematology
  HEMOGLOBIN: '718-7',
  WBC_COUNT: '6690-2',
  RBC_COUNT: '789-8',
  PLATELET_COUNT: '777-3',
  HEMATOCRIT: '4544-3',
  MCV: '787-2',
  MCH: '785-6',
  MCHC: '786-4',
  ESR: '4537-7',
  
  // Biochemistry
  GLUCOSE_FASTING: '1558-6',
  GLUCOSE_RANDOM: '2345-7',
  HBA1C: '4548-4',
  CREATININE: '2160-0',
  UREA: '3091-6',
  BILIRUBIN_TOTAL: '1975-2',
  BILIRUBIN_DIRECT: '1968-7',
  SGOT_AST: '1920-8',
  SGPT_ALT: '1742-6',
  ALP: '6768-6',
  TOTAL_PROTEIN: '2885-2',
  ALBUMIN: '1751-7',
  
  // Lipids
  CHOLESTEROL: '2093-3',
  TRIGLYCERIDES: '2571-8',
  HDL: '2085-9',
  LDL: '2089-1',
  VLDL: '2091-7',
  
  // Thyroid
  TSH: '3016-3',
  T3_TOTAL: '3053-6',
  T4_TOTAL: '3026-2',
  T3_FREE: '3051-0',
  T4_FREE: '3024-7',
  
  // Electrolytes
  SODIUM: '2951-2',
  POTASSIUM: '2823-3',
  CHLORIDE: '2075-0',
  CALCIUM: '17861-6',
  
  // Serology
  HIV_1_2_ANTIBODY: '56888-1',
  HBSAG: '5195-3',
  HCV_ANTIBODY: '16128-1',
  
  // Cardiac
  TROPONIN_I: '10839-9',
  CK_MB: '13969-1',
  BNP: '30934-4'
};

// ============================================================================
// SNOMED CT CODES (Common)
// ============================================================================

export const SNOMED_CODES = {
  CBC: '26604007',
  BLOOD_GLUCOSE: '33747003',
  URINALYSIS: '167217005',
  LIVER_FUNCTION_TEST: '26958001',
  KIDNEY_FUNCTION_TEST: '14146005',
  LIPID_PROFILE: '252150008',
  THYROID_FUNCTION_TEST: '61165007',
  XRAY_CHEST: '399208008',
  CT_SCAN: '77477000',
  MRI: '113091000',
  ULTRASOUND: '16310003',
  ECG: '29303009',
  ECHOCARDIOGRAM: '40701008'
};

// ============================================================================
// ANTIBIOTIC SENSITIVITY (Culture Reports)
// ============================================================================

export const SENSITIVITY_RESULTS = {
  S: { code: 'S', label: 'Sensitive', color: '#4CAF50' },
  I: { code: 'I', label: 'Intermediate', color: '#FF9800' },
  R: { code: 'R', label: 'Resistant', color: '#F44336' }
};

export const COMMON_ANTIBIOTICS = [
  // Penicillins
  { code: 'AMP', name: 'Ampicillin', class: 'Penicillin' },
  { code: 'AMX', name: 'Amoxicillin', class: 'Penicillin' },
  { code: 'AMC', name: 'Amoxicillin-Clavulanate', class: 'Penicillin + BLI' },
  { code: 'PIP_TAZ', name: 'Piperacillin-Tazobactam', class: 'Penicillin + BLI' },
  
  // Cephalosporins
  { code: 'CEF', name: 'Cefazolin', class: 'Cephalosporin 1G' },
  { code: 'CXM', name: 'Cefuroxime', class: 'Cephalosporin 2G' },
  { code: 'CTX', name: 'Cefotaxime', class: 'Cephalosporin 3G' },
  { code: 'CTR', name: 'Ceftriaxone', class: 'Cephalosporin 3G' },
  { code: 'CAZ', name: 'Ceftazidime', class: 'Cephalosporin 3G' },
  { code: 'FEP', name: 'Cefepime', class: 'Cephalosporin 4G' },
  
  // Carbapenems
  { code: 'IPM', name: 'Imipenem', class: 'Carbapenem' },
  { code: 'MEM', name: 'Meropenem', class: 'Carbapenem' },
  { code: 'ETP', name: 'Ertapenem', class: 'Carbapenem' },
  
  // Aminoglycosides
  { code: 'GEN', name: 'Gentamicin', class: 'Aminoglycoside' },
  { code: 'AMK', name: 'Amikacin', class: 'Aminoglycoside' },
  { code: 'TOB', name: 'Tobramycin', class: 'Aminoglycoside' },
  
  // Fluoroquinolones
  { code: 'CIP', name: 'Ciprofloxacin', class: 'Fluoroquinolone' },
  { code: 'LEV', name: 'Levofloxacin', class: 'Fluoroquinolone' },
  { code: 'OFX', name: 'Ofloxacin', class: 'Fluoroquinolone' },
  { code: 'NOR', name: 'Norfloxacin', class: 'Fluoroquinolone' },
  
  // Others
  { code: 'COT', name: 'Cotrimoxazole', class: 'Sulfonamide' },
  { code: 'NIT', name: 'Nitrofurantoin', class: 'Nitrofuran' },
  { code: 'VAN', name: 'Vancomycin', class: 'Glycopeptide' },
  { code: 'LZD', name: 'Linezolid', class: 'Oxazolidinone' },
  { code: 'CLR', name: 'Clarithromycin', class: 'Macrolide' },
  { code: 'AZM', name: 'Azithromycin', class: 'Macrolide' },
  { code: 'DOX', name: 'Doxycycline', class: 'Tetracycline' },
  { code: 'COL', name: 'Colistin', class: 'Polymyxin' },
  { code: 'TGC', name: 'Tigecycline', class: 'Glycylcycline' }
];

// ============================================================================
// COMMON ORGANISMS (Culture Reports)
// ============================================================================

export const COMMON_ORGANISMS = {
  // Gram Positive Cocci
  STAPH_AUREUS: 'Staphylococcus aureus',
  MRSA: 'Methicillin-resistant Staphylococcus aureus (MRSA)',
  CONS: 'Coagulase-negative Staphylococci',
  STREP_PNEUMONIAE: 'Streptococcus pneumoniae',
  STREP_PYOGENES: 'Streptococcus pyogenes',
  ENTEROCOCCUS_FAECALIS: 'Enterococcus faecalis',
  ENTEROCOCCUS_FAECIUM: 'Enterococcus faecium',
  
  // Gram Negative Bacilli
  E_COLI: 'Escherichia coli',
  KLEBSIELLA_PNEUMONIAE: 'Klebsiella pneumoniae',
  PSEUDOMONAS_AERUGINOSA: 'Pseudomonas aeruginosa',
  ACINETOBACTER: 'Acinetobacter baumannii',
  PROTEUS_MIRABILIS: 'Proteus mirabilis',
  ENTEROBACTER: 'Enterobacter species',
  SALMONELLA_TYPHI: 'Salmonella typhi',
  SALMONELLA_PARATYPHI: 'Salmonella paratyphi',
  
  // Anaerobes
  BACTEROIDES: 'Bacteroides fragilis',
  CLOSTRIDIUM: 'Clostridium species',
  
  // Fungi
  CANDIDA_ALBICANS: 'Candida albicans',
  CANDIDA_NON_ALBICANS: 'Candida non-albicans',
  ASPERGILLUS: 'Aspergillus species'
};

// ============================================================================
// FHIR RESOURCE MAPPINGS
// ============================================================================

export const FHIR_MAPPINGS = {
  DIAGNOSTIC_REPORT: {
    resourceType: 'DiagnosticReport',
    status: {
      DRAFT: 'registered',
      ENTERED: 'preliminary',
      APPROVED: 'final',
      AMENDED: 'amended',
      CANCELLED: 'cancelled'
    },
    category: {
      PATHOLOGY: 'LAB',
      RADIOLOGY: 'RAD',
      CARDIOLOGY: 'CUS'
    }
  },
  OBSERVATION: {
    resourceType: 'Observation',
    interpretation: {
      NORMAL: 'N',
      LOW: 'L',
      HIGH: 'H',
      CRITICAL_LOW: 'LL',
      CRITICAL_HIGH: 'HH',
      ABNORMAL: 'A'
    }
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  TEMPLATE_TYPES,
  DIAGNOSTIC_CATEGORIES,
  DEPARTMENTS,
  SUB_DEPARTMENTS,
  SPECIMEN_TYPES,
  TUBE_TYPES,
  TUBE_COLORS,
  REPORT_STATUS,
  TEMPLATE_STATUS,
  INTERPRETATION_CODES,
  QUALITATIVE_RESULTS,
  CRITICAL_VALUES,
  AGE_GROUPS,
  GENDER_TYPES,
  PREGNANCY_STATUS,
  COMMON_TEST_CODES,
  SECTION_LAYOUTS,
  FIELD_TYPES,
  NABL_SCOPES,
  COMPLIANCE_STANDARDS,
  LOINC_CODES,
  SNOMED_CODES,
  SENSITIVITY_RESULTS,
  COMMON_ANTIBIOTICS,
  COMMON_ORGANISMS,
  FHIR_MAPPINGS
};

















