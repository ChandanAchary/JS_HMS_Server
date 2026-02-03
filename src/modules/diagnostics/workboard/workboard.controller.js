/**
 * Diagnostic Workboard Controller
 * HTTP handlers for result entry and workflow operations
 */

import { WorkboardService } from './workboard.service.js';
import { ApiResponse } from '../../../shared/dto/ApiResponse.js';

/**
 * Get Workboard Service instance
 */
const getService = (req) => new WorkboardService(req.prisma);

// ==================== WORKLIST ====================

/**
 * Get worklist by category
 * @route GET /api/diagnostics/workboard/worklist/:category
 */
export async function getWorklistByCategory(req, res, next) {
  try {
    const service = getService(req);
    const { hospitalId, role } = req.user;
    const { category } = req.params;

    const result = await service.getWorklistByCategory(
      hospitalId,
      category !== 'all' ? category : null,
      role,
      req.query
    );

    res.json(ApiResponse.success(result, 'Worklist retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get result entry form for a specific result
 * @route GET /api/diagnostics/workboard/entry-form/:resultId
 */
export async function getResultEntryForm(req, res, next) {
  try {
    const service = getService(req);
    const { hospitalId, role } = req.user;
    const { resultId } = req.params;

    const result = await service.getResultEntryForm(resultId, hospitalId, role);

    res.json(ApiResponse.success(result, 'Entry form retrieved'));
  } catch (error) {
    next(error);
  }
}

// ==================== RESULT ENTRY ====================

/**
 * Save result entry (draft)
 * @route PUT /api/diagnostics/workboard/results/:resultId
 */
export async function saveResultEntry(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;

    const result = await service.saveResultEntry(resultId, req.body, userId, hospitalId);

    res.json(ApiResponse.success(result, 'Result saved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Submit result for QC/Review
 * @route POST /api/diagnostics/workboard/results/:resultId/submit
 */
export async function submitResultForReview(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;
    const { notes } = req.body;

    const result = await service.submitResultForReview(resultId, userId, hospitalId, notes);

    res.json(ApiResponse.success(result, 'Result submitted for review'));
  } catch (error) {
    next(error);
  }
}

// ==================== QC WORKFLOW ====================

/**
 * Approve QC
 * @route POST /api/diagnostics/workboard/results/:resultId/qc-approve
 */
export async function approveQC(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;
    const { notes } = req.body;

    const result = await service.approveQC(resultId, userId, hospitalId, notes);

    res.json(ApiResponse.success(result, 'QC approved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Reject QC (return to technician)
 * @route POST /api/diagnostics/workboard/results/:resultId/qc-reject
 */
export async function rejectQC(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;
    const { reason } = req.body;

    const result = await service.rejectQC(resultId, userId, hospitalId, reason);

    res.json(ApiResponse.success(result, 'Result returned for correction'));
  } catch (error) {
    next(error);
  }
}

// ==================== REVIEW & RELEASE ====================

/**
 * Review and approve result
 * @route POST /api/diagnostics/workboard/results/:resultId/review-approve
 */
export async function reviewAndApprove(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;

    const result = await service.reviewAndApprove(resultId, userId, hospitalId, req.body);

    res.json(ApiResponse.success(result, 'Result reviewed and approved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Release result to patient
 * @route POST /api/diagnostics/workboard/results/:resultId/release
 */
export async function releaseResult(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;

    const result = await service.releaseResult(resultId, userId, hospitalId);

    res.json(ApiResponse.success(result, 'Result released to patient'));
  } catch (error) {
    next(error);
  }
}

/**
 * Amend released result
 * @route POST /api/diagnostics/workboard/results/:resultId/amend
 */
export async function amendResult(req, res, next) {
  try {
    const service = getService(req);
    const { id: userId, hospitalId } = req.user;
    const { resultId } = req.params;

    const result = await service.amendResult(resultId, userId, hospitalId, req.body);

    res.json(ApiResponse.success(result, 'Result amended'));
  } catch (error) {
    next(error);
  }
}

export default {
  getWorklistByCategory,
  getResultEntryForm,
  saveResultEntry,
  submitResultForReview,
  approveQC,
  rejectQC,
  reviewAndApprove,
  releaseResult,
  amendResult
};
