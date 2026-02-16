/**
 * Diagnostic Tests Seed Data
 * Sample diagnostic test catalog for initial setup
 */

export const DIAGNOSTIC_TEST_SEED = [
  // ==================== BLOOD TESTS ====================
  {
    testCode: 'LAB_CBC_001',
    testName: 'Complete Blood Count (CBC)',
    shortName: 'CBC',
    description: 'A complete blood count measures different components of the blood including RBC, WBC, hemoglobin, hematocrit, and platelets.',
    category: 'BLOOD_TEST',
    subCategory: 'Hematology',
    department: 'LAB',
    basePrice: 300,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '2ml',
    tubeType: 'EDTA',
    tubeColor: 'PURPLE',
    turnaroundTime: 4,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'Hemoglobin', gender: 'male', ageMin: 18, ageMax: 100, min: 13, max: 17, unit: 'g/dL' },
      { parameter: 'Hemoglobin', gender: 'female', ageMin: 18, ageMax: 100, min: 12, max: 16, unit: 'g/dL' },
      { parameter: 'WBC', gender: 'all', ageMin: 0, ageMax: 100, min: 4000, max: 11000, unit: '/µL' },
      { parameter: 'Platelet', gender: 'all', ageMin: 0, ageMax: 100, min: 150000, max: 450000, unit: '/µL' }
    ],
    unit: 'Multiple',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_LFT_001',
    testName: 'Liver Function Test (LFT)',
    shortName: 'LFT',
    description: 'Measures enzymes, proteins, and bilirubin levels to assess liver health.',
    category: 'BLOOD_TEST',
    subCategory: 'Biochemistry',
    department: 'LAB',
    basePrice: 400,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 6,
    fastingRequired: true,
    fastingHours: 8,
    referenceRanges: [
      { parameter: 'SGOT', gender: 'all', ageMin: 0, ageMax: 100, min: 5, max: 40, unit: 'U/L' },
      { parameter: 'SGPT', gender: 'all', ageMin: 0, ageMax: 100, min: 7, max: 56, unit: 'U/L' },
      { parameter: 'Total Bilirubin', gender: 'all', ageMin: 0, ageMax: 100, min: 0.1, max: 1.2, unit: 'mg/dL' },
      { parameter: 'ALP', gender: 'all', ageMin: 0, ageMax: 100, min: 44, max: 147, unit: 'U/L' }
    ],
    unit: 'Multiple',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_KFT_001',
    testName: 'Kidney Function Test (KFT)',
    shortName: 'KFT',
    description: 'Evaluates kidney function by measuring creatinine, BUN, and electrolytes.',
    category: 'BLOOD_TEST',
    subCategory: 'Biochemistry',
    department: 'LAB',
    basePrice: 350,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 6,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'Creatinine', gender: 'male', ageMin: 18, ageMax: 100, min: 0.7, max: 1.3, unit: 'mg/dL' },
      { parameter: 'Creatinine', gender: 'female', ageMin: 18, ageMax: 100, min: 0.6, max: 1.1, unit: 'mg/dL' },
      { parameter: 'BUN', gender: 'all', ageMin: 0, ageMax: 100, min: 7, max: 20, unit: 'mg/dL' },
      { parameter: 'Uric Acid', gender: 'male', ageMin: 18, ageMax: 100, min: 3.4, max: 7, unit: 'mg/dL' }
    ],
    unit: 'Multiple',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_TSH_001',
    testName: 'Thyroid Stimulating Hormone (TSH)',
    shortName: 'TSH',
    description: 'Measures TSH levels to evaluate thyroid function.',
    category: 'HORMONES',
    subCategory: 'Thyroid',
    department: 'LAB',
    basePrice: 250,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '3ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 24,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'TSH', gender: 'all', ageMin: 0, ageMax: 100, min: 0.4, max: 4.0, unit: 'mIU/L' }
    ],
    unit: 'mIU/L',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_TFT_001',
    testName: 'Thyroid Function Test (Complete)',
    shortName: 'TFT',
    description: 'Complete thyroid panel including T3, T4, and TSH.',
    category: 'HORMONES',
    subCategory: 'Thyroid',
    department: 'LAB',
    basePrice: 600,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 24,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'T3', gender: 'all', ageMin: 0, ageMax: 100, min: 80, max: 200, unit: 'ng/dL' },
      { parameter: 'T4', gender: 'all', ageMin: 0, ageMax: 100, min: 5.1, max: 14.1, unit: 'µg/dL' },
      { parameter: 'TSH', gender: 'all', ageMin: 0, ageMax: 100, min: 0.4, max: 4.0, unit: 'mIU/L' }
    ],
    unit: 'Multiple',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_LIPID_001',
    testName: 'Lipid Profile',
    shortName: 'Lipid',
    description: 'Measures cholesterol, triglycerides, HDL, LDL, and VLDL.',
    category: 'BLOOD_TEST',
    subCategory: 'Biochemistry',
    department: 'LAB',
    basePrice: 450,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 6,
    fastingRequired: true,
    fastingHours: 12,
    referenceRanges: [
      { parameter: 'Total Cholesterol', gender: 'all', ageMin: 0, ageMax: 100, min: 0, max: 200, unit: 'mg/dL' },
      { parameter: 'HDL', gender: 'male', ageMin: 18, ageMax: 100, min: 40, max: 100, unit: 'mg/dL' },
      { parameter: 'HDL', gender: 'female', ageMin: 18, ageMax: 100, min: 50, max: 100, unit: 'mg/dL' },
      { parameter: 'LDL', gender: 'all', ageMin: 0, ageMax: 100, min: 0, max: 100, unit: 'mg/dL' },
      { parameter: 'Triglycerides', gender: 'all', ageMin: 0, ageMax: 100, min: 0, max: 150, unit: 'mg/dL' }
    ],
    unit: 'Multiple',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_FBS_001',
    testName: 'Fasting Blood Sugar (FBS)',
    shortName: 'FBS',
    description: 'Measures blood glucose levels after fasting.',
    category: 'BLOOD_TEST',
    subCategory: 'Diabetes',
    department: 'LAB',
    basePrice: 80,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '2ml',
    tubeType: 'Fluoride',
    tubeColor: 'GREY',
    turnaroundTime: 2,
    fastingRequired: true,
    fastingHours: 8,
    referenceRanges: [
      { parameter: 'FBS', gender: 'all', ageMin: 0, ageMax: 100, min: 70, max: 100, unit: 'mg/dL' }
    ],
    unit: 'mg/dL',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_HBA1C_001',
    testName: 'Glycated Hemoglobin (HbA1c)',
    shortName: 'HbA1c',
    description: 'Measures average blood sugar over 2-3 months.',
    category: 'BLOOD_TEST',
    subCategory: 'Diabetes',
    department: 'LAB',
    basePrice: 400,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '2ml',
    tubeType: 'EDTA',
    tubeColor: 'PURPLE',
    turnaroundTime: 24,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'HbA1c', gender: 'all', ageMin: 0, ageMax: 100, min: 0, max: 5.7, unit: '%' }
    ],
    unit: '%',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },

  // ==================== IMAGING ====================
  {
    testCode: 'RAD_XRAY_CHEST_001',
    testName: 'X-Ray Chest (PA View)',
    shortName: 'Chest X-Ray',
    description: 'Posteroanterior view of chest X-ray.',
    category: 'IMAGING',
    subCategory: 'X-Ray',
    department: 'RADIOLOGY',
    basePrice: 500,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'IMAGING',
    turnaroundTime: 2,
    fastingRequired: false,
    homeCollectionAvailable: false,
    requiresAppointment: true,
    equipmentRequired: 'X-Ray Machine'
  },
  {
    testCode: 'RAD_USG_ABD_001',
    testName: 'Ultrasound Abdomen Complete',
    shortName: 'USG Abdomen',
    description: 'Complete abdominal ultrasound covering liver, gallbladder, pancreas, spleen, kidneys.',
    category: 'IMAGING',
    subCategory: 'Ultrasound',
    department: 'RADIOLOGY',
    basePrice: 800,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'IMAGING',
    turnaroundTime: 4,
    fastingRequired: true,
    fastingHours: 6,
    homeCollectionAvailable: false,
    requiresAppointment: true,
    equipmentRequired: 'Ultrasound Machine'
  },
  {
    testCode: 'RAD_CT_HEAD_001',
    testName: 'CT Scan Head (Plain)',
    shortName: 'CT Head',
    description: 'Non-contrast CT scan of the brain.',
    category: 'IMAGING',
    subCategory: 'CT Scan',
    department: 'RADIOLOGY',
    basePrice: 2500,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'IMAGING',
    turnaroundTime: 4,
    fastingRequired: false,
    homeCollectionAvailable: false,
    requiresAppointment: true,
    equipmentRequired: 'CT Scanner'
  },
  {
    testCode: 'RAD_MRI_BRAIN_001',
    testName: 'MRI Brain',
    shortName: 'MRI Brain',
    description: 'Magnetic resonance imaging of the brain.',
    category: 'IMAGING',
    subCategory: 'MRI',
    department: 'RADIOLOGY',
    basePrice: 5000,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'IMAGING',
    turnaroundTime: 24,
    fastingRequired: false,
    homeCollectionAvailable: false,
    requiresAppointment: true,
    equipmentRequired: 'MRI Machine'
  },

  // ==================== CARDIAC TESTS ====================
  {
    testCode: 'CARD_ECG_001',
    testName: 'Electrocardiogram (ECG/EKG)',
    shortName: 'ECG',
    description: '12-lead electrocardiogram to assess heart rhythm and electrical activity.',
    category: 'CARDIAC',
    subCategory: 'Electrophysiology',
    department: 'CARDIOLOGY',
    basePrice: 200,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'OTHER',
    turnaroundTime: 1,
    fastingRequired: false,
    homeCollectionAvailable: false,
    requiresAppointment: false,
    equipmentRequired: 'ECG Machine'
  },
  {
    testCode: 'CARD_ECHO_001',
    testName: '2D Echocardiography',
    shortName: 'ECHO',
    description: 'Ultrasound imaging of the heart to assess structure and function.',
    category: 'CARDIAC',
    subCategory: 'Echocardiography',
    department: 'CARDIOLOGY',
    basePrice: 1500,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'IMAGING',
    turnaroundTime: 4,
    fastingRequired: false,
    homeCollectionAvailable: false,
    requiresAppointment: true,
    equipmentRequired: 'Echo Machine'
  },
  {
    testCode: 'CARD_TMT_001',
    testName: 'Treadmill Test (TMT)',
    shortName: 'TMT',
    description: 'Stress test to evaluate heart function during exercise.',
    category: 'CARDIAC',
    subCategory: 'Stress Test',
    department: 'CARDIOLOGY',
    basePrice: 1200,
    taxRate: 5,
    hsnSacCode: '998932',
    sampleType: 'OTHER',
    turnaroundTime: 2,
    fastingRequired: false,
    homeCollectionAvailable: false,
    requiresAppointment: true,
    equipmentRequired: 'Treadmill with ECG'
  },

  // ==================== URINE TESTS ====================
  {
    testCode: 'LAB_URINE_001',
    testName: 'Urine Routine & Microscopy',
    shortName: 'Urine R/M',
    description: 'Complete urine analysis including physical, chemical, and microscopic examination.',
    category: 'URINE_TEST',
    subCategory: 'Routine',
    department: 'LAB',
    basePrice: 150,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'URINE',
    sampleVolume: '30ml',
    turnaroundTime: 2,
    fastingRequired: false,
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_URINE_CULTURE_001',
    testName: 'Urine Culture & Sensitivity',
    shortName: 'Urine C/S',
    description: 'Culture test to identify bacterial infection and antibiotic sensitivity.',
    category: 'MICROBIOLOGY',
    subCategory: 'Culture',
    department: 'LAB',
    basePrice: 600,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'URINE',
    sampleVolume: '30ml',
    turnaroundTime: 72,
    fastingRequired: false,
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },

  // ==================== SEROLOGY ====================
  {
    testCode: 'LAB_HIV_001',
    testName: 'HIV I & II Antibody Test',
    shortName: 'HIV',
    description: 'Screening test for HIV infection.',
    category: 'SEROLOGY',
    subCategory: 'Infectious Disease',
    department: 'LAB',
    basePrice: 350,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 24,
    fastingRequired: false,
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_HBSAG_001',
    testName: 'Hepatitis B Surface Antigen (HBsAg)',
    shortName: 'HBsAg',
    description: 'Screening test for Hepatitis B infection.',
    category: 'SEROLOGY',
    subCategory: 'Infectious Disease',
    department: 'LAB',
    basePrice: 300,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 24,
    fastingRequired: false,
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_CRP_001',
    testName: 'C-Reactive Protein (CRP)',
    shortName: 'CRP',
    description: 'Marker for inflammation in the body.',
    category: 'BLOOD_TEST',
    subCategory: 'Inflammation',
    department: 'LAB',
    basePrice: 350,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '3ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 6,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'CRP', gender: 'all', ageMin: 0, ageMax: 100, min: 0, max: 10, unit: 'mg/L' }
    ],
    unit: 'mg/L',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_VITD_001',
    testName: 'Vitamin D (25-OH)',
    shortName: 'Vit D',
    description: 'Measures vitamin D levels in the blood.',
    category: 'BLOOD_TEST',
    subCategory: 'Vitamins',
    department: 'LAB',
    basePrice: 1200,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 48,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'Vitamin D', gender: 'all', ageMin: 0, ageMax: 100, min: 30, max: 100, unit: 'ng/mL' }
    ],
    unit: 'ng/mL',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  },
  {
    testCode: 'LAB_VITB12_001',
    testName: 'Vitamin B12',
    shortName: 'Vit B12',
    description: 'Measures vitamin B12 levels in the blood.',
    category: 'BLOOD_TEST',
    subCategory: 'Vitamins',
    department: 'LAB',
    basePrice: 800,
    taxRate: 5,
    hsnSacCode: '998931',
    sampleType: 'BLOOD',
    sampleVolume: '5ml',
    tubeType: 'SST',
    tubeColor: 'RED',
    turnaroundTime: 48,
    fastingRequired: false,
    referenceRanges: [
      { parameter: 'Vitamin B12', gender: 'all', ageMin: 0, ageMax: 100, min: 200, max: 900, unit: 'pg/mL' }
    ],
    unit: 'pg/mL',
    homeCollectionAvailable: true,
    homeCollectionCharge: 50
  }
];

/**
 * Seed diagnostic tests for a hospital
 * @param {PrismaClient} prisma - Prisma client
 * @param {string} hospitalId - Hospital ID
 */
export async function seedDiagnosticTests(prisma, hospitalId) {
  const tests = DIAGNOSTIC_TEST_SEED.map(test => ({
    ...test,
    hospitalId
  }));

  // Use upsert to avoid duplicates
  for (const test of tests) {
    await prisma.diagnosticTest.upsert({
      where: { testCode: test.testCode },
      update: { ...test },
      create: { ...test }
    });
  }

  return {
    message: `${tests.length} diagnostic tests seeded successfully`,
    count: tests.length
  };
}

export default DIAGNOSTIC_TEST_SEED;

















