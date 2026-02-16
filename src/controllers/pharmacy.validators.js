/**
 * Pharmacy Validators & DTOs
 * Input validation and data transformation for drug, inventory, and dispensing operations
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export const parseDrugInput = (body) => {
  return {
    drugName: body.drugName?.trim(),
    brandName: body.brandName?.trim(),
    drugCode: body.drugCode?.trim(),
    category: body.category,
    subcategory: body.subcategory?.trim(),
    strength: body.strength?.trim(),
    unit: body.unit,
    therapeuticClass: body.therapeuticClass?.trim(),
    indication: body.indication?.trim(),
    contraindications: body.contraindications?.trim(),
    sideEffects: body.sideEffects?.trim(),
    dosageInstructions: body.dosageInstructions?.trim(),
    hsnSacCode: body.hsnSacCode?.trim(),
    gstRate: body.gstRate || 5,
    manufacturerLicense: body.manufacturerLicense?.trim(),
    manufacturerName: body.manufacturerName?.trim(),
    minimumStock: body.minimumStock || 10,
    maximumStock: body.maximumStock || 100,
    reorderLevel: body.reorderLevel || 20,
    reorderQuantity: body.reorderQuantity || 50,
    costPrice: parseFloat(body.costPrice),
    sellingPrice: parseFloat(body.sellingPrice),
    mrp: body.mrp ? parseFloat(body.mrp) : null,
    storageCondition: body.storageCondition?.trim(),
    shelfLife: body.shelfLife ? parseInt(body.shelfLife) : null,
    requiresPrescription: body.requiresPrescription || false,
  };
};

export const formatDrug = (drug) => {
  return {
    id: drug.id,
    drugName: drug.drugName,
    brandName: drug.brandName,
    drugCode: drug.drugCode,
    category: drug.category,
    strength: drug.strength,
    unit: drug.unit,
    therapeuticClass: drug.therapeuticClass,
    costPrice: drug.costPrice,
    sellingPrice: drug.sellingPrice,
    mrp: drug.mrp,
    minimumStock: drug.minimumStock,
    reorderLevel: drug.reorderLevel,
    isActive: drug.isActive,
    requiresPrescription: drug.requiresPrescription,
  };
};

export const formatInventory = (inventory) => {
  return {
    id: inventory.id,
    drugId: inventory.drugId,
    batchNumber: inventory.batchNumber,
    manufacturingDate: inventory.manufacturingDate,
    expiryDate: inventory.expiryDate,
    quantity: inventory.quantity,
    unit: inventory.unit,
    totalCost: inventory.totalCost,
    vendorName: inventory.vendorName,
    status: inventory.status,
    isExpired: inventory.isExpired,
    expiringIn: calculateDaysToExpiry(inventory.expiryDate),
  };
};

export const formatDispense = (dispense) => {
  return {
    id: dispense.id,
    dispenseId: dispense.dispenseId,
    patientName: dispense.patientName,
    itemCount: dispense.items?.length || 0,
    subtotal: dispense.subtotal,
    taxAmount: dispense.taxAmount,
    discountAmount: dispense.discountAmount,
    totalAmount: dispense.totalAmount,
    paymentStatus: dispense.paymentStatus,
    dispensedBy: dispense.dispensedByName,
    dispensedAt: dispense.dispensedAt,
  };
};

export const formatTransaction = (transaction) => {
  return {
    id: transaction.id,
    drugId: transaction.drugId,
    transactionType: transaction.transactionType,
    quantity: transaction.quantity,
    quantityBefore: transaction.quantityBefore,
    quantityAfter: transaction.quantityAfter,
    performedBy: transaction.performedByName,
    reason: transaction.reason,
    createdAt: transaction.createdAt,
  };
};

const calculateDaysToExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ============================================================================
// Validators
// ============================================================================
export const validateDrugInput = (req, res, next) => {
  const { drugName, drugCode, category, strength, unit, costPrice, sellingPrice } = req.body;

  const errors = [];

  if (!drugName || typeof drugName !== 'string' || drugName.trim().length === 0) {
    errors.push('Drug name is required and must be a non-empty string');
  }

  if (!drugCode || typeof drugCode !== 'string' || drugCode.trim().length === 0) {
    errors.push('Drug code is required and must be a non-empty string');
  }

  if (!category || typeof category !== 'string') {
    errors.push('Category is required (TABLET, CAPSULE, INJECTION, SYRUP, OINTMENT)');
  }

  if (!strength || typeof strength !== 'string') {
    errors.push('Strength is required (e.g., 500mg)');
  }

  if (!unit || typeof unit !== 'string') {
    errors.push('Unit is required (mg, ml, IU)');
  }

  if (typeof costPrice !== 'number' || costPrice < 0) {
    errors.push('Cost price must be a non-negative number');
  }

  if (typeof sellingPrice !== 'number' || sellingPrice < 0) {
    errors.push('Selling price must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateInventoryInput = (req, res, next) => {
  const { drugId, batchNumber, manufacturingDate, expiryDate, quantity, unit, costPrice } = req.body;

  const errors = [];

  if (!drugId || typeof drugId !== 'string') {
    errors.push('Drug ID is required');
  }

  if (!batchNumber || typeof batchNumber !== 'string') {
    errors.push('Batch number is required');
  }

  if (!manufacturingDate) {
    errors.push('Manufacturing date is required');
  }

  if (!expiryDate) {
    errors.push('Expiry date is required');
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  if (!unit || typeof unit !== 'string') {
    errors.push('Unit is required (PIECE, BOX, STRIP, VIAL)');
  }

  if (typeof costPrice !== 'number' || costPrice < 0) {
    errors.push('Cost price must be a non-negative number');
  }

  // Validate dates
  const mfgDate = new Date(manufacturingDate);
  const expDate = new Date(expiryDate);
  if (mfgDate >= expDate) {
    errors.push('Expiry date must be after manufacturing date');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validatePrescriptionDispense = (req, res, next) => {
  const { items, patientName } = req.body;

  const errors = [];

  if (!patientName || typeof patientName !== 'string') {
    errors.push('Patient name is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one item is required');
  }

  items?.forEach((item, idx) => {
    if (!item.drugId) {
      errors.push(`Item ${idx + 1}: Drug ID is required`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Item ${idx + 1}: Quantity must be positive`);
    }
    if (typeof item.sellingPrice !== 'number' || item.sellingPrice < 0) {
      errors.push(`Item ${idx + 1}: Selling price must be non-negative`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

















