/**
 * Queue Routes
 * REST API endpoints for queue management
 */

import { Router } from 'express';
import * as controller from './queue.controller.js';

const router = Router();

// ==================== SERVICE QUEUE ROUTES ====================
// Service queues are the actual queues (e.g., "Dr. Sharma OPD", "Lab Blood Collection")

/**
 * @route   POST /api/queue/service-queues
 * @desc    Create a new service queue
 * @access  Admin, Manager
 */
router.post('/service-queues', controller.createServiceQueue);

/**
 * @route   GET /api/queue/service-queues
 * @desc    Get all service queues for hospital
 * @query   serviceType, department, isActive, doctorId
 * @access  Authenticated
 */
router.get('/service-queues', controller.getServiceQueues);

/**
 * @route   GET /api/queue/service-queues/:id
 * @desc    Get service queue details with waiting list
 * @access  Authenticated
 */
router.get('/service-queues/:id', controller.getServiceQueueDetails);

/**
 * @route   PUT /api/queue/service-queues/:id
 * @desc    Update service queue configuration
 * @access  Admin, Manager
 */
router.put('/service-queues/:id', controller.updateServiceQueue);

/**
 * @route   POST /api/queue/service-queues/:id/toggle
 * @desc    Pause or resume a service queue
 * @body    { isPaused: boolean, reason?: string }
 * @access  Admin, Manager, Doctor (own queue)
 */
router.post('/service-queues/:id/toggle', controller.toggleServiceQueue);

/**
 * @route   GET /api/queue/service-queues/:id/display
 * @desc    Get queue display data for TV/Monitor
 * @access  Authenticated
 */
router.get('/service-queues/:id/display', controller.getQueueDisplay);

/**
 * @route   POST /api/queue/service-queues/:id/call-next
 * @desc    Call next patient in queue (respects priority)
 * @access  Doctor, Receptionist, Lab Technician
 */
router.post('/service-queues/:id/call-next', controller.callNextPatient);

// ==================== PATIENT QUEUE ROUTES ====================
// These are individual patient entries in queues

/**
 * @route   POST /api/queue/check-in
 * @desc    Add patient to a queue (manual check-in)
 * @body    { patientId, serviceQueueId, billId?, isEmergency?, urgency?, specialNeeds?, notes? }
 * @access  Receptionist, Admin
 */
router.post('/check-in', controller.checkInPatient);

/**
 * @route   POST /api/queue/auto-queue
 * @desc    Auto-queue from billing (called after bill creation)
 * @body    { billId, patientId, isEmergency, visitType, departmentCode, services[] }
 * @access  Billing, System
 */
router.post('/auto-queue', controller.autoQueueFromBilling);

/**
 * @route   GET /api/queue/patient/:patientId
 * @desc    Get patient's all active queue entries
 * @access  Authenticated
 */
router.get('/patient/:patientId', controller.getPatientQueues);

// ==================== QUEUE ENTRY OPERATIONS ====================
// Operations on individual queue entries

/**
 * @route   GET /api/queue/entries/:id/status
 * @desc    Get patient queue status (position, wait time)
 * @access  Authenticated
 */
router.get('/entries/:id/status', controller.getPatientQueueStatus);

/**
 * @route   POST /api/queue/entries/:id/start-serving
 * @desc    Start serving patient (after call is answered)
 * @access  Doctor, Lab Technician, Receptionist
 */
router.post('/entries/:id/start-serving', controller.startServing);

/**
 * @route   POST /api/queue/entries/:id/complete
 * @desc    Complete service for patient
 * @access  Doctor, Lab Technician, Receptionist
 */
router.post('/entries/:id/complete', controller.completeService);

/**
 * @route   POST /api/queue/entries/:id/skip
 * @desc    Skip patient (not present when called)
 * @access  Doctor, Lab Technician, Receptionist
 */
router.post('/entries/:id/skip', controller.skipPatient);

/**
 * @route   POST /api/queue/entries/:id/recall
 * @desc    Recall a skipped patient
 * @access  Doctor, Lab Technician, Receptionist
 */
router.post('/entries/:id/recall', controller.recallPatient);

/**
 * @route   POST /api/queue/entries/:id/transfer
 * @desc    Transfer patient to another queue
 * @body    { newServiceQueueId, reason }
 * @access  Doctor, Receptionist, Admin
 */
router.post('/entries/:id/transfer', controller.transferPatient);

/**
 * @route   POST /api/queue/entries/:id/cancel
 * @desc    Cancel/remove patient from queue
 * @body    { reason?: string }
 * @access  Receptionist, Admin, Patient (own)
 */
router.post('/entries/:id/cancel', controller.cancelPatient);

/**
 * @route   POST /api/queue/entries/:id/change-priority
 * @desc    Change patient's priority level
 * @body    { priority: 'EMERGENCY'|'URGENT'|'PRIORITY'|'NORMAL', reason }
 * @access  Doctor, Admin
 */
router.post('/entries/:id/change-priority', controller.changePriority);

// ==================== ANALYTICS ROUTES ====================

/**
 * @route   GET /api/queue/analytics
 * @desc    Get queue analytics for date range
 * @query   startDate, endDate
 * @access  Admin, Manager
 */
router.get('/analytics', controller.getQueueAnalytics);

/**
 * @route   POST /api/queue/reset-daily
 * @desc    Reset queue tokens for new day
 * @access  Admin, System
 */
router.post('/reset-daily', controller.resetDailyQueues);

// ==================== PUBLIC ROUTES (No Auth) ====================
// These endpoints are for display boards and patient self-service kiosks

/**
 * @route   GET /api/queue/public/display/:queueCode
 * @desc    Get queue display data (for TV/Monitor)
 * @query   hospitalId
 * @access  Public
 */
router.get('/public/display/:queueCode', controller.getPublicQueueDisplay);

/**
 * @route   GET /api/queue/public/status/:queueNumber
 * @desc    Check queue status by queue number
 * @query   hospitalId
 * @access  Public
 */
router.get('/public/status/:queueNumber', controller.getPublicQueueStatus);

export default router;
