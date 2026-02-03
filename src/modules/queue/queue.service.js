/**
 * Queue Management Service
 * Business logic for hospital queue management
 * 
 * Features:
 * - Auto-queue from billing with emergency prioritization
 * - Multiple service queues (OPD, Diagnostics, Billing counters)
 * - Priority-based calling (Emergency > Urgent > Priority > Normal)
 * - Skip, recall, transfer functionality
 * - Real-time position tracking
 * - Wait time estimation
 */

import { QueueRepository } from './queue.repository.js';
import {
  QUEUE_STATUS,
  QUEUE_PRIORITY,
  PRIORITY_ORDER,
  SERVICE_TYPE,
  QUEUE_CONFIG,
  PRIORITY_REASONS,
  determinePriority,
  calculateEstimatedWaitTime,
  formatTokenNumber,
  generateQueueCode,
  sortQueueByPriority
} from './queue.constants.js';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '../../shared/exceptions/AppError.js';

export class QueueService {
  constructor(prisma) {
    this.prisma = prisma;
    this.repository = new QueueRepository(prisma);
  }

  // ==================== SERVICE QUEUE MANAGEMENT ====================

  /**
   * Create a new service queue
   */
  async createServiceQueue(data, hospitalId, userId) {
    // Validate required fields
    if (!data.queueCode || !data.queueName || !data.serviceType) {
      throw new ValidationError('queueCode, queueName, and serviceType are required');
    }

    // Check if queue code already exists
    const existing = await this.repository.getServiceQueueByCode(hospitalId, data.queueCode);
    if (existing) {
      throw new ConflictError(`Queue with code ${data.queueCode} already exists`);
    }

    // Validate service type
    if (!Object.values(SERVICE_TYPE).includes(data.serviceType)) {
      throw new ValidationError(`Invalid service type: ${data.serviceType}`);
    }

    const serviceQueue = await this.repository.createServiceQueue({
      hospitalId,
      queueCode: data.queueCode,
      queueName: data.queueName,
      shortName: data.shortName || null,
      serviceType: data.serviceType,
      department: data.department || null,
      doctorId: data.doctorId || null,
      employeeId: data.employeeId || null,
      counterNumber: data.counterNumber || null,
      location: data.location || null,
      maxCapacity: data.maxCapacity || QUEUE_CONFIG.MAX_QUEUE_CAPACITY,
      averageServiceTime: data.averageServiceTime || QUEUE_CONFIG.DEFAULT_AVG_SERVICE_TIME,
      workingHours: data.workingHours || null,
      breakTimes: data.breakTimes || null,
      priorityRatio: data.priorityRatio || QUEUE_CONFIG.PRIORITY_RATIO,
      emergencyFirst: data.emergencyFirst ?? QUEUE_CONFIG.EMERGENCY_ALWAYS_FIRST,
      displayEnabled: data.displayEnabled ?? true,
      announcementEnabled: data.announcementEnabled ?? true,
      createdBy: userId
    });

    return {
      message: 'Service queue created successfully',
      serviceQueue
    };
  }

  /**
   * Get all service queues for hospital
   */
  async getServiceQueues(hospitalId, filters = {}) {
    const queues = await this.repository.getServiceQueues(hospitalId, filters);
    
    return {
      queues: queues.map(q => ({
        ...q,
        waitingCount: q._count?.patientQueues || 0
      }))
    };
  }

  /**
   * Get service queue details with waiting list
   */
  async getServiceQueueDetails(serviceQueueId, hospitalId) {
    const queue = await this.repository.getServiceQueueById(serviceQueueId);
    
    if (!queue || queue.hospitalId !== hospitalId) {
      throw new NotFoundError('Service queue not found');
    }

    const waitingList = await this.repository.getWaitingQueue(serviceQueueId, { limit: 20 });
    const currentlyServing = await this.repository.getCurrentlyServing(serviceQueueId);
    const stats = await this.repository.getTodayQueueStats(serviceQueueId);

    return {
      queue: {
        ...queue,
        waitingCount: queue._count?.patientQueues || 0
      },
      currentlyServing,
      waitingList: waitingList.map((entry, index) => ({
        ...entry,
        position: index + 1,
        estimatedWaitTime: calculateEstimatedWaitTime(index + 1, queue.averageServiceTime)
      })),
      todayStats: stats
    };
  }

  /**
   * Update service queue
   */
  async updateServiceQueue(serviceQueueId, data, hospitalId) {
    const queue = await this.repository.getServiceQueueById(serviceQueueId);
    
    if (!queue || queue.hospitalId !== hospitalId) {
      throw new NotFoundError('Service queue not found');
    }

    const updated = await this.repository.updateServiceQueue(serviceQueueId, data);
    
    return {
      message: 'Service queue updated successfully',
      serviceQueue: updated
    };
  }

  /**
   * Pause/Resume service queue
   */
  async toggleQueueStatus(serviceQueueId, isPaused, reason, hospitalId) {
    const queue = await this.repository.getServiceQueueById(serviceQueueId);
    
    if (!queue || queue.hospitalId !== hospitalId) {
      throw new NotFoundError('Service queue not found');
    }

    const updated = await this.repository.updateServiceQueue(serviceQueueId, {
      isPaused,
      pauseReason: isPaused ? reason : null,
      isAcceptingPatients: !isPaused
    });

    return {
      message: isPaused ? 'Queue paused' : 'Queue resumed',
      serviceQueue: updated
    };
  }

  // ==================== PATIENT QUEUE MANAGEMENT ====================

  /**
   * Add patient to queue (main entry point)
   * Called when:
   * 1. Bill is created (auto-queue)
   * 2. Patient checks in manually
   * 3. Diagnostic order is created
   */
  async addPatientToQueue(data, hospitalId, userId) {
    const {
      patientId,
      serviceQueueId,
      billId,
      diagnosticOrderId,
      isEmergency,
      urgency,
      specialNeeds,
      notes
    } = data;

    // Validate service queue
    const serviceQueue = await this.repository.getServiceQueueById(serviceQueueId);
    if (!serviceQueue || serviceQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Service queue not found');
    }

    if (!serviceQueue.isActive || !serviceQueue.isAcceptingPatients) {
      throw new ValidationError('This queue is currently not accepting patients');
    }

    // Check capacity
    const waitingCount = await this.repository.getWaitingCount(serviceQueueId);
    if (waitingCount >= serviceQueue.maxCapacity) {
      throw new ValidationError('Queue is at maximum capacity');
    }

    // Get patient details for priority calculation
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, patientId: true, name: true, age: true, gender: true, isPregnant: true }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Check if patient is already in this queue
    const existingInQueue = await this.prisma.patientQueue.findFirst({
      where: {
        patientId,
        serviceQueueId,
        status: { in: ['WAITING', 'CALLED', 'RECALLED', 'ON_HOLD'] }
      }
    });

    if (existingInQueue) {
      throw new ConflictError('Patient is already in this queue');
    }

    // Determine priority
    const { priority, reason: priorityReason } = determinePriority({
      isEmergency: isEmergency || false,
      urgency: urgency || 'ROUTINE',
      patientAge: patient.age,
      isPregnant: patient.isPregnant
    });

    // Get token number
    const tokenNumber = await this.repository.getNextTokenNumber(serviceQueueId);
    
    // Generate queue number
    const queueNumber = await this.repository.getNextQueueNumber(hospitalId, 'QUE');

    // Calculate initial position
    const position = await this.calculatePosition(serviceQueueId, priority, isEmergency);

    // Calculate estimated wait time
    const estimatedWaitTime = calculateEstimatedWaitTime(position, serviceQueue.averageServiceTime);

    // Create queue entry
    const queueEntry = await this.repository.createPatientQueue({
      queueNumber,
      tokenNumber,
      hospitalId,
      patientId,
      billId: billId || null,
      serviceQueueId,
      priority,
      priorityReason,
      isEmergency: isEmergency || false,
      position,
      originalPosition: position,
      estimatedWaitTime,
      status: QUEUE_STATUS.WAITING,
      serviceName: serviceQueue.queueName,
      serviceType: serviceQueue.serviceType,
      diagnosticOrderId: diagnosticOrderId || null,
      specialNeeds: specialNeeds || null,
      notes: notes || null,
      createdBy: userId
    });

    // Update service queue count
    await this.repository.updateServiceQueue(serviceQueueId, {
      currentCount: { increment: 1 }
    });

    // Recalculate positions for all waiting patients
    await this.repository.recalculatePositions(serviceQueueId);

    return {
      message: 'Patient added to queue successfully',
      queueEntry: {
        ...queueEntry,
        displayToken: formatTokenNumber(tokenNumber, serviceQueue.shortName || serviceQueue.serviceType[0]),
        position,
        estimatedWaitTime,
        estimatedWaitTimeFormatted: this.formatWaitTime(estimatedWaitTime)
      }
    };
  }

  /**
   * Calculate position for new entry based on priority
   */
  async calculatePosition(serviceQueueId, priority, isEmergency) {
    const waitingQueue = await this.repository.getWaitingQueue(serviceQueueId);
    
    if (waitingQueue.length === 0) return 1;

    const priorityNum = PRIORITY_ORDER[priority];

    // Find position based on priority
    let position = 1;
    for (const entry of waitingQueue) {
      const entryPriorityNum = PRIORITY_ORDER[entry.priority];
      
      // Emergency always goes first
      if (isEmergency && !entry.isEmergency) break;
      if (!isEmergency && entry.isEmergency) {
        position++;
        continue;
      }
      
      // Same emergency status, compare priority
      if (priorityNum < entryPriorityNum) break;
      if (priorityNum === entryPriorityNum) {
        position = waitingQueue.filter(e => 
          e.priority === priority && e.isEmergency === isEmergency
        ).length + 1;
        break;
      }
      position++;
    }

    return position;
  }

  /**
   * Auto-add patient to queue from billing
   * Called when a bill is created with consultation/diagnostic services
   */
  async autoQueueFromBilling(billData, hospitalId, userId) {
    const { billId, patientId, isEmergency, visitType, departmentCode, services } = billData;

    // Get patient
    const patient = await this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    const queuedServices = [];

    // Parse services to determine queue(s)
    for (const service of services) {
      const serviceType = this.determineServiceType(service.category, service.serviceName);
      
      if (serviceType) {
        // Find appropriate service queue
        const serviceQueue = await this.findOrCreateServiceQueue(
          hospitalId, 
          serviceType, 
          service,
          departmentCode
        );

        if (serviceQueue) {
          try {
            const result = await this.addPatientToQueue({
              patientId: patient.id,
              serviceQueueId: serviceQueue.id,
              billId,
              isEmergency,
              urgency: isEmergency ? 'STAT' : 'ROUTINE'
            }, hospitalId, userId);

            queuedServices.push({
              service: service.serviceName,
              queue: serviceQueue.queueName,
              token: result.queueEntry.displayToken,
              position: result.queueEntry.position,
              estimatedWait: result.queueEntry.estimatedWaitTimeFormatted
            });
          } catch (error) {
            // Skip if already in queue
            if (error.message !== 'Patient is already in this queue') {
              console.error(`Error queueing for ${service.serviceName}:`, error);
            }
          }
        }
      }
    }

    return {
      message: queuedServices.length > 0 
        ? `Patient added to ${queuedServices.length} queue(s)` 
        : 'No queueable services found',
      queues: queuedServices
    };
  }

  /**
   * Determine service type from billing category
   */
  determineServiceType(category, serviceName) {
    const categoryLower = category?.toLowerCase() || '';
    const nameLower = serviceName?.toLowerCase() || '';

    if (categoryLower.includes('consultation') || categoryLower.includes('opd')) {
      return SERVICE_TYPE.CONSULTATION;
    }
    if (categoryLower.includes('diagnostic') || categoryLower.includes('lab') || 
        categoryLower.includes('test') || categoryLower.includes('pathology')) {
      return SERVICE_TYPE.DIAGNOSTIC;
    }
    if (categoryLower.includes('pharmacy') || categoryLower.includes('medicine')) {
      return SERVICE_TYPE.PHARMACY;
    }
    if (categoryLower.includes('procedure') || nameLower.includes('injection')) {
      return SERVICE_TYPE.PROCEDURE;
    }
    if (categoryLower.includes('imaging') || categoryLower.includes('xray') || 
        categoryLower.includes('radiology') || categoryLower.includes('ultrasound')) {
      return SERVICE_TYPE.DIAGNOSTIC;
    }

    return null;
  }

  /**
   * Find or create a service queue
   */
  async findOrCreateServiceQueue(hospitalId, serviceType, service, departmentCode) {
    // Try to find existing queue
    const queues = await this.repository.getServiceQueues(hospitalId, {
      serviceType,
      isActive: true
    });

    // If department-specific queue exists, use it
    if (departmentCode) {
      const deptQueue = queues.find(q => q.department === departmentCode);
      if (deptQueue) return deptQueue;
    }

    // Use first active queue of this type
    if (queues.length > 0) {
      return queues[0];
    }

    // Create default queue if none exists
    const queueCode = generateQueueCode(serviceType, departmentCode, '001');
    
    return this.repository.createServiceQueue({
      hospitalId,
      queueCode,
      queueName: `${serviceType} Queue`,
      serviceType,
      department: departmentCode,
      isActive: true,
      isAcceptingPatients: true
    });
  }

  // ==================== QUEUE OPERATIONS ====================

  /**
   * Call next patient
   */
  async callNextPatient(serviceQueueId, hospitalId, userId) {
    const serviceQueue = await this.repository.getServiceQueueById(serviceQueueId);
    
    if (!serviceQueue || serviceQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Service queue not found');
    }

    // Check if someone is currently being served
    const currentlyServing = await this.repository.getCurrentlyServing(serviceQueueId);
    if (currentlyServing) {
      throw new ValidationError('Complete current patient before calling next');
    }

    // Get next patient (respects priority)
    const nextPatient = await this.repository.getNextPatientToCall(serviceQueueId);
    
    if (!nextPatient) {
      return {
        message: 'No patients waiting in queue',
        nextPatient: null
      };
    }

    // Update patient status to CALLED
    const updated = await this.repository.updatePatientQueue(nextPatient.id, {
      status: QUEUE_STATUS.CALLED,
      calledAt: new Date(),
      counterNumber: serviceQueue.counterNumber,
      assignedToId: userId,
      updatedBy: userId
    });

    // Update service queue current token
    await this.repository.updateServiceQueue(serviceQueueId, {
      currentToken: nextPatient.tokenNumber,
      currentServingId: nextPatient.id
    });

    return {
      message: 'Patient called',
      calledPatient: {
        ...updated,
        displayToken: formatTokenNumber(nextPatient.tokenNumber, serviceQueue.shortName)
      }
    };
  }

  /**
   * Start serving patient (after they respond to call)
   */
  async startServing(patientQueueId, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    if (patientQueue.status !== QUEUE_STATUS.CALLED && patientQueue.status !== QUEUE_STATUS.RECALLED) {
      throw new ValidationError(`Cannot start serving. Current status: ${patientQueue.status}`);
    }

    const updated = await this.repository.updatePatientQueue(patientQueueId, {
      status: QUEUE_STATUS.SERVING,
      servedAt: new Date(),
      assignedToId: userId,
      updatedBy: userId
    });

    return {
      message: 'Service started',
      serving: updated
    };
  }

  /**
   * Complete service for patient
   */
  async completeService(patientQueueId, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    if (patientQueue.status !== QUEUE_STATUS.SERVING) {
      throw new ValidationError(`Cannot complete. Current status: ${patientQueue.status}`);
    }

    const now = new Date();
    const waitTimeMinutes = patientQueue.servedAt 
      ? Math.round((patientQueue.servedAt - patientQueue.joinedAt) / 60000)
      : null;
    const serviceTimeMinutes = patientQueue.servedAt
      ? Math.round((now - patientQueue.servedAt) / 60000)
      : null;

    // Update queue entry
    const updated = await this.repository.updatePatientQueue(patientQueueId, {
      status: QUEUE_STATUS.COMPLETED,
      completedAt: now,
      updatedBy: userId
    });

    // Update service queue
    await this.repository.updateServiceQueue(patientQueue.serviceQueueId, {
      currentCount: { decrement: 1 },
      currentServingId: null,
      todayPatientCount: { increment: 1 }
    });

    // Create history entry
    await this.repository.createQueueHistory({
      hospitalId,
      serviceQueueId: patientQueue.serviceQueueId,
      patientQueueId,
      queueDate: new Date(),
      tokenNumber: patientQueue.tokenNumber,
      priority: patientQueue.priority,
      position: patientQueue.originalPosition || patientQueue.position,
      joinedAt: patientQueue.joinedAt,
      calledAt: patientQueue.calledAt,
      servedAt: patientQueue.servedAt,
      completedAt: now,
      waitTimeMinutes,
      serviceTimeMinutes,
      totalTimeMinutes: waitTimeMinutes + serviceTimeMinutes,
      finalStatus: QUEUE_STATUS.COMPLETED,
      skipCount: patientQueue.skipCount,
      wasEmergency: patientQueue.isEmergency
    });

    // Recalculate positions
    await this.repository.recalculatePositions(patientQueue.serviceQueueId);

    return {
      message: 'Service completed',
      completed: updated,
      metrics: {
        waitTimeMinutes,
        serviceTimeMinutes,
        totalTimeMinutes: waitTimeMinutes + serviceTimeMinutes
      }
    };
  }

  /**
   * Skip patient (not present when called)
   */
  async skipPatient(patientQueueId, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    if (patientQueue.status !== QUEUE_STATUS.CALLED) {
      throw new ValidationError('Can only skip called patients');
    }

    const newSkipCount = patientQueue.skipCount + 1;

    // Check if max skips reached
    if (newSkipCount >= QUEUE_CONFIG.MAX_SKIP_COUNT) {
      // Auto-cancel
      const updated = await this.repository.updatePatientQueue(patientQueueId, {
        status: QUEUE_STATUS.CANCELLED,
        skipCount: newSkipCount,
        lastSkippedAt: new Date(),
        notes: `Auto-cancelled after ${newSkipCount} skips`,
        updatedBy: userId
      });

      await this.repository.updateServiceQueue(patientQueue.serviceQueueId, {
        currentCount: { decrement: 1 },
        currentServingId: null
      });

      return {
        message: `Patient auto-cancelled after ${newSkipCount} skips`,
        skipped: updated,
        autoCancelled: true
      };
    }

    // Move to end of same priority group (but keep priority)
    const updated = await this.repository.updatePatientQueue(patientQueueId, {
      status: QUEUE_STATUS.SKIPPED,
      skipCount: newSkipCount,
      lastSkippedAt: new Date(),
      updatedBy: userId
    });

    // Clear current serving
    await this.repository.updateServiceQueue(patientQueue.serviceQueueId, {
      currentServingId: null
    });

    // Recalculate positions
    await this.repository.recalculatePositions(patientQueue.serviceQueueId);

    return {
      message: `Patient skipped (${newSkipCount}/${QUEUE_CONFIG.MAX_SKIP_COUNT})`,
      skipped: updated,
      autoCancelled: false
    };
  }

  /**
   * Recall skipped patient
   */
  async recallPatient(patientQueueId, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    if (patientQueue.status !== QUEUE_STATUS.SKIPPED) {
      throw new ValidationError('Can only recall skipped patients');
    }

    const updated = await this.repository.updatePatientQueue(patientQueueId, {
      status: QUEUE_STATUS.RECALLED,
      recalledAt: new Date(),
      updatedBy: userId
    });

    return {
      message: 'Patient recalled',
      recalled: updated
    };
  }

  /**
   * Transfer patient to another queue
   */
  async transferPatient(patientQueueId, newServiceQueueId, reason, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    const newQueue = await this.repository.getServiceQueueById(newServiceQueueId);
    
    if (!newQueue || newQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Target queue not found');
    }

    // Mark current entry as transferred
    await this.repository.updatePatientQueue(patientQueueId, {
      status: QUEUE_STATUS.TRANSFERRED,
      transferredTo: newServiceQueueId,
      transferReason: reason,
      completedAt: new Date(),
      updatedBy: userId
    });

    // Decrement old queue count
    await this.repository.updateServiceQueue(patientQueue.serviceQueueId, {
      currentCount: { decrement: 1 },
      currentServingId: patientQueue.status === QUEUE_STATUS.SERVING ? null : undefined
    });

    // Add to new queue
    const newEntry = await this.addPatientToQueue({
      patientId: patientQueue.patientId,
      serviceQueueId: newServiceQueueId,
      billId: patientQueue.billId,
      isEmergency: patientQueue.isEmergency,
      notes: `Transferred from ${patientQueue.serviceQueue.queueName}. Reason: ${reason}`
    }, hospitalId, userId);

    // Link transfer
    await this.repository.updatePatientQueue(newEntry.queueEntry.id, {
      transferredFrom: patientQueueId
    });

    // Recalculate old queue positions
    await this.repository.recalculatePositions(patientQueue.serviceQueueId);

    return {
      message: 'Patient transferred',
      oldEntry: patientQueue,
      newEntry: newEntry.queueEntry
    };
  }

  /**
   * Cancel patient from queue
   */
  async cancelPatient(patientQueueId, reason, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    if (patientQueue.status === QUEUE_STATUS.COMPLETED || 
        patientQueue.status === QUEUE_STATUS.CANCELLED) {
      throw new ValidationError('Cannot cancel completed or already cancelled entries');
    }

    const updated = await this.repository.updatePatientQueue(patientQueueId, {
      status: QUEUE_STATUS.CANCELLED,
      notes: reason || 'Cancelled by user',
      completedAt: new Date(),
      updatedBy: userId
    });

    // Decrement queue count
    await this.repository.updateServiceQueue(patientQueue.serviceQueueId, {
      currentCount: { decrement: 1 },
      currentServingId: patientQueue.status === QUEUE_STATUS.SERVING ? null : undefined
    });

    // Recalculate positions
    await this.repository.recalculatePositions(patientQueue.serviceQueueId);

    return {
      message: 'Patient removed from queue',
      cancelled: updated
    };
  }

  /**
   * Change patient priority
   */
  async changePriority(patientQueueId, newPriority, reason, hospitalId, userId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    if (!Object.values(QUEUE_PRIORITY).includes(newPriority)) {
      throw new ValidationError(`Invalid priority: ${newPriority}`);
    }

    const updated = await this.repository.updatePatientQueue(patientQueueId, {
      priority: newPriority,
      priorityReason: reason,
      isEmergency: newPriority === QUEUE_PRIORITY.EMERGENCY,
      updatedBy: userId
    });

    // Recalculate positions
    await this.repository.recalculatePositions(patientQueue.serviceQueueId);

    return {
      message: `Priority changed to ${newPriority}`,
      updated
    };
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Get patient's position and wait time
   */
  async getPatientQueueStatus(patientQueueId, hospitalId) {
    const patientQueue = await this.repository.getPatientQueueById(patientQueueId);
    
    if (!patientQueue || patientQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Queue entry not found');
    }

    const position = await this.repository.getPatientPosition(
      patientQueueId, 
      patientQueue.serviceQueueId
    );

    const serviceQueue = patientQueue.serviceQueue;
    const estimatedWaitTime = calculateEstimatedWaitTime(position, serviceQueue.averageServiceTime);

    return {
      queueEntry: {
        ...patientQueue,
        displayToken: formatTokenNumber(patientQueue.tokenNumber, serviceQueue.shortName),
        position,
        estimatedWaitTime,
        estimatedWaitTimeFormatted: this.formatWaitTime(estimatedWaitTime)
      }
    };
  }

  /**
   * Get patient's all active queues
   */
  async getPatientQueues(patientId, hospitalId) {
    const patient = await this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    const queues = await this.repository.getPatientActiveQueues(patient.id, hospitalId);

    return {
      patient: { id: patient.id, patientId: patient.patientId, name: patient.name },
      activeQueues: await Promise.all(queues.map(async (q) => {
        const position = await this.repository.getPatientPosition(q.id, q.serviceQueueId);
        return {
          ...q,
          displayToken: formatTokenNumber(q.tokenNumber, q.serviceQueue?.shortName),
          position,
          estimatedWaitTime: calculateEstimatedWaitTime(position, q.serviceQueue?.averageServiceTime || 10),
          estimatedWaitTimeFormatted: this.formatWaitTime(
            calculateEstimatedWaitTime(position, q.serviceQueue?.averageServiceTime || 10)
          )
        };
      }))
    };
  }

  /**
   * Get queue display data (for TV/Monitor)
   */
  async getQueueDisplay(serviceQueueId, hospitalId) {
    const serviceQueue = await this.repository.getServiceQueueById(serviceQueueId);
    
    if (!serviceQueue || serviceQueue.hospitalId !== hospitalId) {
      throw new NotFoundError('Service queue not found');
    }

    const waitingList = await this.repository.getWaitingQueue(serviceQueueId, { limit: 10 });
    const currentlyServing = await this.repository.getCurrentlyServing(serviceQueueId);

    return {
      queueName: serviceQueue.queueName,
      shortName: serviceQueue.shortName,
      counterNumber: serviceQueue.counterNumber,
      location: serviceQueue.location,
      assignedTo: serviceQueue.doctor?.name || serviceQueue.employee?.name || null,
      displayMessage: serviceQueue.displayMessage,
      currentlyServing: currentlyServing ? {
        tokenNumber: currentlyServing.tokenNumber,
        displayToken: formatTokenNumber(currentlyServing.tokenNumber, serviceQueue.shortName),
        patientName: currentlyServing.patient?.name,
        status: currentlyServing.status
      } : null,
      nextInLine: waitingList.slice(0, 5).map((entry, index) => ({
        position: index + 1,
        tokenNumber: entry.tokenNumber,
        displayToken: formatTokenNumber(entry.tokenNumber, serviceQueue.shortName),
        patientName: entry.patient?.name?.split(' ')[0], // First name only for privacy
        priority: entry.priority,
        isEmergency: entry.isEmergency
      })),
      stats: {
        totalWaiting: waitingList.length,
        currentToken: serviceQueue.currentToken,
        todayServed: serviceQueue.todayPatientCount
      }
    };
  }

  /**
   * Get queue analytics
   */
  async getQueueAnalytics(hospitalId, startDate, endDate) {
    const analytics = await this.repository.getQueueAnalytics(hospitalId, startDate, endDate);
    
    return {
      period: { startDate, endDate },
      analytics
    };
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Reset all queues for the day
   */
  async resetDailyQueues(hospitalId) {
    await this.repository.resetServiceQueueTokens(hospitalId);
    
    return { message: 'Queue tokens reset for new day' };
  }

  /**
   * Format wait time for display
   */
  formatWaitTime(minutes) {
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 1) {
      return remainingMinutes > 0 
        ? `1 hour ${remainingMinutes} min` 
        : '1 hour';
    }
    
    return remainingMinutes > 0 
      ? `${hours} hours ${remainingMinutes} min` 
      : `${hours} hours`;
  }
}

export default QueueService;
