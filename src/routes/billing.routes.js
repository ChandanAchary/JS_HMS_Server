/**
 * Billing Routes
 * API routes for billing operations
 */

import { Router } from 'express';
import * as billingController from '../controllers/billing.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Root endpoint - returns billing module info
router.get('/', (req, res) => {
  res.json({ module: 'billing', status: 'active', endpoints: ['POST /login', 'GET /catalog', 'POST /patients', 'GET /patients/search', 'POST /patients/:patientId/bills'] });
});

// Public route - billing login
router.post('/login', billingController.billingLogin);

// Protected routes (require authentication)
router.use(protect);

// Service catalog
router.get('/catalog', billingController.getCatalog);

// Patient routes
router.post('/patients', billingController.createPatient);
router.get('/patients/search', billingController.searchPatients);
router.get('/patients/:patientId', billingController.getPatient);

// Bill routes for patient
router.post('/patients/:patientId/bills', billingController.createBill);
router.get('/patients/:patientId/bills', billingController.listBills);
router.get('/patients/:patientId/bills/:billId', billingController.getBillByPatientAndBillId);

// Direct bill routes
router.get('/bills/:billId', billingController.getBill);
router.post('/bills/:billId/payment', billingController.receivePayment);

export { router as billingRoutes };
export default router;
