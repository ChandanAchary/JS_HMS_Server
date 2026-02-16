/**
 * 🧬 UNIVERSAL DIAGNOSTIC REPORT CONTROLLER
 * ===========================================
 * 
 * RESTful endpoints for all diagnostic report operations
 */

import diagnosticReportService from '../services/diagnosticReport.service.js';

export class DiagnosticReportController {
  
  /**
   * GET /api/diagnostic-templates
   * Get all available report templates
   */
  async getTemplates(req, res) {
    try {
      const { hospitalId } = req.user;
      const filters = {
        category: req.query.category,
        department: req.query.department,
        templateType: req.query.templateType,
        search: req.query.search
      };

      const templates = await diagnosticReportService.getTemplates(hospitalId, filters);

      res.json({
        success: true,
        count: templates.length,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
        error: error.message
      });
    }
  }

  /**
   * GET /api/diagnostic-templates/:identifier
   * Get template details
   */
  async getTemplateDetails(req, res) {
    try {
      const { hospitalId } = req.user;
      const { identifier } = req.params;

      const template = await diagnosticReportService.getTemplateDetails(hospitalId, identifier);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Template not found',
        error: error.message
      });
    }
  }

  /**
   * POST /api/diagnostic-reports
   * Create a new diagnostic report
   */
  async createReport(req, res) {
    try {
      const { hospitalId, userId } = req.user;
      const {
        patientId,
        templateId,
        diagnosticOrderId,
        orderItemId
      } = req.body;

      const report = await diagnosticReportService.createReport({
        hospitalId,
        patientId,
        templateId,
        diagnosticOrderId,
        orderItemId,
        enteredBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create report',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/diagnostic-reports/:reportId/results
   * Update report results
   */
  async updateResults(req, res) {
    try {
      const { userId } = req.user;
      const { reportId } = req.params;
      const {
        results,
        specimens,
        repeatableSectionsData
      } = req.body;

      const report = await diagnosticReportService.updateReportResults({
        reportId,
        results,
        specimens,
        repeatableSectionsData,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Results updated successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update results',
        error: error.message
      });
    }
  }

  /**
   * POST /api/diagnostic-reports/:reportId/qc-check
   * Perform QC check
   */
  async performQCCheck(req, res) {
    try {
      const { userId } = req.user;
      const { reportId } = req.params;
      const { qcStatus, qcNotes } = req.body;

      const report = await diagnosticReportService.performQCCheck({
        reportId,
        qcStatus,
        qcNotes,
        qcCheckedBy: userId
      });

      res.json({
        success: true,
        message: 'QC check completed',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'QC check failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/diagnostic-reports/:reportId/review
   * Pathologist/Radiologist review
   */
  async performReview(req, res) {
    try {
      const { userId, userRole } = req.user;
      const { reportId } = req.params;
      const {
        reviewerNotes,
        manualInterpretation,
        impressions,
        recommendations
      } = req.body;

      const report = await diagnosticReportService.performReview({
        reportId,
        reviewerNotes,
        manualInterpretation,
        impressions,
        recommendations,
        reviewedBy: userId,
        reviewerDesignation: userRole
      });

      res.json({
        success: true,
        message: 'Review completed successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Review failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/diagnostic-reports/:reportId/approve
   * Approve and sign report
   */
  async approveReport(req, res) {
    try {
      const { userId, userRole } = req.user;
      const { reportId } = req.params;
      const { digitalSignature } = req.body;

      const report = await diagnosticReportService.approveReport({
        reportId,
        approvedBy: userId,
        approverDesignation: userRole,
        digitalSignature
      });

      res.json({
        success: true,
        message: 'Report approved and signed',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Approval failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/diagnostic-reports/:reportId/release
   * Release report to patient
   */
  async releaseReport(req, res) {
    try {
      const { userId } = req.user;
      const { reportId } = req.params;
      const { releaseMode } = req.body;

      const report = await diagnosticReportService.releaseReport({
        reportId,
        releasedBy: userId,
        releaseMode: releaseMode || 'MANUAL'
      });

      res.json({
        success: true,
        message: 'Report released successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Release failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/diagnostic-reports/:reportId/amend
   * Amend report (post sign-off)
   */
  async amendReport(req, res) {
    try {
      const { userId } = req.user;
      const { reportId } = req.params;
      const {
        reason,
        previousValues,
        newValues,
        approvedBy
      } = req.body;

      const report = await diagnosticReportService.amendReport({
        reportId,
        reason,
        previousValues,
        newValues,
        amendedBy: userId,
        approvedBy: approvedBy || userId
      });

      res.json({
        success: true,
        message: 'Report amended successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Amendment failed',
        error: error.message
      });
    }
  }

  /**
   * GET /api/diagnostic-reports/:reportId
   * Get report details
   */
  async getReport(req, res) {
    try {
      const { reportId } = req.params;
      const { trackPrint, trackView } = req.query;

      const report = await diagnosticReportService.getReport(reportId, {
        trackPrint: trackPrint === 'true',
        trackView: trackView === 'true',
        printedBy: req.user?.userId
      });

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
        error: error.message
      });
    }
  }

  /**
   * GET /api/diagnostic-reports
   * Search/List reports
   */
  async searchReports(req, res) {
    try {
      const { hospitalId } = req.user;
      const filters = {
        patientId: req.query.patientId,
        status: req.query.status,
        category: req.query.category,
        reportId: req.query.reportId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      };

      const reports = await diagnosticReportService.searchReports(hospitalId, filters);

      res.json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message
      });
    }
  }

  /**
   * GET /api/diagnostic-reports/:reportId/pdf
   * Generate PDF report
   */
  async generatePDF(req, res) {
    try {
      const { reportId } = req.params;
      const { hospitalId } = req.user;

      // Get the report data
      const report = await diagnosticReportService.getReportById(reportId, hospitalId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Generate PDF
      const { generateDiagnosticReportPdf } = await import('../utils/pdfGenerator.utils.js');
      const pdfBuffer = await generateDiagnosticReportPdf({
        reportNumber: report.reportNumber,
        reportDate: report.reportDate,
        patientName: report.patientName,
        patientId: report.patientId,
        patientAge: report.patientAge,
        patientGender: report.patientGender,
        referringDoctor: report.referringDoctor,
        results: report.results,
        interpretation: report.interpretation,
        technician: report.technician,
        pathologist: report.pathologist,
        hospitalName: report.hospitalName,
        hospitalAddress: report.hospitalAddress,
        hospitalPhone: report.hospitalPhone,
        hospitalEmail: report.hospitalEmail
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Report_${report.reportNumber}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'PDF generation failed',
        error: error.message
      });
    }
  }

  /**
   * GET /api/diagnostic-reports/patient/:patientId
   * Get all reports for a patient
   */
  async getPatientReports(req, res) {
    try {
      const { hospitalId } = req.user;
      const { patientId } = req.params;

      const reports = await diagnosticReportService.searchReports(hospitalId, {
        patientId,
        limit: 100
      });

      res.json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patient reports',
        error: error.message
      });
    }
  }

  /**
   * GET /api/diagnostic-reports/stats
   * Get report statistics
   */
  async getStatistics(req, res) {
    try {
      const { hospitalId } = req.user;
      const { dateFrom, dateTo } = req.query;

      const stats = await diagnosticReportService.getStatistics(hospitalId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }
}

export default new DiagnosticReportController();



















