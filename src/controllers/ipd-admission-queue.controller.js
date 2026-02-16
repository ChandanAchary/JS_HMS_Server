/**
 * IPD Admission Queue Controller
 * Handles HTTP requests for IPD admission queue management
 */

import logger from '../utils/logger.js';
import { IPDAdmissionQueueService } from '../services/ipd-admission-queue.service.js';
import { AppError } from '../shared/AppError.js';

export class IPDAdmissionQueueController {
  constructor(prisma) {
    this.queueService = new IPDAdmissionQueueService(prisma);
  }

  /**
   * Create admission request from OPD consultation
   * POST /api/ipd/admission-queue/request
   */
  async createAdmissionRequest(req, res) {
    try {
      const { patientId, visitId, admissionReason, initialDiagnosis, estimatedLOS, priority, medicalHistory, allergies, emergencyContact, recommendedDepartment, notes } = req.body;

      if (!patientId || !admissionReason) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID and admission reason are required'
        });
      }

      const result = await this.queueService.createAdmissionRequest(
        {
          patientId,
          visitId,
          admissionReason,
          initialDiagnosis,
          estimatedLOS,
          priority,
          medicalHistory,
          allergies,
          emergencyContact,
          recommendedDepartment,
          notes
        },
        req.user
      );

      res.status(201).json(result);
    } catch (error) {
      logger.error(`Create Admission Request Error: ${error.message}`);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create admission request'
      });
    }
  }

  /**
   * Get pending admission requests in IPD queue
   * GET /api/ipd/admission-queue/pending
   */
  async getPendingAdmissionRequests(req, res) {
    try {
      const { priority, limit = 50, offset = 0, department } = req.query;
      const hospitalId = req.user.hospitalId;

      const result = await this.queueService.getPendingAdmissionRequests(
        hospitalId,
        {
          priority,
          limit: parseInt(limit),
          offset: parseInt(offset),
          department
        }
      );

      res.json(result);
    } catch (error) {
      logger.error(`Get Pending Requests Error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch pending requests'
      });
    }
  }

  /**
   * Get all admission requests for a patient
   * GET /api/ipd/admission-queue/patient/:patientId
   */
  async getPatientAdmissionRequests(req, res) {
    try {
      const { patientId } = req.params;

      const result = await this.queueService.getPatientAdmissionRequests(patientId);
      res.json(result);
    } catch (error) {
      logger.error(`Get Patient Requests Error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch patient requests'
      });
    }
  }

  /**
   * Get admission request details
   * GET /api/ipd/admission-queue/request/:requestId
   */
  async getAdmissionRequest(req, res) {
    try {
      const { requestId } = req.params;

      const result = await this.queueService.getAdmissionRequest(requestId);
      res.json(result);
    } catch (error) {
      logger.error(`Get Request Error: ${error.message}`);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch request'
      });
    }
  }

  /**
   * Approve admission request and allocate bed
   * POST /api/ipd/admission-queue/request/:requestId/approve
   */
  async approveAdmissionRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { bedId } = req.body;

      if (!bedId) {
        return res.status(400).json({
          success: false,
          message: 'Bed ID is required'
        });
      }

      const result = await this.queueService.approveAdmissionRequest(
        requestId,
        bedId,
        req.user
      );

      res.json(result);
    } catch (error) {
      logger.error(`Approve Request Error: ${error.message}`);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to approve request'
      });
    }
  }

  /**
   * Reject admission request
   * POST /api/ipd/admission-queue/request/:requestId/reject
   */
  async rejectAdmissionRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { rejectionReason } = req.body;

      const result = await this.queueService.rejectAdmissionRequest(
        requestId,
        rejectionReason,
        req.user
      );

      res.json(result);
    } catch (error) {
      logger.error(`Reject Request Error: ${error.message}`);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to reject request'
      });
    }
  }

  /**
   * Get admission queue statistics
   * GET /api/ipd/admission-queue/stats
   */
  async getQueueStats(req, res) {
    try {
      const hospitalId = req.user.hospitalId;

      const result = await this.queueService.getAdmissionQueueStats(hospitalId);
      res.json(result);
    } catch (error) {
      logger.error(`Get Queue Stats Error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch queue statistics'
      });
    }
  }
}



















