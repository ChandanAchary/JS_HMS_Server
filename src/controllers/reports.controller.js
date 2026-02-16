/**
 * Reports Controller
 * Request handlers for report generation
 */

import { ReportService } from '../services/reports.service.js';
import logger from '../utils/logger.js';

let reportService;

const initializeService = (prisma) => {
  if (!reportService) {
    reportService = new ReportService(prisma);
  }
};

// Helper to parse date query params
const parseDateRange = (req) => {
  return {
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
  };
};

// ============== PATIENT REPORTS ==============
export const getPatientVisitStats = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const stats = await reportService.getPatientVisitStats(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'Patient Visit Statistics',
      dateRange,
      data: stats,
    });
  } catch (error) {
    logger.error('[Reports] GET /patient/visit-statistics error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientDemographics = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const demographics = await reportService.getPatientDemographics(hospitalId);

    res.json({
      success: true,
      reportType: 'Patient Demographics',
      data: demographics,
    });
  } catch (error) {
    logger.error('[Reports] GET /patient/demographics error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientBillingSummary = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const summary = await reportService.getPatientBillingSummary(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'Patient Billing Summary',
      dateRange,
      data: summary,
    });
  } catch (error) {
    logger.error('[Reports] GET /patient/billing-summary error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== CLINICAL REPORTS ==============
export const getOPDAnalysis = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const analysis = await reportService.getOPDAnalysis(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'OPD Analysis',
      dateRange,
      data: analysis,
    });
  } catch (error) {
    logger.error('[Reports] GET /clinical/opd-analysis error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getIPDOccupancy = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const occupancy = await reportService.getIPDOccupancy(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'IPD Occupancy',
      dateRange,
      data: occupancy,
    });
  } catch (error) {
    logger.error('[Reports] GET /clinical/ipd-occupancy error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiagnosticStats = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const stats = await reportService.getDiagnosticStats(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'Diagnostic Statistics',
      dateRange,
      data: stats,
    });
  } catch (error) {
    logger.error('[Reports] GET /clinical/diagnostic-stats error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== FINANCIAL REPORTS ==============
export const getRevenueReport = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const revenue = await reportService.getRevenueReport(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'Revenue Report',
      dateRange,
      data: revenue,
    });
  } catch (error) {
    logger.error('[Reports] GET /financial/revenue error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOutstandingBills = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const outstanding = await reportService.getOutstandingBills(hospitalId);

    res.json({
      success: true,
      reportType: 'Outstanding Bills',
      data: outstanding,
    });
  } catch (error) {
    logger.error('[Reports] GET /financial/outstanding-bills error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getServiceRevenue = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const serviceRevenue = await reportService.getServiceRevenue(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'Service-Wise Revenue',
      dateRange,
      data: serviceRevenue,
    });
  } catch (error) {
    logger.error('[Reports] GET /financial/service-revenue error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== STAFF REPORTS ==============
export const getAttendanceSummary = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const summary = await reportService.getAttendanceSummary(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'Attendance Summary',
      dateRange,
      data: summary,
    });
  } catch (error) {
    logger.error('[Reports] GET /staff/attendance-summary error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStaffPerformance = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const performance = await reportService.getStaffPerformance(hospitalId);

    res.json({
      success: true,
      reportType: 'Staff Performance',
      data: performance,
    });
  } catch (error) {
    logger.error('[Reports] GET /staff/performance error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== AUDIT REPORTS ==============
export const getAuditLogs = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);
    const { entity, action, performedBy } = req.query;

    const logs = await reportService.getAuditLogs(hospitalId, dateRange, {
      entity,
      action,
      performedBy,
    });

    res.json({
      success: true,
      reportType: 'Audit Logs',
      dateRange,
      count: logs.length,
      data: logs.slice(0, 500), // Limit to 500 recent logs
    });
  } catch (error) {
    logger.error('[Reports] GET /audit/activity-logs error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const activity = await reportService.getUserActivity(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'User Activity',
      dateRange,
      data: activity,
    });
  } catch (error) {
    logger.error('[Reports] GET /audit/user-activity error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSystemEvents = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const dateRange = parseDateRange(req);

    const events = await reportService.getSystemEvents(hospitalId, dateRange);

    res.json({
      success: true,
      reportType: 'System Events',
      dateRange,
      data: events,
    });
  } catch (error) {
    logger.error('[Reports] GET /audit/system-events error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== DATA EXPORT ==============
export const exportReportCSV = async (req, res) => {
  try {
    const { reportType, data } = req.body;

    if (!data || !Array.isArray(data) && typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid data format' });
    }

    // Convert to CSV
    const csv = convertToCSV(data);
    const filename = `${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('[Reports] POST /export/csv error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const exportReportPDF = async (req, res) => {
  try {
    // PDF generation would require a library like pdfkit or puppeteer
    // For now, return placeholder
    res.status(501).json({
      success: false,
      error: 'PDF export not yet implemented. Use CSV export instead.',
    });
  } catch (error) {
    logger.error('[Reports] POST /export/pdf error', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(item =>
      headers.map(h => {
        const value = item[h];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  } else if (typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
  }

  return String(data);
};



















