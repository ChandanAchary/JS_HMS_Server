/**
 * Billing Validators & DTOs
 * Validation functions and response formatting for billing-related operations
 */

import { ValidationError } from '../shared/AppError.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Response DTO for bill
 */
export const formatBill = (bill) => ({
  id: bill.id,
  billId: bill.billId,
  patientId: bill.patientId,
  hospitalId: bill.hospitalId,
  services: bill.services,
  totalAmount: bill.totalAmount,
  paymentStatus: bill.paymentStatus,
  paymentMode: bill.paymentMode,
  paymentDetails: bill.paymentDetails,
  isEmergency: bill.isEmergency || false,
  visitType: bill.visitType,
  departmentCode: bill.departmentCode,
  billDate: bill.billDate,
  createdAt: bill.createdAt,
  lockedAt: bill.lockedAt,
  createdBy: bill.createdBy
});

/**
 * Response DTO for bill list item
 */
export const formatBillListItem = (bill) => ({
  billId: bill.billId,
  billDate: bill.billDate,
  services: bill.services,
  totalAmount: bill.totalAmount,
  paymentStatus: bill.paymentStatus,
  paymentMode: bill.paymentMode
});

/**
 * Response DTO for patient with bills
 */
export const formatPatientWithBills = (patient, bills = []) => ({
  patientId: patient.patientId,
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  address: patient.address || '',
  bills: bills.map(formatBillListItem)
});

/**
 * Response DTO for bill creation success
 */
export const formatBillCreated = (bill) => ({
  message: 'Bill created successfully',
  bill: formatBill(bill)
});

/**
 * Response DTO for payment received
 */
export const formatPaymentReceived = (bill) => ({
  message: 'Payment recorded successfully',
  bill: formatBill(bill)
});

/**
 * Request DTO for bill creation
 */
export const parseBillInput = (body) => ({
  services: body.services || [],
  paymentMode: body.paymentMode || 'Cash'
});

/**
 * Request DTO for service item validation
 */
export const parseServiceItem = (item) => ({
  serviceName: String(item.serviceName || '').trim(),
  category: String(item.category || '').trim(),
  quantity: Math.max(1, Number(item.quantity || 1)),
  unitPrice: Number(item.unitPrice ?? item.price ?? 0)
});

/**
 * Response DTO for login
 */
export const formatBillingLoginResponse = (employee, token) => ({
  message: 'Login successful',
  token,
  role: employee.role,
  employee: {
    id: employee.id,
    name: employee.name,
    phone: employee.phone,
    role: employee.role
  }
});

// ============================================================================
// Validators
// ============================================================================

// Valid billing roles
export const BILLING_ROLES = ['BILLING_ENTRY', 'BILLING_EXIT'];

// Valid payment modes
export const PAYMENT_MODES = ['Cash', 'Card', 'UPI', 'NetBanking', 'Insurance', 'Other'];

/**
 * Validate billing login
 */
export const validateBillingLogin = (data) => {
  const errors = [];

  if (!data.emailOrPhone?.trim()) {
    errors.push('Email or phone is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Check if role is valid for billing
 */
export const isBillingRole = (role) => {
  return BILLING_ROLES.includes(role);
};

/**
 * Validate patient creation input
 */
export const validatePatientCreate = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate services array for bill creation
 */
export const validateServices = (services) => {
  if (!Array.isArray(services) || services.length === 0) {
    throw new ValidationError('At least one service is required');
  }

  const errors = [];

  services.forEach((item, index) => {
    if (!item.serviceName?.trim()) {
      errors.push(`Service ${index + 1}: Service name is required`);
    }
    if (!item.category?.trim()) {
      errors.push(`Service ${index + 1}: Category is required`);
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate payment mode
 */
export const validatePaymentMode = (mode) => {
  if (!mode) return 'Cash';
  
  if (!PAYMENT_MODES.includes(mode)) {
    throw new ValidationError(`Invalid payment mode. Must be one of: ${PAYMENT_MODES.join(', ')}`);
  }
  
  return mode;
};

/**
 * Validate payment input
 */
export const validatePaymentInput = (data) => {
  const paymentMode = validatePaymentMode(data.paymentMode || 'Cash');
  const paymentDetails = data.paymentDetails || {};
  
  return { paymentMode, paymentDetails };
};

export default {
  validateBillingLogin,
  isBillingRole,
  validatePatientCreate,
  validateServices,
  validatePaymentMode,
  validatePaymentInput,
  BILLING_ROLES,
  PAYMENT_MODES
};



















