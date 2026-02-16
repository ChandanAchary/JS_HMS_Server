/**
 * Reports Service
 * Business logic for report generation
 */

import { ReportRepository } from './reports.repository.js';
import logger from '../utils/logger.js';

export class ReportService {
  constructor(prisma) {
    this.repository = new ReportRepository(prisma);
  }

  // Helper to get date range
  getDateRange(fromDate, toDate) {
    return {
      fromDate: fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      toDate: toDate || new Date(),
    };
  }

  // ============== PATIENT REPORTS ==============
  async getPatientVisitStats(hospitalId, dateRange) {
    try {
      const visits = await this.repository.getPatientVisits(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      const byVisitType = {};
      const byStatus = {};

      visits.forEach(v => {
        byVisitType[v.visitType] = (byVisitType[v.visitType] || 0) + 1;
        byStatus[v.status] = (byStatus[v.status] || 0) + 1;
      });

      return {
        totalVisits: visits.length,
        byVisitType,
        byStatus,
        avgVisitsPerDay: Math.round(visits.length / getDaysDifference(dateRange.fromDate, dateRange.toDate)),
      };
    } catch (error) {
      logger.error('[Reports] Error generating patient visit stats', error);
      throw error;
    }
  }

  async getPatientDemographics(hospitalId) {
    try {
      return await this.repository.getPatientDemographics(hospitalId);
    } catch (error) {
      logger.error('[Reports] Error generating patient demographics', error);
      throw error;
    }
  }

  async getPatientBillingSummary(hospitalId, dateRange) {
    try {
      const bills = await this.repository.getBills(hospitalId, this.getDateRange(dateRange.fromDate, dateRange.toDate));

      let totalBilled = 0;
      let totalPaid = 0;
      let totalOutstanding = 0;

      bills.forEach(b => {
        totalBilled += b.totalAmount;
        if (b.paymentStatus === 'PAID') totalPaid += b.totalAmount;
        else if (b.paymentStatus === 'UNPAID' || b.paymentStatus === 'PARTIAL') {
          totalOutstanding += b.totalAmount;
        }
      });

      return {
        totalBills: bills.length,
        totalBilled,
        totalPaid,
        totalOutstanding,
        collectionRate: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
      };
    } catch (error) {
      logger.error('[Reports] Error generating patient billing summary', error);
      throw error;
    }
  }

  // ============== CLINICAL REPORTS ==============
  async getOPDAnalysis(hospitalId, dateRange) {
    try {
      const visits = await this.repository.getOPDVisits(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      return {
        totalOPDVisits: visits.length,
        newPatients: visits.filter(v => v.visitType.includes('NEW')).length,
        followUpPatients: visits.filter(v => v.visitType.includes('FOLLOWUP')).length,
        avgVisitsPerDay: Math.round(visits.length / getDaysDifference(dateRange.fromDate, dateRange.toDate)),
      };
    } catch (error) {
      logger.error('[Reports] Error generating OPD analysis', error);
      throw error;
    }
  }

  async getIPDOccupancy(hospitalId, dateRange) {
    try {
      const admissions = await this.repository.getIPDAdmissions(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      let totalBedDays = 0;
      const activeAdmissions = admissions.filter(a => a.status === 'ACTIVE').length;

      admissions.forEach(a => {
        const discharged = a.discharge;
        const days = discharged
          ? Math.ceil((new Date(discharged.dischargeDate) - new Date(a.admissionDate)) / (1000 * 60 * 60 * 24))
          : 0;
        totalBedDays += days;
      });

      return {
        totalAdmissions: admissions.length,
        activeAdmissions,
        avgLengthOfStay: admissions.length > 0 ? Math.round(totalBedDays / admissions.length) : 0,
      };
    } catch (error) {
      logger.error('[Reports] Error generating IPD occupancy report', error);
      throw error;
    }
  }

  async getDiagnosticStats(hospitalId, dateRange) {
    try {
      const orders = await this.repository.getDiagnosticOrders(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      const byCategory = {};
      const byStatus = {};

      orders.forEach(o => {
        o.orderItems.forEach(item => {
          byCategory[item.testCategory] = (byCategory[item.testCategory] || 0) + 1;
        });
        byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      });

      return {
        totalOrders: orders.length,
        totalTests: orders.reduce((sum, o) => sum + o.orderItems.length, 0),
        byCategory,
        byStatus,
      };
    } catch (error) {
      logger.error('[Reports] Error generating diagnostic stats', error);
      throw error;
    }
  }

  // ============== FINANCIAL REPORTS ==============
  async getRevenueReport(hospitalId, dateRange) {
    try {
      const bills = await this.repository.getBills(hospitalId, this.getDateRange(dateRange.fromDate, dateRange.toDate));

      let totalRevenue = 0;
      let byPaymentMode = {};

      bills.forEach(b => {
        if (b.paymentStatus === 'PAID') {
          totalRevenue += b.totalAmount;
          const mode = b.paymentMode || 'UNKNOWN';
          byPaymentMode[mode] = (byPaymentMode[mode] || 0) + b.totalAmount;
        }
      });

      return {
        totalRevenue,
        totalBills: bills.length,
        avgBillAmount: bills.length > 0 ? Math.round(totalRevenue / bills.length) : 0,
        byPaymentMode,
      };
    } catch (error) {
      logger.error('[Reports] Error generating revenue report', error);
      throw error;
    }
  }

  async getOutstandingBills(hospitalId) {
    try {
      const bills = await this.repository.getOutstandingBills(hospitalId);

      let totalOutstanding = 0;
      bills.forEach(b => {
        totalOutstanding += b.totalAmount;
      });

      return {
        count: bills.length,
        totalAmount: totalOutstanding,
        bills: bills.map(b => ({
          billId: b.billId,
          patientId: b.patientId,
          amount: b.totalAmount,
          status: b.paymentStatus,
          billDate: b.billDate,
        })),
      };
    } catch (error) {
      logger.error('[Reports] Error fetching outstanding bills', error);
      throw error;
    }
  }

  async getServiceRevenue(hospitalId, dateRange) {
    try {
      const bills = await this.repository.getBills(hospitalId, this.getDateRange(dateRange.fromDate, dateRange.toDate));

      const byService = {};

      bills.forEach(b => {
        if (Array.isArray(b.services)) {
          b.services.forEach(s => {
            const service = s.serviceName || 'Unknown';
            byService[service] = (byService[service] || 0) + (s.amount || 0);
          });
        }
      });

      return byService;
    } catch (error) {
      logger.error('[Reports] Error generating service revenue report', error);
      throw error;
    }
  }

  // ============== STAFF REPORTS ==============
  async getAttendanceSummary(hospitalId, dateRange) {
    try {
      const attendance = await this.repository.getAttendance(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      let totalPresent = 0;
      let totalAbsent = 0;

      attendance.forEach(a => {
        if (a.checkInTime && a.checkOutTime) totalPresent++;
        else totalAbsent++;
      });

      return {
        totalPresent,
        totalAbsent,
        attendanceRate: attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0,
      };
    } catch (error) {
      logger.error('[Reports] Error generating attendance summary', error);
      throw error;
    }
  }

  async getStaffPerformance(hospitalId) {
    try {
      // This would be expanded based on specific performance metrics
      return {
        message: 'Staff performance report generation in progress',
      };
    } catch (error) {
      logger.error('[Reports] Error generating staff performance report', error);
      throw error;
    }
  }

  // ============== AUDIT REPORTS ==============
  async getAuditLogs(hospitalId, dateRange, filters) {
    try {
      return await this.repository.getAuditLogs(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate),
        filters
      );
    } catch (error) {
      logger.error('[Reports] Error fetching audit logs', error);
      throw error;
    }
  }

  async getUserActivity(hospitalId, dateRange) {
    try {
      const logs = await this.repository.getAuditLogs(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      const byUser = {};
      logs.forEach(log => {
        if (!byUser[log.performedBy]) {
          byUser[log.performedBy] = { name: log.performedByName, actions: 0 };
        }
        byUser[log.performedBy].actions++;
      });

      return byUser;
    } catch (error) {
      logger.error('[Reports] Error generating user activity report', error);
      throw error;
    }
  }

  async getSystemEvents(hospitalId, dateRange) {
    try {
      const logs = await this.repository.getAuditLogs(
        hospitalId,
        this.getDateRange(dateRange.fromDate, dateRange.toDate)
      );

      const byAction = {};
      logs.forEach(log => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
      });

      return byAction;
    } catch (error) {
      logger.error('[Reports] Error generating system events report', error);
      throw error;
    }
  }
}

const getDaysDifference = (fromDate, toDate) => {
  const from = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = toDate ? new Date(toDate) : new Date();
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
};



















