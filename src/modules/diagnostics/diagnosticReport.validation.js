/**
 * 🧬 DIAGNOSTIC REPORT VALIDATION SCHEMAS
 * =========================================
 * 
 * Request validation for all diagnostic report operations
 */

import Joi from 'joi';

export const diagnosticReportValidation = {
  
  // Create report
  create: Joi.object({
    patientId: Joi.string().required(),
    templateId: Joi.string().required(),
    diagnosticOrderId: Joi.string().optional(),
    orderItemId: Joi.string().optional()
  }),

  // Update results
  updateResults: Joi.object({
    results: Joi.object().required(),
    specimens: Joi.array().items(
      Joi.object({
        specimenId: Joi.string().required(),
        type: Joi.string().required(),
        subType: Joi.string().optional(),
        collectedAt: Joi.date().required(),
        collectedBy: Joi.string().optional(),
        receivedAt: Joi.date().optional(),
        quality: Joi.string().valid('GOOD', 'ACCEPTABLE', 'HEMOLYZED', 'LIPEMIC', 'CLOTTED', 'CONTAMINATED'),
        volume: Joi.string().optional(),
        container: Joi.string().optional(),
        containerColor: Joi.string().optional(),
        rejected: Joi.boolean().default(false),
        rejectionReason: Joi.string().optional()
      })
    ).optional(),
    repeatableSectionsData: Joi.array().optional()
  }),

  // QC Check
  qcCheck: Joi.object({
    qcStatus: Joi.string().valid('PASSED', 'FAILED', 'WAIVED').required(),
    qcNotes: Joi.string().optional()
  }),

  // Review
  review: Joi.object({
    reviewerNotes: Joi.string().optional(),
    manualInterpretation: Joi.string().optional(),
    impressions: Joi.string().optional(),
    recommendations: Joi.string().optional()
  }),

  // Approve
  approve: Joi.object({
    digitalSignature: Joi.string().optional()
  }),

  // Release
  release: Joi.object({
    releaseMode: Joi.string().valid('MANUAL', 'AUTO').default('MANUAL')
  }),

  // Amend
  amend: Joi.object({
    reason: Joi.string().required(),
    previousValues: Joi.object().required(),
    newValues: Joi.object().required(),
    approvedBy: Joi.string().optional()
  }),

  // Search
  search: Joi.object({
    patientId: Joi.string().optional(),
    status: Joi.string().valid(
      'DRAFT', 'ENTERED', 'QC_PENDING', 'QC_CHECKED', 
      'REVIEW_PENDING', 'REVIEWED', 'APPROVED', 'RELEASED', 'AMENDED'
    ).optional(),
    category: Joi.string().optional(),
    reportId: Joi.string().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    limit: Joi.number().integer().min(1).max(100).default(50),
    skip: Joi.number().integer().min(0).default(0)
  })
};

export default diagnosticReportValidation;
