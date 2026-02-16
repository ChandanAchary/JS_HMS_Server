/**
 * IPD Module Main Controller
 * Orchestrates all IPD operations
 */

import logger from '../utils/logger.js';
import { sendResponse, sendError } from '../shared/helpers/responseHandler.js';

export class IPDController {
  constructor(
    admissionService,
    bedService,
    ordersService,
    clinicalNotesService,
    alertsService,
    consentService,
    movementService,
    vitalsService
  ) {
    this.admissionService = admissionService;
    this.bedService = bedService;
    this.ordersService = ordersService;
    this.clinicalNotesService = clinicalNotesService;
    this.alertsService = alertsService;
    this.consentService = consentService;
    this.movementService = movementService;
    this.vitalsService = vitalsService;
  }

  /**
   * ========== ADMISSION ENDPOINTS ==========
   */

  async admitPatient(req, res) {
    try {
      const { patientId, wardId, bedId, reason, diagnosis } = req.body;

      const admission = await this.admissionService.admitPatient(
        patientId,
        {
          wardId,
          bedId,
          reason,
          diagnosis,
          admissionDate: new Date(),
          admissionDocuments: req.body.documents || [],
        },
        req.user
      );

      sendResponse(res, 201, 'Patient admitted successfully', admission);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAdmissionDetails(req, res) {
    try {
      const { admissionId } = req.params;
      const admission = await this.admissionService.getAdmissionDetails(admissionId);
      sendResponse(res, 200, 'Admission details retrieved', admission);
    } catch (error) {
      sendError(res, error);
    }
  }

  async listAdmissions(req, res) {
    try {
      const { wardId, status, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const result = await this.admissionService.listAdmissions(
        { wardId, status },
        skip,
        parseInt(limit)
      );

      sendResponse(res, 200, 'Admissions retrieved', result);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== VITAL SIGNS ENDPOINTS ==========
   */

  async recordVitals(req, res) {
    try {
      const { admissionId } = req.params;
      const vitals = await this.vitalsService.recordVitals(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Vital signs recorded', vitals);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getRecentVitals(req, res) {
    try {
      const { admissionId } = req.params;
      const { limit = 10 } = req.query;

      const vitals = await this.vitalsService.getRecentVitals(
        admissionId,
        parseInt(limit)
      );

      sendResponse(res, 200, 'Recent vital signs retrieved', vitals);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getVitalsTrend(req, res) {
    try {
      const { admissionId } = req.params;
      const { parameter, days = 7 } = req.query;

      const trend = await this.vitalsService.getVitalsTrend(
        admissionId,
        parameter,
        parseInt(days)
      );

      sendResponse(res, 200, 'Vitals trend retrieved', trend);
    } catch (error) {
      sendError(res, error);
    }
  }

  async startContinuousMonitoring(req, res) {
    try {
      const { admissionId } = req.params;
      const { monitoringType } = req.body;

      const monitoring = await this.vitalsService.startContinuousMonitoring(
        admissionId,
        monitoringType,
        req.user
      );

      sendResponse(res, 201, 'Continuous monitoring started', monitoring);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== CLINICAL ORDERS ENDPOINTS ==========
   */

  async createOrder(req, res) {
    try {
      const { admissionId } = req.params;
      const order = await this.ordersService.createOrder(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Order created', order);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAdmissionOrders(req, res) {
    try {
      const { admissionId } = req.params;
      const { status, orderType, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const result = await this.ordersService.getAdmissionOrders(
        admissionId,
        { status, orderType },
        skip,
        parseInt(limit)
      );

      sendResponse(res, 200, 'Orders retrieved', result);
    } catch (error) {
      sendError(res, error);
    }
  }

  async recordMedicationAdministration(req, res) {
    try {
      const { admissionId } = req.params;
      const mar = await this.ordersService.recordMedicationAdministration(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Medication administration recorded', mar);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== CLINICAL NOTES ENDPOINTS ==========
   */

  async createProgressNote(req, res) {
    try {
      const { admissionId } = req.params;
      const note = await this.clinicalNotesService.createProgressNote(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Progress note created', note);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getProgressNotes(req, res) {
    try {
      const { admissionId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const result = await this.clinicalNotesService.getProgressNotes(
        admissionId,
        skip,
        parseInt(limit)
      );

      sendResponse(res, 200, 'Progress notes retrieved', result);
    } catch (error) {
      sendError(res, error);
    }
  }

  async createAssessment(req, res) {
    try {
      const { admissionId } = req.params;
      const assessment = await this.clinicalNotesService.createAssessment(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Assessment created', assessment);
    } catch (error) {
      sendError(res, error);
    }
  }

  async createDischargeSummary(req, res) {
    try {
      const { admissionId } = req.params;
      const summary = await this.clinicalNotesService.createDischargeSummary(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Discharge summary created', summary);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== ALERTS ENDPOINTS ==========
   */

  async createAlert(req, res) {
    try {
      const { admissionId } = req.params;
      const alert = await this.alertsService.createAlert(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Alert created', alert);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAdmissionAlerts(req, res) {
    try {
      const { admissionId } = req.params;
      const { status, alertType } = req.query;

      const alerts = await this.alertsService.getAdmissionAlerts(
        admissionId,
        { status, alertType }
      );

      sendResponse(res, 200, 'Alerts retrieved', alerts);
    } catch (error) {
      sendError(res, error);
    }
  }

  async acknowledgeAlert(req, res) {
    try {
      const { alertId } = req.params;
      const alert = await this.alertsService.acknowledgeAlert(
        alertId,
        req.user
      );
      sendResponse(res, 200, 'Alert acknowledged', alert);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== CONSENT ENDPOINTS ==========
   */

  async createConsent(req, res) {
    try {
      const { admissionId } = req.params;
      const consent = await this.consentService.createConsent(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Consent created', consent);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAdmissionConsents(req, res) {
    try {
      const { admissionId } = req.params;
      const { status, consentType } = req.query;

      const consents = await this.consentService.getAdmissionConsents(
        admissionId,
        { status, consentType }
      );

      sendResponse(res, 200, 'Consents retrieved', consents);
    } catch (error) {
      sendError(res, error);
    }
  }

  async signConsent(req, res) {
    try {
      const { consentId } = req.params;
      const consent = await this.consentService.signConsent(
        consentId,
        req.body,
        req.user
      );
      sendResponse(res, 200, 'Consent signed', consent);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== PATIENT MOVEMENT ENDPOINTS ==========
   */

  async recordPatientEntry(req, res) {
    try {
      const { admissionId, wardId } = req.params;
      const movement = await this.movementService.recordPatientEntry(
        admissionId,
        wardId,
        req.body,
        req.user
      );
      sendResponse(res, 201, 'Patient entry recorded', movement);
    } catch (error) {
      sendError(res, error);
    }
  }

  async transferPatient(req, res) {
    try {
      const { admissionId } = req.params;
      const { toWardId, toBedId } = req.body;

      const movement = await this.movementService.transferPatient(
        admissionId,
        toWardId,
        toBedId,
        req.body,
        req.user
      );

      sendResponse(res, 201, 'Patient transferred', movement);
    } catch (error) {
      sendError(res, error);
    }
  }

  async dischargePatient(req, res) {
    try {
      const { admissionId } = req.params;
      const movement = await this.movementService.dischargePatient(
        admissionId,
        req.body,
        req.user
      );
      sendResponse(res, 200, 'Patient discharged', movement);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getPatientCurrentLocation(req, res) {
    try {
      const { admissionId } = req.params;
      const location = await this.movementService.getPatientCurrentLocation(
        admissionId
      );
      sendResponse(res, 200, 'Patient location retrieved', location);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getWardCensus(req, res) {
    try {
      const { wardId } = req.params;
      const census = await this.movementService.getWardCensus(wardId);
      sendResponse(res, 200, 'Ward census retrieved', census);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== BED MANAGEMENT ENDPOINTS ==========
   */

  async getBedStatus(req, res) {
    try {
      const { wardId } = req.params;
      const beds = await this.bedService.getWardBeds(wardId);
      sendResponse(res, 200, 'Ward beds retrieved', beds);
    } catch (error) {
      sendError(res, error);
    }
  }

  async updateBedStatus(req, res) {
    try {
      const { bedId } = req.params;
      const { status, notes } = req.body;

      const bed = await this.bedService.updateBedStatus(
        bedId,
        status,
        notes,
        req.user
      );

      sendResponse(res, 200, 'Bed status updated', bed);
    } catch (error) {
      sendError(res, error);
    }
  }

  /**
   * ========== DASHBOARD ENDPOINTS ==========
   */

  async getAdmissionDashboard(req, res) {
    try {
      const { admissionId } = req.params;

      const [admission, vitals, alerts, orders, notes] = await Promise.all([
        this.admissionService.getAdmissionDetails(admissionId),
        this.vitalsService.getRecentVitals(admissionId, 5),
        this.alertsService.getAdmissionAlerts(admissionId, { status: 'ACTIVE' }),
        this.ordersService.getAdmissionOrders(admissionId, {}, 0, 10),
        this.clinicalNotesService.getProgressNotes(admissionId, 0, 5),
      ]);

      sendResponse(res, 200, 'Admission dashboard retrieved', {
        admission,
        recentVitals: vitals,
        activeAlerts: alerts,
        recentOrders: orders.orders,
        recentNotes: notes.notes,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  async getWardDashboard(req, res) {
    try {
      const { wardId } = req.params;

      const [census, activeAdmissions] = await Promise.all([
        this.movementService.getWardCensus(wardId),
        this.admissionService.listAdmissions({ wardId, status: 'ACTIVE' }, 0, 100),
      ]);

      sendResponse(res, 200, 'Ward dashboard retrieved', {
        census,
        activeAdmissions: activeAdmissions.admissions,
      });
    } catch (error) {
      sendError(res, error);
    }
  }
}



















