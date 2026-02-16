/**
 * IPD Admission Queue Routes
 * Routes for managing patient flow from OPD to IPD
 */

import express from 'express';
import { IPDAdmissionQueueController } from '../controllers/ipd-admission-queue.controller.js';

export function createAdmissionQueueRouter(prisma, authenticate, authorize) {
  const router = express.Router();
  const controller = new IPDAdmissionQueueController(prisma);

  /**
   * POST /api/ipd/queue/request
   * Doctor creates IPD admission request after OPD consultation
   * Requires: IPD_CREATE_ADMISSION_REQUEST permission
   */
  router.post(
    '/queue/request',
    authenticate,
    authorize('IPD_CREATE_ADMISSION_REQUEST'),
    (req, res) => controller.createAdmissionRequest(req, res)
  );

  /**
   * GET /api/ipd/queue/pending
   * Get all pending admission requests in IPD queue
   * Requires: IPD_VIEW_ADMISSION_QUEUE permission
   */
  router.get(
    '/queue/pending',
    authenticate,
    authorize('IPD_VIEW_ADMISSION_QUEUE'),
    (req, res) => controller.getPendingAdmissionRequests(req, res)
  );

  /**
   * GET /api/ipd/queue/patient/:patientId
   * Get all admission requests for a specific patient
   * Requires: IPD_VIEW_ADMISSION permission
   */
  router.get(
    '/queue/patient/:patientId',
    authenticate,
    authorize('IPD_VIEW_ADMISSION'),
    (req, res) => controller.getPatientAdmissionRequests(req, res)
  );

  /**
   * GET /api/ipd/queue/request/:requestId
   * Get admission request details
   * Requires: IPD_VIEW_ADMISSION permission
   */
  router.get(
    '/queue/request/:requestId',
    authenticate,
    authorize('IPD_VIEW_ADMISSION'),
    (req, res) => controller.getAdmissionRequest(req, res)
  );

  /**
   * POST /api/ipd/queue/request/:requestId/approve
   * Approve admission request and allocate bed
   * Requires: IPD_APPROVE_ADMISSION_REQUEST permission
   */
  router.post(
    '/queue/request/:requestId/approve',
    authenticate,
    authorize('IPD_APPROVE_ADMISSION_REQUEST'),
    (req, res) => controller.approveAdmissionRequest(req, res)
  );

  /**
   * POST /api/ipd/queue/request/:requestId/reject
   * Reject admission request
   * Requires: IPD_REJECT_ADMISSION_REQUEST permission
   */
  router.post(
    '/queue/request/:requestId/reject',
    authenticate,
    authorize('IPD_REJECT_ADMISSION_REQUEST'),
    (req, res) => controller.rejectAdmissionRequest(req, res)
  );

  /**
   * GET /api/ipd/queue/stats
   * Get admission queue statistics
   * Requires: IPD_VIEW_DASHBOARD permission
   */
  router.get(
    '/queue/stats',
    authenticate,
    authorize('IPD_VIEW_DASHBOARD'),
    (req, res) => controller.getQueueStats(req, res)
  );

  return router;
}

// Export a default instance for direct use
export const ipdAdmissionQueueRoutes = express.Router();
export default createAdmissionQueueRouter;



















