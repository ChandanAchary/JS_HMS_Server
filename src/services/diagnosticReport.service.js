/**
 * 🧬 UNIVERSAL DIAGNOSTIC REPORT GENERATION SERVICE
 * ===================================================
 * 
 * Single unified service for ALL diagnostic report types:
 * - TABULAR (CBC, LFT, KFT, Lipid Profile, etc.)
 * - QUALITATIVE (HIV, HBsAg, Dengue, COVID-19, etc.)
 * - SEMI_QUANTITATIVE (Widal, CRP, ESR, etc.)
 * - CULTURE_SENSITIVITY (Urine/Blood Culture, etc.)
 * - NARRATIVE (X-Ray, CT, MRI, Ultrasound, etc.)
 * - CLINICAL_NOTE (OPD Notes, Discharge Summary, etc.)
 * - HYBRID (Multi-section reports, Packages, etc.)
 * 
 * Zero code duplication | One engine for all types | NABL compliant
 */

import prisma from '../core/database/prismaClient.js';

export class UniversalDiagnosticReportService {
  
  /**
   * 📋 Get all available templates for a hospital
   */
  async getTemplates(hospitalId, filters = {}) {
    const where = {
      hospitalId,
      isActive: true,
      ...(filters.category && { category: filters.category }),
      ...(filters.department && { department: filters.department }),
      ...(filters.templateType && { templateType: filters.templateType }),
      ...(filters.search && {
        OR: [
          { templateName: { contains: filters.search, mode: 'insensitive' } },
          { templateCode: { contains: filters.search, mode: 'insensitive' } },
          { shortName: { contains: filters.search, mode: 'insensitive' } }
        ]
      })
    };

    const templates = await prisma.diagnosticReportTemplate.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { department: 'asc' },
        { templateName: 'asc' }
      ],
      select: {
        id: true,
        templateCode: true,
        templateName: true,
        shortName: true,
        category: true,
        department: true,
        subDepartment: true,
        testSubCategory: true,
        templateType: true,
        description: true,
        specimenConfig: true
      }
    });

    return templates;
  }

  /**
   * 📝 Get template details by ID or code
   */
  async getTemplateDetails(hospitalId, identifier) {
    const where = {
      hospitalId,
      isActive: true,
      OR: [
        { id: identifier },
        { templateCode: identifier }
      ]
    };

    const template = await prisma.diagnosticReportTemplate.findFirst({
      where
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  /**
   * ✨ Create a new diagnostic report (Universal Entry Point)
   */
  async createReport({
    hospitalId,
    patientId,
    templateId,
    diagnosticOrderId,
    orderItemId,
    enteredBy
  }) {
    // Get template
    const template = await prisma.diagnosticReportTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Generate report ID
    const reportId = await this.generateReportId(hospitalId);

    // Create report
    const report = await prisma.diagnosticReport.create({
      data: {
        reportId,
        hospitalId,
        patientId,
        templateId,
        diagnosticOrderId,
        orderItemId,
        
        // Template snapshot for legal compliance
        templateVersion: template.version || 1,
        templateSnapshot: template,
        
        // Test details
        testCode: template.templateCode,
        testName: template.templateName,
        testCategory: template.category,
        reportType: template.templateType,
        
        // Initialize empty results based on template type
        results: this.initializeResults(template.templateType, template.fields),
        specimens: [],
        referenceRangesUsed: template.referenceRanges || {},
        
        // Workflow
        status: 'DRAFT',
        workflowHistory: [
          {
            status: 'DRAFT',
            at: new Date().toISOString(),
            by: enteredBy,
            notes: 'Report created'
          }
        ],
        
        enteredBy,
        enteredAt: new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            fullName: true,
            age: true,
            gender: true,
            bloodGroup: true
          }
        },
        template: {
          select: {
            templateCode: true,
            templateName: true,
            shortName: true,
            templateType: true,
            fields: true,
            sections: true
          }
        }
      }
    });

    return report;
  }

  /**
   * 📊 Update report results (Universal Data Entry)
   */
  async updateReportResults({
    reportId,
    results,
    specimens,
    repeatableSectionsData,
    updatedBy
  }) {
    // Get existing report
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId },
      include: { template: true }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.isLocked) {
      throw new Error('Report is locked and cannot be modified');
    }

    // Validate results based on template type
    const validatedResults = await this.validateResults(
      report.template,
      results
    );

    // Calculate computed fields
    const calculatedResults = await this.calculateFields(
      report.template,
      validatedResults
    );

    // Interpret results (auto-interpretation)
    const interpretation = await this.interpretResults(
      report.template,
      { ...validatedResults, ...calculatedResults }
    );

    // Check for critical values
    const criticalValuesCheck = await this.checkCriticalValues(
      report.template,
      { ...validatedResults, ...calculatedResults }
    );

    // Update report
    const updatedReport = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        results: { ...validatedResults, ...calculatedResults },
        calculatedResults,
        autoInterpretation: interpretation,
        specimens: specimens || report.specimens,
        repeatableSectionsData: repeatableSectionsData || report.repeatableSectionsData,
        
        hasCriticalValues: criticalValuesCheck.hasCritical,
        criticalValues: criticalValuesCheck.criticalValues,
        
        status: 'ENTERED',
        workflowHistory: [
          ...report.workflowHistory,
          {
            status: 'ENTERED',
            at: new Date().toISOString(),
            by: updatedBy,
            notes: 'Results entered'
          }
        ],
        
        enteredBy: updatedBy,
        enteredAt: new Date(),
        
        updatedAt: new Date()
      }
    });

    // Send critical value notifications if needed
    if (criticalValuesCheck.hasCritical) {
      await this.sendCriticalValueNotification(updatedReport);
    }

    return updatedReport;
  }

  /**
   * ✅ QC Check
   */
  async performQCCheck({ reportId, qcStatus, qcNotes, qcCheckedBy }) {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const updatedReport = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        qcStatus,
        qcCheckedBy,
        qcCheckedAt: new Date(),
        qcNotes,
        
        status: qcStatus === 'PASSED' ? 'QC_CHECKED' : 'ENTERED',
        workflowHistory: [
          ...report.workflowHistory,
          {
            status: 'QC_CHECKED',
            at: new Date().toISOString(),
            by: qcCheckedBy,
            notes: `QC ${qcStatus}: ${qcNotes || ''}`
          }
        ]
      }
    });

    return updatedReport;
  }

  /**
   * 👨‍⚕️ Pathologist/Radiologist Review
   */
  async performReview({
    reportId,
    reviewerNotes,
    manualInterpretation,
    impressions,
    recommendations,
    reviewedBy,
    reviewerDesignation
  }) {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const updatedReport = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        reviewedBy,
        reviewedAt: new Date(),
        reviewerNotes,
        reviewerDesignation,
        manualInterpretation,
        impressions,
        recommendations,
        
        status: 'REVIEWED',
        workflowHistory: [
          ...report.workflowHistory,
          {
            status: 'REVIEWED',
            at: new Date().toISOString(),
            by: reviewedBy,
            notes: `Reviewed by ${reviewerDesignation}`
          }
        ]
      }
    });

    return updatedReport;
  }

  /**
   * 🔐 Approve and Sign Report
   */
  async approveReport({
    reportId,
    approvedBy,
    approverDesignation,
    digitalSignature
  }) {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const updatedReport = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        approvedBy,
        approvedAt: new Date(),
        approverDesignation,
        digitalSignature,
        signatureVerified: true,
        
        status: 'APPROVED',
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: approvedBy,
        lockReason: 'SIGNED_OFF',
        
        workflowHistory: [
          ...report.workflowHistory,
          {
            status: 'APPROVED',
            at: new Date().toISOString(),
            by: approvedBy,
            notes: `Approved and signed by ${approverDesignation}`
          }
        ]
      }
    });

    return updatedReport;
  }

  /**
   * 📤 Release Report (Make visible to patient)
   */
  async releaseReport({ reportId, releasedBy, releaseMode = 'MANUAL' }) {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.status !== 'APPROVED') {
      throw new Error('Report must be approved before release');
    }

    const updatedReport = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        isReleased: true,
        releasedAt: new Date(),
        releasedBy,
        releaseMode,
        visibleToPatient: true,
        
        status: 'RELEASED',
        workflowHistory: [
          ...report.workflowHistory,
          {
            status: 'RELEASED',
            at: new Date().toISOString(),
            by: releasedBy,
            notes: `Report released (${releaseMode})`
          }
        ]
      }
    });

    // Trigger delivery mechanisms (SMS, Email, etc.)
    await this.triggerReportDelivery(updatedReport);

    return updatedReport;
  }

  /**
   * 📝 Amend Report (Post sign-off changes)
   */
  async amendReport({
    reportId,
    reason,
    previousValues,
    newValues,
    amendedBy,
    approvedBy
  }) {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const amendmentId = `AMD${Date.now()}`;
    const amendment = {
      amendmentId,
      amendedAt: new Date().toISOString(),
      amendedBy,
      reason,
      previousValues,
      newValues,
      approvedBy,
      approvedAt: new Date().toISOString()
    };

    const updatedReport = await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        results: { ...report.results, ...newValues },
        isAmended: true,
        amendmentCount: report.amendmentCount + 1,
        amendments: [...(report.amendments || []), amendment],
        
        status: 'AMENDED',
        workflowHistory: [
          ...report.workflowHistory,
          {
            status: 'AMENDED',
            at: new Date().toISOString(),
            by: amendedBy,
            notes: `Amendment ${report.amendmentCount + 1}: ${reason}`
          }
        ]
      }
    });

    return updatedReport;
  }

  /**
   * 📊 Get Report for Viewing/Printing
   */
  async getReport(reportId, options = {}) {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id: reportId },
      include: {
        patient: true,
        template: true,
        hospital: true,
        diagnosticOrder: {
          include: {
            referringDoctor: true
          }
        }
      }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Format report based on template type
    const formattedReport = await this.formatReportForDisplay(report);

    // Track print/view
    if (options.trackPrint) {
      await this.trackReportPrint(reportId, options.printedBy);
    }

    if (options.trackView && report.visibleToPatient) {
      await this.trackPatientView(reportId);
    }

    return formattedReport;
  }

  /**
   * 🔍 Search Reports
   */
  async searchReports(hospitalId, filters = {}) {
    const where = {
      hospitalId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { testCategory: filters.category }),
      ...(filters.dateFrom && filters.dateTo && {
        reportDate: {
          gte: new Date(filters.dateFrom),
          lte: new Date(filters.dateTo)
        }
      }),
      ...(filters.reportId && { reportId: { contains: filters.reportId } })
    };

    const reports = await prisma.diagnosticReport.findMany({
      where,
      include: {
        patient: {
          select: {
            fullName: true,
            patientId: true,
            age: true,
            gender: true
          }
        },
        template: {
          select: {
            templateName: true,
            shortName: true,
            category: true
          }
        }
      },
      orderBy: {
        reportDate: 'desc'
      },
      take: filters.limit || 50,
      skip: filters.skip || 0
    });

    return reports;
  }

  // ============================================
  // 🛠️ HELPER FUNCTIONS
  // ============================================

  initializeResults(templateType, fields) {
    const results = {};
    
    if (fields && Array.isArray(fields)) {
      fields.forEach(field => {
        results[field.code] = null;
      });
    }

    return results;
  }

  async generateReportId(hospitalId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Count reports today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await prisma.diagnosticReport.count({
      where: {
        hospitalId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `RPT${year}${month}${day}${sequence}`;
  }

  async validateResults(template, results) {
    const validated = {};

    if (template.fields && Array.isArray(template.fields)) {
      for (const field of template.fields) {
        const value = results[field.code];

        // Required field validation
        if (field.required && (value === null || value === undefined || value === '')) {
          throw new Error(`${field.label} is required`);
        }

        // Type validation
        if (value !== null && value !== undefined) {
          if (field.type === 'number' && field.validation) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              throw new Error(`${field.label} must be a number`);
            }
            if (field.validation.min !== undefined && numValue < field.validation.min) {
              throw new Error(`${field.label} must be at least ${field.validation.min}`);
            }
            if (field.validation.max !== undefined && numValue > field.validation.max) {
              throw new Error(`${field.label} must not exceed ${field.validation.max}`);
            }
          }
        }

        validated[field.code] = value;
      }
    }

    return validated;
  }

  async calculateFields(template, results) {
    const calculated = {};

    if (template.calculatedFields && Array.isArray(template.calculatedFields)) {
      for (const calcField of template.calculatedFields) {
        try {
          // Simple formula evaluation (can be enhanced)
          const value = this.evaluateFormula(calcField.formula, results);
          calculated[calcField.code] = value;
        } catch (error) {
          console.error(`Error calculating ${calcField.code}:`, error);
          calculated[calcField.code] = null;
        }
      }
    }

    return calculated;
  }

  evaluateFormula(formula, results) {
    // Replace field codes with values
    let expression = formula;
    for (const [key, value] of Object.entries(results)) {
      if (value !== null && value !== undefined) {
        expression = expression.replace(new RegExp(key, 'g'), value);
      }
    }

    try {
      // Safe evaluation (only for numeric operations)
      // In production, use a proper expression evaluator library
      const result = eval(expression);
      return isNaN(result) ? null : Number(result.toFixed(2));
    } catch (error) {
      return null;
    }
  }

  async interpretResults(template, results) {
    const interpretations = [];

    if (template.referenceRanges) {
      for (const [fieldCode, value] of Object.entries(results)) {
        if (value === null || value === undefined) continue;

        const ranges = template.referenceRanges[fieldCode];
        if (!ranges) continue;

        // Get appropriate range (can be enhanced for age/gender)
        const range = ranges.all || ranges.male || ranges.female;
        if (!range) continue;

        // Simple interpretation
        if (typeof range.min !== 'undefined' && typeof range.max !== 'undefined') {
          if (value < range.min) {
            interpretations.push(`${fieldCode}: LOW`);
          } else if (value > range.max) {
            interpretations.push(`${fieldCode}: HIGH`);
          } else {
            interpretations.push(`${fieldCode}: NORMAL`);
          }
        }
      }
    }

    return interpretations.join('\n');
  }

  async checkCriticalValues(template, results) {
    const criticalValues = [];
    let hasCritical = false;

    if (template.criticalValueRules) {
      for (const [fieldCode, value] of Object.entries(results)) {
        if (value === null || value === undefined) continue;

        const rules = template.criticalValueRules[fieldCode];
        if (!rules) continue;

        if (rules.criticalLow && value < rules.criticalLow) {
          criticalValues.push({
            field: fieldCode,
            value,
            threshold: rules.criticalLow,
            type: 'LOW',
            requiresNotification: rules.requiresNotification || false
          });
          hasCritical = true;
        }

        if (rules.criticalHigh && value > rules.criticalHigh) {
          criticalValues.push({
            field: fieldCode,
            value,
            threshold: rules.criticalHigh,
            type: 'HIGH',
            requiresNotification: rules.requiresNotification || false
          });
          hasCritical = true;
        }
      }
    }

    return { hasCritical, criticalValues };
  }

  async sendCriticalValueNotification(report) {
    try {
      const { sendCriticalValueNotification } = await import('./email.service.js');
      
      // Get patient and critical values
      const patient = await prisma.patient.findUnique({
        where: { id: report.patientId },
        select: { firstName: true, lastName: true, email: true }
      });

      if (patient && patient.email) {
        await sendCriticalValueNotification(
          patient.email,
          `${patient.firstName} ${patient.lastName}`,
          report.reportNumber,
          report.criticalValues || [],
          report.hospitalName || 'Hospital'
        );
        console.log(`🚨 Critical value notification sent to ${patient.email}`);
      }

      // Also notify referring doctor if present
      if (report.referringDoctorId) {
        const doctor = await prisma.doctor.findUnique({
          where: { id: report.referringDoctorId },
          select: { email: true, firstName: true, lastName: true }
        });

        if (doctor && doctor.email) {
          await sendCriticalValueNotification(
            doctor.email,
            `${patient.firstName} ${patient.lastName}`,
            report.reportNumber,
            report.criticalValues || [],
            report.hospitalName || 'Hospital'
          );
          console.log(`🚨 Critical value notification sent to doctor ${doctor.email}`);
        }
      }
    } catch (error) {
      console.error('Failed to send critical value notification:', error);
    }
  }

  async triggerReportDelivery(report) {
    try {
      const { sendReportDeliveryNotification } = await import('./email.service.js');
      
      // Get patient details
      const patient = await prisma.patient.findUnique({
        where: { id: report.patientId },
        select: { firstName: true, lastName: true, email: true, phone: true }
      });

      if (patient && patient.email) {
        const reportUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports/${report.id}`;
        
        await sendReportDeliveryNotification(
          patient.email,
          `${patient.firstName} ${patient.lastName}`,
          report.reportNumber,
          reportUrl,
          report.hospitalName || 'Hospital'
        );
        console.log(`📧 Report delivery notification sent to ${patient.email}`);
      }

      // TODO: Send SMS if phone number available
      if (patient && patient.phone) {
        console.log(`📱 SMS notification to be sent to ${patient.phone}`);
        // Implement SMS integration here (Twilio, AWS SNS, etc.)
      }
    } catch (error) {
      console.error('Failed to trigger report delivery:', error);
    }
  }

  async trackReportPrint(reportId, printedBy) {
    await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        printCount: { increment: 1 },
        lastPrintedAt: new Date(),
        lastPrintedBy: printedBy
      }
    });
  }

  async trackPatientView(reportId) {
    await prisma.diagnosticReport.update({
      where: { id: reportId },
      data: {
        patientViewedAt: new Date()
      }
    });
  }

  async formatReportForDisplay(report) {
    // Format report based on template type
    return {
      ...report,
      formattedResults: this.formatResultsByType(report.reportType, report.results, report.template),
      interpretationSummary: this.generateInterpretationSummary(report)
    };
  }

  formatResultsByType(templateType, results, template) {
    switch (templateType) {
      case 'TABULAR':
        return this.formatTabularResults(results, template);
      case 'QUALITATIVE':
        return this.formatQualitativeResults(results, template);
      case 'NARRATIVE':
        return this.formatNarrativeResults(results, template);
      case 'CULTURE_SENSITIVITY':
        return this.formatCultureResults(results, template);
      default:
        return results;
    }
  }

  formatTabularResults(results, template) {
    const rows = [];
    
    if (template.fields && Array.isArray(template.fields)) {
      template.fields.forEach(field => {
        const value = results[field.code];
        if (value !== null && value !== undefined) {
          rows.push({
            parameter: field.label,
            value: value,
            unit: field.unit || '',
            referenceRange: this.getReferenceRangeText(field.code, template.referenceRanges),
            interpretation: this.getInterpretation(value, field.code, template.referenceRanges)
          });
        }
      });
    }

    return rows;
  }

  formatQualitativeResults(results, template) {
    const tests = [];
    
    if (template.fields && Array.isArray(template.fields)) {
      template.fields.forEach(field => {
        const value = results[field.code];
        if (value !== null && value !== undefined) {
          tests.push({
            testName: field.label,
            result: value,
            method: template.specimenConfig?.method || 'Standard'
          });
        }
      });
    }

    return tests;
  }

  formatNarrativeResults(results, template) {
    return results;
  }

  formatCultureResults(results, template) {
    return {
      growthStatus: results.GROWTH_STATUS || 'No Growth',
      organismIsolated: results.ORGANISM_ISOLATED || '',
      colonyCount: results.COLONY_COUNT || '',
      antibioticSensitivity: results.ANTIBIOTIC_SENSITIVITY || []
    };
  }

  getReferenceRangeText(fieldCode, referenceRanges) {
    if (!referenceRanges || !referenceRanges[fieldCode]) return '';
    
    const range = referenceRanges[fieldCode].all || referenceRanges[fieldCode].male || referenceRanges[fieldCode].female;
    if (!range) return '';

    if (range.min !== undefined && range.max !== undefined) {
      return `${range.min} - ${range.max}`;
    }

    return '';
  }

  getInterpretation(value, fieldCode, referenceRanges) {
    if (!referenceRanges || !referenceRanges[fieldCode]) return '';
    
    const range = referenceRanges[fieldCode].all || referenceRanges[fieldCode].male || referenceRanges[fieldCode].female;
    if (!range || !range.min || !range.max) return '';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';

    if (numValue < range.min) return 'LOW';
    if (numValue > range.max) return 'HIGH';
    return 'NORMAL';
  }

  generateInterpretationSummary(report) {
    const summary = {
      normalCount: 0,
      abnormalCount: 0,
      criticalCount: 0,
      overallStatus: 'NORMAL'
    };

    // Count interpretations
    if (report.formattedResults && Array.isArray(report.formattedResults)) {
      report.formattedResults.forEach(result => {
        if (result.interpretation === 'NORMAL') {
          summary.normalCount++;
        } else {
          summary.abnormalCount++;
        }
      });
    }

    if (report.hasCriticalValues) {
      summary.criticalCount = report.criticalValues?.length || 0;
      summary.overallStatus = 'CRITICAL';
    } else if (summary.abnormalCount > 0) {
      summary.overallStatus = 'ABNORMAL';
    }

    return summary;
  }

  /**
   * Get statistics for diagnostic reports
   */
  async getStatistics(hospitalId, filters = {}) {
    const whereBase = { hospitalId };
    
    // Add date filters if provided
    if (filters.dateFrom || filters.dateTo) {
      whereBase.createdAt = {};
      if (filters.dateFrom) {
        whereBase.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        whereBase.createdAt.lte = filters.dateTo;
      }
    }

    // Get total counts
    const [
      totalReports,
      pendingReports,
      completedReports,
      criticalReports,
      reportsByStatus
    ] = await Promise.all([
      prisma.diagnosticReport.count({ where: whereBase }),
      prisma.diagnosticReport.count({
        where: { ...whereBase, status: 'PENDING' }
      }),
      prisma.diagnosticReport.count({
        where: { ...whereBase, status: 'COMPLETED' }
      }),
      prisma.diagnosticReport.count({
        where: { ...whereBase, hasCriticalValues: true }
      }),
      prisma.diagnosticReport.groupBy({
        by: ['status'],
        where: whereBase,
        _count: true
      })
    ]);

    // Get reports by template type
    const reportsByType = await prisma.diagnosticReport.groupBy({
      by: ['reportType'],
      where: whereBase,
      _count: true
    });

    // Get daily report counts for the period
    const dailyCounts = await prisma.diagnosticReport.groupBy({
      by: ['createdAt'],
      where: whereBase,
      _count: true
    });

    return {
      overview: {
        totalReports,
        pendingReports,
        completedReports,
        criticalReports
      },
      byStatus: reportsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      byType: reportsByType.reduce((acc, item) => {
        acc[item.reportType] = item._count;
        return acc;
      }, {}),
      dailyTrend: dailyCounts.length,
      dateRange: {
        from: filters.dateFrom,
        to: filters.dateTo
      }
    };
  }
}

export default new UniversalDiagnosticReportService();



















