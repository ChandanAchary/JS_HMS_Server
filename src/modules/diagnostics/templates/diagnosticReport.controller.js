/**
 * Diagnostic Report Controller
 * 
 * Handles HTTP requests for:
 * - Template management (CRUD)
 * - Report creation and management
 * - Workflow operations (sign-off, approve, amend)
 * - Report rendering and export
 */

import { templateEngineService } from './templateEngine.service.js';
import { reportGeneratorService, REPORT_STATUS } from './reportGenerator.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// TEMPLATE MANAGEMENT
// ============================================================================

/**
 * Get all available templates
 */
export const getAllTemplates = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { category, templateType, department } = req.query;
    
    const templates = await templateEngineService.getAllTemplates(hospitalId, {
      category,
      templateType,
      department
    });
    
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await templateEngineService.getTemplateById(templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Parse JSON fields for response
    const parsedTemplate = {
      ...template,
      fields: typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields,
      sections: typeof template.sections === 'string' ? JSON.parse(template.sections) : template.sections,
      referenceRanges: typeof template.referenceRanges === 'string' ? JSON.parse(template.referenceRanges) : template.referenceRanges,
      calculatedFields: typeof template.calculatedFields === 'string' ? JSON.parse(template.calculatedFields) : template.calculatedFields,
      interpretationRules: typeof template.interpretationRules === 'string' ? JSON.parse(template.interpretationRules) : template.interpretationRules
    };
    
    res.json({
      success: true,
      data: parsedTemplate
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};

/**
 * Get template by code
 */
export const getTemplateByCode = async (req, res) => {
  try {
    const { templateCode } = req.params;
    const { hospitalId } = req.user;
    
    const template = await templateEngineService.getTemplateByCode(templateCode, hospitalId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { hospitalId } = req.user;
    
    const templates = await templateEngineService.getTemplatesByCategory(category, hospitalId);
    
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

/**
 * Create a new template (hospital-specific)
 */
export const createTemplate = async (req, res) => {
  try {
    const { hospitalId, id: userId } = req.user;
    const templateData = req.body;
    
    // Validate required fields
    if (!templateData.templateCode || !templateData.templateName) {
      return res.status(400).json({
        success: false,
        message: 'Template code and name are required'
      });
    }
    
    // Check for duplicate code
    const existing = await prisma.diagnosticReportTemplate.findFirst({
      where: {
        templateCode: templateData.templateCode,
        hospitalId
      }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Template code already exists'
      });
    }
    
    const template = await prisma.diagnosticReportTemplate.create({
      data: {
        ...templateData,
        hospitalId,
        isSystemTemplate: false,
        createdById: userId,
        fields: JSON.stringify(templateData.fields || []),
        sections: JSON.stringify(templateData.sections || []),
        referenceRanges: JSON.stringify(templateData.referenceRanges || {}),
        calculatedFields: JSON.stringify(templateData.calculatedFields || []),
        interpretationRules: JSON.stringify(templateData.interpretationRules || []),
        specimenConfig: JSON.stringify(templateData.specimenConfig || {}),
        signOffConfig: JSON.stringify(templateData.signOffConfig || {}),
        complianceConfig: JSON.stringify(templateData.complianceConfig || {}),
        attachmentConfig: JSON.stringify(templateData.attachmentConfig || {}),
        repeatableSections: JSON.stringify(templateData.repeatableSections || []),
        criticalValueRules: JSON.stringify(templateData.criticalValueRules || {}),
        fhirMapping: JSON.stringify(templateData.fhirMapping || {})
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
};

/**
 * Update a template
 */
export const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { hospitalId, id: userId } = req.user;
    const updateData = req.body;
    
    // Check template exists and belongs to hospital
    const existing = await prisma.diagnosticReportTemplate.findUnique({
      where: { id: templateId }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    if (existing.isSystemTemplate) {
      return res.status(403).json({
        success: false,
        message: 'System templates cannot be modified'
      });
    }
    
    if (existing.hospitalId !== hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this template'
      });
    }
    
    // Increment version
    const newVersion = existing.version + 1;
    
    // Stringify JSON fields if they're objects
    const processedData = { ...updateData, version: newVersion };
    const jsonFields = ['fields', 'sections', 'referenceRanges', 'calculatedFields', 'interpretationRules', 
                        'specimenConfig', 'signOffConfig', 'complianceConfig', 'attachmentConfig',
                        'repeatableSections', 'criticalValueRules', 'fhirMapping'];
    
    for (const field of jsonFields) {
      if (processedData[field] && typeof processedData[field] === 'object') {
        processedData[field] = JSON.stringify(processedData[field]);
      }
    }
    
    const template = await prisma.diagnosticReportTemplate.update({
      where: { id: templateId },
      data: processedData
    });
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
};

/**
 * Delete a template (soft delete)
 */
export const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { hospitalId } = req.user;
    
    const existing = await prisma.diagnosticReportTemplate.findUnique({
      where: { id: templateId }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    if (existing.isSystemTemplate) {
      return res.status(403).json({
        success: false,
        message: 'System templates cannot be deleted'
      });
    }
    
    if (existing.hospitalId !== hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this template'
      });
    }
    
    // Soft delete by changing status
    await prisma.diagnosticReportTemplate.update({
      where: { id: templateId },
      data: { status: 'ARCHIVED' }
    });
    
    res.json({
      success: true,
      message: 'Template archived successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
};

// ============================================================================
// REPORT MANAGEMENT
// ============================================================================

/**
 * Create a new diagnostic report
 */
export const createReport = async (req, res) => {
  try {
    const { hospitalId, id: userId } = req.user;
    const reportData = req.body;
    
    const report = await reportGeneratorService.createReport({
      ...reportData,
      hospitalId,
      createdById: userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await reportGeneratorService.getReportById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

/**
 * Get fully rendered report (for viewing/printing)
 */
export const getRenderedReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const rendered = await reportGeneratorService.getRenderedReport(reportId);
    
    res.json({
      success: true,
      data: rendered
    });
  } catch (error) {
    console.error('Error rendering report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to render report',
      error: error.message
    });
  }
};

/**
 * Update report results
 */
export const updateReportResults = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const updateData = req.body;
    
    const report = await reportGeneratorService.updateReportResults(reportId, updateData, userId);
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update report'
    });
  }
};

/**
 * Get patient reports
 */
export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page, limit, category, status, startDate, endDate } = req.query;
    
    const result = await reportGeneratorService.getPatientReports(patientId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      category,
      status,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient reports',
      error: error.message
    });
  }
};

/**
 * Validate report data
 */
export const validateReportData = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { hospitalId } = req.user;
    const reportData = req.body;
    
    const validation = await templateEngineService.validateReportData(
      templateId,
      reportData,
      { hospitalId }
    );
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate report',
      error: error.message
    });
  }
};

// ============================================================================
// WORKFLOW OPERATIONS
// ============================================================================

/**
 * Submit report for entry
 */
export const submitForEntry = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    
    const report = await reportGeneratorService.submitForEntry(reportId, userId);
    
    res.json({
      success: true,
      message: 'Report submitted for entry',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Submit report for QC
 */
export const submitForQC = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    
    const report = await reportGeneratorService.submitForQC(reportId, userId);
    
    res.json({
      success: true,
      message: 'Report submitted for QC review',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * QC approval
 */
export const approveQC = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { notes } = req.body;
    
    const report = await reportGeneratorService.approveQC(reportId, userId, notes);
    
    res.json({
      success: true,
      message: 'QC approved',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * QC rejection
 */
export const rejectQC = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const report = await reportGeneratorService.rejectQC(reportId, userId, reason);
    
    res.json({
      success: true,
      message: 'QC rejected',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Final approval by pathologist/radiologist
 */
export const approveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { signatureData } = req.body;
    
    const report = await reportGeneratorService.approveReport(reportId, userId, signatureData);
    
    res.json({
      success: true,
      message: 'Report approved and signed off',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reject report (send back for corrections)
 */
export const rejectReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const report = await reportGeneratorService.rejectReport(reportId, userId, reason);
    
    res.json({
      success: true,
      message: 'Report rejected',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mark report as delivered
 */
export const markDelivered = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { deliveryMethod } = req.body;
    
    const report = await reportGeneratorService.markDelivered(reportId, userId, deliveryMethod);
    
    res.json({
      success: true,
      message: 'Report marked as delivered',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Amend an approved report
 */
export const amendReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { results, reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Amendment reason is required'
      });
    }
    
    const report = await reportGeneratorService.amendReport(reportId, { results }, userId, reason);
    
    res.json({
      success: true,
      message: 'Report amended successfully',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================================
// CRITICAL VALUES
// ============================================================================

/**
 * Check critical values in report data
 */
export const checkCriticalValues = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { hospitalId } = req.user;
    const reportData = req.body;
    
    const result = await templateEngineService.checkCriticalValues(
      templateId,
      reportData,
      { hospitalId }
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check critical values',
      error: error.message
    });
  }
};

/**
 * Acknowledge critical value
 */
export const acknowledgeCriticalValue = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { notes } = req.body;
    
    const report = await reportGeneratorService.acknowledgeCriticalValue(reportId, userId, notes);
    
    res.json({
      success: true,
      message: 'Critical value acknowledged',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================================
// WORKLIST & DASHBOARD
// ============================================================================

/**
 * Get worklist for current user's role
 */
export const getWorklist = async (req, res) => {
  try {
    const { hospitalId, id: userId, role } = req.user;
    const { page, limit, department } = req.query;
    
    const result = await reportGeneratorService.getWorklist(hospitalId, role, userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      department
    });
    
    res.json({
      success: true,
      data: result.reports,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worklist',
      error: error.message
    });
  }
};

/**
 * Get pending reports by status
 */
export const getPendingReports = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { status, page, limit, department } = req.query;
    
    const result = await reportGeneratorService.getPendingReports(hospitalId, status, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      department
    });
    
    res.json({
      success: true,
      data: result.reports,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reports',
      error: error.message
    });
  }
};

/**
 * Get report statistics
 */
export const getReportStatistics = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { startDate, endDate, department } = req.query;
    
    const stats = await reportGeneratorService.getReportStatistics(hospitalId, {
      startDate,
      endDate,
      department
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
};

// ============================================================================
// AUDIT TRAIL
// ============================================================================

/**
 * Get audit trail for a report
 */
export const getReportAuditTrail = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const auditTrail = await reportGeneratorService.getReportAuditTrail(reportId);
    
    res.json({
      success: true,
      data: auditTrail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trail',
      error: error.message
    });
  }
};

// ============================================================================
// REPORT LOCKING
// ============================================================================

/**
 * Lock a report
 */
export const lockReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { reason } = req.body;
    
    const report = await reportGeneratorService.lockReport(reportId, userId, reason);
    
    res.json({
      success: true,
      message: 'Report locked',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Unlock a report
 */
export const unlockReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId } = req.user;
    const { reason } = req.body;
    
    const report = await reportGeneratorService.unlockReport(reportId, userId, reason);
    
    res.json({
      success: true,
      message: 'Report unlocked',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  // Templates
  getAllTemplates,
  getTemplateById,
  getTemplateByCode,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  
  // Reports
  createReport,
  getReportById,
  getRenderedReport,
  updateReportResults,
  getPatientReports,
  validateReportData,
  
  // Workflow
  submitForEntry,
  submitForQC,
  approveQC,
  rejectQC,
  approveReport,
  rejectReport,
  markDelivered,
  amendReport,
  
  // Critical Values
  checkCriticalValues,
  acknowledgeCriticalValue,
  
  // Worklist & Dashboard
  getWorklist,
  getPendingReports,
  getReportStatistics,
  
  // Audit & Locking
  getReportAuditTrail,
  lockReport,
  unlockReport
};
