/**
 * Visit Repository
 * Database operations for visits
 */

export class VisitRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create a new patient visit
   */
  async createVisit(data) {
    return await this.prisma.patientVisit.create({
      data,
      include: {
        patient: true,
        bill: true,
      },
    });
  }

  /**
   * Get visit by ID
   */
  async getVisitById(visitId) {
    return await this.prisma.patientVisit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        bill: true,
      },
    });
  }

  /**
   * Get visit by visitId (human-readable)
   */
  async getVisitByVisitId(visitId) {
    return await this.prisma.patientVisit.findUnique({
      where: { visitId },
      include: {
        patient: true,
        bill: true,
      },
    });
  }

  /**
   * Get visits by hospital
   */
  async getVisitsByHospital(hospitalId, filters = {}) {
    const where = { hospitalId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.visitType) {
      where.visitType = filters.visitType;
    }

    if (filters.visitCategory) {
      where.visitCategory = filters.visitCategory;
    }

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.fromDate) {
      where.visitDate = { gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      where.visitDate = {
        ...where.visitDate,
        lte: new Date(filters.toDate),
      };
    }

    return await this.prisma.patientVisit.findMany({
      where,
      include: {
        patient: true,
        bill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update visit
   */
  async updateVisit(visitId, data) {
    return await this.prisma.patientVisit.update({
      where: { id: visitId },
      data,
      include: {
        patient: true,
        bill: true,
      },
    });
  }

  /**
   * Get visits by patient
   */
  async getVisitsByPatient(patientId) {
    return await this.prisma.patientVisit.findMany({
      where: { patientId },
      include: {
        bill: true,
      },
      orderBy: {
        visitDate: 'desc',
      },
    });
  }

  /**
   * Get active visits (not completed/cancelled)
   */
  async getActiveVisits(hospitalId) {
    return await this.prisma.patientVisit.findMany({
      where: {
        hospitalId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      include: {
        patient: true,
        bill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
