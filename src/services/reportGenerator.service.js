/**
 * Report Generator Service
 * 
 * Handles the complete lifecycle of diagnostic reports:
 * - Report creation from templates
 * - Sign-off workflow (Technician → QC → Pathologist/Radiologist)
 * - Report locking and amendments
 * - PDF generation configuration
 * - Audit trail
 * - Critical value notifications
 * 
 * Compliance: NABL (ISO 15189), NABH
 */

import prisma from '../core/database/prismaClient.js';
import { templateEngineService } from './templateEngine.service.js';
import { TEMPLATE_TYPES } from '../constants/diagnosticTemplates.js';

// ============================================================================
// REPORT STATUS WORKFLOW
// ============================================================================

const REPORT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_ENTRY: 'PENDING_ENTRY',
  PENDING_QC: 'PENDING_QC',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  DELIVERED: 'DELIVERED',
  AMENDED: 'AMENDED',
  CANCELLED: 'CANCELLED'
};

const WORKFLOW_TRANSITIONS = {
  [REPORT_STATUS.DRAFT]: [REPORT_STATUS.PENDING_ENTRY, REPORT_STATUS.CANCELLED],
  [REPORT_STATUS.PENDING_ENTRY]: [REPORT_STATUS.PENDING_QC, REPORT_STATUS.DRAFT, REPORT_STATUS.CANCELLED],
  [REPORT_STATUS.PENDING_QC]: [REPORT_STATUS.PENDING_REVIEW, REPORT_STATUS.PENDING_ENTRY, REPORT_STATUS.CANCELLED],
  [REPORT_STATUS.PENDING_REVIEW]: [REPORT_STATUS.APPROVED, REPORT_STATUS.PENDING_QC, REPORT_STATUS.CANCELLED],
  [REPORT_STATUS.APPROVED]: [REPORT_STATUS.DELIVERED, REPORT_STATUS.AMENDED],
  [REPORT_STATUS.DELIVERED]: [REPORT_STATUS.AMENDED],
  [REPORT_STATUS.AMENDED]: [REPORT_STATUS.DELIVERED]
};

// ============================================================================
// REPORT GENERATOR SERVICE CLASS
// ============================================================================

class ReportGeneratorService {
  
  // ============================================================================
  // REPORT CREATION
  // ============================================================================
  
  /**
   * Create a new diagnostic report
   */
  async createReport(data) {
    const {
      templateId,
      templateCode,
      diagnosticOrderId,
      patientId,
      hospitalId,
      specimens = [],
      results = {},
      metadata = {},
      createdById
    } = data;
    
    // Get template
    let template;
    if (templateId) {
      template = await prisma.diagnosticReportTemplate.findUnique({
        where: { id: templateId }
      });
    } else if (templateCode) {
      template = await prisma.diagnosticReportTemplate.findFirst({
        where: {
          templateCode,
          OR: [{ hospitalId }, { isSystemTemplate: true }],
          status: 'ACTIVE'
        }
      });
    }
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Generate report number
    const reportNumber = await this.generateReportNumber(hospitalId, template.category);
    
    // Get patient details for context
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    // Render report to detect critical values
    const rendered = await templateEngineService.renderReport(
      template.id,
      { patient, results, specimens, metadata },
      { hospitalId }
    );
    
    // Create report
    const report = await prisma.diagnosticReport.create({
      data: {
        reportNumber,
        hospitalId,
        templateId: template.id,
        templateCode: template.templateCode,
        templateVersion: template.version,
        diagnosticOrderId,
        patientId,
        specimens: JSON.stringify(specimens),
        results: JSON.stringify(results),
        calculatedValues: JSON.stringify(rendered.calculatedValues || {}),
        interpretations: JSON.stringify(rendered.interpretations || []),
        criticalValues: JSON.stringify(rendered.criticalValues || []),
        hasCriticalValues: rendered.criticalValues.length > 0,
        status: REPORT_STATUS.DRAFT,
        createdById,
        reportDate: new Date()
      },
      include: {
        template: {
          select: {
            templateCode: true,
            templateName: true,
            templateType: true,
            category: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true,
            patientId: true,
            gender: true,
            dateOfBirth: true,
            bloodGroup: true
          }
        }
      }
    });
    
    // Log audit
    await this.logAudit({
      reportId: report.id,
      templateId: template.id,
      action: 'REPORT_CREATED',
      performedById: createdById,
      details: { reportNumber, patientId, templateCode: template.templateCode }
    });
    
    // Handle critical value notification
    if (rendered.criticalValues.length > 0) {
      await this.notifyCriticalValues(report, rendered.criticalValues, createdById);
    }
    
    return report;
  }
  
  /**
   * Generate unique report number
   */
  async generateReportNumber(hospitalId, category) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Category prefix
    const categoryPrefixes = {
      'HEMATOLOGY': 'HEM',
      'BIOCHEMISTRY': 'BIO',
      'SEROLOGY': 'SER',
      'MICROBIOLOGY': 'MIC',
      'HISTOPATHOLOGY': 'HPE',
      'CYTOLOGY': 'CYT',
      'RADIOLOGY': 'RAD',
      'CARDIOLOGY': 'CAR',
      'HORMONES': 'HOR',
      'MOLECULAR': 'MOL'
    };
    
    const prefix = categoryPrefixes[category] || 'DGN';
    
    // Get sequence for today
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const count = await prisma.diagnosticReport.count({
      where: {
        hospitalId,
        createdAt: { gte: startOfDay }
      }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    
    return `${prefix}${year}${month}${day}${sequence}`;
  }
  
  // ============================================================================
  // REPORT UPDATES
  // ============================================================================
  
  /**
   * Update report results
   */
  async updateReportResults(reportId, data, updatedById) {
    const { results, specimens, metadata } = data;
    
    const report = await this.getReportById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Check if report is editable
    if (report.isLocked) {
      throw new Error('Report is locked and cannot be edited');
    }
    
    if (report.status === REPORT_STATUS.APPROVED || report.status === REPORT_STATUS.DELIVERED) {
      throw new Error('Approved/Delivered reports must be amended, not edited');
    }
    
    // Get patient for context
    const patient = await prisma.patient.findUnique({
      where: { id: report.patientId }
    });
    
    // Re-render with new results
    const existingResults = typeof report.results === 'string' ? JSON.parse(report.results) : report.results;
    const mergedResults = { ...existingResults, ...results };
    
    const rendered = await templateEngineService.renderReport(
      report.templateId,
      { patient, results: mergedResults, specimens, metadata },
      { hospitalId: report.hospitalId }
    );
    
    // Update report
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        results: JSON.stringify(mergedResults),
        specimens: specimens ? JSON.stringify(specimens) : undefined,
        calculatedValues: JSON.stringify(rendered.calculatedValues || {}),
        interpretations: JSON.stringify(rendered.interpretations || []),
        criticalValues: JSON.stringify(rendered.criticalValues || []),
        hasCriticalValues: rendered.criticalValues.length > 0,
        updatedAt: new Date()
      }
    });
    
    // Log audit
    await this.logAudit({
      reportId,
      templateId: report.templateId,
      action: 'RESULTS_UPDATED',
      performedById: updatedById,
      previousValues: JSON.stringify(existingResults),
      newValues: JSON.stringify(mergedResults),
      details: { fieldsUpdated: Object.keys(results) }
    });
    
    return updated;
  }
  
  // ============================================================================
  // WORKFLOW & SIGN-OFF
  // ============================================================================
  
  /**
   * Submit report for entry (move from DRAFT to PENDING_ENTRY)
   */
  async submitForEntry(reportId, technicianId) {
    return this.transitionStatus(reportId, REPORT_STATUS.PENDING_ENTRY, technicianId, {
      action: 'SUBMITTED_FOR_ENTRY',
      role: 'TECHNICIAN'
    });
  }
  
  /**
   * Submit for QC review
   */
  async submitForQC(reportId, technicianId) {
    const report = await this.getReportById(reportId);
    
    // Validate report has required data
    const validation = await templateEngineService.validateReportData(
      report.templateId,
      { results: typeof report.results === 'string' ? JSON.parse(report.results) : report.results },
      { hospitalId: report.hospitalId }
    );
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return this.transitionStatus(reportId, REPORT_STATUS.PENDING_QC, technicianId, {
      action: 'SUBMITTED_FOR_QC',
      role: 'TECHNICIAN',
      enteredAt: new Date(),
      enteredById: technicianId
    });
  }
  
  /**
   * QC Approval - move to pending review
   */
  async approveQC(reportId, qcOfficerId, notes = '') {
    return this.transitionStatus(reportId, REPORT_STATUS.PENDING_REVIEW, qcOfficerId, {
      action: 'QC_APPROVED',
      role: 'QC_OFFICER',
      qcApprovedAt: new Date(),
      qcApprovedById: qcOfficerId,
      qcNotes: notes
    });
  }
  
  /**
   * QC Rejection - send back for corrections
   */
  async rejectQC(reportId, qcOfficerId, reason) {
    return this.transitionStatus(reportId, REPORT_STATUS.PENDING_ENTRY, qcOfficerId, {
      action: 'QC_REJECTED',
      role: 'QC_OFFICER',
      rejectionReason: reason
    });
  }
  
  /**
   * Final approval by pathologist/radiologist
   */
  async approveReport(reportId, reviewerId, signatureData = {}) {
    const report = await this.getReportById(reportId);
    
    // Final validation
    const validation = await templateEngineService.validateReportData(
      report.templateId,
      { results: typeof report.results === 'string' ? JSON.parse(report.results) : report.results },
      { hospitalId: report.hospitalId }
    );
    
    if (!validation.valid) {
      throw new Error(`Cannot approve: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    // Update with sign-off
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        status: REPORT_STATUS.APPROVED,
        signedOffById: reviewerId,
        signedOffAt: new Date(),
        signatureData: signatureData.digitalSignature ? JSON.stringify(signatureData) : null,
        isLocked: true,
        lockedAt: new Date(),
        lockedById: reviewerId,
        verifiedAt: new Date(),
        verifiedById: reviewerId
      }
    });
    
    // Log audit
    await this.logAudit({
      reportId,
      templateId: report.templateId,
      action: 'REPORT_APPROVED',
      performedById: reviewerId,
      details: { 
        signedAt: new Date().toISOString(),
        hasDigitalSignature: !!signatureData.digitalSignature
      }
    });
    
    return updated;
  }
  
  /**
   * Reject report - send back for corrections
   */
  async rejectReport(reportId, reviewerId, reason) {
    return this.transitionStatus(reportId, REPORT_STATUS.PENDING_QC, reviewerId, {
      action: 'REPORT_REJECTED',
      role: 'REVIEWER',
      rejectionReason: reason
    });
  }
  
  /**
   * Mark report as delivered
   */
  async markDelivered(reportId, deliveredById, deliveryMethod = 'PRINT') {
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        status: REPORT_STATUS.DELIVERED,
        deliveredAt: new Date(),
        deliveredById,
        deliveryMethod
      }
    });
    
    await this.logAudit({
      reportId,
      action: 'REPORT_DELIVERED',
      performedById: deliveredById,
      details: { deliveryMethod }
    });
    
    return updated;
  }
  
  /**
   * Generic status transition
   */
  async transitionStatus(reportId, newStatus, performedById, auditDetails = {}) {
    const report = await this.getReportById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Validate transition
    const allowedTransitions = WORKFLOW_TRANSITIONS[report.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Invalid transition from ${report.status} to ${newStatus}`);
    }
    
    const updateData = {
      status: newStatus,
      updatedAt: new Date()
    };
    
    // Add transition-specific fields
    if (auditDetails.enteredById) updateData.enteredById = auditDetails.enteredById;
    if (auditDetails.enteredAt) updateData.enteredAt = auditDetails.enteredAt;
    if (auditDetails.qcApprovedById) updateData.qcApprovedById = auditDetails.qcApprovedById;
    if (auditDetails.qcApprovedAt) updateData.qcApprovedAt = auditDetails.qcApprovedAt;
    
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: updateData
    });
    
    // Log audit
    await this.logAudit({
      reportId,
      templateId: report.templateId,
      action: auditDetails.action || 'STATUS_CHANGED',
      performedById,
      previousValues: JSON.stringify({ status: report.status }),
      newValues: JSON.stringify({ status: newStatus }),
      details: auditDetails
    });
    
    return updated;
  }
  
  // ============================================================================
  // AMENDMENTS
  // ============================================================================
  
  /**
   * Create an amendment to an approved report
   */
  async amendReport(reportId, data, amendedById, reason) {
    const report = await this.getReportById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    if (report.status !== REPORT_STATUS.APPROVED && report.status !== REPORT_STATUS.DELIVERED) {
      throw new Error('Only approved or delivered reports can be amended');
    }
    
    // Store original values
    const originalResults = typeof report.results === 'string' ? JSON.parse(report.results) : report.results;
    const amendments = typeof report.amendments === 'string' ? JSON.parse(report.amendments) : report.amendments || [];
    
    // Add amendment record
    const amendment = {
      amendmentNumber: amendments.length + 1,
      amendedAt: new Date().toISOString(),
      amendedById,
      reason,
      previousValues: originalResults,
      newValues: data.results,
      fieldsChanged: Object.keys(data.results)
    };
    
    amendments.push(amendment);
    
    // Merge results
    const mergedResults = { ...originalResults, ...data.results };
    
    // Re-render
    const patient = await prisma.patient.findUnique({
      where: { id: report.patientId }
    });
    
    const rendered = await templateEngineService.renderReport(
      report.templateId,
      { patient, results: mergedResults },
      { hospitalId: report.hospitalId }
    );
    
    // Update report
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        status: REPORT_STATUS.AMENDED,
        results: JSON.stringify(mergedResults),
        calculatedValues: JSON.stringify(rendered.calculatedValues || {}),
        interpretations: JSON.stringify(rendered.interpretations || []),
        criticalValues: JSON.stringify(rendered.criticalValues || []),
        hasCriticalValues: rendered.criticalValues.length > 0,
        amendments: JSON.stringify(amendments),
        amendmentCount: amendments.length,
        lastAmendedAt: new Date(),
        lastAmendedById: amendedById
      }
    });
    
    // Log audit
    await this.logAudit({
      reportId,
      templateId: report.templateId,
      action: 'REPORT_AMENDED',
      performedById: amendedById,
      previousValues: JSON.stringify(originalResults),
      newValues: JSON.stringify(data.results),
      details: { reason, amendmentNumber: amendment.amendmentNumber }
    });
    
    return updated;
  }
  
  // ============================================================================
  // REPORT RETRIEVAL
  // ============================================================================
  
  /**
   * Get report by ID
   */
  async getReportById(reportId) {
    return await prisma.diagnosticReport.findUnique({
      where: { id: reportId },
      include: {
        template: true,
        patient: true,
        diagnosticOrder: true
      }
    });
  }
  
  /**
   * Get report by report number
   */
  async getReportByNumber(reportNumber, hospitalId) {
    return await prisma.diagnosticReport.findFirst({
      where: { reportNumber, hospitalId },
      include: {
        template: true,
        patient: true,
        diagnosticOrder: true
      }
    });
  }
  
  /**
   * Get reports for a patient
   */
  async getPatientReports(patientId, options = {}) {
    const { page = 1, limit = 20, category, status, startDate, endDate } = options;
    
    const where = { patientId };
    
    if (category) where.template = { category };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate);
      if (endDate) where.reportDate.lte = new Date(endDate);
    }
    
    const [reports, total] = await Promise.all([
      prisma.diagnosticReport.findMany({
        where,
        include: {
          template: {
            select: { templateCode: true, templateName: true, category: true, templateType: true }
          }
        },
        orderBy: { reportDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.diagnosticReport.count({ where })
    ]);
    
    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Get pending reports by status
   */
  async getPendingReports(hospitalId, status, options = {}) {
    const { page = 1, limit = 20, department } = options;
    
    const where = { hospitalId, status };
    if (department) where.template = { department };
    
    const [reports, total] = await Promise.all([
      prisma.diagnosticReport.findMany({
        where,
        include: {
          template: {
            select: { templateCode: true, templateName: true, category: true, department: true }
          },
          patient: {
            select: { id: true, name: true, patientId: true }
          }
        },
        orderBy: { reportDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.diagnosticReport.count({ where })
    ]);
    
    return { reports, total, page, limit };
  }
  
  /**
   * Get fully rendered report for viewing/printing
   */
  async getRenderedReport(reportId) {
    const report = await this.getReportById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    const patient = await prisma.patient.findUnique({
      where: { id: report.patientId }
    });
    
    const results = typeof report.results === 'string' ? JSON.parse(report.results) : report.results;
    const specimens = typeof report.specimens === 'string' ? JSON.parse(report.specimens) : report.specimens;
    
    const rendered = await templateEngineService.renderReport(
      report.templateId,
      { patient, results, specimens },
      { hospitalId: report.hospitalId }
    );
    
    return {
      report: {
        ...report,
        results,
        specimens,
        calculatedValues: typeof report.calculatedValues === 'string' ? JSON.parse(report.calculatedValues) : report.calculatedValues,
        interpretations: typeof report.interpretations === 'string' ? JSON.parse(report.interpretations) : report.interpretations,
        criticalValues: typeof report.criticalValues === 'string' ? JSON.parse(report.criticalValues) : report.criticalValues,
        amendments: typeof report.amendments === 'string' ? JSON.parse(report.amendments) : report.amendments
      },
      rendered,
      patient
    };
  }
  
  // ============================================================================
  // CRITICAL VALUE HANDLING
  // ============================================================================
  
  /**
   * Notify about critical values
   */
  async notifyCriticalValues(report, criticalValues, notifiedById) {
    // Log critical value notification
    await this.logAudit({
      reportId: report.id,
      templateId: report.templateId,
      action: 'CRITICAL_VALUE_DETECTED',
      performedById: notifiedById,
      details: {
        criticalValues: criticalValues.map(cv => ({
          field: cv.fieldCode,
          value: cv.value,
          reason: cv.reason
        })),
        patientId: report.patientId
      }
    });
    
    // Send actual notifications
    try {
      const { sendCriticalValueNotification } = await import('./email.service.js');
      
      const patient = await prisma.patient.findUnique({
        where: { id: report.patientId },
        select: { firstName: true, lastName: true, email: true }
      });

      if (patient && patient.email) {
        await sendCriticalValueNotification(
          patient.email,
          `${patient.firstName} ${patient.lastName}`,
          report.reportNumber,
          criticalValues.map(cv => ({
            testName: cv.testName,
            value: cv.value,
            unit: cv.unit,
            referenceRange: cv.referenceRange,
            reason: cv.reason
          })),
          'Hospital' // You can pass actual hospital name
        );
        console.log(`🚨 Critical value email sent for report: ${report.reportNumber}`);
      }

      // Log for audit
      console.log(`CRITICAL VALUE ALERT - Report: ${report.reportNumber}`, criticalValues);
    } catch (error) {
      console.error('Failed to send critical value notification:', error);
      // Still log even if notification fails
      console.log(`CRITICAL VALUE ALERT - Report: ${report.reportNumber}`, criticalValues);
    }
    
    return true;
  }
  
  /**
   * Acknowledge critical value notification
   */
  async acknowledgeCriticalValue(reportId, acknowledgedById, notes = '') {
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        criticalValueAcknowledgedAt: new Date(),
        criticalValueAcknowledgedById: acknowledgedById
      }
    });
    
    await this.logAudit({
      reportId,
      action: 'CRITICAL_VALUE_ACKNOWLEDGED',
      performedById: acknowledgedById,
      details: { notes }
    });
    
    return updated;
  }
  
  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================
  
  /**
   * Log audit trail
   */
  async logAudit(data) {
    const { reportId, templateId, action, performedById, previousValues, newValues, details } = data;
    
    return await prisma.templateAuditLog.create({
      data: {
        templateId,
        reportId,
        action,
        performedById,
        previousValues,
        newValues,
        ipAddress: details?.ipAddress,
        userAgent: details?.userAgent,
        details: details ? JSON.stringify(details) : null
      }
    });
  }
  
  /**
   * Get audit trail for a report
   */
  async getReportAuditTrail(reportId) {
    return await prisma.templateAuditLog.findMany({
      where: { reportId },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
  }
  
  // ============================================================================
  // REPORT LOCKING
  // ============================================================================
  
  /**
   * Lock a report
   */
  async lockReport(reportId, lockedById, reason = 'Manual lock') {
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockedById
      }
    });
    
    await this.logAudit({
      reportId,
      action: 'REPORT_LOCKED',
      performedById: lockedById,
      details: { reason }
    });
    
    return updated;
  }
  
  /**
   * Unlock a report (requires senior authority)
   */
  async unlockReport(reportId, unlockedById, reason) {
    if (!reason) {
      throw new Error('Reason required to unlock report');
    }
    
    const updated = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        isLocked: false,
        lockedAt: null,
        lockedById: null
      }
    });
    
    await this.logAudit({
      reportId,
      action: 'REPORT_UNLOCKED',
      performedById: unlockedById,
      details: { reason }
    });
    
    return updated;
  }
  
  // ============================================================================
  // STATISTICS & DASHBOARD
  // ============================================================================
  
  /**
   * Get report statistics for dashboard
   */
  async getReportStatistics(hospitalId, options = {}) {
    const { startDate, endDate, department } = options;
    
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    
    const where = { hospitalId };
    if (Object.keys(dateFilter).length > 0) where.reportDate = dateFilter;
    if (department) where.template = { department };
    
    // Get counts by status
    const statusCounts = await prisma.diagnosticReport.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    });
    
    // Get counts by category
    const reportsByCategory = await prisma.diagnosticReport.findMany({
      where,
      select: {
        template: { select: { category: true } }
      }
    });
    
    const categoryCounts = reportsByCategory.reduce((acc, r) => {
      const cat = r.template?.category || 'UNKNOWN';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    // Get critical value count
    const criticalCount = await prisma.diagnosticReport.count({
      where: { ...where, hasCriticalValues: true }
    });
    
    // Get TAT (Turn Around Time) metrics
    const completedReports = await prisma.diagnosticReport.findMany({
      where: {
        ...where,
        status: { in: [REPORT_STATUS.APPROVED, REPORT_STATUS.DELIVERED] },
        signedOffAt: { not: null }
      },
      select: {
        createdAt: true,
        signedOffAt: true
      }
    });
    
    let avgTAT = 0;
    if (completedReports.length > 0) {
      const tatSum = completedReports.reduce((sum, r) => {
        return sum + (new Date(r.signedOffAt) - new Date(r.createdAt));
      }, 0);
      avgTAT = Math.round(tatSum / completedReports.length / (1000 * 60)); // in minutes
    }
    
    return {
      statusCounts: statusCounts.reduce((acc, s) => {
        acc[s.status] = s._count.id;
        return acc;
      }, {}),
      categoryCounts,
      criticalValueCount: criticalCount,
      averageTATMinutes: avgTAT,
      totalReports: Object.values(statusCounts).reduce((sum, s) => sum + s._count.id, 0)
    };
  }
  
  /**
   * Get worklist for a role
   */
  async getWorklist(hospitalId, role, userId, options = {}) {
    let statusFilter;
    
    switch (role) {
      case 'TECHNICIAN':
        statusFilter = [REPORT_STATUS.PENDING_ENTRY, REPORT_STATUS.DRAFT];
        break;
      case 'QC_OFFICER':
        statusFilter = [REPORT_STATUS.PENDING_QC];
        break;
      case 'PATHOLOGIST':
      case 'RADIOLOGIST':
        statusFilter = [REPORT_STATUS.PENDING_REVIEW];
        break;
      default:
        statusFilter = Object.values(REPORT_STATUS);
    }
    
    return this.getPendingReports(hospitalId, { in: statusFilter }, options);
  }
}

// Export singleton instance
export const reportGeneratorService = new ReportGeneratorService();
export { REPORT_STATUS, WORKFLOW_TRANSITIONS };
export default reportGeneratorService;



















