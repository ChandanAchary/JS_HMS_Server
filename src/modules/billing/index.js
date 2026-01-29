/**
 * Billing Module
 * Patient billing and payment management
 */

// Routes (default export)
export { default as billingRoutes } from './billing.routes.js';

// Service
export { BillingService } from './billing.service.js';

// Repository
export { BillRepository, CounterRepository } from './billing.repository.js';

// Controller functions
export {
  billingLogin,
  createPatient,
  getPatient,
  searchPatients,
  getCatalog,
  createBill,
  listBills,
  getBill,
  getBillByPatientAndBillId,
  receivePayment
} from './billing.controller.js';

// DTOs
export {
  formatBill,
  formatBillListItem,
  formatPatientWithBills,
  formatBillCreated,
  formatPaymentReceived,
  parseBillInput,
  parseServiceItem,
  formatBillingLoginResponse
} from './billing.dto.js';

// Validators
export {
  validateBillingLogin,
  isBillingRole,
  validatePatientCreate,
  validateServices,
  validatePaymentMode,
  validatePaymentInput,
  BILLING_ROLES,
  PAYMENT_MODES
} from './billing.validators.js';

// Default export for routes
import billingRoutes from './billing.routes.js';
export default billingRoutes;
