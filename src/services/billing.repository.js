/**
 * Billing Repository
 * Data access layer for Bill and Patient entities
 */

export class BillRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find bill by internal ID
   */
  async findById(id) {
    return this.prisma.bill.findUnique({
      where: { id }
    });
  }

  /**
   * Find bill by billId (display ID)
   */
  async findByBillId(billId, hospitalId) {
    return this.prisma.bill.findFirst({
      where: { billId, hospitalId }
    });
  }

  /**
   * Create bill
   */
  async create(data) {
    return this.prisma.bill.create({ data });
  }

  /**
   * Update bill
   */
  async update(id, data) {
    return this.prisma.bill.update({
      where: { id },
      data
    });
  }

  /**
   * Find bills for patient
   */
  async findByPatientId(patientId, hospitalId) {
    return this.prisma.bill.findMany({
      where: { patientId, hospitalId },
      orderBy: { billDate: 'desc' }
    });
  }

  /**
   * Find bill by patient and bill ID
   */
  async findByPatientAndBillId(patientId, billId, hospitalId) {
    return this.prisma.bill.findFirst({
      where: { patientId, billId, hospitalId }
    });
  }

  /**
   * Count bills by hospital
   */
  async countByHospital(hospitalId) {
    return this.prisma.bill.count({
      where: { hospitalId }
    });
  }
}

export class CounterRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get next sequence atomically
   */
  async nextSequence(counterId) {
    return this.prisma.$transaction(async (tx) => {
      let counter = await tx.counter.findUnique({ where: { id: counterId } });
      if (!counter) {
        counter = await tx.counter.create({ data: { id: counterId, seq: 1 } });
        return counter.seq;
      }
      counter = await tx.counter.update({
        where: { id: counterId },
        data: { seq: { increment: 1 } }
      });
      return counter.seq;
    });
  }
}

export default { BillRepository, CounterRepository };

















