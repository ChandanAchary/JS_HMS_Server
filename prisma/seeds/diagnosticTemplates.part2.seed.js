/**
 * 🧬 UNIVERSAL DIAGNOSTIC REPORT TEMPLATE SEEDING SYSTEM - PART 2
 * ==================================================================
 * 
 * Radiology, Clinical Notes, OPD Reports, and Package Templates
 */

// ============================================
// 🩻 RADIOLOGY & IMAGING TEMPLATES
// ============================================

export const RADIOLOGY_TEMPLATES = {
  XRAY_CHEST: {
    templateCode: 'XRAY_CHEST_V1',
    templateName: 'X-Ray Chest (PA/AP View)',
    shortName: 'Chest X-Ray',
    category: 'RADIOLOGY',
    department: 'RADIOLOGY',
    subDepartment: 'X-RAY',
    testSubCategory: 'XRAY',
    templateType: 'NARRATIVE',
    description: 'Chest radiograph interpretation',
    
    sections: [
      { sectionId: 'TECHNIQUE', title: 'Technique', layout: 'TEXT', order: 1 },
      { sectionId: 'FINDINGS', title: 'Findings', layout: 'TEXT', order: 2 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 3 }
    ],
    
    fields: [
      {
        code: 'TECHNIQUE',
        label: 'Technique',
        type: 'textarea',
        sectionId: 'TECHNIQUE',
        required: true,
        order: 1,
        defaultValue: 'PA/AP view of chest taken in standard position'
      },
      {
        code: 'FINDINGS',
        label: 'Findings',
        type: 'textarea',
        sectionId: 'FINDINGS',
        required: true,
        order: 2,
        placeholder: 'Lungs, Heart, Mediastinum, Pleura, Bones, Soft tissues...'
      },
      {
        code: 'IMPRESSION',
        label: 'Impression',
        type: 'textarea',
        sectionId: 'IMPRESSION',
        required: true,
        order: 3
      }
    ],
    
    attachmentConfig: {
      allowImages: true,
      maxImages: 10,
      allowDICOM: true
    },
    
    signOffConfig: {
      requiresQCCheck: false,
      requiresPathologistReview: true,
      reviewerDesignation: 'Radiologist'
    }
  },

  ULTRASOUND_ABDOMEN: {
    templateCode: 'USG_ABD_V1',
    templateName: 'Ultrasound Abdomen & Pelvis',
    shortName: 'USG Abdomen',
    category: 'RADIOLOGY',
    department: 'RADIOLOGY',
    subDepartment: 'ULTRASOUND',
    testSubCategory: 'ULTRASOUND',
    templateType: 'NARRATIVE',
    description: 'Abdominal and pelvic ultrasonography',
    
    sections: [
      { sectionId: 'TECHNIQUE', title: 'Technique', layout: 'TEXT', order: 1 },
      { sectionId: 'LIVER', title: 'Liver', layout: 'TEXT', order: 2 },
      { sectionId: 'GB', title: 'Gall Bladder', layout: 'TEXT', order: 3 },
      { sectionId: 'PANCREAS', title: 'Pancreas', layout: 'TEXT', order: 4 },
      { sectionId: 'SPLEEN', title: 'Spleen', layout: 'TEXT', order: 5 },
      { sectionId: 'KIDNEYS', title: 'Kidneys', layout: 'TEXT', order: 6 },
      { sectionId: 'BLADDER', title: 'Urinary Bladder', layout: 'TEXT', order: 7 },
      { sectionId: 'UTERUS', title: 'Uterus & Adnexa', layout: 'TEXT', order: 8 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 9 }
    ],
    
    fields: [
      {
        code: 'TECHNIQUE',
        label: 'Technique',
        type: 'textarea',
        sectionId: 'TECHNIQUE',
        required: true,
        order: 1
      },
      {
        code: 'LIVER',
        label: 'Liver',
        type: 'textarea',
        sectionId: 'LIVER',
        required: true,
        order: 2
      },
      {
        code: 'GB',
        label: 'Gall Bladder',
        type: 'textarea',
        sectionId: 'GB',
        required: true,
        order: 3
      },
      {
        code: 'PANCREAS',
        label: 'Pancreas',
        type: 'textarea',
        sectionId: 'PANCREAS',
        required: true,
        order: 4
      },
      {
        code: 'SPLEEN',
        label: 'Spleen',
        type: 'textarea',
        sectionId: 'SPLEEN',
        required: true,
        order: 5
      },
      {
        code: 'KIDNEYS',
        label: 'Kidneys',
        type: 'textarea',
        sectionId: 'KIDNEYS',
        required: true,
        order: 6
      },
      {
        code: 'BLADDER',
        label: 'Urinary Bladder',
        type: 'textarea',
        sectionId: 'BLADDER',
        required: false,
        order: 7
      },
      {
        code: 'UTERUS',
        label: 'Uterus & Adnexa',
        type: 'textarea',
        sectionId: 'UTERUS',
        required: false,
        order: 8
      },
      {
        code: 'IMPRESSION',
        label: 'Impression',
        type: 'textarea',
        sectionId: 'IMPRESSION',
        required: true,
        order: 9
      }
    ],
    
    attachmentConfig: {
      allowImages: true,
      maxImages: 20,
      allowDICOM: true
    }
  },

  MAMMOGRAPHY: {
    templateCode: 'MAMMO_V1',
    templateName: 'Mammography (Bilateral)',
    shortName: 'Mammography',
    category: 'RADIOLOGY',
    department: 'RADIOLOGY',
    subDepartment: 'MAMMOGRAPHY',
    testSubCategory: 'MAMMOGRAPHY',
    templateType: 'NARRATIVE',
    description: 'Bilateral mammography with BI-RADS classification',
    
    sections: [
      { sectionId: 'TECHNIQUE', title: 'Technique', layout: 'TEXT', order: 1 },
      { sectionId: 'DENSITY', title: 'Breast Density', layout: 'TEXT', order: 2 },
      { sectionId: 'FINDINGS', title: 'Findings', layout: 'TEXT', order: 3 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 4 },
      { sectionId: 'BIRADS', title: 'BI-RADS Category', layout: 'KEY_VALUE', order: 5 }
    ],
    
    fields: [
      {
        code: 'TECHNIQUE',
        label: 'Technique',
        type: 'textarea',
        sectionId: 'TECHNIQUE',
        required: true,
        order: 1
      },
      {
        code: 'DENSITY',
        label: 'Breast Density',
        type: 'select',
        options: [
          'A - Almost entirely fatty',
          'B - Scattered fibroglandular',
          'C - Heterogeneously dense',
          'D - Extremely dense'
        ],
        sectionId: 'DENSITY',
        required: true,
        order: 2
      },
      {
        code: 'FINDINGS',
        label: 'Findings',
        type: 'textarea',
        sectionId: 'FINDINGS',
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
      },
      {
        code: 'BIRADS',
        label: 'BI-RADS Category',
        type: 'select',
        options: [
          'BI-RADS 0 - Incomplete, Need Additional Imaging',
          'BI-RADS 1 - Negative',
          'BI-RADS 2 - Benign',
          'BI-RADS 3 - Probably Benign',
          'BI-RADS 4 - Suspicious',
          'BI-RADS 5 - Highly Suggestive of Malignancy',
          'BI-RADS 6 - Known Biopsy-Proven Malignancy'
        ],
        sectionId: 'BIRADS',
        required: true,
        order: 5
      }
    ],
    
    attachmentConfig: {
      allowImages: true,
      maxImages: 10,
      allowDICOM: true
    }
  },

  CT_SCAN: {
    templateCode: 'CT_V1',
    templateName: 'CT Scan',
    shortName: 'CT Scan',
    category: 'RADIOLOGY',
    department: 'RADIOLOGY',
    subDepartment: 'CT',
    testSubCategory: 'CT',
    templateType: 'NARRATIVE',
    description: 'Computed Tomography scan report',
    
    sections: [
      { sectionId: 'CLINICAL', title: 'Clinical History', layout: 'TEXT', order: 1 },
      { sectionId: 'TECHNIQUE', title: 'Technique', layout: 'TEXT', order: 2 },
      { sectionId: 'FINDINGS', title: 'Findings', layout: 'TEXT', order: 3 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 4 }
    ],
    
    fields: [
      {
        code: 'CLINICAL',
        label: 'Clinical History',
        type: 'textarea',
        sectionId: 'CLINICAL',
        required: true,
        order: 1
      },
      {
        code: 'TECHNIQUE',
        label: 'Technique',
        type: 'textarea',
        sectionId: 'TECHNIQUE',
        required: true,
        order: 2
      },
      {
        code: 'FINDINGS',
        label: 'Findings',
        type: 'textarea',
        sectionId: 'FINDINGS',
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
    
    attachmentConfig: {
      allowImages: true,
      maxImages: 50,
      allowDICOM: true,
      dicomViewerIntegration: true
    }
  },

  MRI_SCAN: {
    templateCode: 'MRI_V1',
    templateName: 'MRI Scan',
    shortName: 'MRI',
    category: 'RADIOLOGY',
    department: 'RADIOLOGY',
    subDepartment: 'MRI',
    testSubCategory: 'MRI',
    templateType: 'NARRATIVE',
    description: 'Magnetic Resonance Imaging report',
    
    sections: [
      { sectionId: 'CLINICAL', title: 'Clinical History', layout: 'TEXT', order: 1 },
      { sectionId: 'TECHNIQUE', title: 'Technique', layout: 'TEXT', order: 2 },
      { sectionId: 'FINDINGS', title: 'Findings', layout: 'TEXT', order: 3 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 4 }
    ],
    
    fields: [
      {
        code: 'CLINICAL',
        label: 'Clinical History',
        type: 'textarea',
        sectionId: 'CLINICAL',
        required: true,
        order: 1
      },
      {
        code: 'TECHNIQUE',
        label: 'Technique',
        type: 'textarea',
        sectionId: 'TECHNIQUE',
        required: true,
        order: 2
      },
      {
        code: 'FINDINGS',
        label: 'Findings',
        type: 'textarea',
        sectionId: 'FINDINGS',
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
    
    attachmentConfig: {
      allowImages: true,
      maxImages: 100,
      allowDICOM: true,
      dicomViewerIntegration: true
    }
  }
};

// ============================================
// 🫁 RESPIRATORY & CARDIOLOGY TEMPLATES
// ============================================

export const RESPIRATORY_CARDIOLOGY_TEMPLATES = {
  PFT: {
    templateCode: 'PFT_V1',
    templateName: 'Pulmonary Function Test',
    shortName: 'PFT',
    category: 'RESPIRATORY',
    department: 'RESPIRATORY',
    subDepartment: 'PFT',
    testSubCategory: 'PFT',
    templateType: 'TABULAR',
    description: 'Spirometry and lung function assessment',
    
    fields: [
      {
        code: 'FVC',
        label: 'FVC (Forced Vital Capacity)',
        type: 'number',
        unit: 'Liters',
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'FVC_PERCENT',
        label: 'FVC % Predicted',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: true,
        order: 2
      },
      {
        code: 'FEV1',
        label: 'FEV1 (Forced Expiratory Volume in 1 sec)',
        type: 'number',
        unit: 'Liters',
        sectionId: 'RESULTS',
        required: true,
        order: 3
      },
      {
        code: 'FEV1_PERCENT',
        label: 'FEV1 % Predicted',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: true,
        order: 4
      },
      {
        code: 'FEV1_FVC_RATIO',
        label: 'FEV1/FVC Ratio',
        type: 'number',
        unit: '%',
        sectionId: 'RESULTS',
        required: true,
        order: 5
      },
      {
        code: 'PEFR',
        label: 'PEFR (Peak Expiratory Flow Rate)',
        type: 'number',
        unit: 'L/min',
        sectionId: 'RESULTS',
        required: false,
        order: 6
      },
      {
        code: 'INTERPRETATION',
        label: 'Interpretation',
        type: 'textarea',
        sectionId: 'RESULTS',
        required: true,
        order: 7
      }
    ],
    
    referenceRanges: {
      FEV1_FVC_RATIO: {
        all: {
          normal: { min: 70, max: 100 },
          obstructive: { min: 0, max: 70 }
        }
      }
    }
  },

  ECG: {
    templateCode: 'ECG_V1',
    templateName: 'Electrocardiogram (ECG/EKG)',
    shortName: 'ECG',
    category: 'CARDIOLOGY',
    department: 'CARDIOLOGY',
    subDepartment: 'ECG',
    testSubCategory: 'ECG',
    templateType: 'NARRATIVE',
    description: '12-lead electrocardiogram',
    
    sections: [
      { sectionId: 'FINDINGS', title: 'ECG Findings', layout: 'KEY_VALUE', order: 1 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 2 }
    ],
    
    fields: [
      {
        code: 'HEART_RATE',
        label: 'Heart Rate',
        type: 'number',
        unit: 'bpm',
        sectionId: 'FINDINGS',
        required: true,
        order: 1
      },
      {
        code: 'RHYTHM',
        label: 'Rhythm',
        type: 'text',
        sectionId: 'FINDINGS',
        required: true,
        order: 2
      },
      {
        code: 'PR_INTERVAL',
        label: 'PR Interval',
        type: 'text',
        sectionId: 'FINDINGS',
        required: false,
        order: 3
      },
      {
        code: 'QRS_DURATION',
        label: 'QRS Duration',
        type: 'text',
        sectionId: 'FINDINGS',
        required: false,
        order: 4
      },
      {
        code: 'QT_INTERVAL',
        label: 'QT Interval',
        type: 'text',
        sectionId: 'FINDINGS',
        required: false,
        order: 5
      },
      {
        code: 'AXIS',
        label: 'Axis',
        type: 'text',
        sectionId: 'FINDINGS',
        required: false,
        order: 6
      },
      {
        code: 'ST_CHANGES',
        label: 'ST-T Changes',
        type: 'textarea',
        sectionId: 'FINDINGS',
        required: false,
        order: 7
      },
      {
        code: 'IMPRESSION',
        label: 'Impression',
        type: 'textarea',
        sectionId: 'IMPRESSION',
        required: true,
        order: 8
      }
    ],
    
    attachmentConfig: {
      allowImages: true,
      maxImages: 5,
      allowPDF: true
    }
  },

  ECHO: {
    templateCode: 'ECHO_V1',
    templateName: 'Echocardiography (2D Echo)',
    shortName: '2D Echo',
    category: 'CARDIOLOGY',
    department: 'CARDIOLOGY',
    subDepartment: 'ECHO',
    testSubCategory: 'ECHO',
    templateType: 'NARRATIVE',
    description: 'Two-dimensional echocardiogram',
    
    sections: [
      { sectionId: 'CHAMBER_SIZE', title: 'Chamber Size', layout: 'TEXT', order: 1 },
      { sectionId: 'WALL_MOTION', title: 'Wall Motion', layout: 'TEXT', order: 2 },
      { sectionId: 'VALVES', title: 'Valves', layout: 'TEXT', order: 3 },
      { sectionId: 'EJECTION_FRACTION', title: 'Ejection Fraction', layout: 'KEY_VALUE', order: 4 },
      { sectionId: 'IMPRESSION', title: 'Impression', layout: 'TEXT', order: 5 }
    ],
    
    fields: [
      {
        code: 'CHAMBER_SIZE',
        label: 'Chamber Size',
        type: 'textarea',
        sectionId: 'CHAMBER_SIZE',
        required: true,
        order: 1
      },
      {
        code: 'WALL_MOTION',
        label: 'Wall Motion',
        type: 'textarea',
        sectionId: 'WALL_MOTION',
        required: true,
        order: 2
      },
      {
        code: 'VALVES',
        label: 'Valves',
        type: 'textarea',
        sectionId: 'VALVES',
        required: true,
        order: 3
      },
      {
        code: 'LVEF',
        label: 'LV Ejection Fraction',
        type: 'number',
        unit: '%',
        sectionId: 'EJECTION_FRACTION',
        required: true,
        order: 4
      },
      {
        code: 'IMPRESSION',
        label: 'Impression',
        type: 'textarea',
        sectionId: 'IMPRESSION',
        required: true,
        order: 5
      }
    ]
  }
};

// ============================================
// 🧑‍⚕️ OPD & CLINICAL NOTES
// ============================================

export const CLINICAL_NOTES_TEMPLATES = {
  OPD_CONSULTATION: {
    templateCode: 'OPD_CONSULT_V1',
    templateName: 'OPD Consultation Note',
    shortName: 'OPD Note',
    category: 'CLINICAL',
    department: 'OPD',
    subDepartment: 'CONSULTATION',
    testSubCategory: 'OPD',
    templateType: 'CLINICAL_NOTE',
    description: 'Outpatient department consultation record',
    
    sections: [
      { sectionId: 'CHIEF_COMPLAINTS', title: 'Chief Complaints', layout: 'TEXT', order: 1 },
      { sectionId: 'HISTORY', title: 'History', layout: 'TEXT', order: 2 },
      { sectionId: 'EXAMINATION', title: 'Examination', layout: 'TEXT', order: 3 },
      { sectionId: 'DIAGNOSIS', title: 'Diagnosis', layout: 'TEXT', order: 4 },
      { sectionId: 'TREATMENT', title: 'Treatment Plan', layout: 'TEXT', order: 5 },
      { sectionId: 'ADVICE', title: 'Advice', layout: 'TEXT', order: 6 }
    ],
    
    fields: [
      {
        code: 'CHIEF_COMPLAINTS',
        label: 'Chief Complaints',
        type: 'textarea',
        sectionId: 'CHIEF_COMPLAINTS',
        required: true,
        order: 1
      },
      {
        code: 'HISTORY_PRESENT_ILLNESS',
        label: 'History of Present Illness',
        type: 'textarea',
        sectionId: 'HISTORY',
        required: true,
        order: 2
      },
      {
        code: 'PAST_HISTORY',
        label: 'Past History',
        type: 'textarea',
        sectionId: 'HISTORY',
        required: false,
        order: 3
      },
      {
        code: 'FAMILY_HISTORY',
        label: 'Family History',
        type: 'textarea',
        sectionId: 'HISTORY',
        required: false,
        order: 4
      },
      {
        code: 'VITALS',
        label: 'Vital Signs',
        type: 'textarea',
        sectionId: 'EXAMINATION',
        required: true,
        order: 5
      },
      {
        code: 'SYSTEMIC_EXAMINATION',
        label: 'Systemic Examination',
        type: 'textarea',
        sectionId: 'EXAMINATION',
        required: true,
        order: 6
      },
      {
        code: 'PROVISIONAL_DIAGNOSIS',
        label: 'Provisional Diagnosis',
        type: 'textarea',
        sectionId: 'DIAGNOSIS',
        required: true,
        order: 7
      },
      {
        code: 'INVESTIGATIONS',
        label: 'Investigations Ordered',
        type: 'textarea',
        sectionId: 'TREATMENT',
        required: false,
        order: 8
      },
      {
        code: 'MEDICATIONS',
        label: 'Medications Prescribed',
        type: 'textarea',
        sectionId: 'TREATMENT',
        required: false,
        order: 9
      },
      {
        code: 'ADVICE',
        label: 'Advice',
        type: 'textarea',
        sectionId: 'ADVICE',
        required: true,
        order: 10
      },
      {
        code: 'FOLLOW_UP',
        label: 'Follow Up',
        type: 'text',
        sectionId: 'ADVICE',
        required: false,
        order: 11
      }
    ]
  },

  DISCHARGE_SUMMARY: {
    templateCode: 'DISCHARGE_V1',
    templateName: 'Discharge Summary',
    shortName: 'Discharge Summary',
    category: 'CLINICAL',
    department: 'IPD',
    subDepartment: 'DISCHARGE',
    testSubCategory: 'DISCHARGE',
    templateType: 'CLINICAL_NOTE',
    description: 'Hospital discharge summary',
    
    sections: [
      { sectionId: 'ADMISSION', title: 'Admission Details', layout: 'KEY_VALUE', order: 1 },
      { sectionId: 'DIAGNOSIS', title: 'Diagnosis', layout: 'TEXT', order: 2 },
      { sectionId: 'HOSPITAL_COURSE', title: 'Hospital Course', layout: 'TEXT', order: 3 },
      { sectionId: 'TREATMENT', title: 'Treatment Given', layout: 'TEXT', order: 4 },
      { sectionId: 'CONDITION', title: 'Condition at Discharge', layout: 'TEXT', order: 5 },
      { sectionId: 'MEDICATIONS', title: 'Discharge Medications', layout: 'TEXT', order: 6 },
      { sectionId: 'ADVICE', title: 'Advice', layout: 'TEXT', order: 7 }
    ],
    
    fields: [
      {
        code: 'ADMISSION_DATE',
        label: 'Date of Admission',
        type: 'date',
        sectionId: 'ADMISSION',
        required: true,
        order: 1
      },
      {
        code: 'DISCHARGE_DATE',
        label: 'Date of Discharge',
        type: 'date',
        sectionId: 'ADMISSION',
        required: true,
        order: 2
      },
      {
        code: 'DURATION',
        label: 'Duration of Stay',
        type: 'text',
        sectionId: 'ADMISSION',
        required: false,
        order: 3
      },
      {
        code: 'ADMISSION_DIAGNOSIS',
        label: 'Admission Diagnosis',
        type: 'textarea',
        sectionId: 'DIAGNOSIS',
        required: true,
        order: 4
      },
      {
        code: 'FINAL_DIAGNOSIS',
        label: 'Final Diagnosis',
        type: 'textarea',
        sectionId: 'DIAGNOSIS',
        required: true,
        order: 5
      },
      {
        code: 'HOSPITAL_COURSE',
        label: 'Hospital Course',
        type: 'textarea',
        sectionId: 'HOSPITAL_COURSE',
        required: true,
        order: 6
      },
      {
        code: 'TREATMENT_GIVEN',
        label: 'Treatment Given',
        type: 'textarea',
        sectionId: 'TREATMENT',
        required: true,
        order: 7
      },
      {
        code: 'CONDITION_AT_DISCHARGE',
        label: 'Condition at Discharge',
        type: 'select',
        options: ['Improved', 'Stable', 'Against Medical Advice', 'Referred', 'Expired'],
        sectionId: 'CONDITION',
        required: true,
        order: 8
      },
      {
        code: 'DISCHARGE_MEDICATIONS',
        label: 'Discharge Medications',
        type: 'textarea',
        sectionId: 'MEDICATIONS',
        required: true,
        order: 9
      },
      {
        code: 'ADVICE',
        label: 'Advice & Follow Up',
        type: 'textarea',
        sectionId: 'ADVICE',
        required: true,
        order: 10
      }
    ]
  },

  FITNESS_CERTIFICATE: {
    templateCode: 'FITNESS_CERT_V1',
    templateName: 'Medical Fitness Certificate',
    shortName: 'Fitness Certificate',
    category: 'CLINICAL',
    department: 'OPD',
    subDepartment: 'CERTIFICATE',
    testSubCategory: 'CERTIFICATE',
    templateType: 'CLINICAL_NOTE',
    description: 'Medical fitness certification',
    
    fields: [
      {
        code: 'PURPOSE',
        label: 'Purpose of Certificate',
        type: 'text',
        sectionId: 'DETAILS',
        required: true,
        order: 1
      },
      {
        code: 'EXAMINATION_DATE',
        label: 'Date of Examination',
        type: 'date',
        sectionId: 'DETAILS',
        required: true,
        order: 2
      },
      {
        code: 'FINDINGS',
        label: 'Examination Findings',
        type: 'textarea',
        sectionId: 'DETAILS',
        required: true,
        order: 3
      },
      {
        code: 'FITNESS_STATUS',
        label: 'Fitness Status',
        type: 'select',
        options: ['Fit', 'Fit with Restrictions', 'Temporarily Unfit', 'Permanently Unfit'],
        sectionId: 'DETAILS',
        required: true,
        order: 4
      },
      {
        code: 'REMARKS',
        label: 'Remarks',
        type: 'textarea',
        sectionId: 'DETAILS',
        required: false,
        order: 5
      }
    ]
  },

  SICK_LEAVE: {
    templateCode: 'SICK_LEAVE_V1',
    templateName: 'Sick Leave Certificate',
    shortName: 'Sick Leave',
    category: 'CLINICAL',
    department: 'OPD',
    subDepartment: 'CERTIFICATE',
    testSubCategory: 'CERTIFICATE',
    templateType: 'CLINICAL_NOTE',
    description: 'Medical certificate for sick leave',
    
    fields: [
      {
        code: 'DIAGNOSIS',
        label: 'Diagnosis',
        type: 'textarea',
        sectionId: 'DETAILS',
        required: true,
        order: 1
      },
      {
        code: 'LEAVE_FROM',
        label: 'Leave From',
        type: 'date',
        sectionId: 'DETAILS',
        required: true,
        order: 2
      },
      {
        code: 'LEAVE_TO',
        label: 'Leave To',
        type: 'date',
        sectionId: 'DETAILS',
        required: true,
        order: 3
      },
      {
        code: 'DURATION_DAYS',
        label: 'Duration (Days)',
        type: 'number',
        sectionId: 'DETAILS',
        required: false,
        order: 4
      },
      {
        code: 'REMARKS',
        label: 'Remarks',
        type: 'textarea',
        sectionId: 'DETAILS',
        required: false,
        order: 5
      }
    ]
  }
};

// ============================================
// 🧾 PACKAGE / COMPOSITE REPORTS
// ============================================

export const PACKAGE_TEMPLATES = {
  MASTER_HEALTH_CHECKUP: {
    templateCode: 'MASTER_HC_V1',
    templateName: 'Master Health Checkup',
    shortName: 'Master HC',
    category: 'PACKAGE',
    department: 'LAB',
    subDepartment: 'PACKAGES',
    testSubCategory: 'HEALTH_CHECKUP',
    templateType: 'HYBRID',
    description: 'Complete health checkup package',
    
    sections: [
      { sectionId: 'CBC', title: 'Complete Blood Count', layout: 'TABLE', order: 1 },
      { sectionId: 'GLUCOSE', title: 'Blood Glucose', layout: 'TABLE', order: 2 },
      { sectionId: 'LFT', title: 'Liver Function Test', layout: 'TABLE', order: 3 },
      { sectionId: 'KFT', title: 'Kidney Function Test', layout: 'TABLE', order: 4 },
      { sectionId: 'LIPID', title: 'Lipid Profile', layout: 'TABLE', order: 5 },
      { sectionId: 'THYROID', title: 'Thyroid Profile', layout: 'TABLE', order: 6 },
      { sectionId: 'URINE', title: 'Urine Analysis', layout: 'TABLE', order: 7 },
      { sectionId: 'IMAGING', title: 'Imaging Reports', layout: 'TEXT', order: 8 }
    ],
    
    includedTests: [
      'CBC',
      'ESR',
      'BLOOD_SUGAR',
      'HBA1C',
      'LFT',
      'KFT',
      'LIPID_PROFILE',
      'THYROID_PROFILE',
      'URINE_ROUTINE',
      'XRAY_CHEST',
      'ECG'
    ]
  },

  DIABETIC_PROFILE: {
    templateCode: 'DIABETIC_PROFILE_V1',
    templateName: 'Diabetic Profile',
    shortName: 'Diabetic Profile',
    category: 'PACKAGE',
    department: 'LAB',
    subDepartment: 'PACKAGES',
    testSubCategory: 'DIABETIC',
    templateType: 'HYBRID',
    description: 'Comprehensive diabetes monitoring package',
    
    sections: [
      { sectionId: 'GLUCOSE', title: 'Blood Glucose', layout: 'TABLE', order: 1 },
      { sectionId: 'HBA1C', title: 'HbA1c', layout: 'TABLE', order: 2 },
      { sectionId: 'LIPID', title: 'Lipid Profile', layout: 'TABLE', order: 3 },
      { sectionId: 'KFT', title: 'Kidney Function', layout: 'TABLE', order: 4 },
      { sectionId: 'URINE', title: 'Urine Analysis', layout: 'TABLE', order: 5 }
    ],
    
    includedTests: [
      'BLOOD_SUGAR',
      'HBA1C',
      'LIPID_PROFILE',
      'KFT',
      'URINE_ROUTINE',
      'URINE_MICROALBUMIN'
    ]
  },

  CARDIAC_PROFILE: {
    templateCode: 'CARDIAC_PROFILE_V1',
    templateName: 'Cardiac Profile',
    shortName: 'Cardiac Profile',
    category: 'PACKAGE',
    department: 'CARDIOLOGY',
    subDepartment: 'PACKAGES',
    testSubCategory: 'CARDIAC',
    templateType: 'HYBRID',
    description: 'Heart health evaluation package',
    
    sections: [
      { sectionId: 'LIPID', title: 'Lipid Profile', layout: 'TABLE', order: 1 },
      { sectionId: 'CARDIAC_ENZYMES', title: 'Cardiac Enzymes', layout: 'TABLE', order: 2 },
      { sectionId: 'ECG', title: 'ECG Report', layout: 'TEXT', order: 3 },
      { sectionId: 'ECHO', title: '2D Echo Report', layout: 'TEXT', order: 4 }
    ],
    
    includedTests: [
      'LIPID_PROFILE',
      'TROPONIN',
      'CPK_MB',
      'LDH',
      'ECG',
      'ECHO'
    ]
  },

  ANTENATAL_PROFILE: {
    templateCode: 'ANTENATAL_V1',
    templateName: 'Antenatal Profile',
    shortName: 'ANC Profile',
    category: 'PACKAGE',
    department: 'OB_GYN',
    subDepartment: 'PACKAGES',
    testSubCategory: 'ANTENATAL',
    templateType: 'HYBRID',
    description: 'Pregnancy monitoring package',
    
    sections: [
      { sectionId: 'CBC', title: 'Complete Blood Count', layout: 'TABLE', order: 1 },
      { sectionId: 'BLOOD_GROUP', title: 'Blood Group', layout: 'KEY_VALUE', order: 2 },
      { sectionId: 'GLUCOSE', title: 'Blood Glucose', layout: 'TABLE', order: 3 },
      { sectionId: 'THYROID', title: 'Thyroid Profile', layout: 'TABLE', order: 4 },
      { sectionId: 'INFECTIONS', title: 'Infection Screening', layout: 'TABLE', order: 5 },
      { sectionId: 'URINE', title: 'Urine Analysis', layout: 'TABLE', order: 6 }
    ],
    
    includedTests: [
      'CBC',
      'BLOOD_GROUP',
      'BLOOD_SUGAR',
      'THYROID_PROFILE',
      'HIV',
      'HBSAG',
      'HCV',
      'VDRL',
      'URINE_ROUTINE',
      'ULTRASOUND_OBSTETRIC'
    ]
  },

  PRE_OPERATIVE_PROFILE: {
    templateCode: 'PRE_OP_V1',
    templateName: 'Pre-Operative Profile',
    shortName: 'Pre-Op',
    category: 'PACKAGE',
    department: 'SURGERY',
    subDepartment: 'PACKAGES',
    testSubCategory: 'PRE_OPERATIVE',
    templateType: 'HYBRID',
    description: 'Pre-surgical evaluation package',
    
    sections: [
      { sectionId: 'CBC', title: 'Complete Blood Count', layout: 'TABLE', order: 1 },
      { sectionId: 'COAGULATION', title: 'Coagulation Profile', layout: 'TABLE', order: 2 },
      { sectionId: 'BLOOD_GROUP', title: 'Blood Group', layout: 'KEY_VALUE', order: 3 },
      { sectionId: 'BIOCHEMISTRY', title: 'Biochemistry', layout: 'TABLE', order: 4 },
      { sectionId: 'INFECTIONS', title: 'Infection Screening', layout: 'TABLE', order: 5 },
      { sectionId: 'XRAY', title: 'Chest X-Ray', layout: 'TEXT', order: 6 },
      { sectionId: 'ECG', title: 'ECG', layout: 'TEXT', order: 7 }
    ],
    
    includedTests: [
      'CBC',
      'PT_INR',
      'APTT',
      'BLOOD_GROUP',
      'BLOOD_SUGAR',
      'KFT',
      'LFT',
      'HIV',
      'HBSAG',
      'HCV',
      'XRAY_CHEST',
      'ECG'
    ]
  },

  FEVER_PROFILE: {
    templateCode: 'FEVER_PROFILE_V1',
    templateName: 'Fever Profile',
    shortName: 'Fever Profile',
    category: 'PACKAGE',
    department: 'LAB',
    subDepartment: 'PACKAGES',
    testSubCategory: 'FEVER',
    templateType: 'HYBRID',
    description: 'Fever investigation package',
    
    sections: [
      { sectionId: 'CBC', title: 'Complete Blood Count', layout: 'TABLE', order: 1 },
      { sectionId: 'SEROLOGY', title: 'Serology', layout: 'TABLE', order: 2 },
      { sectionId: 'URINE', title: 'Urine Analysis', layout: 'TABLE', order: 3 },
      { sectionId: 'BLOOD_CULTURE', title: 'Blood Culture', layout: 'TEXT', order: 4 }
    ],
    
    includedTests: [
      'CBC',
      'ESR',
      'CRP',
      'WIDAL',
      'DENGUE',
      'MALARIA',
      'URINE_ROUTINE',
      'BLOOD_CULTURE'
    ]
  }
};

// ============================================
// 🧬 NEUROLOGY & SPECIAL TESTS
// ============================================

export const NEUROLOGY_TEMPLATES = {
  CSF_ANALYSIS: {
    templateCode: 'CSF_V1',
    templateName: 'CSF (Cerebrospinal Fluid) Analysis',
    shortName: 'CSF Analysis',
    category: 'PATHOLOGY',
    department: 'LAB',
    subDepartment: 'BIOCHEMISTRY',
    testSubCategory: 'CSF',
    templateType: 'TABULAR',
    description: 'Cerebrospinal fluid analysis',
    
    fields: [
      {
        code: 'APPEARANCE',
        label: 'Appearance',
        type: 'text',
        sectionId: 'RESULTS',
        required: true,
        order: 1
      },
      {
        code: 'COLOR',
        label: 'Color',
        type: 'text',
        sectionId: 'RESULTS',
        required: true,
        order: 2
      },
      {
        code: 'TOTAL_CELLS',
        label: 'Total Cell Count',
        type: 'number',
        unit: 'cells/mm³',
        sectionId: 'RESULTS',
        required: true,
        order: 3
      },
      {
        code: 'PROTEIN',
        label: 'Protein',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 4
      },
      {
        code: 'GLUCOSE',
        label: 'Glucose',
        type: 'number',
        unit: 'mg/dL',
        sectionId: 'RESULTS',
        required: true,
        order: 5
      },
      {
        code: 'CHLORIDE',
        label: 'Chloride',
        type: 'number',
        unit: 'mEq/L',
        sectionId: 'RESULTS',
        required: false,
        order: 6
      }
    ],
    
    referenceRanges: {
      TOTAL_CELLS: { all: { min: 0, max: 5 } },
      PROTEIN: { all: { min: 15, max: 45 } },
      GLUCOSE: { all: { min: 50, max: 80 } },
      CHLORIDE: { all: { min: 118, max: 132 } }
    },
    
    specimenConfig: {
      sampleTypes: ['CSF'],
      volume: '2-5ml',
      fastingRequired: false,
      specialInstructions: 'Collect in sterile tube via lumbar puncture'
    }
  }
};

// Export all templates
// NOTE: This file exports only the templates defined here.
// The combined `ALL_TEMPLATES` object is assembled in
// `seedDiagnosticTemplates.js` which imports templates
// from both `diagnosticTemplates.seed.js` and this file.

// (No default combined export from this file)
