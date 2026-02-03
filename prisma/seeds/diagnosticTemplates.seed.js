/**
 * 🧬 UNIVERSAL DIAGNOSTIC REPORT TEMPLATE SEEDING SYSTEM
 * ========================================================
 * 
 * Comprehensive template library for ALL diagnostic services:
 * - Pathology (Blood Tests, Hematology, Biochemistry)
 * - Microbiology (Culture & Sensitivity)
 * - Serology & Immunology
 * - Radiology & Imaging
 * - Cardiology
 * - Neurology
 * - OPD & Clinical Notes
 * - Package/Composite Reports
 * 
 * NABL/NABH Compliant | HL7 FHIR Ready | SaaS-HMS Compatible
 */

// ============================================
// 🩸 BLOOD & LAB TESTS - HEMATOLOGY
// ============================================

export const HEMATOLOGY_TEMPLATES = {
  CBC: {
    templateCode: 'CBC_V1',
    templateName: 'Complete Blood Count',
    shortName: 'CBC',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'HEMATOLOGY',
    testSubCategory: 'CBC',
    templateType: 'TABULAR',
    description: 'Complete blood count with differential',
    
    headerConfig: {
      showLogo: true,
      showHospitalName: true,
      reportTitle: 'HEMATOLOGY REPORT',
      accreditationInfo: { nablLogo: true }
    },
    
    sections: [
      { sectionId: 'RESULTS', title: 'Investigation Results', layout: 'TABLE', order: 1 }
    ],
    
    fields: [
      {
        code: 'HB',
        label: 'Hemoglobin',
        type: 'number',
        unit: 'g/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 25, step: 0.1 },
        criticalValues: { low: 7, high: 20 }
      },
      {
        code: 'RBC',
        label: 'RBC Count',
        type: 'number',
        unit: 'million/cmm',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 0, max: 10, step: 0.01 },
        criticalValues: { low: 2.5, high: 7 }
      },
      {
        code: 'WBC',
        label: 'WBC Count',
        type: 'number',
        unit: 'cells/cmm',
        sectionId: 'RESULTS',
        required: true,
        order: 3,
        validation: { min: 0, max: 50000, step: 100 },
        criticalValues: { low: 2000, high: 30000 }
      },
      {
        code: 'PLATELETS',
        label: 'Platelet Count',
        type: 'number',
        unit: 'lakhs/cmm',
        sectionId: 'RESULTS',
        required: true,
        order: 4,
        validation: { min: 0, max: 10, step: 0.01 },
        criticalValues: { low: 0.5, high: 10 }
      },
      {
        code: 'PCV',
        label: 'PCV (Hematocrit)',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: true,
        order: 5,
        validation: { min: 0, max: 70, step: 0.1 }
      },
      {
        code: 'MCV',
        label: 'MCV',
        type: 'number',
        unit: 'fL',
        sectionId: 'RESULTS',
        required: false,
        order: 6,
        validation: { min: 50, max: 120, step: 0.1 }
      },
      {
        code: 'MCH',
        label: 'MCH',
        type: 'number',
        unit: 'pg',
        sectionId: 'RESULTS',
        required: false,
        order: 7,
        validation: { min: 20, max: 40, step: 0.1 }
      },
      {
        code: 'MCHC',
        label: 'MCHC',
        type: 'number',
        unit: 'g/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 8,
        validation: { min: 25, max: 40, step: 0.1 }
      },
      {
        code: 'NEUTROPHILS',
        label: 'Neutrophils',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: false,
        order: 9,
        validation: { min: 0, max: 100, step: 0.1 }
      },
      {
        code: 'LYMPHOCYTES',
        label: 'Lymphocytes',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: false,
        order: 10,
        validation: { min: 0, max: 100, step: 0.1 }
      },
      {
        code: 'MONOCYTES',
        label: 'Monocytes',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: false,
        order: 11,
        validation: { min: 0, max: 100, step: 0.1 }
      },
      {
        code: 'EOSINOPHILS',
        label: 'Eosinophils',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: false,
        order: 12,
        validation: { min: 0, max: 100, step: 0.1 }
      },
      {
        code: 'BASOPHILS',
        label: 'Basophils',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: false,
        order: 13,
        validation: { min: 0, max: 100, step: 0.1 }
      }
    ],
    
    referenceRanges: {
      HB: {
        male: { adult: { min: 13, max: 17 } },
        female: { adult: { min: 12, max: 16 }, pregnant: { min: 11, max: 14 } }
      },
      RBC: {
        male: { adult: { min: 4.5, max: 5.9 } },
        female: { adult: { min: 4.0, max: 5.2 } }
      },
      WBC: { all: { min: 4000, max: 11000 } },
      PLATELETS: { all: { min: 1.5, max: 4.5 } },
      PCV: {
        male: { adult: { min: 40, max: 50 } },
        female: { adult: { min: 36, max: 46 } }
      },
      MCV: { all: { min: 80, max: 100 } },
      MCH: { all: { min: 27, max: 32 } },
      MCHC: { all: { min: 32, max: 36 } },
      NEUTROPHILS: { all: { min: 40, max: 75 } },
      LYMPHOCYTES: { all: { min: 20, max: 45 } },
      MONOCYTES: { all: { min: 2, max: 10 } },
      EOSINOPHILS: { all: { min: 1, max: 6 } },
      BASOPHILS: { all: { min: 0, max: 2 } }
    },
    
    criticalValueRules: {
      HB: { criticalLow: 7, criticalHigh: 20, panicLow: 5, panicHigh: 22 },
      WBC: { criticalLow: 2000, criticalHigh: 30000, requiresNotification: true },
      PLATELETS: { criticalLow: 0.5, criticalHigh: 10, requiresNotification: true }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['EDTA'],
      tubeColors: ['PURPLE'],
      volume: '2ml',
      fastingRequired: false
    },
    
    signOffConfig: {
      requiresTechnicianEntry: true,
      requiresQCCheck: true,
      requiresPathologistReview: true,
      requiresDigitalSignature: true
    }
  },

  ESR: {
    templateCode: 'ESR_V1',
    templateName: 'Erythrocyte Sedimentation Rate',
    shortName: 'ESR',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'HEMATOLOGY',
    testSubCategory: 'ESR',
    templateType: 'SEMI_QUANTITATIVE',
    description: 'ESR by Westergren method',
    
    fields: [
      {
        code: 'ESR_VALUE',
        label: 'ESR',
        type: 'number',
        unit: 'mm/hr',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 150, step: 1 }
      }
    ],
    
    referenceRanges: {
      ESR_VALUE: {
        male: { adult: { min: 0, max: 15 } },
        female: { adult: { min: 0, max: 20 } }
      }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['EDTA'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  PERIPHERAL_SMEAR: {
    templateCode: 'PS_V1',
    templateName: 'Peripheral Blood Smear',
    shortName: 'PS',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'HEMATOLOGY',
    testSubCategory: 'PERIPHERAL_SMEAR',
    templateType: 'NARRATIVE',
    description: 'Microscopic examination of peripheral blood smear',
    
    sections: [
      { sectionId: 'RBC_MORPHOLOGY', title: 'RBC Morphology', layout: 'TEXT', order: 1 },
      { sectionId: 'WBC_MORPHOLOGY', title: 'WBC Morphology', layout: 'TEXT', order: 2 },
      { sectionId: 'PLATELET_MORPHOLOGY', title: 'Platelet Morphology', layout: 'TEXT', order: 3 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 4 }
    ],
    
    fields: [
      {
        code: 'RBC_MORPHOLOGY',
        label: 'RBC Morphology',
        type: 'textarea',
        sectionId: 'RBC_MORPHOLOGY',
        required: true,
        order: 1
      },
      {
        code: 'WBC_MORPHOLOGY',
        label: 'WBC Morphology',
        type: 'textarea',
        sectionId: 'WBC_MORPHOLOGY',
        required: true,
        order: 2
      },
      {
        code: 'PLATELET_MORPHOLOGY',
        label: 'Platelet Morphology',
        type: 'textarea',
        sectionId: 'PLATELET_MORPHOLOGY',
        required: true,
        order: 3
      },
      {
        code: 'IMPRESSION',
        label: 'Impression',
        type: 'textarea',
        sectionId: 'IMPRESSION',
        required: true,
        order: 4
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['EDTA'],
      volume: '1ml',
      fastingRequired: false
    }
  }
};

// ============================================
// 🧪 BIOCHEMISTRY TESTS
// ============================================

export const BIOCHEMISTRY_TEMPLATES = {
  BLOOD_SUGAR: {
    templateCode: 'GLUCOSE_V1',
    templateName: 'Blood Glucose Profile',
    shortName: 'Glucose',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'GLUCOSE',
    templateType: 'TABULAR',
    description: 'Blood glucose measurement (FBS/PPBS/RBS)',
    
    fields: [
      {
        code: 'FBS',
        label: 'Fasting Blood Sugar',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 1,
        validation: { min: 0, max: 600, step: 1 },
        criticalValues: { low: 40, high: 400 }
      },
      {
        code: 'PPBS',
        label: 'Post Prandial Blood Sugar',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 2,
        validation: { min: 0, max: 600, step: 1 },
        criticalValues: { low: 40, high: 400 }
      },
      {
        code: 'RBS',
        label: 'Random Blood Sugar',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 3,
        validation: { min: 0, max: 600, step: 1 },
        criticalValues: { low: 40, high: 400 }
      }
    ],
    
    referenceRanges: {
      FBS: { all: { min: 70, max: 110 } },
      PPBS: { all: { min: 70, max: 140 } },
      RBS: { all: { min: 70, max: 140 } }
    },
    
    criticalValueRules: {
      FBS: { criticalLow: 40, criticalHigh: 400, requiresNotification: true },
      PPBS: { criticalLow: 40, criticalHigh: 400, requiresNotification: true },
      RBS: { criticalLow: 40, criticalHigh: 400, requiresNotification: true }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM', 'PLASMA'],
      tubeTypes: ['FLUORIDE', 'PLAIN'],
      tubeColors: ['GRAY', 'RED'],
      volume: '2ml',
      fastingRequired: true,
      fastingHours: 8
    }
  },

  HBA1C: {
    templateCode: 'HBA1C_V1',
    templateName: 'Glycated Hemoglobin (HbA1c)',
    shortName: 'HbA1c',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'HBA1C',
    templateType: 'TABULAR',
    description: 'Glycated hemoglobin measurement',
    
    fields: [
      {
        code: 'HBA1C',
        label: 'HbA1c',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 3, max: 20, step: 0.1 }
      },
      {
        code: 'AVERAGE_GLUCOSE',
        label: 'Estimated Average Glucose',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 2,
        validation: { min: 50, max: 500, step: 1 }
      }
    ],
    
    referenceRanges: {
      HBA1C: {
        all: {
          normal: { min: 4, max: 5.6 },
          prediabetic: { min: 5.7, max: 6.4 },
          diabetic: { min: 6.5, max: 20 }
        }
      }
    },
    
    calculatedFields: [
      {
        code: 'AVERAGE_GLUCOSE',
        formula: '(HBA1C * 28.7) - 46.7',
        label: 'Estimated Average Glucose'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['EDTA'],
      tubeColors: ['PURPLE'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  KFT: {
    templateCode: 'KFT_V1',
    templateName: 'Kidney Function Test',
    shortName: 'KFT/RFT',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'KFT',
    templateType: 'TABULAR',
    description: 'Renal function test panel',
    
    fields: [
      {
        code: 'UREA',
        label: 'Blood Urea',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 200, step: 0.1 },
        criticalValues: { high: 100 }
      },
      {
        code: 'BUN',
        label: 'Blood Urea Nitrogen',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 2,
        validation: { min: 0, max: 100, step: 0.1 }
      },
      {
        code: 'CREATININE',
        label: 'Serum Creatinine',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 3,
        validation: { min: 0, max: 20, step: 0.01 },
        criticalValues: { high: 5 }
      },
      {
        code: 'URIC_ACID',
        label: 'Serum Uric Acid',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 4,
        validation: { min: 0, max: 15, step: 0.1 }
      },
      {
        code: 'SODIUM',
        label: 'Sodium',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: false,
        order: 5,
        validation: { min: 100, max: 180, step: 0.1 },
        criticalValues: { low: 120, high: 160 }
      },
      {
        code: 'POTASSIUM',
        label: 'Potassium',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: false,
        order: 6,
        validation: { min: 1, max: 10, step: 0.1 },
        criticalValues: { low: 2.5, high: 6.5 }
      },
      {
        code: 'CHLORIDE',
        label: 'Chloride',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: false,
        order: 7,
        validation: { min: 70, max: 130, step: 0.1 }
      },
      {
        code: 'EGFR',
        label: 'eGFR',
        type: 'number',
        unit: 'mL/min/1.73m²',
        sectionId: 'RESULTS',
        required: false,
        order: 8,
        validation: { min: 0, max: 150, step: 0.1 }
      }
    ],
    
    referenceRanges: {
      UREA: { all: { min: 15, max: 40 } },
      BUN: { all: { min: 7, max: 20 } },
      CREATININE: {
        male: { adult: { min: 0.7, max: 1.3 } },
        female: { adult: { min: 0.6, max: 1.1 } }
      },
      URIC_ACID: {
        male: { adult: { min: 3.5, max: 7.2 } },
        female: { adult: { min: 2.6, max: 6.0 } }
      },
      SODIUM: { all: { min: 135, max: 145 } },
      POTASSIUM: { all: { min: 3.5, max: 5.0 } },
      CHLORIDE: { all: { min: 98, max: 107 } },
      EGFR: { all: { min: 90, max: 120 } }
    },
    
    criticalValueRules: {
      CREATININE: { criticalHigh: 5, requiresNotification: true },
      POTASSIUM: { criticalLow: 2.5, criticalHigh: 6.5, requiresNotification: true },
      SODIUM: { criticalLow: 120, criticalHigh: 160, requiresNotification: true }
    },
    
    calculatedFields: [
      {
        code: 'BUN',
        formula: 'UREA / 2.14',
        label: 'Blood Urea Nitrogen'
      },
      {
        code: 'EGFR',
        formula: 'CKD_EPI(CREATININE, AGE, GENDER)',
        label: 'eGFR (CKD-EPI)'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      tubeColors: ['RED', 'YELLOW'],
      volume: '3ml',
      fastingRequired: false
    }
  },

  LFT: {
    templateCode: 'LFT_V1',
    templateName: 'Liver Function Test',
    shortName: 'LFT',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'LFT',
    templateType: 'TABULAR',
    description: 'Hepatic function test panel',
    
    fields: [
      {
        code: 'TOTAL_BILIRUBIN',
        label: 'Total Bilirubin',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 30, step: 0.01 }
      },
      {
        code: 'DIRECT_BILIRUBIN',
        label: 'Direct Bilirubin',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 0, max: 20, step: 0.01 }
      },
      {
        code: 'INDIRECT_BILIRUBIN',
        label: 'Indirect Bilirubin',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 3,
        validation: { min: 0, max: 20, step: 0.01 }
      },
      {
        code: 'SGOT',
        label: 'SGOT (AST)',
        type: 'number',
        unit: 'U/L',
        sectionId: 'RESULTS',
        required: true,
        order: 4,
        validation: { min: 0, max: 500, step: 1 }
      },
      {
        code: 'SGPT',
        label: 'SGPT (ALT)',
        type: 'number',
        unit: 'U/L',
        sectionId: 'RESULTS',
        required: true,
        order: 5,
        validation: { min: 0, max: 500, step: 1 }
      },
      {
        code: 'ALP',
        label: 'Alkaline Phosphatase',
        type: 'number',
        unit: 'U/L',
        sectionId: 'RESULTS',
        required: true,
        order: 6,
        validation: { min: 0, max: 1000, step: 1 }
      },
      {
        code: 'TOTAL_PROTEIN',
        label: 'Total Protein',
        type: 'number',
        unit: 'g/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 7,
        validation: { min: 0, max: 15, step: 0.1 }
      },
      {
        code: 'ALBUMIN',
        label: 'Albumin',
        type: 'number',
        unit: 'g/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 8,
        validation: { min: 0, max: 10, step: 0.1 }
      },
      {
        code: 'GLOBULIN',
        label: 'Globulin',
        type: 'number',
        unit: 'g/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 9,
        validation: { min: 0, max: 10, step: 0.1 }
      },
      {
        code: 'AG_RATIO',
        label: 'A/G Ratio',
        type: 'number',
        unit: '',
        sectionId: 'RESULTS',
        required: false,
        order: 10,
        validation: { min: 0, max: 5, step: 0.01 }
      }
    ],
    
    referenceRanges: {
      TOTAL_BILIRUBIN: { all: { min: 0.3, max: 1.2 } },
      DIRECT_BILIRUBIN: { all: { min: 0, max: 0.3 } },
      INDIRECT_BILIRUBIN: { all: { min: 0.2, max: 0.9 } },
      SGOT: { all: { min: 0, max: 40 } },
      SGPT: { all: { min: 0, max: 41 } },
      ALP: { all: { min: 44, max: 147 } },
      TOTAL_PROTEIN: { all: { min: 6.0, max: 8.3 } },
      ALBUMIN: { all: { min: 3.5, max: 5.5 } },
      GLOBULIN: { all: { min: 2.0, max: 3.5 } },
      AG_RATIO: { all: { min: 1.0, max: 2.5 } }
    },
    
    calculatedFields: [
      {
        code: 'INDIRECT_BILIRUBIN',
        formula: 'TOTAL_BILIRUBIN - DIRECT_BILIRUBIN',
        label: 'Indirect Bilirubin'
      },
      {
        code: 'GLOBULIN',
        formula: 'TOTAL_PROTEIN - ALBUMIN',
        label: 'Globulin'
      },
      {
        code: 'AG_RATIO',
        formula: 'ALBUMIN / GLOBULIN',
        label: 'A/G Ratio'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      tubeColors: ['RED', 'YELLOW'],
      volume: '3ml',
      fastingRequired: false
    }
  },

  LIPID_PROFILE: {
    templateCode: 'LIPID_V1',
    templateName: 'Lipid Profile',
    shortName: 'Lipid',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'LIPID',
    templateType: 'TABULAR',
    description: 'Complete lipid panel',
    
    fields: [
      {
        code: 'TOTAL_CHOLESTEROL',
        label: 'Total Cholesterol',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 500, step: 1 }
      },
      {
        code: 'TRIGLYCERIDES',
        label: 'Triglycerides',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 0, max: 1000, step: 1 }
      },
      {
        code: 'HDL',
        label: 'HDL Cholesterol',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 3,
        validation: { min: 0, max: 150, step: 1 }
      },
      {
        code: 'LDL',
        label: 'LDL Cholesterol',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 4,
        validation: { min: 0, max: 400, step: 1 }
      },
      {
        code: 'VLDL',
        label: 'VLDL Cholesterol',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 5,
        validation: { min: 0, max: 100, step: 1 }
      },
      {
        code: 'TC_HDL_RATIO',
        label: 'TC/HDL Ratio',
        type: 'number',
        unit: '',
        sectionId: 'RESULTS',
        required: false,
        order: 6,
        validation: { min: 0, max: 10, step: 0.1 }
      },
      {
        code: 'LDL_HDL_RATIO',
        label: 'LDL/HDL Ratio',
        type: 'number',
        unit: '',
        sectionId: 'RESULTS',
        required: false,
        order: 7,
        validation: { min: 0, max: 10, step: 0.1 }
      }
    ],
    
    referenceRanges: {
      TOTAL_CHOLESTEROL: {
        all: {
          desirable: { min: 0, max: 200 },
          borderlineHigh: { min: 200, max: 239 },
          high: { min: 240, max: 500 }
        }
      },
      TRIGLYCERIDES: {
        all: {
          normal: { min: 0, max: 150 },
          borderlineHigh: { min: 150, max: 199 },
          high: { min: 200, max: 499 },
          veryHigh: { min: 500, max: 1000 }
        }
      },
      HDL: {
        all: {
          low: { min: 0, max: 40 },
          normal: { min: 40, max: 60 },
          high: { min: 60, max: 150 }
        }
      },
      LDL: {
        all: {
          optimal: { min: 0, max: 100 },
          nearOptimal: { min: 100, max: 129 },
          borderlineHigh: { min: 130, max: 159 },
          high: { min: 160, max: 189 },
          veryHigh: { min: 190, max: 400 }
        }
      },
      VLDL: { all: { min: 5, max: 40 } },
      TC_HDL_RATIO: { all: { min: 0, max: 5 } },
      LDL_HDL_RATIO: { all: { min: 0, max: 3.5 } }
    },
    
    calculatedFields: [
      {
        code: 'VLDL',
        formula: 'TRIGLYCERIDES / 5',
        label: 'VLDL Cholesterol'
      },
      {
        code: 'LDL',
        formula: 'TOTAL_CHOLESTEROL - HDL - VLDL',
        label: 'LDL Cholesterol (Friedewald)'
      },
      {
        code: 'TC_HDL_RATIO',
        formula: 'TOTAL_CHOLESTEROL / HDL',
        label: 'TC/HDL Ratio'
      },
      {
        code: 'LDL_HDL_RATIO',
        formula: 'LDL / HDL',
        label: 'LDL/HDL Ratio'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      tubeColors: ['RED', 'YELLOW'],
      volume: '3ml',
      fastingRequired: true,
      fastingHours: 12,
      specialInstructions: 'Patient should be on normal diet for 2 weeks before test'
    }
  },

  ELECTROLYTES: {
    templateCode: 'ELECTROLYTES_V1',
    templateName: 'Serum Electrolytes',
    shortName: 'Electrolytes',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'ELECTROLYTES',
    templateType: 'TABULAR',
    description: 'Electrolyte panel (Na, K, Cl, HCO3)',
    
    fields: [
      {
        code: 'SODIUM',
        label: 'Sodium',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 100, max: 180, step: 0.1 },
        criticalValues: { low: 120, high: 160 }
      },
      {
        code: 'POTASSIUM',
        label: 'Potassium',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 1, max: 10, step: 0.1 },
        criticalValues: { low: 2.5, high: 6.5 }
      },
      {
        code: 'CHLORIDE',
        label: 'Chloride',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: true,
        order: 3,
        validation: { min: 70, max: 130, step: 0.1 }
      },
      {
        code: 'BICARBONATE',
        label: 'Bicarbonate (HCO3)',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: false,
        order: 4,
        validation: { min: 10, max: 50, step: 0.1 }
      }
    ],
    
    referenceRanges: {
      SODIUM: { all: { min: 135, max: 145 } },
      POTASSIUM: { all: { min: 3.5, max: 5.0 } },
      CHLORIDE: { all: { min: 98, max: 107 } },
      BICARBONATE: { all: { min: 22, max: 28 } }
    },
    
    criticalValueRules: {
      SODIUM: { criticalLow: 120, criticalHigh: 160, requiresNotification: true },
      POTASSIUM: { criticalLow: 2.5, criticalHigh: 6.5, requiresNotification: true, panicLow: 2.0, panicHigh: 7.0 }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      tubeColors: ['RED', 'YELLOW'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  CALCIUM: {
    templateCode: 'CALCIUM_V1',
    templateName: 'Serum Calcium',
    shortName: 'Calcium',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'CALCIUM',
    templateType: 'TABULAR',
    description: 'Serum calcium measurement',
    
    fields: [
      {
        code: 'CALCIUM',
        label: 'Total Calcium',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 20, step: 0.1 },
        criticalValues: { low: 7, high: 13 }
      },
      {
        code: 'IONIZED_CALCIUM',
        label: 'Ionized Calcium',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: false,
        order: 2,
        validation: { min: 0, max: 10, step: 0.01 }
      }
    ],
    
    referenceRanges: {
      CALCIUM: { all: { min: 8.5, max: 10.5 } },
      IONIZED_CALCIUM: { all: { min: 4.5, max: 5.5 } }
    },
    
    criticalValueRules: {
      CALCIUM: { criticalLow: 7, criticalHigh: 13, requiresNotification: true }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  VITAMIN_D: {
    templateCode: 'VIT_D_V1',
    templateName: '25-Hydroxy Vitamin D',
    shortName: 'Vitamin D',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'VITAMINS',
    templateType: 'TABULAR',
    description: '25-OH Vitamin D measurement',
    
    fields: [
      {
        code: 'VITAMIN_D',
        label: '25-OH Vitamin D',
        type: 'number',
        unit: 'ng/mL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 200, step: 0.1 }
      }
    ],
    
    referenceRanges: {
      VITAMIN_D: {
        all: {
          deficient: { min: 0, max: 20 },
          insufficient: { min: 20, max: 30 },
          sufficient: { min: 30, max: 100 },
          excess: { min: 100, max: 200 }
        }
      }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '3ml',
      fastingRequired: false
    }
  },

  VITAMIN_B12: {
    templateCode: 'VIT_B12_V1',
    templateName: 'Vitamin B12',
    shortName: 'B12',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'VITAMINS',
    templateType: 'TABULAR',
    description: 'Serum Vitamin B12 measurement',
    
    fields: [
      {
        code: 'VITAMIN_B12',
        label: 'Vitamin B12',
        type: 'number',
        unit: 'pg/mL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 2000, step: 1 }
      }
    ],
    
    referenceRanges: {
      VITAMIN_B12: {
        all: {
          deficient: { min: 0, max: 200 },
          borderline: { min: 200, max: 300 },
          normal: { min: 300, max: 1000 }
        }
      }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '3ml',
      fastingRequired: false
    }
  },

  IRON_STUDIES: {
    templateCode: 'IRON_V1',
    templateName: 'Iron Studies',
    shortName: 'Iron',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'IRON',
    templateType: 'TABULAR',
    description: 'Iron, TIBC, and Ferritin',
    
    fields: [
      {
        code: 'SERUM_IRON',
        label: 'Serum Iron',
        type: 'number',
        unit: 'µg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 500, step: 1 }
      },
      {
        code: 'TIBC',
        label: 'TIBC',
        type: 'number',
        unit: 'µg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 0, max: 800, step: 1 }
      },
      {
        code: 'TRANSFERRIN_SATURATION',
        label: 'Transferrin Saturation',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: false,
        order: 3,
        validation: { min: 0, max: 100, step: 0.1 }
      },
      {
        code: 'FERRITIN',
        label: 'Serum Ferritin',
        type: 'number',
        unit: 'ng/mL',
        sectionId: 'RESULTS',
        required: false,
        order: 4,
        validation: { min: 0, max: 5000, step: 1 }
      }
    ],
    
    referenceRanges: {
      SERUM_IRON: {
        male: { adult: { min: 65, max: 176 } },
        female: { adult: { min: 50, max: 170 } }
      },
      TIBC: { all: { min: 250, max: 450 } },
      TRANSFERRIN_SATURATION: { all: { min: 20, max: 50 } },
      FERRITIN: {
        male: { adult: { min: 30, max: 400 } },
        female: { adult: { min: 13, max: 150 } }
      }
    },
    
    calculatedFields: [
      {
        code: 'TRANSFERRIN_SATURATION',
        formula: '(SERUM_IRON / TIBC) * 100',
        label: 'Transferrin Saturation'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '3ml',
      fastingRequired: true,
      fastingHours: 8
    }
  },

  CRP: {
    templateCode: 'CRP_V1',
    templateName: 'C-Reactive Protein',
    shortName: 'CRP',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'INFLAMMATORY',
    templateType: 'SEMI_QUANTITATIVE',
    description: 'C-Reactive Protein measurement',
    
    fields: [
      {
        code: 'CRP',
        label: 'CRP',
        type: 'number',
        unit: 'mg/L',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 500, step: 0.1 }
      }
    ],
    
    referenceRanges: {
      CRP: {
        all: {
          normal: { min: 0, max: 6 },
          elevated: { min: 6, max: 50 },
          highlyElevated: { min: 50, max: 500 }
        }
      }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  PROCALCITONIN: {
    templateCode: 'PCT_V1',
    templateName: 'Procalcitonin',
    shortName: 'PCT',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'INFLAMMATORY',
    templateType: 'SEMI_QUANTITATIVE',
    description: 'Procalcitonin for sepsis evaluation',
    
    fields: [
      {
        code: 'PROCALCITONIN',
        label: 'Procalcitonin',
        type: 'number',
        unit: 'ng/mL',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 100, step: 0.01 }
      }
    ],
    
    referenceRanges: {
      PROCALCITONIN: {
        all: {
          normal: { min: 0, max: 0.05 },
          localInfection: { min: 0.05, max: 0.5 },
          sepsisRisk: { min: 0.5, max: 2 },
          severeSepsis: { min: 2, max: 10 },
          septicShock: { min: 10, max: 100 }
        }
      }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM', 'PLASMA'],
      tubeTypes: ['PLAIN', 'SST', 'EDTA'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  PT_INR: {
    templateCode: 'PT_INR_V1',
    templateName: 'Prothrombin Time & INR',
    shortName: 'PT/INR',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'COAGULATION',
    testSubCategory: 'COAGULATION',
    templateType: 'TABULAR',
    description: 'Prothrombin time and International Normalized Ratio',
    
    fields: [
      {
        code: 'PT_PATIENT',
        label: 'PT (Patient)',
        type: 'number',
        unit: 'seconds',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 120, step: 0.1 }
      },
      {
        code: 'PT_CONTROL',
        label: 'PT (Control)',
        type: 'number',
        unit: 'seconds',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 0, max: 60, step: 0.1 }
      },
      {
        code: 'INR',
        label: 'INR',
        type: 'number',
        unit: '',
        sectionId: 'RESULTS',
        required: false,
        order: 3,
        validation: { min: 0, max: 10, step: 0.01 },
        criticalValues: { high: 5 }
      }
    ],
    
    referenceRanges: {
      PT_PATIENT: { all: { min: 11, max: 13.5 } },
      PT_CONTROL: { all: { min: 11, max: 13.5 } },
      INR: {
        all: {
          normal: { min: 0.8, max: 1.2 },
          therapeutic: { min: 2.0, max: 3.0 },
          highRisk: { min: 2.5, max: 3.5 }
        }
      }
    },
    
    criticalValueRules: {
      INR: { criticalHigh: 5, requiresNotification: true }
    },
    
    calculatedFields: [
      {
        code: 'INR',
        formula: '(PT_PATIENT / PT_CONTROL) ^ ISI',
        label: 'INR'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'PLASMA'],
      tubeTypes: ['SODIUM_CITRATE'],
      tubeColors: ['LIGHT_BLUE'],
      volume: '2ml',
      fastingRequired: false,
      specialInstructions: 'Fill tube to correct level for accurate citrate ratio'
    }
  },

  APTT: {
    templateCode: 'APTT_V1',
    templateName: 'Activated Partial Thromboplastin Time',
    shortName: 'APTT/PTT',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'COAGULATION',
    testSubCategory: 'COAGULATION',
    templateType: 'TABULAR',
    description: 'Activated Partial Thromboplastin Time',
    
    fields: [
      {
        code: 'APTT_PATIENT',
        label: 'APTT (Patient)',
        type: 'number',
        unit: 'seconds',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 200, step: 0.1 }
      },
      {
        code: 'APTT_CONTROL',
        label: 'APTT (Control)',
        type: 'number',
        unit: 'seconds',
        sectionId: 'RESULTS',
        required: true,
        order: 2,
        validation: { min: 0, max: 80, step: 0.1 }
      },
      {
        code: 'APTT_RATIO',
        label: 'APTT Ratio',
        type: 'number',
        unit: '',
        sectionId: 'RESULTS',
        required: false,
        order: 3,
        validation: { min: 0, max: 5, step: 0.01 }
      }
    ],
    
    referenceRanges: {
      APTT_PATIENT: { all: { min: 25, max: 35 } },
      APTT_CONTROL: { all: { min: 25, max: 35 } },
      APTT_RATIO: { all: { min: 0.8, max: 1.2 } }
    },
    
    calculatedFields: [
      {
        code: 'APTT_RATIO',
        formula: 'APTT_PATIENT / APTT_CONTROL',
        label: 'APTT Ratio'
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'PLASMA'],
      tubeTypes: ['SODIUM_CITRATE'],
      tubeColors: ['LIGHT_BLUE'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  D_DIMER: {
    templateCode: 'D_DIMER_V1',
    templateName: 'D-Dimer',
    shortName: 'D-Dimer',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'COAGULATION',
    testSubCategory: 'COAGULATION',
    templateType: 'SEMI_QUANTITATIVE',
    description: 'D-Dimer for thrombosis evaluation',
    
    fields: [
      {
        code: 'D_DIMER',
        label: 'D-Dimer',
        type: 'number',
        unit: 'µg/mL FEU',
        sectionId: 'RESULTS',
        required: true,
        order: 1,
        validation: { min: 0, max: 50, step: 0.01 }
      }
    ],
    
    referenceRanges: {
      D_DIMER: {
        all: {
          normal: { min: 0, max: 0.5 },
          elevated: { min: 0.5, max: 50 }
        }
      }
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'PLASMA'],
      tubeTypes: ['SODIUM_CITRATE'],
      tubeColors: ['LIGHT_BLUE'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  BLOOD_GROUP: {
    templateCode: 'BLOOD_GROUP_V1',
    templateName: 'Blood Group & Rh Typing',
    shortName: 'Blood Group',
    category: 'BLOOD_BANK',
    department: 'BLOOD_BANK',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'BLOOD_GROUPING',
    templateType: 'BLOOD_BANK',
    description: 'ABO and Rh blood grouping',
    
    fields: [
      {
        code: 'ABO_GROUP',
        label: 'ABO Blood Group',
        type: 'select',
        options: ['A', 'B', 'AB', 'O'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'RH_TYPE',
        label: 'Rh Type',
        type: 'select',
        options: ['Positive', 'Negative'],
        sectionId: 'RESULTS',
        required: true,
        order: 2
      },
      {
        code: 'BLOOD_GROUP',
        label: 'Blood Group',
        type: 'computed',
        formula: 'ABO_GROUP + " " + (RH_TYPE === "Positive" ? "+" : "-")',
        sectionId: 'RESULTS',
        order: 3
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['EDTA', 'PLAIN'],
      tubeColors: ['PURPLE', 'RED'],
      volume: '2ml',
      fastingRequired: false
    }
  }
};

// ============================================
// 🧬 MICROBIOLOGY TEMPLATES
// ============================================

export const MICROBIOLOGY_TEMPLATES = {
  URINE_CULTURE: {
    templateCode: 'URINE_CS_V1',
    templateName: 'Urine Culture & Sensitivity',
    shortName: 'Urine C/S',
    category: 'MICROBIOLOGY',
    department: 'LAB',
    subDepartment: 'MICROBIOLOGY',
    testSubCategory: 'CULTURE',
    templateType: 'CULTURE_SENSITIVITY',
    description: 'Urine culture with antibiotic sensitivity',
    
    sections: [
      { sectionId: 'CULTURE', title: 'Culture Results', layout: 'KEY_VALUE', order: 1 },
      { sectionId: 'SENSITIVITY', title: 'Antibiotic Sensitivity', layout: 'TABLE', order: 2 }
    ],
    
    fields: [
      {
        code: 'GROWTH_STATUS',
        label: 'Growth',
        type: 'select',
        options: ['No Growth', 'Growth', 'Contaminated', 'Insufficient Sample'],
        sectionId: 'CULTURE',
        required: true,
        order: 1
      },
      {
        code: 'ORGANISM_ISOLATED',
        label: 'Organism Isolated',
        type: 'text',
        sectionId: 'CULTURE',
        required: false,
        order: 2
      },
      {
        code: 'COLONY_COUNT',
        label: 'Colony Count',
        type: 'text',
        sectionId: 'CULTURE',
        required: false,
        order: 3
      },
      {
        code: 'CULTURE_METHOD',
        label: 'Culture Method',
        type: 'text',
        sectionId: 'CULTURE',
        required: false,
        order: 4
      }
    ],
    
    repeatableSections: [
      {
        sectionId: 'ANTIBIOTIC_SENSITIVITY',
        label: 'Antibiotic Sensitivity',
        maxRepeats: 30,
        fields: [
          {
            code: 'ANTIBIOTIC',
            label: 'Antibiotic',
            type: 'select',
            options: [
              'Amikacin',
              'Amoxicillin',
              'Ampicillin',
              'Azithromycin',
              'Ceftriaxone',
              'Cefixime',
              'Cefuroxime',
              'Ciprofloxacin',
              'Gentamicin',
              'Imipenem',
              'Levofloxacin',
              'Meropenem',
              'Nitrofurantoin',
              'Norfloxacin',
              'Ofloxacin',
              'Piperacillin-Tazobactam',
              'Tetracycline',
              'Trimethoprim-Sulfamethoxazole',
              'Vancomycin'
            ]
          },
          {
            code: 'RESULT',
            label: 'Result',
            type: 'select',
            options: ['Sensitive (S)', 'Resistant (R)', 'Intermediate (I)']
          }
        ]
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['URINE'],
      volume: '5-10ml',
      fastingRequired: false,
      specialInstructions: 'Collect midstream clean catch urine in sterile container'
    },
    
    supportsMultiSpecimen: false,
    
    signOffConfig: {
      requiresTechnicianEntry: true,
      requiresQCCheck: true,
      requiresPathologistReview: true,
      requiresDigitalSignature: true
    }
  },

  BLOOD_CULTURE: {
    templateCode: 'BLOOD_CS_V1',
    templateName: 'Blood Culture & Sensitivity',
    shortName: 'Blood C/S',
    category: 'MICROBIOLOGY',
    department: 'LAB',
    subDepartment: 'MICROBIOLOGY',
    testSubCategory: 'CULTURE',
    templateType: 'CULTURE_SENSITIVITY',
    description: 'Blood culture with antibiotic sensitivity',
    
    fields: [
      {
        code: 'GROWTH_STATUS',
        label: 'Growth',
        type: 'select',
        options: ['No Growth', 'Growth', 'Contaminated'],
        sectionId: 'CULTURE',
        required: true,
        order: 1
      },
      {
        code: 'ORGANISM_ISOLATED',
        label: 'Organism Isolated',
        type: 'text',
        sectionId: 'CULTURE',
        required: false,
        order: 2
      },
      {
        code: 'CULTURE_DURATION',
        label: 'Culture Duration',
        type: 'text',
        sectionId: 'CULTURE',
        required: false,
        order: 3
      }
    ],
    
    repeatableSections: [
      {
        sectionId: 'ANTIBIOTIC_SENSITIVITY',
        label: 'Antibiotic Sensitivity',
        maxRepeats: 30,
        fields: [
          {
            code: 'ANTIBIOTIC',
            label: 'Antibiotic',
            type: 'text'
          },
          {
            code: 'RESULT',
            label: 'Result',
            type: 'select',
            options: ['Sensitive (S)', 'Resistant (R)', 'Intermediate (I)']
          }
        ]
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['BLOOD_CULTURE_BOTTLE'],
      volume: '8-10ml (adults), 1-5ml (pediatric)',
      fastingRequired: false,
      specialInstructions: 'Collect before antibiotic therapy if possible'
    },
    
    supportsMultiSpecimen: true,
    specimenSchema: [
      { type: 'AEROBIC', label: 'Aerobic Culture Bottle', required: true },
      { type: 'ANAEROBIC', label: 'Anaerobic Culture Bottle', required: false }
    ]
  },

  STOOL_EXAMINATION: {
    templateCode: 'STOOL_EXAM_V1',
    templateName: 'Stool Examination (Routine)',
    shortName: 'Stool R/E',
    category: 'MICROBIOLOGY',
    department: 'LAB',
    subDepartment: 'MICROBIOLOGY',
    testSubCategory: 'STOOL',
    templateType: 'HYBRID',
    description: 'Routine stool examination (macroscopic and microscopic)',
    
    sections: [
      { sectionId: 'MACROSCOPIC', title: 'Macroscopic Examination', layout: 'KEY_VALUE', order: 1 },
      { sectionId: 'MICROSCOPIC', title: 'Microscopic Examination', layout: 'KEY_VALUE', order: 2 }
    ],
    
    fields: [
      {
        code: 'CONSISTENCY',
        label: 'Consistency',
        type: 'select',
        options: ['Formed', 'Semi-formed', 'Loose', 'Watery'],
        sectionId: 'MACROSCOPIC',
        required: true,
        order: 1
      },
      {
        code: 'COLOR',
        label: 'Color',
        type: 'text',
        sectionId: 'MACROSCOPIC',
        required: true,
        order: 2
      },
      {
        code: 'ODOUR',
        label: 'Odour',
        type: 'text',
        sectionId: 'MACROSCOPIC',
        required: false,
        order: 3
      },
      {
        code: 'MUCUS',
        label: 'Mucus',
        type: 'select',
        options: ['Absent', 'Present'],
        sectionId: 'MACROSCOPIC',
        required: true,
        order: 4
      },
      {
        code: 'BLOOD',
        label: 'Blood',
        type: 'select',
        options: ['Absent', 'Present'],
        sectionId: 'MACROSCOPIC',
        required: true,
        order: 5
      },
      {
        code: 'OCCULT_BLOOD',
        label: 'Occult Blood',
        type: 'select',
        options: ['Negative', 'Positive'],
        sectionId: 'MICROSCOPIC',
        required: false,
        order: 6
      },
      {
        code: 'PUS_CELLS',
        label: 'Pus Cells',
        type: 'text',
        sectionId: 'MICROSCOPIC',
        required: true,
        order: 7
      },
      {
        code: 'RBC',
        label: 'RBCs',
        type: 'text',
        sectionId: 'MICROSCOPIC',
        required: true,
        order: 8
      },
      {
        code: 'OVA_CYST',
        label: 'Ova/Cyst',
        type: 'text',
        sectionId: 'MICROSCOPIC',
        required: true,
        order: 9
      },
      {
        code: 'PARASITES',
        label: 'Parasites',
        type: 'text',
        sectionId: 'MICROSCOPIC',
        required: false,
        order: 10
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['STOOL'],
      volume: 'Small amount',
      fastingRequired: false,
      specialInstructions: 'Collect fresh sample in clean, dry container'
    }
  },

  SPUTUM_AFB: {
    templateCode: 'AFB_V1',
    templateName: 'Sputum for AFB (TB Test)',
    shortName: 'AFB',
    category: 'MICROBIOLOGY',
    department: 'LAB',
    subDepartment: 'MICROBIOLOGY',
    testSubCategory: 'AFB',
    templateType: 'QUALITATIVE',
    description: 'Acid Fast Bacilli (AFB) staining for tuberculosis',
    
    fields: [
      {
        code: 'AFB_RESULT',
        label: 'AFB Result',
        type: 'select',
        options: [
          'Negative (No AFB seen)',
          'Scanty (1-9 AFB/100 fields)',
          '1+ (10-99 AFB/100 fields)',
          '2+ (1-10 AFB/field in 50 fields)',
          '3+ (>10 AFB/field in 20 fields)'
        ],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'STAINING_METHOD',
        label: 'Staining Method',
        type: 'text',
        sectionId: 'RESULTS',
        required: false,
        order: 2
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['SPUTUM'],
      volume: '3-5ml',
      fastingRequired: false,
      specialInstructions: 'Early morning sample preferred. Collect 3 consecutive samples.'
    }
  },

  CBNAAT: {
    templateCode: 'CBNAAT_V1',
    templateName: 'CBNAAT / GeneXpert (MTB/RIF)',
    shortName: 'CBNAAT',
    category: 'MICROBIOLOGY',
    department: 'LAB',
    subDepartment: 'MOLECULAR',
    testSubCategory: 'MOLECULAR',
    templateType: 'QUALITATIVE',
    description: 'Cartridge Based Nucleic Acid Amplification Test for TB',
    
    fields: [
      {
        code: 'MTB_RESULT',
        label: 'MTB (Tuberculosis) Detected',
        type: 'select',
        options: ['NOT DETECTED', 'DETECTED (Very Low)', 'DETECTED (Low)', 'DETECTED (Medium)', 'DETECTED (High)'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'RIF_RESISTANCE',
        label: 'Rifampicin Resistance',
        type: 'select',
        options: ['NOT DETECTED', 'DETECTED', 'INDETERMINATE'],
        sectionId: 'RESULTS',
        required: false,
        order: 2
      },
      {
        code: 'PROBE_RESULT',
        label: 'Probe Result Details',
        type: 'textarea',
        sectionId: 'RESULTS',
        required: false,
        order: 3
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['SPUTUM', 'TISSUE', 'FLUID'],
      volume: '2-3ml',
      fastingRequired: false
    }
  }
};

// ============================================
// 🧫 SEROLOGY & IMMUNOLOGY TEMPLATES
// ============================================

export const SEROLOGY_TEMPLATES = {
  DENGUE: {
    templateCode: 'DENGUE_V1',
    templateName: 'Dengue NS1 / IgG / IgM',
    shortName: 'Dengue',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'VIRAL',
    templateType: 'QUALITATIVE',
    description: 'Dengue diagnostic panel',
    
    fields: [
      {
        code: 'NS1_ANTIGEN',
        label: 'NS1 Antigen',
        type: 'select',
        options: ['Positive', 'Negative'],
        sectionId: 'RESULTS',
        required: false,
        order: 1
      },
      {
        code: 'DENGUE_IGG',
        label: 'Dengue IgG',
        type: 'select',
        options: ['Positive', 'Negative'],
        sectionId: 'RESULTS',
        required: false,
        order: 2
      },
      {
        code: 'DENGUE_IGM',
        label: 'Dengue IgM',
        type: 'select',
        options: ['Positive', 'Negative'],
        sectionId: 'RESULTS',
        required: false,
        order: 3
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  HIV: {
    templateCode: 'HIV_V1',
    templateName: 'HIV (1 & 2) Test',
    shortName: 'HIV',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'VIRAL',
    templateType: 'QUALITATIVE',
    description: 'HIV antibody screening test',
    
    fields: [
      {
        code: 'HIV_RESULT',
        label: 'HIV (1 & 2)',
        type: 'select',
        options: ['Non-Reactive', 'Reactive'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'METHOD',
        label: 'Method',
        type: 'text',
        sectionId: 'RESULTS',
        required: false,
        order: 2
      }
    ],
    
    footerConfig: {
      disclaimer: 'Reactive samples should be confirmed by Western Blot or other confirmatory tests. Pre and post-test counseling recommended.'
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  HBSAG: {
    templateCode: 'HBSAG_V1',
    templateName: 'Hepatitis B Surface Antigen',
    shortName: 'HBsAg',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'VIRAL',
    templateType: 'QUALITATIVE',
    description: 'HBsAg screening test',
    
    fields: [
      {
        code: 'HBSAG_RESULT',
        label: 'HBsAg',
        type: 'select',
        options: ['Non-Reactive', 'Reactive'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  HCV: {
    templateCode: 'HCV_V1',
    templateName: 'Anti-HCV (Hepatitis C)',
    shortName: 'Anti-HCV',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'VIRAL',
    templateType: 'QUALITATIVE',
    description: 'Hepatitis C antibody test',
    
    fields: [
      {
        code: 'HCV_RESULT',
        label: 'Anti-HCV',
        type: 'select',
        options: ['Non-Reactive', 'Reactive'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  WIDAL: {
    templateCode: 'WIDAL_V1',
    templateName: 'Widal Test (Typhoid)',
    shortName: 'Widal',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'BACTERIAL',
    templateType: 'SEMI_QUANTITATIVE',
    description: 'Widal test for typhoid fever',
    
    fields: [
      {
        code: 'TYPHI_O',
        label: 'S. Typhi O',
        type: 'text',
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'TYPHI_H',
        label: 'S. Typhi H',
        type: 'text',
        sectionId: 'RESULTS',
        required: true,
        order: 2
      },
      {
        code: 'PARATYPHI_AH',
        label: 'S. Paratyphi AH',
        type: 'text',
        sectionId: 'RESULTS',
        required: false,
        order: 3
      },
      {
        code: 'PARATYPHI_BH',
        label: 'S. Paratyphi BH',
        type: 'text',
        sectionId: 'RESULTS',
        required: false,
        order: 4
      }
    ],
    
    footerConfig: {
      disclaimer: 'Significant titre: ≥1:160 for O antigen, ≥1:80 for H antigen. Clinical correlation required.'
    },
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  MALARIA: {
    templateCode: 'MALARIA_V1',
    templateName: 'Malaria Antigen Test',
    shortName: 'Malaria',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'PARASITIC',
    templateType: 'QUALITATIVE',
    description: 'Rapid malaria antigen detection',
    
    fields: [
      {
        code: 'PF_ANTIGEN',
        label: 'P. falciparum (Pf)',
        type: 'select',
        options: ['Positive', 'Negative'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'PV_ANTIGEN',
        label: 'P. vivax (Pv)',
        type: 'select',
        options: ['Positive', 'Negative'],
        sectionId: 'RESULTS',
        required: false,
        order: 2
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD'],
      tubeTypes: ['EDTA'],
      volume: '2ml',
      fastingRequired: false
    }
  },

  COVID19_RTPCR: {
    templateCode: 'COVID_RTPCR_V1',
    templateName: 'COVID-19 RT-PCR',
    shortName: 'COVID RT-PCR',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'MOLECULAR',
    testSubCategory: 'VIRAL',
    templateType: 'QUALITATIVE',
    description: 'Real-Time RT-PCR for SARS-CoV-2',
    
    fields: [
      {
        code: 'COVID_RESULT',
        label: 'SARS-CoV-2 RNA',
        type: 'select',
        options: ['NOT DETECTED', 'DETECTED'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'CT_VALUE',
        label: 'Ct Value',
        type: 'number',
        sectionId: 'RESULTS',
        required: false,
        order: 2,
        validation: { min: 10, max: 40, step: 0.1 }
      },
      {
        code: 'GENE_TARGETS',
        label: 'Gene Targets Detected',
        type: 'textarea',
        sectionId: 'RESULTS',
        required: false,
        order: 3
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['NASOPHARYNGEAL_SWAB', 'OROPHARYNGEAL_SWAB'],
      volume: 'Swab',
      fastingRequired: false
    }
  },

  VDRL: {
    templateCode: 'VDRL_V1',
    templateName: 'VDRL (Syphilis)',
    shortName: 'VDRL',
    category: 'SEROLOGY',
    department: 'LAB',
    subDepartment: 'SEROLOGY',
    testSubCategory: 'BACTERIAL',
    templateType: 'QUALITATIVE',
    description: 'Venereal Disease Research Laboratory test',
    
    fields: [
      {
        code: 'VDRL_RESULT',
        label: 'VDRL',
        type: 'select',
        options: ['Non-Reactive', 'Reactive'],
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'TITRE',
        label: 'Titre (if reactive)',
        type: 'text',
        sectionId: 'RESULTS',
        required: false,
        order: 2
      }
    ],
    
    specimenConfig: {
      sampleTypes: ['BLOOD', 'SERUM'],
      tubeTypes: ['PLAIN', 'SST'],
      volume: '2ml',
      fastingRequired: false
    }
  }
};

// Continue in next part...
