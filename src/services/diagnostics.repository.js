/**
 * Diagnostics Repository
 * Database operations for diagnostic system
 */

export class DiagnosticsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // ==================== DIAGNOSTIC TESTS ====================

  /**
   * Create a new diagnostic test
   */
  async createTest(data) {
    return this.prisma.diagnosticTest.create({ data });
  }

  /**
   * Update a diagnostic test
   */
  async updateTest(id, data) {
    return this.prisma.diagnosticTest.update({
      where: { id },
      data
    });
  }

  /**
   * Get test by ID
   */
  async getTestById(id) {
    return this.prisma.diagnosticTest.findUnique({
      where: { id }
    });
  }

  /**
   * Get test by code
   */
  async getTestByCode(testCode, hospitalId) {
    return this.prisma.diagnosticTest.findFirst({
      where: { testCode, hospitalId }
    });
  }

  /**
   * Get all tests with filters
   */
  async getAllTests(hospitalId, filters = {}) {
    const where = { hospitalId };
    
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.search) {
      where.OR = [
        { testName: { contains: filters.search, mode: 'insensitive' } },
        { testCode: { contains: filters.search, mode: 'insensitive' } },
        { shortName: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    if (filters.department) {
      where.department = filters.department;
    }
    if (filters.homeCollectionAvailable !== undefined) {
      where.homeCollectionAvailable = filters.homeCollectionAvailable;
    }

    return this.prisma.diagnosticTest.findMany({
      where,
      orderBy: filters.orderBy || { testName: 'asc' }
    });
  }

  /**
   * Get tests by IDs
   */
  async getTestsByIds(testIds) {
    return this.prisma.diagnosticTest.findMany({
      where: { id: { in: testIds } }
    });
  }

  /**
   * Deactivate test (soft delete)
   */
  async deactivateTest(id) {
    return this.prisma.diagnosticTest.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // ==================== DIAGNOSTIC ORDERS ====================

  /**
   * Create diagnostic order
   */
  async createOrder(data) {
    return this.prisma.diagnosticOrder.create({
      data,
      include: {
        patient: true,
        orderItems: {
          include: { test: true }
        },
        referringDoctor: true
      }
    });
  }

  /**
   * Update diagnostic order
   */
  async updateOrder(id, data) {
    return this.prisma.diagnosticOrder.update({
      where: { id },
      data,
      include: {
        patient: true,
        orderItems: {
          include: { test: true, result: true }
        },
        referringDoctor: true
      }
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    return this.prisma.diagnosticOrder.findUnique({
      where: { id },
      include: {
        patient: true,
        orderItems: {
          include: { test: true, result: true }
        },
        referringDoctor: true,
        externalPrescription: true,
        collectionSlot: true
      }
    });
  }

  /**
   * Get order by orderId
   */
  async getOrderByOrderId(orderId) {
    return this.prisma.diagnosticOrder.findUnique({
      where: { orderId },
      include: {
        patient: true,
        orderItems: {
          include: { test: true, result: true }
        },
        referringDoctor: true,
        externalPrescription: true,
        collectionSlot: true
      }
    });
  }

  /**
   * Get orders by patient
   */
  async getOrdersByPatient(patientId, hospitalId) {
    return this.prisma.diagnosticOrder.findMany({
      where: { patientId, hospitalId },
      include: {
        orderItems: {
          include: { test: true, result: true }
        },
        referringDoctor: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get orders with filters
   */
  async getOrders(hospitalId, filters = {}) {
    const where = { hospitalId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.orderType) {
      where.orderType = filters.orderType;
    }
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters.referringDoctorId) {
      where.referringDoctorId = filters.referringDoctorId;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }
    if (filters.collectionDate) {
      const startOfDay = new Date(filters.collectionDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.collectionDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.collectionScheduledAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    return this.prisma.diagnosticOrder.findMany({
      where,
      include: {
        patient: true,
        orderItems: {
          include: { test: true }
        },
        referringDoctor: true
      },
      orderBy: filters.orderBy || { createdAt: 'desc' },
      skip: filters.skip,
      take: filters.take
    });
  }

  /**
   * Count orders
   */
  async countOrders(hospitalId, filters = {}) {
    const where = { hospitalId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    return this.prisma.diagnosticOrder.count({ where });
  }

  // ==================== ORDER ITEMS ====================

  /**
   * Create order item
   */
  async createOrderItem(data) {
    return this.prisma.diagnosticOrderItem.create({
      data,
      include: { test: true }
    });
  }

  /**
   * Create multiple order items
   */
  async createOrderItems(items) {
    return this.prisma.diagnosticOrderItem.createMany({
      data: items
    });
  }

  /**
   * Update order item
   */
  async updateOrderItem(id, data) {
    return this.prisma.diagnosticOrderItem.update({
      where: { id },
      data,
      include: { test: true, result: true }
    });
  }

  /**
   * Get order item by ID
   */
  async getOrderItemById(id) {
    return this.prisma.diagnosticOrderItem.findUnique({
      where: { id },
      include: { test: true, result: true, order: true }
    });
  }

  /**
   * Get order items by order ID
   */
  async getOrderItemsByOrderId(orderId) {
    return this.prisma.diagnosticOrderItem.findMany({
      where: { orderId },
      include: { test: true, result: true }
    });
  }

  /**
   * Get order item by sample ID
   */
  async getOrderItemBySampleId(sampleId) {
    return this.prisma.diagnosticOrderItem.findUnique({
      where: { sampleId },
      include: { test: true, result: true, order: { include: { patient: true } } }
    });
  }

  /**
   * Get pending collections
   */
  async getPendingCollections(hospitalId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.diagnosticOrder.findMany({
      where: {
        hospitalId,
        status: { in: ['CREATED', 'SCHEDULED'] },
        collectionScheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        patient: true,
        orderItems: {
          where: { status: { in: ['ORDERED', 'SAMPLE_PENDING'] } },
          include: { test: true }
        }
      },
      orderBy: { collectionScheduledAt: 'asc' }
    });
  }

  // ==================== DIAGNOSTIC RESULTS ====================

  /**
   * Create result
   */
  async createResult(data) {
    return this.prisma.diagnosticResult.create({
      data,
      include: { patient: true }
    });
  }

  /**
   * Update result
   */
  async updateResult(id, data) {
    return this.prisma.diagnosticResult.update({
      where: { id },
      data
    });
  }

  /**
   * Get result by ID
   */
  async getResultById(id) {
    return this.prisma.diagnosticResult.findUnique({
      where: { id },
      include: { patient: true }
    });
  }

  /**
   * Get results by patient
   */
  async getResultsByPatient(patientId, hospitalId) {
    return this.prisma.diagnosticResult.findMany({
      where: { patientId, hospitalId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get results pending QC
   */
  async getResultsPendingQC(hospitalId) {
    return this.prisma.diagnosticResult.findMany({
      where: {
        hospitalId,
        status: 'ENTERED',
        qcStatus: null
      },
      include: { patient: true },
      orderBy: { enteredAt: 'asc' }
    });
  }

  /**
   * Get results pending review
   */
  async getResultsPendingReview(hospitalId) {
    return this.prisma.diagnosticResult.findMany({
      where: {
        hospitalId,
        qcStatus: 'PASSED',
        status: 'QC_CHECKED'
      },
      include: { patient: true },
      orderBy: { qcCheckedAt: 'asc' }
    });
  }

  // ==================== EXTERNAL PRESCRIPTIONS ====================

  /**
   * Create external prescription
   */
  async createExternalPrescription(data) {
    return this.prisma.externalPrescription.create({
      data,
      include: { patient: true }
    });
  }

  /**
   * Update external prescription
   */
  async updateExternalPrescription(id, data) {
    return this.prisma.externalPrescription.update({
      where: { id },
      data
    });
  }

  /**
   * Get external prescription by ID
   */
  async getExternalPrescriptionById(id) {
    return this.prisma.externalPrescription.findUnique({
      where: { id },
      include: { patient: true, orders: true }
    });
  }

  // ==================== LAB SLOTS ====================

  /**
   * Create lab slot
   */
  async createLabSlot(data) {
    return this.prisma.labSlot.create({ data });
  }

  /**
   * Create multiple lab slots
   */
  async createLabSlots(slots) {
    return this.prisma.labSlot.createMany({
      data: slots,
      skipDuplicates: true
    });
  }

  /**
   * Update lab slot
   */
  async updateLabSlot(id, data) {
    return this.prisma.labSlot.update({
      where: { id },
      data
    });
  }

  /**
   * Get available slots
   */
  async getAvailableSlots(hospitalId, date, collectionType = 'WALK_IN') {
    return this.prisma.labSlot.findMany({
      where: {
        hospitalId,
        slotDate: new Date(date),
        collectionType,
        isAvailable: true,
        isBlocked: false
      },
      orderBy: { slotStartTime: 'asc' }
    });
  }

  /**
   * Get slot by ID
   */
  async getSlotById(id) {
    return this.prisma.labSlot.findUnique({
      where: { id },
      include: { technician: true }
    });
  }

  /**
   * Book a slot (increment currentBookings)
   */
  async bookSlot(id) {
    return this.prisma.labSlot.update({
      where: { id },
      data: {
        currentBookings: { increment: 1 }
      }
    });
  }

  /**
   * Release a slot (decrement currentBookings)
   */
  async releaseSlot(id) {
    return this.prisma.labSlot.update({
      where: { id },
      data: {
        currentBookings: { decrement: 1 }
      }
    });
  }

  // ==================== COUNTERS ====================

  /**
   * Get next sequence for ID generation
   */
  async nextSequence(counterId) {
    const counter = await this.prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 }
    });
    return counter.seq;
  }
}

















