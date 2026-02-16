/**
 * Reports Repository
 * Database queries for reporting
 */

export class ReportRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // ============== PATIENT REPORTS ==============
  async getPatientVisits(hospitalId, dateRange) {
    return this.prisma.patientVisit.findMany({
      where: {
        hospitalId,
        visitDate: {
          gte: new Date(dateRange.fromDate),
          lte: new Date(dateRange.toDate),
        },
      },
      include: { patient: true },
    });
  }

  async getPatientDemographics(hospitalId) {
    const patients = await this.prisma.patient.findMany({
      where: { hospitalId },
    });

    const byGender = {};
    const byAge = {};

    patients.forEach(p => {
      byGender[p.gender] = (byGender[p.gender] || 0) + 1;
      if (p.age) {
        const ageGroup = getAgeGroup(p.age);
        byAge[ageGroup] = (byAge[ageGroup] || 0) + 1;
      }
    });

    return { totalPatients: patients.length, byGender, byAge };
  }

  // ============== CLINICAL REPORTS ==============
  async getOPDVisits(hospitalId, dateRange) {
    return this.prisma.patientVisit.findMany({
      where: {
        hospitalId,
        visitType: { contains: 'CONSULTATION' },
        visitDate: {
          gte: new Date(dateRange.fromDate),
          lte: new Date(dateRange.toDate),
        },
      },
      include: { patient: true },
    });
  }

  async getIPDAdmissions(hospitalId, dateRange) {
    return this.prisma.ipdAdmission.findMany({
      where: {
        hospitalId,
        admissionDate: {
          gte: new Date(dateRange.fromDate),
          lte: new Date(dateRange.toDate),
        },
      },
      include: { patient: true, bed: true },
    });
  }

  async getDiagnosticOrders(hospitalId, dateRange) {
    return this.prisma.diagnosticOrder.findMany({
      where: {
        hospitalId,
        createdAt: {
          gte: new Date(dateRange.fromDate),
          lte: new Date(dateRange.toDate),
        },
      },
      include: { patient: true, orderItems: true },
    });
  }

  // ============== FINANCIAL REPORTS ==============
  async getBills(hospitalId, dateRange) {
    return this.prisma.bill.findMany({
      where: {
        hospitalId,
        billDate: {
          gte: new Date(dateRange.fromDate),
          lte: new Date(dateRange.toDate),
        },
      },
    });
  }

  async getOutstandingBills(hospitalId) {
    return this.prisma.bill.findMany({
      where: {
        hospitalId,
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
      },
      include: { Employee: true },
    });
  }

  // ============== ATTENDANCE REPORTS ==============
  async getAttendance(hospitalId, dateRange) {
    return this.prisma.attendance.findMany({
      where: {
        hospitalId,
        createdAt: {
          gte: new Date(dateRange.fromDate),
          lte: new Date(dateRange.toDate),
        },
      },
      include: { Employee: true, Doctor: true },
    });
  }

  // ============== AUDIT REPORTS ==============
  async getAuditLogs(hospitalId, dateRange, filters = {}) {
    const where = {
      hospitalId,
      createdAt: {
        gte: new Date(dateRange.fromDate),
        lte: new Date(dateRange.toDate),
      },
    };

    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.performedBy) where.performedBy = filters.performedBy;

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  // ============== ANALYTICS ==============
  async getAnalytics(hospitalId, dateRange) {
    return this.prisma.analytics.findMany({
      where: {
        hospitalId,
        reportDate: {
          gte: new Date(dateRange.fromDate).toISOString().split('T')[0],
          lte: new Date(dateRange.toDate).toISOString().split('T')[0],
        },
      },
    });
  }
}

const getAgeGroup = (age) => {
  if (age < 18) return '0-17';
  if (age < 30) return '18-29';
  if (age < 45) return '30-44';
  if (age < 60) return '45-59';
  return '60+';
};

















