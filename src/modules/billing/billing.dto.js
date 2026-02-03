/**
 * Billing DTOs (Data Transfer Objects)
 */

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

export default {
  formatBill,
  formatBillListItem,
  formatPatientWithBills,
  formatBillCreated,
  formatPaymentReceived,
  parseBillInput,
  parseServiceItem,
  formatBillingLoginResponse
};
