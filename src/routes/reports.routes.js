/**
 * Reports Routes
 * Clinical, financial, and audit reports
 */

import express from 'express';
import * as controller from '../controllers/reports.controller.js';
import { protect as authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizePermission } from '../middlewares/rbac.middleware.js';

const router = express.Router();

// Root endpoint - returns reports module info
router.get('/', (req, res) => {
  res.json({ module: 'reports', status: 'active', endpoints: ['GET /patient/visit-statistics', 'GET /clinical/opd-analysis', 'GET /financial/revenue', 'GET /staff/attendance-summary'] });
});

// ============== PATIENT REPORTS ==============
// Patient visit statistics
router.get('/patient/visit-statistics', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getPatientVisitStats);

// Patient demographics report
router.get('/patient/demographics', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getPatientDemographics);

// Patient billing summary
router.get('/patient/billing-summary', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getPatientBillingSummary);

// ============== CLINICAL REPORTS ==============
// OPD visit analysis
router.get('/clinical/opd-analysis', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getOPDAnalysis);

// IPD occupancy report
router.get('/clinical/ipd-occupancy', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getIPDOccupancy);

// Diagnostic test statistics
router.get('/clinical/diagnostic-stats', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getDiagnosticStats);

// ============== FINANCIAL REPORTS ==============
// Revenue report
router.get('/financial/revenue', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getRevenueReport);

// Outstanding bills
router.get('/financial/outstanding-bills', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getOutstandingBills);

// Service-wise revenue
router.get('/financial/service-revenue', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getServiceRevenue);

// ============== STAFF REPORTS ==============
// Staff attendance summary
router.get('/staff/attendance-summary', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getAttendanceSummary);

// Staff performance metrics
router.get('/staff/performance', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getStaffPerformance);

// ============== AUDIT REPORTS ==============
// Audit log report
router.get('/audit/activity-logs', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getAuditLogs);

// User activity report
router.get('/audit/user-activity', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getUserActivity);

// System event log
router.get('/audit/system-events', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.getSystemEvents);

// ============== DATA EXPORT ==============
// Export report as CSV
router.post('/export/csv', authenticateToken, authorizePermission('VIEW_REPORTS'), controller.exportReportCSV);

// Export report as PDF
router.post('/export/pdf', authenticateToken, authorizePermission('PRINT_REPORT'), controller.exportReportPDF);

export { router as reportRoutes };
export default router;
