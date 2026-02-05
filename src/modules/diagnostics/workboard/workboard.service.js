/**
 * Diagnostic Workboard Service
 * Business logic for result entry and workflow management
 */

import { DiagnosticTemplateService } from '../templates/template.service.js';
import { RESULT_ENTRY_STATUS, getAllowedCategoriesForRole } from '../../../constants/roles.js';

export class WorkboardService {
  constructor(prisma) {
    this.prisma = prisma;
    this.templateService = new DiagnosticTemplateService(prisma);
  }

  // ==================== WORKLIST & QUEUE ====================

  /**
   * Get worklist items for a specific test category
   */
  async getWorklistByCategory(hospitalId, category, role, filters = {}) {
    const { status, urgency, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const allowedCategories = getAllowedCategoriesForRole(role);

    // Verify role has access to this category
    if (category && !allowedCategories.includes(category)) {
      const error = new Error(`Access denied. Your role does not have permission for category: ${category}`);
      error.statusCode = 403;
      throw error;
    }

    const where = {
      order: {
        hospitalId,
        orderStatus: { not: 'CANCELLED' }
      },
      test: { category: category || { in: allowedCategories } }
    };

    // Status filter
    if (status) {
      where.status = status;
    } else {
      // Default: show items ready for work
      where.status = {
        in: [
          RESULT_ENTRY_STATUS.SAMPLE_COLLECTED,
          RESULT_ENTRY_STATUS.IN_PROGRESS,
          RESULT_ENTRY_STATUS.PENDING_QC
        ]
      };
    }

    // Urgency filter
    if (urgency) {
      where.order.urgency = urgency;
    }

    // Date filters
    if (dateFrom || dateTo) {
      where.sampleCollectedAt = {};
      if (dateFrom) where.sampleCollectedAt.gte = new Date(dateFrom);
      if (dateTo) where.sampleCollectedAt.lte = new Date(dateTo);
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.diagnosticResult.findMany({
        where,
        include: {
          test: true,
          order: {
            include: {
              patient: {
                select: {
                  id: true,
                  patientId: true,
                  name: true,
                  age: true,
                  gender: true,
                  dateOfBirth: true
                }
              },
              referringDoctor: {
                select: {
                  id: true,
                  name: true,
                  specialization: true
                }
              }
            }
          }
        },
        orderBy: [
          { order: { urgency: 'desc' } },
          { sampleCollectedAt: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.diagnosticResult.count({ where })
    ]);

    return {
      items: items.map(this.formatWorklistItem),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      category,
      filters: { status, urgency, dateFrom, dateTo }
    };
  }

  /**
   * Get detailed result entry form for a specific test result
   */
  async getResultEntryForm(resultId, hospitalId, role) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId }
      },
      include: {
        test: true,
        order: {
          include: {
            patient: true,
            referringDoctor: {
              select: { id: true, name: true, specialization: true }
            }
          }
        }
      }
    });

    if (!result) {
      const error = new Error('Result not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify role access
    const allowedCategories = getAllowedCategoriesForRole(role);
    if (!allowedCategories.includes(result.test.category)) {
      const error = new Error('Access denied for this test category');
      error.statusCode = 403;
      throw error;
    }

    // Get template for this test
    const templateData = await this.templateService.getEntryFormConfig({
      testCode: result.test.testCode,
      testCategory: result.test.category,
      hospitalId
    });

    return {
      result: this.formatResultForEntry(result),
      patient: this.formatPatientInfo(result.order.patient),
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        urgency: result.order.urgency,
        clinicalIndication: result.order.clinicalIndication,
        specialInstructions: result.order.specialInstructions,
        referringDoctor: result.order.referringDoctor
      },
      test: {
        id: result.test.id,
        testCode: result.test.testCode,
        testName: result.test.testName,
        shortName: result.test.shortName,
        category: result.test.category,
        subCategory: result.test.subCategory,
        department: result.test.department,
        referenceRanges: result.test.referenceRanges,
        unit: result.test.unit
      },
      template: templateData,
      workflow: this.getWorkflowOptions(result.status, role)
    };
  }

  // ==================== RESULT ENTRY ====================

  /**
   * Save result entry (draft or partial)
   */
  async saveResultEntry(resultId, data, userId, hospitalId) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId }
      },
      include: { test: true, order: true }
    });

    if (!result) {
      const error = new Error('Result not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate status allows entry
    const entryAllowedStatuses = [
      RESULT_ENTRY_STATUS.SAMPLE_COLLECTED,
      RESULT_ENTRY_STATUS.IN_PROGRESS
    ];

    if (!entryAllowedStatuses.includes(result.status)) {
      const error = new Error(`Cannot enter results. Current status: ${result.status}`);
      error.statusCode = 400;
      throw error;
    }

    // Update result with entered data
    const updateData = {
      status: RESULT_ENTRY_STATUS.IN_PROGRESS,
      enteredBy: userId,
      enteredAt: new Date(),
      updatedAt: new Date()
    };

    // For tabular results (blood tests, etc.)
    if (data.resultValue !== undefined) {
      updateData.resultValue = data.resultValue;
    }
    if (data.resultNumeric !== undefined) {
      updateData.resultNumeric = parseFloat(data.resultNumeric);
    }
    if (data.resultUnit !== undefined) {
      updateData.resultUnit = data.resultUnit;
    }

    // For narrative results (imaging, pathology)
    if (data.reportText !== undefined) {
      updateData.reportText = data.reportText;
    }
    if (data.impressions !== undefined) {
      updateData.impressions = data.impressions;
    }
    if (data.recommendations !== undefined) {
      updateData.recommendations = data.recommendations;
    }

    // Component results (for profiles with multiple parameters)
    if (data.componentResults !== undefined) {
      updateData.componentResults = data.componentResults;
    }

    // Additional notes
    if (data.technicianNotes !== undefined) {
      updateData.technicianNotes = data.technicianNotes;
    }

    // Calculate interpretation if numeric value provided
    if (data.resultNumeric !== undefined && result.test.referenceRanges) {
      updateData.interpretation = this.calculateInterpretation(
        data.resultNumeric,
        result.test.referenceRanges,
        result.order
      );
      updateData.isCritical = ['CRITICAL_LOW', 'CRITICAL_HIGH'].includes(updateData.interpretation);
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: updateData,
      include: { test: true, order: true }
    });

    return {
      result: this.formatResultForEntry(updatedResult),
      message: 'Result saved successfully',
      status: updatedResult.status
    };
  }

  /**
   * Submit result for QC/Review
   */
  async submitResultForReview(resultId, userId, hospitalId, notes = null) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId }
      },
      include: { test: true }
    });

    if (!result) {
      const error = new Error('Result not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate result has required data before submission
    const validationErrors = this.validateResultForSubmission(result);
    if (validationErrors.length > 0) {
      const error = new Error(`Cannot submit: ${validationErrors.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: {
        status: RESULT_ENTRY_STATUS.PENDING_QC,
        submittedBy: userId,
        submittedAt: new Date(),
        technicianNotes: notes || result.technicianNotes
      },
      include: { test: true, order: { include: { patient: true } } }
    });

    return {
      result: this.formatWorklistItem(updatedResult),
      message: 'Result submitted for QC review',
      nextStep: 'Awaiting Quality Control verification'
    };
  }

  /**
   * QC Approve result
   */
  async approveQC(resultId, userId, hospitalId, notes = null) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId },
        status: RESULT_ENTRY_STATUS.PENDING_QC
      }
    });

    if (!result) {
      const error = new Error('Result not found or not pending QC');
      error.statusCode = 404;
      throw error;
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: {
        status: RESULT_ENTRY_STATUS.PENDING_REVIEW,
        qcApprovedBy: userId,
        qcApprovedAt: new Date(),
        qcNotes: notes
      },
      include: { test: true, order: { include: { patient: true } } }
    });

    return {
      result: this.formatWorklistItem(updatedResult),
      message: 'QC approved. Awaiting specialist review.',
      nextStep: 'Pending pathologist/radiologist review'
    };
  }

  /**
   * QC Reject result (return to technician)
   */
  async rejectQC(resultId, userId, hospitalId, reason) {
    if (!reason) {
      const error = new Error('Rejection reason is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId },
        status: RESULT_ENTRY_STATUS.PENDING_QC
      }
    });

    if (!result) {
      const error = new Error('Result not found or not pending QC');
      error.statusCode = 404;
      throw error;
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: {
        status: RESULT_ENTRY_STATUS.IN_PROGRESS,
        qcRejectedBy: userId,
        qcRejectedAt: new Date(),
        qcRejectionReason: reason
      },
      include: { test: true, order: { include: { patient: true } } }
    });

    return {
      result: this.formatWorklistItem(updatedResult),
      message: 'Result returned to technician for correction',
      reason
    };
  }

  /**
   * Specialist review and approve
   */
  async reviewAndApprove(resultId, userId, hospitalId, reviewData) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId },
        status: { in: [RESULT_ENTRY_STATUS.PENDING_REVIEW, RESULT_ENTRY_STATUS.QC_APPROVED] }
      },
      include: { test: true }
    });

    if (!result) {
      const error = new Error('Result not found or not pending review');
      error.statusCode = 404;
      throw error;
    }

    const updateData = {
      status: RESULT_ENTRY_STATUS.APPROVED,
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewerNotes: reviewData.notes || null
    };

    // For imaging/pathology - reviewer can update impressions
    if (reviewData.impressions) {
      updateData.impressions = reviewData.impressions;
    }
    if (reviewData.recommendations) {
      updateData.recommendations = reviewData.recommendations;
    }
    if (reviewData.interpretation) {
      updateData.interpretation = reviewData.interpretation;
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: updateData,
      include: { test: true, order: { include: { patient: true } } }
    });

    return {
      result: this.formatWorklistItem(updatedResult),
      message: 'Result reviewed and approved. Ready for release.',
      nextStep: 'Ready to release to patient'
    };
  }

  /**
   * Release result to patient
   */
  async releaseResult(resultId, userId, hospitalId) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId },
        status: RESULT_ENTRY_STATUS.APPROVED
      }
    });

    if (!result) {
      const error = new Error('Result not found or not approved');
      error.statusCode = 404;
      throw error;
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: {
        status: RESULT_ENTRY_STATUS.RELEASED,
        releasedBy: userId,
        releasedAt: new Date(),
        visibleToPatient: true
      },
      include: { test: true, order: { include: { patient: true } } }
    });

    // TODO: Send notification to patient (SMS, email, app notification)

    return {
      result: this.formatWorklistItem(updatedResult),
      message: 'Result released to patient',
      releasedAt: updatedResult.releasedAt
    };
  }

  /**
   * Amend released result
   */
  async amendResult(resultId, userId, hospitalId, amendmentData) {
    const result = await this.prisma.diagnosticResult.findFirst({
      where: {
        id: resultId,
        order: { hospitalId },
        status: RESULT_ENTRY_STATUS.RELEASED
      }
    });

    if (!result) {
      const error = new Error('Result not found or cannot be amended');
      error.statusCode = 404;
      throw error;
    }

    if (!amendmentData.reason) {
      const error = new Error('Amendment reason is required');
      error.statusCode = 400;
      throw error;
    }

    // Store original values before amendment
    const previousValues = {
      resultValue: result.resultValue,
      resultNumeric: result.resultNumeric,
      reportText: result.reportText,
      impressions: result.impressions,
      interpretation: result.interpretation,
      amendedAt: new Date(),
      amendedBy: userId
    };

    const updateData = {
      status: RESULT_ENTRY_STATUS.AMENDED,
      amendedBy: userId,
      amendedAt: new Date(),
      amendmentReason: amendmentData.reason,
      amendmentHistory: result.amendmentHistory 
        ? [...result.amendmentHistory, previousValues]
        : [previousValues]
    };

    // Update with new values
    if (amendmentData.resultValue !== undefined) {
      updateData.resultValue = amendmentData.resultValue;
    }
    if (amendmentData.resultNumeric !== undefined) {
      updateData.resultNumeric = parseFloat(amendmentData.resultNumeric);
    }
    if (amendmentData.reportText !== undefined) {
      updateData.reportText = amendmentData.reportText;
    }
    if (amendmentData.impressions !== undefined) {
      updateData.impressions = amendmentData.impressions;
    }
    if (amendmentData.interpretation !== undefined) {
      updateData.interpretation = amendmentData.interpretation;
    }

    const updatedResult = await this.prisma.diagnosticResult.update({
      where: { id: resultId },
      data: updateData,
      include: { test: true, order: { include: { patient: true } } }
    });

    return {
      result: this.formatWorklistItem(updatedResult),
      message: 'Result amended successfully',
      amendmentReason: amendmentData.reason,
      previousValues
    };
  }

  // ==================== HELPER METHODS ====================

  formatWorklistItem(item) {
    return {
      id: item.id,
      testId: item.testId,
      orderId: item.orderId,
      test: item.test ? {
        id: item.test.id,
        testCode: item.test.testCode,
        testName: item.test.testName,
        shortName: item.test.shortName,
        category: item.test.category,
        subCategory: item.test.subCategory,
        department: item.test.department
      } : null,
      patient: item.order?.patient ? {
        id: item.order.patient.id,
        patientId: item.order.patient.patientId,
        name: item.order.patient.name,
        age: item.order.patient.age,
        gender: item.order.patient.gender
      } : null,
      orderNumber: item.order?.orderNumber,
      status: item.status,
      urgency: item.order?.urgency,
      interpretation: item.interpretation,
      isCritical: item.isCritical,
      sampleCollectedAt: item.sampleCollectedAt,
      enteredAt: item.enteredAt,
      submittedAt: item.submittedAt,
      reviewedAt: item.reviewedAt,
      releasedAt: item.releasedAt,
      createdAt: item.createdAt
    };
  }

  formatResultForEntry(result) {
    return {
      id: result.id,
      status: result.status,
      resultValue: result.resultValue,
      resultNumeric: result.resultNumeric,
      resultUnit: result.resultUnit,
      referenceMin: result.referenceMin,
      referenceMax: result.referenceMax,
      referenceText: result.referenceText,
      interpretation: result.interpretation,
      isCritical: result.isCritical,
      reportText: result.reportText,
      impressions: result.impressions,
      recommendations: result.recommendations,
      componentResults: result.componentResults,
      technicianNotes: result.technicianNotes,
      reviewerNotes: result.reviewerNotes,
      attachments: result.attachments,
      imageUrls: result.imageUrls,
      enteredBy: result.enteredBy,
      enteredAt: result.enteredAt,
      submittedAt: result.submittedAt,
      reviewedBy: result.reviewedBy,
      reviewedAt: result.reviewedAt,
      sampleCollectedAt: result.sampleCollectedAt
    };
  }

  formatPatientInfo(patient) {
    if (!patient) return null;
    return {
      id: patient.id,
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      phone: patient.phone,
      bloodGroup: patient.bloodGroup
    };
  }

  calculateInterpretation(value, referenceRanges, order) {
    if (!referenceRanges || !Array.isArray(referenceRanges)) return 'NORMAL';

    // Find appropriate range based on patient gender/age
    const patientGender = order?.patient?.gender?.toLowerCase() || 'all';
    const patientAge = order?.patient?.age || 30;

    const range = referenceRanges.find(r => 
      (r.gender === 'all' || r.gender === patientGender) &&
      patientAge >= (r.ageMin || 0) &&
      patientAge <= (r.ageMax || 150)
    ) || referenceRanges[0];

    if (!range) return 'NORMAL';

    const { min, max, criticalMin, criticalMax } = range;

    if (criticalMin !== undefined && value < criticalMin) return 'CRITICAL_LOW';
    if (criticalMax !== undefined && value > criticalMax) return 'CRITICAL_HIGH';
    if (value < min) return 'LOW';
    if (value > max) return 'HIGH';
    return 'NORMAL';
  }

  validateResultForSubmission(result) {
    const errors = [];

    // For tabular results
    if (['BLOOD_TEST', 'HORMONES', 'URINE'].includes(result.test?.category)) {
      if (!result.resultValue && result.resultNumeric === null && !result.componentResults) {
        errors.push('Result value is required');
      }
    }

    // For narrative results
    if (['IMAGING', 'PATHOLOGY'].includes(result.test?.category)) {
      if (!result.reportText && !result.impressions) {
        errors.push('Report text or impressions required');
      }
    }

    return errors;
  }

  getWorkflowOptions(status, role) {
    const options = {
      canEdit: false,
      canSubmit: false,
      canApproveQC: false,
      canRejectQC: false,
      canReview: false,
      canRelease: false,
      canAmend: false,
      nextActions: []
    };

    switch (status) {
      case RESULT_ENTRY_STATUS.SAMPLE_COLLECTED:
      case RESULT_ENTRY_STATUS.IN_PROGRESS:
        options.canEdit = true;
        options.canSubmit = true;
        options.nextActions = ['Save Draft', 'Submit for QC'];
        break;

      case RESULT_ENTRY_STATUS.PENDING_QC:
        options.canApproveQC = ['LAB_TECHNICIAN', 'PATHOLOGY'].includes(role);
        options.canRejectQC = ['LAB_TECHNICIAN', 'PATHOLOGY'].includes(role);
        options.nextActions = ['Approve QC', 'Reject (Return to Technician)'];
        break;

      case RESULT_ENTRY_STATUS.PENDING_REVIEW:
      case RESULT_ENTRY_STATUS.QC_APPROVED:
        options.canReview = ['PATHOLOGY', 'RADIOLOGIST'].includes(role);
        options.nextActions = ['Review & Approve'];
        break;

      case RESULT_ENTRY_STATUS.APPROVED:
        options.canRelease = true;
        options.nextActions = ['Release to Patient'];
        break;

      case RESULT_ENTRY_STATUS.RELEASED:
        options.canAmend = ['PATHOLOGY'].includes(role);
        options.nextActions = options.canAmend ? ['Amend Report'] : [];
        break;
    }

    return options;
  }
}
