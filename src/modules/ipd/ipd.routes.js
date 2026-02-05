/**
 * IPD Module Routes with RBAC
 */

import { Router } from 'express';
import { authenticate } from '../../core/middleware/authMiddleware.js';
import { authorize } from '../../core/middleware/rbacMiddleware.js';

export function createIPDRoutes(
  ipdController,
  rolePermissions
) {
  const router = Router();

  /**
   * ========== ADMISSION ROUTES ==========
   */

  // Admit patient
  router.post(
    '/admissions',
    authenticate,
    authorize(rolePermissions, ['IPD_ADMIT_PATIENT']),
    (req, res) => ipdController.admitPatient(req, res)
  );

  // Get admission details
  router.get(
    '/admissions/:admissionId',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_ADMISSION']),
    (req, res) => ipdController.getAdmissionDetails(req, res)
  );

  // List admissions
  router.get(
    '/admissions',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_ADMISSION']),
    (req, res) => ipdController.listAdmissions(req, res)
  );

  /**
   * ========== VITAL SIGNS ROUTES ==========
   */

  // Record vital signs
  router.post(
    '/admissions/:admissionId/vitals',
    authenticate,
    authorize(rolePermissions, ['IPD_RECORD_VITALS']),
    (req, res) => ipdController.recordVitals(req, res)
  );

  // Get recent vital signs
  router.get(
    '/admissions/:admissionId/vitals',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_VITALS']),
    (req, res) => ipdController.getRecentVitals(req, res)
  );

  // Get vital signs trend
  router.get(
    '/admissions/:admissionId/vitals/trend',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_VITALS']),
    (req, res) => ipdController.getVitalsTrend(req, res)
  );

  // Start continuous monitoring
  router.post(
    '/admissions/:admissionId/monitoring/start',
    authenticate,
    authorize(rolePermissions, ['IPD_MANAGE_MONITORING']),
    (req, res) => ipdController.startContinuousMonitoring(req, res)
  );

  /**
   * ========== CLINICAL ORDERS ROUTES ==========
   */

  // Create order
  router.post(
    '/admissions/:admissionId/orders',
    authenticate,
    authorize(rolePermissions, ['IPD_CREATE_ORDER']),
    (req, res) => ipdController.createOrder(req, res)
  );

  // Get admission orders
  router.get(
    '/admissions/:admissionId/orders',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_ORDER']),
    (req, res) => ipdController.getAdmissionOrders(req, res)
  );

  // Record medication administration
  router.post(
    '/admissions/:admissionId/medications/administration',
    authenticate,
    authorize(rolePermissions, ['IPD_ADMINISTER_MEDICATION']),
    (req, res) => ipdController.recordMedicationAdministration(req, res)
  );

  /**
   * ========== CLINICAL NOTES ROUTES ==========
   */

  // Create progress note
  router.post(
    '/admissions/:admissionId/notes',
    authenticate,
    authorize(rolePermissions, ['IPD_CREATE_CLINICAL_NOTE']),
    (req, res) => ipdController.createProgressNote(req, res)
  );

  // Get progress notes
  router.get(
    '/admissions/:admissionId/notes',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_CLINICAL_NOTE']),
    (req, res) => ipdController.getProgressNotes(req, res)
  );

  // Create assessment
  router.post(
    '/admissions/:admissionId/assessments',
    authenticate,
    authorize(rolePermissions, ['IPD_CREATE_ASSESSMENT']),
    (req, res) => ipdController.createAssessment(req, res)
  );

  // Create discharge summary
  router.post(
    '/admissions/:admissionId/discharge-summary',
    authenticate,
    authorize(rolePermissions, ['IPD_CREATE_DISCHARGE_SUMMARY']),
    (req, res) => ipdController.createDischargeSummary(req, res)
  );

  /**
   * ========== ALERTS ROUTES ==========
   */

  // Create alert
  router.post(
    '/admissions/:admissionId/alerts',
    authenticate,
    authorize(rolePermissions, ['IPD_CREATE_ALERT']),
    (req, res) => ipdController.createAlert(req, res)
  );

  // Get admission alerts
  router.get(
    '/admissions/:admissionId/alerts',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_ALERT']),
    (req, res) => ipdController.getAdmissionAlerts(req, res)
  );

  // Acknowledge alert
  router.put(
    '/alerts/:alertId/acknowledge',
    authenticate,
    authorize(rolePermissions, ['IPD_ACKNOWLEDGE_ALERT']),
    (req, res) => ipdController.acknowledgeAlert(req, res)
  );

  /**
   * ========== CONSENT ROUTES ==========
   */

  // Create consent
  router.post(
    '/admissions/:admissionId/consents',
    authenticate,
    authorize(rolePermissions, ['IPD_CREATE_CONSENT']),
    (req, res) => ipdController.createConsent(req, res)
  );

  // Get admission consents
  router.get(
    '/admissions/:admissionId/consents',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_CONSENT']),
    (req, res) => ipdController.getAdmissionConsents(req, res)
  );

  // Sign consent
  router.put(
    '/consents/:consentId/sign',
    authenticate,
    authorize(rolePermissions, ['IPD_SIGN_CONSENT']),
    (req, res) => ipdController.signConsent(req, res)
  );

  /**
   * ========== PATIENT MOVEMENT ROUTES ==========
   */

  // Record patient entry to ward
  router.post(
    '/admissions/:admissionId/wards/:wardId/entry',
    authenticate,
    authorize(rolePermissions, ['IPD_MANAGE_PATIENT_MOVEMENT']),
    (req, res) => ipdController.recordPatientEntry(req, res)
  );

  // Transfer patient
  router.post(
    '/admissions/:admissionId/transfer',
    authenticate,
    authorize(rolePermissions, ['IPD_MANAGE_PATIENT_MOVEMENT']),
    (req, res) => ipdController.transferPatient(req, res)
  );

  // Discharge patient
  router.post(
    '/admissions/:admissionId/discharge',
    authenticate,
    authorize(rolePermissions, ['IPD_DISCHARGE_PATIENT']),
    (req, res) => ipdController.dischargePatient(req, res)
  );

  // Get patient current location
  router.get(
    '/admissions/:admissionId/location',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_PATIENT_LOCATION']),
    (req, res) => ipdController.getPatientCurrentLocation(req, res)
  );

  /**
   * ========== BED MANAGEMENT ROUTES ==========
   */

  // Get ward beds
  router.get(
    '/wards/:wardId/beds',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_BED_STATUS']),
    (req, res) => ipdController.getBedStatus(req, res)
  );

  // Update bed status
  router.put(
    '/beds/:bedId/status',
    authenticate,
    authorize(rolePermissions, ['IPD_MANAGE_BED']),
    (req, res) => ipdController.updateBedStatus(req, res)
  );

  /**
   * ========== CENSUS ROUTES ==========
   */

  // Get ward census
  router.get(
    '/wards/:wardId/census',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_CENSUS']),
    (req, res) => ipdController.getWardCensus(req, res)
  );

  /**
   * ========== DASHBOARD ROUTES ==========
   */

  // Get admission dashboard
  router.get(
    '/admissions/:admissionId/dashboard',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_DASHBOARD']),
    (req, res) => ipdController.getAdmissionDashboard(req, res)
  );

  // Get ward dashboard
  router.get(
    '/wards/:wardId/dashboard',
    authenticate,
    authorize(rolePermissions, ['IPD_VIEW_DASHBOARD']),
    (req, res) => ipdController.getWardDashboard(req, res)
  );

  return router;
}
