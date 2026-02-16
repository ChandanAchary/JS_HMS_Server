/**
 * Queue Controller
 * HTTP request handlers for queue management
 */

import { QueueService } from '../services/queue.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';

/**
 * Get service instance for request
 */
function getQueueService(req) {
  return new QueueService(req.prisma);
}

// ==================== SERVICE QUEUE ENDPOINTS ====================

/**
 * Create service queue
 * POST /api/queue/service-queues
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function createServiceQueue(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.createServiceQueue(
      req.body,
      req.user?.id
    );
    res.status(201).json(ApiResponse.success(result, 'Service queue created'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get all service queues
 * GET /api/queue/service-queues
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function getServiceQueues(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const { serviceType, department, isActive, doctorId } = req.query;
    
    const result = await queueService.getServiceQueues({
      serviceType,
      department,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      doctorId
    });
    
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Get service queue details
 * GET /api/queue/service-queues/:id
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function getServiceQueueDetails(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.getServiceQueueDetails(req.params.id);
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Update service queue
 * PUT /api/queue/service-queues/:id
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function updateServiceQueue(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.updateServiceQueue(
      req.params.id,
      req.body
    );
    res.json(ApiResponse.success(result, 'Service queue updated'));
  } catch (error) {
    next(error);
  }
}

/**
 * Pause/Resume service queue
 * POST /api/queue/service-queues/:id/toggle
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function toggleServiceQueue(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const { isPaused, reason } = req.body;
    
    const result = await queueService.toggleQueueStatus(
      req.params.id,
      isPaused,
      reason
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Get queue display data
 * GET /api/queue/service-queues/:id/display
 */
export async function getQueueDisplay(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.getQueueDisplay(
      req.params.id,
      req.hospitalId
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

// ==================== PATIENT QUEUE ENDPOINTS ====================

/**
 * Add patient to queue (check-in)
 * POST /api/queue/check-in
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function checkInPatient(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const {
      patientId,
      serviceQueueId,
      billId,
      diagnosticOrderId,
      isEmergency,
      urgency,
      specialNeeds,
      notes
    } = req.body;
    
    const result = await queueService.addPatientToQueue({
      patientId,
      serviceQueueId,
      billId,
      diagnosticOrderId,
      isEmergency,
      urgency,
      specialNeeds,
      notes
    }, req.user?.id);
    
    res.status(201).json(ApiResponse.success(result, 'Patient added to queue'));
  } catch (error) {
    next(error);
  }
}

/**
 * Auto-queue from billing
 * POST /api/queue/auto-queue
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function autoQueueFromBilling(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.autoQueueFromBilling(
      req.body,
      req.user?.id
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient queue status
 * GET /api/queue/entries/:id/status
 */
export async function getPatientQueueStatus(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.getPatientQueueStatus(
      req.params.id,
      req.hospitalId
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient's all active queues
 * GET /api/queue/patient/:patientId
 */
export async function getPatientQueues(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.getPatientQueues(
      req.params.patientId,
      req.hospitalId
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

// ==================== QUEUE OPERATIONS ENDPOINTS ====================

/**
 * Call next patient
 * POST /api/queue/service-queues/:id/call-next
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function callNextPatient(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.callNextPatient(
      req.params.id,
      req.user?.id
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Start serving patient
 * POST /api/queue/entries/:id/start-serving
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function startServing(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.startServing(
      req.params.id,
      req.user?.id
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Complete service
 * POST /api/queue/entries/:id/complete
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function completeService(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.completeService(
      req.params.id,
      req.user?.id
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Skip patient
 * POST /api/queue/entries/:id/skip
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function skipPatient(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.skipPatient(
      req.params.id,
      req.user?.id
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Recall patient
 * POST /api/queue/entries/:id/recall
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function recallPatient(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.recallPatient(
      req.params.id,
      req.user?.id
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Transfer patient to another queue
 * POST /api/queue/entries/:id/transfer
 * NOTE: hospitalId is automatically managed via TenantContext (single-tenant)
 */
export async function transferPatient(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const { newServiceQueueId, reason } = req.body;
    
    const result = await queueService.transferPatient(
      req.params.id,
      newServiceQueueId,
      reason,
      req.user?.id
    );
    res.json(ApiResponse.success(result, 'Patient transferred'));
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel patient from queue
 * POST /api/queue/entries/:id/cancel
 */
export async function cancelPatient(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const { reason } = req.body;
    
    const result = await queueService.cancelPatient(
      req.params.id,
      reason,
      req.hospitalId,
      req.user?.id
    );
    res.json(ApiResponse.success(result, 'Patient removed from queue'));
  } catch (error) {
    next(error);
  }
}

/**
 * Change patient priority
 * POST /api/queue/entries/:id/change-priority
 */
export async function changePriority(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const { priority, reason } = req.body;
    
    const result = await queueService.changePriority(
      req.params.id,
      priority,
      reason,
      req.hospitalId,
      req.user?.id
    );
    res.json(ApiResponse.success(result, 'Priority updated'));
  } catch (error) {
    next(error);
  }
}

// ==================== ANALYTICS ENDPOINTS ====================

/**
 * Get queue analytics
 * GET /api/queue/analytics
 */
export async function getQueueAnalytics(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const { startDate, endDate } = req.query;
    
    const result = await queueService.getQueueAnalytics(
      req.hospitalId,
      startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate || new Date().toISOString()
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Reset daily queues
 * POST /api/queue/reset-daily
 */
export async function resetDailyQueues(req, res, next) {
  try {
    const queueService = getQueueService(req);
    const result = await queueService.resetDailyQueues(req.hospitalId);
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

// ==================== PUBLIC DISPLAY ENDPOINTS ====================

/**
 * Get queue display (public - no auth required)
 * GET /api/queue/display/:queueCode
 */
export async function getPublicQueueDisplay(req, res, next) {
  try {
    const { queueCode } = req.params;
    const { hospitalId } = req.query;
    
    if (!hospitalId) {
      return res.status(400).json(ApiResponse.error('hospitalId is required'));
    }
    
    const queueService = new QueueService(req.prisma);
    
    // Find queue by code
    const serviceQueue = await req.prisma.serviceQueue.findUnique({
      where: {
        hospitalId_queueCode: { hospitalId, queueCode }
      }
    });
    
    if (!serviceQueue) {
      return res.status(404).json(ApiResponse.error('Queue not found'));
    }
    
    const result = await queueService.getQueueDisplay(serviceQueue.id, hospitalId);
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Check patient queue status (public - by queue number)
 * GET /api/queue/public/status/:queueNumber
 */
export async function getPublicQueueStatus(req, res, next) {
  try {
    const { queueNumber } = req.params;
    const { hospitalId } = req.query;
    
    if (!hospitalId) {
      return res.status(400).json(ApiResponse.error('hospitalId is required'));
    }
    
    const patientQueue = await req.prisma.patientQueue.findUnique({
      where: {
        hospitalId_queueNumber: { hospitalId, queueNumber }
      },
      include: {
        serviceQueue: {
          select: { queueName: true, shortName: true, counterNumber: true, averageServiceTime: true }
        }
      }
    });
    
    if (!patientQueue) {
      return res.status(404).json(ApiResponse.error('Queue entry not found'));
    }
    
    const queueService = new QueueService(req.prisma);
    const result = await queueService.getPatientQueueStatus(patientQueue.id, hospitalId);
    
    // Remove sensitive info for public access
    const publicResult = {
      queueNumber: result.queueEntry.queueNumber,
      displayToken: result.queueEntry.displayToken,
      position: result.queueEntry.position,
      status: result.queueEntry.status,
      estimatedWaitTime: result.queueEntry.estimatedWaitTime,
      estimatedWaitTimeFormatted: result.queueEntry.estimatedWaitTimeFormatted,
      serviceName: result.queueEntry.serviceQueue?.queueName,
      counterNumber: result.queueEntry.serviceQueue?.counterNumber
    };
    
    res.json(ApiResponse.success(publicResult));
  } catch (error) {
    next(error);
  }
}

export default {
  // Service Queue
  createServiceQueue,
  getServiceQueues,
  getServiceQueueDetails,
  updateServiceQueue,
  toggleServiceQueue,
  getQueueDisplay,
  
  // Patient Queue
  checkInPatient,
  autoQueueFromBilling,
  getPatientQueueStatus,
  getPatientQueues,
  
  // Queue Operations
  callNextPatient,
  startServing,
  completeService,
  skipPatient,
  recallPatient,
  transferPatient,
  cancelPatient,
  changePriority,
  
  // Analytics
  getQueueAnalytics,
  resetDailyQueues,
  
  // Public
  getPublicQueueDisplay,
  getPublicQueueStatus
};



















