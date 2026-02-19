/**
 * Pharmacy Routes
 * Drug catalog, inventory, and dispensing management
 */

import express from 'express';
import * as controller from '../controllers/pharmacy.controller.js';
import { protect as authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizePermission } from '../middlewares/rbac.middleware.js';
import * as validators from '../controllers/pharmacy.validators.js';

const router = express.Router();

// Root endpoint - returns pharmacy module info
router.get('/', (req, res) => {
  res.json({ module: 'pharmacy', status: 'active', endpoints: ['GET /drugs', 'POST /drugs', 'GET /inventory', 'POST /dispense', 'GET /transactions'] });
});

// ============== DRUG MANAGEMENT ==============
// Get all drugs (with filters)
router.get('/drugs', authenticateToken, authorizePermission('MANAGE_BILLING'), controller.getDrugs);

// Create new drug
router.post('/drugs', authenticateToken, authorizePermission('MANAGE_BILLING'), validators.validateDrugInput, controller.createDrug);

// Get drug by ID
router.get('/drugs/:drugId', authenticateToken, controller.getDrugById);

// Update drug
router.put('/drugs/:drugId', authenticateToken, authorizePermission('MANAGE_BILLING'), validators.validateDrugInput, controller.updateDrug);

// Delete drug
router.delete('/drugs/:drugId', authenticateToken, authorizePermission('MANAGE_BILLING'), controller.deleteDrug);

// ============== INVENTORY MANAGEMENT ==============
// Get inventory by drug (with stock levels)
router.get('/inventory/drug/:drugId', authenticateToken, controller.getInventoryByDrug);

// Get all inventory (with filters)
router.get('/inventory', authenticateToken, controller.getInventory);

// Add new stock (Purchase)
router.post('/inventory', authenticateToken, authorizePermission('MANAGE_BILLING'), validators.validateInventoryInput, controller.addInventory);

// Update inventory (e.g., warehouse location)
router.put('/inventory/:inventoryId', authenticateToken, authorizePermission('MANAGE_BILLING'), controller.updateInventory);

// ============== INVENTORY TRANSACTIONS ==============
// Get transaction history
router.get('/transactions', authenticateToken, controller.getTransactions);

// Get low stock alerts
router.get('/alerts/low-stock', authenticateToken, controller.getLowStockAlerts);

// Get expiring drugs
router.get('/alerts/expiring', authenticateToken, controller.getExpiringDrugs);

// ============== PRESCRIPTION DISPENSING ==============
// Dispense drugs (Pharmacy counter)
router.post('/dispense', authenticateToken, authorizePermission('BILLING_ACCESS'), validators.validatePrescriptionDispense, controller.dispensePrescription);

// Get dispense history
router.get('/dispenses', authenticateToken, controller.getDispenses);

// Get dispense by ID
router.get('/dispenses/:dispenseId', authenticateToken, controller.getDispenseById);

// ============== REPORTS ==============
// Inventory report
router.get('/reports/inventory-status', authenticateToken, controller.getInventoryReport);

// Stock movement report
router.get('/reports/stock-movement', authenticateToken, controller.getStockMovementReport);

// Expiry report
router.get('/reports/expiry-analysis', authenticateToken, controller.getExpiryReport);

export { router as pharmacyRoutes };
export default router;
