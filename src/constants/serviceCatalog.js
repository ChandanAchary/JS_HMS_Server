export const SERVICE_CATEGORIES = [
  "Hospital Entry & Consultation",
  "Basic Diagnostic Lab Tests",
  "Imaging / Radiology",
  "Cardiology Tests",
  "Inpatient / Bed Charges",
  "Other Services",
  "Minor Procedures",
  "Advanced / Complex Services"
];

export const SERVICE_CATALOG = [
  {
    category: "Hospital Entry & Consultation",
    services: [
      { serviceName: "OPD Registration / Entry Fee", defaultPrice: 100 },
      { serviceName: "General Physician Consultation", defaultPrice: 300 },
      { serviceName: "Specialist Consultation", defaultPrice: 500 },
      { serviceName: "Emergency OPD Visit", defaultPrice: 3000 }
    ]
  },
  {
    category: "Basic Diagnostic Lab Tests",
    services: [
      { serviceName: "CBC (Complete Blood Count)", defaultPrice: 200 },
      { serviceName: "Blood Sugar Test (Fasting)", defaultPrice: 150 },
      { serviceName: "Lipid Profile", defaultPrice: 400 },
      { serviceName: "Liver Function Test (LFT)", defaultPrice: 500 },
      { serviceName: "Kidney Function Test (KFT)", defaultPrice: 600 },
      { serviceName: "Thyroid Function Test", defaultPrice: 800 }
    ]
  },
  {
    category: "Imaging / Radiology",
    services: [
      { serviceName: "X-Ray", defaultPrice: 200 },
      { serviceName: "Ultrasound (USG)", defaultPrice: 800 },
      { serviceName: "CT Scan", defaultPrice: 2500 },
      { serviceName: "MRI Scan", defaultPrice: 6000 }
    ]
  },
  {
    category: "Cardiology Tests",
    services: [
      { serviceName: "ECG", defaultPrice: 200 },
      { serviceName: "2D Echo", defaultPrice: 1500 }
    ]
  },
  {
    category: "Inpatient / Bed Charges",
    services: [
      { serviceName: "General Ward", defaultPrice: 500 },
      { serviceName: "Semi-Private Room", defaultPrice: 2000 },
      { serviceName: "Private Room", defaultPrice: 4000 },
      { serviceName: "ICU", defaultPrice: 8000 }
    ]
  },
  {
    category: "Other Services",
    services: [
      { serviceName: "Dialysis Session", defaultPrice: 1500 },
      { serviceName: "Ambulance Service", defaultPrice: 1000 }
    ]
  },
  {
    category: "Minor Procedures",
    services: [
      { serviceName: "Cataract Surgery (per eye)", defaultPrice: 15000 },
      { serviceName: "Appendectomy", defaultPrice: 25000 },
      { serviceName: "Hernia Repair", defaultPrice: 20000 },
      { serviceName: "Cholecystectomy", defaultPrice: 35000 },
      { serviceName: "Coronary Angiography", defaultPrice: 18000 }
    ]
  },
  {
    category: "Advanced / Complex Services",
    services: [
      { serviceName: "Cardiac Angioplasty", defaultPrice: 100000 },
      { serviceName: "Knee Replacement", defaultPrice: 180000 },
      { serviceName: "Hip Replacement", defaultPrice: 200000 },
      { serviceName: "Minimally Invasive Cancer Surgery", defaultPrice: 200000 }
    ]
  }
];

// Flat map for quick lookup by category+serviceName
export const SERVICE_MAP = (() => {
  const m = new Map();
  for (const group of SERVICE_CATALOG) {
    for (const s of group.services) {
      m.set(`${group.category}::${s.serviceName}`, { ...s, category: group.category });
    }
  }
  return m;
})();

export default { SERVICE_CATALOG, SERVICE_CATEGORIES, SERVICE_MAP };

















