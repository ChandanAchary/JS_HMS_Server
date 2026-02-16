/**
 * Queue Repository
 * Database operations for queue management
 */

export class QueueRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // ==================== SERVICE QUEUE OPERATIONS ====================

  /**
   * Create a new service queue
   */
  async createServiceQueue(data) {
    return this.prisma.serviceQueue.create({
      data,
      include: {
        doctor: true,
        employee: true
      }
    });
  }

  /**
   * Get service queue by ID
   */
  async getServiceQueueById(id) {
    return this.prisma.serviceQueue.findUnique({
      where: { id },
      include: {
        doctor: true,
        employee: true,
        _count: {
          select: {
            patientQueues: {
              where: { status: 'WAITING' }
            }
          }
        }
      }
    });
  }

  /**
   * Get service queue by code
   */
  async getServiceQueueByCode(hospitalId, queueCode) {
    return this.prisma.serviceQueue.findUnique({
      where: {
        hospitalId_queueCode: { hospitalId, queueCode }
      },
      include: {
        doctor: true,
        employee: true
      }
    });
  }

  /**
   * Get all service queues for hospital
   */
  async getServiceQueues(hospitalId, filters = {}) {
    const where = { hospitalId };
    
    if (filters.serviceType) {
      where.serviceType = filters.serviceType;
    }
    
    if (filters.department) {
      where.department = filters.department;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    return this.prisma.serviceQueue.findMany({
      where,
      include: {
        doctor: {
          select: { id: true, name: true, specialization: true }
        },
        employee: {
          select: { id: true, name: true, role: true }
        },
        _count: {
          select: {
            patientQueues: {
              where: { status: 'WAITING' }
            }
          }
        }
      },
      orderBy: [
        { serviceType: 'asc' },
        { queueName: 'asc' }
      ]
    });
  }

  /**
   * Update service queue
   */
  async updateServiceQueue(id, data) {
    return this.prisma.serviceQueue.update({
      where: { id },
      data,
      include: {
        doctor: true,
        employee: true
      }
    });
  }

  /**
   * Get next token number for a service queue
   */
  async getNextTokenNumber(serviceQueueId) {
    const result = await this.prisma.serviceQueue.update({
      where: { id: serviceQueueId },
      data: {
        nextToken: { increment: 1 }
      },
      select: { nextToken: true }
    });
    return result.nextToken - 1; // Return the token we're assigning
  }

  /**
   * Reset service queue tokens (daily reset)
   */
  async resetServiceQueueTokens(hospitalId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.serviceQueue.updateMany({
      where: {
        hospitalId,
        OR: [
          { lastResetDate: null },
          { lastResetDate: { lt: today } }
        ]
      },
      data: {
        currentToken: 0,
        nextToken: 1,
        todayPatientCount: 0,
        lastResetDate: today
      }
    });
  }

  // ==================== PATIENT QUEUE OPERATIONS ====================

  /**
   * Create patient queue entry
   */
  async createPatientQueue(data) {
    return this.prisma.patientQueue.create({
      data,
      include: {
        patient: true,
        bill: true,
        serviceQueue: true
      }
    });
  }

  /**
   * Get patient queue entry by ID
   */
  async getPatientQueueById(id) {
    return this.prisma.patientQueue.findUnique({
      where: { id },
      include: {
        patient: true,
        bill: true,
        serviceQueue: {
          include: {
            doctor: { select: { id: true, name: true, specialization: true } },
            employee: { select: { id: true, name: true, role: true } }
          }
        },
        diagnosticOrder: true
      }
    });
  }

  /**
   * Get patient queue by queue number
   */
  async getPatientQueueByNumber(hospitalId, queueNumber) {
    return this.prisma.patientQueue.findUnique({
      where: {
        hospitalId_queueNumber: { hospitalId, queueNumber }
      },
      include: {
        patient: true,
        bill: true,
        serviceQueue: true
      }
    });
  }

  /**
   * Get waiting queue for a service queue (sorted by priority)
   */
  async getWaitingQueue(serviceQueueId, options = {}) {
    const { limit, offset } = options;
    
    return this.prisma.patientQueue.findMany({
      where: {
        serviceQueueId,
        status: { in: ['WAITING', 'CALLED', 'RECALLED'] }
      },
      include: {
        patient: {
          select: { id: true, patientId: true, name: true, age: true, gender: true, phone: true }
        },
        bill: {
          select: { id: true, billId: true, isEmergency: true }
        }
      },
      orderBy: [
        // Emergency first, then by priority order, then by join time
        { isEmergency: 'desc' },
        { priority: 'asc' }, // EMERGENCY < URGENT < PRIORITY < NORMAL in sort order
        { joinedAt: 'asc' }
      ],
      take: limit,
      skip: offset
    });
  }

  /**
   * Get waiting count for a service queue
   */
  async getWaitingCount(serviceQueueId) {
    return this.prisma.patientQueue.count({
      where: {
        serviceQueueId,
        status: { in: ['WAITING', 'CALLED', 'RECALLED'] }
      }
    });
  }

  /**
   * Get patient's position in queue
   */
  async getPatientPosition(patientQueueId, serviceQueueId) {
    const patientQueue = await this.prisma.patientQueue.findUnique({
      where: { id: patientQueueId },
      select: { priority: true, isEmergency: true, joinedAt: true }
    });

    if (!patientQueue) return null;

    // Count patients ahead in queue
    const aheadCount = await this.prisma.patientQueue.count({
      where: {
        serviceQueueId,
        status: { in: ['WAITING', 'CALLED', 'RECALLED'] },
        OR: [
          // Higher priority patients
          { isEmergency: true, joinedAt: { lt: patientQueue.joinedAt } },
          { 
            isEmergency: patientQueue.isEmergency,
            priority: { lt: patientQueue.priority },
            joinedAt: { lt: patientQueue.joinedAt }
          },
          // Same priority, earlier join time
          {
            isEmergency: patientQueue.isEmergency,
            priority: patientQueue.priority,
            joinedAt: { lt: patientQueue.joinedAt }
          }
        ]
      }
    });

    return aheadCount + 1;
  }

  /**
   * Update patient queue entry
   */
  async updatePatientQueue(id, data) {
    return this.prisma.patientQueue.update({
      where: { id },
      data,
      include: {
        patient: true,
        serviceQueue: true
      }
    });
  }

  /**
   * Get next patient to call (respecting priority)
   */
  async getNextPatientToCall(serviceQueueId) {
    return this.prisma.patientQueue.findFirst({
      where: {
        serviceQueueId,
        status: 'WAITING'
      },
      include: {
        patient: true,
        bill: true,
        serviceQueue: true
      },
      orderBy: [
        { isEmergency: 'desc' },
        { priority: 'asc' },
        { joinedAt: 'asc' }
      ]
    });
  }

  /**
   * Get currently serving patient
   */
  async getCurrentlyServing(serviceQueueId) {
    return this.prisma.patientQueue.findFirst({
      where: {
        serviceQueueId,
        status: 'SERVING'
      },
      include: {
        patient: true,
        serviceQueue: true
      }
    });
  }

  /**
   * Get patient's active queue entries
   */
  async getPatientActiveQueues(patientId, hospitalId) {
    return this.prisma.patientQueue.findMany({
      where: {
        patientId,
        hospitalId,
        status: { in: ['WAITING', 'CALLED', 'RECALLED', 'ON_HOLD'] }
      },
      include: {
        serviceQueue: {
          include: {
            doctor: { select: { id: true, name: true, specialization: true } }
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
  }

  /**
   * Get today's queue statistics for a service queue
   */
  async getTodayQueueStats(serviceQueueId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = await this.prisma.patientQueue.groupBy({
      by: ['status'],
      where: {
        serviceQueueId,
        createdAt: { gte: todayStart }
      },
      _count: { status: true }
    });

    const avgWaitTime = await this.prisma.patientQueue.aggregate({
      where: {
        serviceQueueId,
        status: 'COMPLETED',
        createdAt: { gte: todayStart },
        servedAt: { not: null },
        joinedAt: { not: null }
      },
      _avg: {
        estimatedWaitTime: true
      }
    });

    return {
      byStatus: stats.reduce((acc, s) => {
        acc[s.status] = s._count.status;
        return acc;
      }, {}),
      averageWaitTime: avgWaitTime._avg.estimatedWaitTime
    };
  }

  /**
   * Bulk update queue positions
   */
  async recalculatePositions(serviceQueueId) {
    // Get all waiting patients sorted by priority
    const waitingPatients = await this.prisma.patientQueue.findMany({
      where: {
        serviceQueueId,
        status: { in: ['WAITING', 'CALLED', 'RECALLED'] }
      },
      orderBy: [
        { isEmergency: 'desc' },
        { priority: 'asc' },
        { joinedAt: 'asc' }
      ],
      select: { id: true }
    });

    // Update positions in transaction
    const updates = waitingPatients.map((patient, index) => 
      this.prisma.patientQueue.update({
        where: { id: patient.id },
        data: { position: index + 1 }
      })
    );

    return this.prisma.$transaction(updates);
  }

  // ==================== QUEUE HISTORY OPERATIONS ====================

  /**
   * Create queue history entry
   */
  async createQueueHistory(data) {
    return this.prisma.queueHistory.create({ data });
  }

  /**
   * Get queue history for analytics
   */
  async getQueueHistory(hospitalId, filters = {}) {
    const where = { hospitalId };
    
    if (filters.serviceQueueId) {
      where.serviceQueueId = filters.serviceQueueId;
    }
    
    if (filters.startDate && filters.endDate) {
      where.queueDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      };
    }

    return this.prisma.queueHistory.findMany({
      where,
      include: {
        serviceQueue: {
          select: { queueName: true, serviceType: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100
    });
  }

  /**
   * Get aggregate statistics for a date range
   */
  async getQueueAnalytics(hospitalId, startDate, endDate) {
    const stats = await this.prisma.queueHistory.aggregate({
      where: {
        hospitalId,
        queueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _count: { id: true },
      _avg: {
        waitTimeMinutes: true,
        serviceTimeMinutes: true,
        totalTimeMinutes: true
      },
      _sum: {
        skipCount: true
      }
    });

    const byStatus = await this.prisma.queueHistory.groupBy({
      by: ['finalStatus'],
      where: {
        hospitalId,
        queueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _count: { finalStatus: true }
    });

    const byPriority = await this.prisma.queueHistory.groupBy({
      by: ['priority'],
      where: {
        hospitalId,
        queueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _count: { priority: true },
      _avg: { waitTimeMinutes: true }
    });

    return {
      total: stats._count.id,
      averages: {
        waitTime: stats._avg.waitTimeMinutes,
        serviceTime: stats._avg.serviceTimeMinutes,
        totalTime: stats._avg.totalTimeMinutes
      },
      totalSkips: stats._sum.skipCount,
      byStatus: byStatus.reduce((acc, s) => {
        acc[s.finalStatus] = s._count.finalStatus;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, p) => {
        acc[p.priority] = {
          count: p._count.priority,
          avgWaitTime: p._avg.waitTimeMinutes
        };
        return acc;
      }, {})
    };
  }

  // ==================== COUNTER OPERATIONS ====================

  /**
   * Get next queue number
   */
  async getNextQueueNumber(hospitalId, prefix = 'QUE') {
    const today = new Date();
    const dateKey = `${String(today.getFullYear()).slice(2)}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const counterId = `${prefix}${dateKey}`;

    const counter = await this.prisma.counter.upsert({
      where: { id: counterId },
      create: { id: counterId, seq: 1 },
      update: { seq: { increment: 1 } }
    });

    return `${prefix}${dateKey}${String(counter.seq).padStart(3, '0')}`;
  }
}

export default QueueRepository;

















