/**
 * OPD Consultation Controller
 * 
 * HTTP handlers for OPD consultation operations:
 * - Consultation notes
 * - Prescriptions
 * - Test orders
 * - Patient OPD history
 */

import { opdConsultationService } from '../services/opd-consultation.service.js';

/**
 * Add consultation note for a visit
 */
export const addConsultationNote = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { id: doctorId } = req.user;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    const result = await opdConsultationService.addConsultationNote(
      visitId,
      req.body,
      doctorId
    );

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.consultationNote
    });
  } catch (error) {
    console.error('Add consultation note error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to add consultation note'
    });
  }
};

/**
 * Get consultation note for a visit
 */
export const getConsultationNote = async (req, res) => {
  try {
    const { visitId } = req.params;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    const consultationNote = await opdConsultationService.getConsultationNote(visitId);

    res.json({
      success: true,
      message: consultationNote ? 'Consultation note retrieved' : 'No consultation note found',
      data: consultationNote
    });
  } catch (error) {
    console.error('Get consultation note error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get consultation note'
    });
  }
};

/**
 * Update consultation note
 */
export const updateConsultationNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { id: doctorId } = req.user;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }

    const result = await opdConsultationService.updateConsultationNote(
      noteId,
      req.body,
      doctorId
    );

    res.json({
      success: true,
      message: result.message,
      data: result.consultationNote
    });
  } catch (error) {
    console.error('Update consultation note error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update consultation note'
    });
  }
};

/**
 * Create prescription for a visit
 */
export const createPrescription = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { id: doctorId } = req.user;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    if (!req.body.medications || !Array.isArray(req.body.medications)) {
      return res.status(400).json({
        success: false,
        message: 'Medications array is required'
      });
    }

    const result = await opdConsultationService.createPrescription(
      visitId,
      req.body,
      doctorId
    );

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create prescription'
    });
  }
};

/**
 * Get prescriptions for a visit
 */
export const getPrescriptionsByVisit = async (req, res) => {
  try {
    const { visitId } = req.params;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    const prescriptions = await opdConsultationService.getPrescriptionsByVisit(visitId);

    res.json({
      success: true,
      message: `Found ${prescriptions.length} prescription(s)`,
      data: prescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get prescriptions'
    });
  }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Prescription ID is required'
      });
    }

    const prescription = await opdConsultationService.getPrescriptionById(prescriptionId);

    res.json({
      success: true,
      message: 'Prescription retrieved',
      data: prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get prescription'
    });
  }
};

/**
 * Update prescription status (dispense, cancel)
 */
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { status } = req.body;
    const { id: userId } = req.user;

    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Prescription ID is required'
      });
    }

    if (!status || !['ACTIVE', 'DISPENSED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (ACTIVE, DISPENSED, CANCELLED)'
      });
    }

    const result = await opdConsultationService.updatePrescriptionStatus(
      prescriptionId,
      status,
      userId
    );

    res.json({
      success: true,
      message: result.message,
      data: result.prescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update prescription status'
    });
  }
};

/**
 * Create test order for a visit
 */
export const createTestOrder = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { id: doctorId } = req.user;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    if (!req.body.tests || !Array.isArray(req.body.tests)) {
      return res.status(400).json({
        success: false,
        message: 'Tests array is required'
      });
    }

    const result = await opdConsultationService.createTestOrder(
      visitId,
      req.body,
      doctorId
    );

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.testOrder
    });
  } catch (error) {
    console.error('Create test order error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create test order'
    });
  }
};

/**
 * Get test orders for a visit
 */
export const getTestOrdersByVisit = async (req, res) => {
  try {
    const { visitId } = req.params;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    const testOrders = await opdConsultationService.getTestOrdersByVisit(visitId);

    res.json({
      success: true,
      message: `Found ${testOrders.length} test order(s)`,
      data: testOrders
    });
  } catch (error) {
    console.error('Get test orders error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get test orders'
    });
  }
};

/**
 * Update test order status
 */
export const updateTestOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const { id: userId } = req.user;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const validStatuses = ['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status is required (${validStatuses.join(', ')})`
      });
    }

    const result = await opdConsultationService.updateTestOrderStatus(
      orderId,
      status,
      userId
    );

    res.json({
      success: true,
      message: result.message,
      data: result.testOrder
    });
  } catch (error) {
    console.error('Update test order status error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update test order status'
    });
  }
};

/**
 * Get patient OPD history
 */
export const getPatientOpdHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit, offset } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const history = await opdConsultationService.getPatientOpdHistory(patientId, {
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({
      success: true,
      message: 'Patient OPD history retrieved',
      data: history
    });
  } catch (error) {
    console.error('Get patient OPD history error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get patient OPD history'
    });
  }
};

/**
 * Get complete visit details (all OPD data for a visit)
 */
export const getCompleteVisitDetails = async (req, res) => {
  try {
    const { visitId } = req.params;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: 'Visit ID is required'
      });
    }

    const visitDetails = await opdConsultationService.getCompleteVisitDetails(visitId);

    res.json({
      success: true,
      message: 'Complete visit details retrieved',
      data: visitDetails
    });
  } catch (error) {
    console.error('Get complete visit details error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get visit details'
    });
  }
};



















