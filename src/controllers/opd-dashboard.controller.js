/**
 * OPD Dashboard Controller
 * 
 * HTTP request handlers for OPD operations
 */

import { opdDashboardService } from '../services/opd-dashboard.service.js';
import { VitalsDTO } from './opd.validators.js';

/**
 * Get OPD Dashboard
 * Returns patient queue with all details in FIFO order
 * NOTE: hospitalId is automatically extracted from req.user (single-tenant)
 */
export const getDashboard = async (req, res) => {
  try {
    const { id: userId, userType } = req.user;
    const { status, limit, offset } = req.query;

    const options = {
      status: status || 'WAITING',
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    // Service automatically uses hospitalId from context
    const dashboard = await opdDashboardService.getOpdDashboard(
      userId,
      userType,
      options
    );

    res.json({
      success: true,
      message: 'OPD Dashboard loaded successfully',
      data: dashboard
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load OPD dashboard'
    });
  }
};

/**
 * Get next patient in queue
 * NOTE: hospitalId is automatically extracted from req.user (single-tenant)
 */
export const getNextPatient = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const nextPatient = await opdDashboardService.getNextPatient(userId);

    if (!nextPatient) {
      return res.json({
        success: true,
        message: 'No patients waiting in queue',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Next patient retrieved',
      data: nextPatient
    });
  } catch (error) {
    console.error('Get next patient error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get next patient'
    });
  }
};

/**
 * Call next patient (WAITING -> CALLED)
 */
export const callNextPatient = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { id: userId } = req.user;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'Queue ID is required'
      });
    }

    const result = await opdDashboardService.callNextPatient(queueId, userId);

    res.json({
      success: true,
      message: `Patient token #${result.tokenNumber} called`,
      data: result
    });
  } catch (error) {
    console.error('Call patient error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to call patient'
    });
  }
};

/**
 * Start serving patient (CALLED -> SERVING)
 */
export const startServing = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { id: userId } = req.user;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'Queue ID is required'
      });
    }

    const result = await opdDashboardService.startServing(queueId, userId);

    res.json({
      success: true,
      message: `Serving patient token #${result.tokenNumber}`,
      data: result
    });
  } catch (error) {
    console.error('Start serving error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start serving patient'
    });
  }
};

/**
 * Complete service (SERVING -> COMPLETED)
 */
export const completeService = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { id: userId } = req.user;
    
    // Get IPD options from request body
    const {
      ipdRequired,
      admissionReason,
      diagnosis,
      estimatedLOS,
      priority,
      department,
      notes,
      emergencyContact
    } = req.body;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'Queue ID is required'
      });
    }

    const result = await opdDashboardService.completeService(queueId, userId, {
      ipdRequired,
      admissionReason,
      diagnosis,
      estimatedLOS,
      priority,
      department,
      notes,
      emergencyContact
    });

    res.json({
      success: true,
      message: ipdRequired
        ? `Service completed. Patient added to IPD admission queue.`
        : `Service completed for patient token #${result.tokenNumber}`,
      data: result
    });
  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete service'
    });
  }
};

/**
 * Skip patient (no-show, auto-cancel after 3 skips)
 */
export const skipPatient = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { id: userId } = req.user;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'Queue ID is required'
      });
    }

    const result = await opdDashboardService.skipPatient(queueId, userId);

    const message = result.autoCancel
      ? `Patient auto-cancelled after ${result.maxSkips} skips`
      : `Patient skipped (${result.skipCount}/${result.maxSkips})`;

    res.json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    console.error('Skip patient error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to skip patient'
    });
  }
};

/**
 * Get complete patient details for OPD operations
 */
export const getPatientDetails = async (req, res) => {
  try {
    const { visitId } = req.params;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    const patientData = await opdDashboardService.getPatientForOpd(visitId);

    // Format vitals using DTO if available
    const formattedData = {
      ...patientData,
      vitals: patientData.vitals ? VitalsDTO.format(patientData.vitals) : null,
      opdOperations: {
        vitalSigns: patientData.vitals ? 'RECORDED' : 'PENDING',
        clinicalNotes: 'NOT_STARTED',
        investigations: 'NOT_STARTED',
        prescriptions: 'NOT_STARTED',
        procedures: 'NOT_STARTED',
        followUp: 'NOT_STARTED',
        documents: 'NO_DOCUMENTS'
      },
      actions: req.opdAccess || {}
    };

    res.json({
      success: true,
      message: 'Patient details retrieved successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get patient details'
    });
  }
};

/**
 * Get OPD statistics
 * NOTE: hospitalId is automatically extracted from req.user (single-tenant)
 */
export const getStatistics = async (req, res) => {
  try {
    // No need to extract hospitalId - service uses it from context
    const statistics = await opdDashboardService._getQueueStatistics();

    res.json({
      success: true,
      message: 'OPD statistics retrieved',
      data: statistics
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get statistics'
    });
  }
};



















