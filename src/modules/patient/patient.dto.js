/**
 * Patient DTOs (Data Transfer Objects)
 */

/**
 * Response DTO for patient
 */
export const formatPatient = (patient) => ({
  patientId: patient.patientId,
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  address: patient.address || '',
  createdAt: patient.createdAt
});

/**
 * Response DTO for patient with bills
 */
export const formatPatientWithBills = (patient, bills = []) => ({
  ...formatPatient(patient),
  bills: bills.map(formatBillSummary)
});

/**
 * Response DTO for bill summary
 */
export const formatBillSummary = (bill) => ({
  billId: bill.billId,
  billDate: bill.billDate,
  services: bill.services,
  totalAmount: bill.totalAmount,
  paymentStatus: bill.paymentStatus,
  paymentMode: bill.paymentMode
});

/**
 * Request DTO for patient creation
 */
export const parsePatientInput = (body) => ({
  name: body.name?.trim(),
  age: body.age ? parseInt(body.age) : null,
  gender: body.gender?.trim() || null,
  phone: body.phone?.trim(),
  address: body.address?.trim() || null
});

/**
 * Response DTO for patient search results
 */
export const formatPatientSearchResults = (patients, billsByPatient = {}) => ({
  success: true,
  patients: patients.map(p => formatPatientWithBills(p, billsByPatient[p.patientId] || []))
});

/**
 * Response DTO for paginated patients
 */
export const formatPaginatedPatients = (result, billsByPatient = {}) => ({
  patients: result.data.map(p => formatPatientWithBills(p, billsByPatient[p.patientId] || [])),
  pagination: result.pagination
});

export default {
  formatPatient,
  formatPatientWithBills,
  formatBillSummary,
  parsePatientInput,
  formatPatientSearchResults,
  formatPaginatedPatients
};
