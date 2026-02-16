/**
 * Pharmacy Repository
 * Database operations for drugs, inventory, and dispensing
 */

export class PharmacyRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // ============== DRUG OPERATIONS ==============
  async createDrug(hospitalId, drugData) {
    return this.prisma.drug.create({
      data: {
        ...drugData,
        hospitalId,
      },
    });
  }

  async getDrugById(drugId) {
    return this.prisma.drug.findUnique({
      where: { id: drugId },
    });
  }

  async getDrugsByHospital(hospitalId, filters = {}) {
    const where = { hospitalId };
    if (filters.category) where.category = filters.category;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { drugName: { contains: filters.search, mode: 'insensitive' } },
        { brandName: { contains: filters.search, mode: 'insensitive' } },
        { drugCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.drug.findMany({
      where,
      skip: filters.skip || 0,
      take: filters.take || 50,
      orderBy: filters.orderBy || { createdAt: 'desc' },
    });
  }

  async updateDrug(drugId, drugData) {
    return this.prisma.drug.update({
      where: { id: drugId },
      data: drugData,
    });
  }

  async deleteDrug(drugId) {
    return this.prisma.drug.delete({
      where: { id: drugId },
    });
  }

  // ============== INVENTORY OPERATIONS ==============
  async addInventory(hospitalId, inventoryData) {
    return this.prisma.inventory.create({
      data: {
        ...inventoryData,
        hospitalId,
      },
    });
  }

  async getInventoryById(inventoryId) {
    return this.prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { drug: true },
    });
  }

  async getInventoryByDrug(drugId, hospitalId) {
    return this.prisma.inventory.findMany({
      where: {
        drugId,
        hospitalId,
        status: 'ACTIVE',
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getInventory(hospitalId, filters = {}) {
    const where = { hospitalId };
    if (filters.status) where.status = filters.status;
    if (filters.expiringIn) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.expiringIn);
      where.expiryDate = {
        lte: futureDate,
        gte: new Date(),
      };
    }

    return this.prisma.inventory.findMany({
      where,
      include: { drug: true },
      skip: filters.skip || 0,
      take: filters.take || 50,
      orderBy: { expiryDate: 'asc' },
    });
  }

  async updateInventory(inventoryId, inventoryData) {
    return this.prisma.inventory.update({
      where: { id: inventoryId },
      data: inventoryData,
    });
  }

  async getLowStockAlerts(hospitalId) {
    return this.prisma.inventory.findMany({
      where: {
        hospitalId,
        status: 'ACTIVE',
      },
      include: { drug: true },
    });
  }

  // ============== TRANSACTION OPERATIONS ==============
  async recordTransaction(hospitalId, transactionData) {
    return this.prisma.inventoryTransaction.create({
      data: {
        ...transactionData,
        hospitalId,
      },
    });
  }

  async getTransactions(hospitalId, filters = {}) {
    const where = { hospitalId };
    if (filters.transactionType) where.transactionType = filters.transactionType;
    if (filters.drugId) where.drugId = filters.drugId;
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {
        gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
        lte: filters.toDate ? new Date(filters.toDate) : undefined,
      };
    }

    return this.prisma.inventoryTransaction.findMany({
      where,
      include: { drug: true },
      skip: filters.skip || 0,
      take: filters.take || 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============== DISPENSING OPERATIONS ==============
  async createDispense(hospitalId, dispenseData) {
    return this.prisma.prescriptionDispense.create({
      data: {
        ...dispenseData,
        hospitalId,
      },
    });
  }

  async getDispenseById(dispenseId) {
    return this.prisma.prescriptionDispense.findUnique({
      where: { id: dispenseId },
    });
  }

  async getDispenseByDispenseId(dispenseId) {
    return this.prisma.prescriptionDispense.findUnique({
      where: { dispenseId },
    });
  }

  async getDispenses(hospitalId, filters = {}) {
    const where = { hospitalId };
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.fromDate || filters.toDate) {
      where.dispensedAt = {
        gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
        lte: filters.toDate ? new Date(filters.toDate) : undefined,
      };
    }

    return this.prisma.prescriptionDispense.findMany({
      where,
      skip: filters.skip || 0,
      take: filters.take || 50,
      orderBy: { dispensedAt: 'desc' },
    });
  }

  async updateDispense(dispenseId, dispenseData) {
    return this.prisma.prescriptionDispense.update({
      where: { id: dispenseId },
      data: dispenseData,
    });
  }

  // ============== STOCK MOVEMENTS ==============
  async getStockMovement(hospitalId, fromDate, toDate) {
    return this.prisma.inventoryTransaction.groupBy({
      by: ['drugId', 'transactionType'],
      where: {
        hospitalId,
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
      _sum: {
        quantity: true,
      },
    });
  }

  // ============== EXPIRY ANALYSIS ==============
  async getExpiringDrugs(hospitalId, daysThreshold = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysThreshold);

    return this.prisma.inventory.findMany({
      where: {
        hospitalId,
        status: 'ACTIVE',
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: { drug: true },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getExpiredDrugs(hospitalId) {
    return this.prisma.inventory.findMany({
      where: {
        hospitalId,
        expiryDate: {
          lt: new Date(),
        },
        isExpired: false,
      },
      include: { drug: true },
    });
  }
}

















