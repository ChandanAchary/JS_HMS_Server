/**
 * OPD Module Routes
 * Central router for all OPD-related endpoints
 */

import express from 'express';
import dashboardRouter from './opd-dashboard.routes.js';
import vitalsRouter from './vitals.routes.js';

const router = express.Router();

// Mount OPD dashboard routes (login, queue management, patient operations)
router.use('/', dashboardRouter);

// Mount vitals routes
router.use('/vitals', vitalsRouter);

// Placeholder for future OPD endpoints (clinical notes, prescriptions, investigations, etc.)
// router.use('/clinical-notes', clinicalNotesRouter);
// router.use('/prescriptions', prescriptionsRouter);
// router.use('/investigations', investigationsRouter);
// router.use('/procedures', proceduresRouter);
// router.use('/follow-ups', followUpRouter);

export default router;
