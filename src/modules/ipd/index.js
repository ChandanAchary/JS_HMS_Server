/**
 * IPD Module Index
 * Initialize and export all IPD services and routes
 */

import { IPDAdmissionService } from './ipd-admission.service.js';
import { IPDAdmissionQueueService } from './ipd-admission-queue.service.js';
import { IPDBedService } from './ipd-bed.service.js';
import { IPDOrdersService } from './ipd-orders.service.js';
import { IPDClinicalNotesService } from './ipd-clinical-notes.service.js';
import { IPDAlertsService } from './ipd-alerts.service.js';
import { IPDConsentService } from './ipd-consent.service.js';
import { IPDMovementService } from './ipd-movement.service.js';
import { IPDVitalsService } from './ipd-vitals.service.js';
import { IPDController } from './ipd.controller.js';
import { IPDAdmissionQueueController } from './ipd-admission-queue.controller.js';
import { createIPDRoutes } from './ipd.routes.js';
import { createAdmissionQueueRouter } from './ipd-admission-queue.routes.js';

/**
 * Initialize IPD Module
 */
export function initializeIPDModule(prisma, rolePermissions, authenticate, authorize) {
  // Create service instances
  const admissionService = new IPDAdmissionService(prisma);
  const admissionQueueService = new IPDAdmissionQueueService(prisma);
  const bedService = new IPDBedService(prisma);
  const alertsService = new IPDAlertsService(prisma);
  const ordersService = new IPDOrdersService(prisma);
  const clinicalNotesService = new IPDClinicalNotesService(prisma);
  const consentService = new IPDConsentService(prisma);
  const movementService = new IPDMovementService(prisma);
  const vitalsService = new IPDVitalsService(prisma, alertsService);

  // Create controller
  const ipdController = new IPDController(
    admissionService,
    bedService,
    ordersService,
    clinicalNotesService,
    alertsService,
    consentService,
    movementService,
    vitalsService
  );

  // Create admission queue controller
  const admissionQueueController = new IPDAdmissionQueueController(prisma);

  // Create routes
  const ipdRoutes = createIPDRoutes(ipdController, rolePermissions);
  const admissionQueueRoutes = createAdmissionQueueRouter(prisma, authenticate, authorize);

  return {
    router: ipdRoutes,
    admissionQueueRouter: admissionQueueRoutes,
    services: {
      admissionService,
      admissionQueueService,
      bedService,
      ordersService,
      clinicalNotesService,
      alertsService,
      consentService,
      movementService,
      vitalsService,
    },
    controllers: {
      ipdController,
      admissionQueueController,
    },
  };
}
// Export services for standalone use
export {
  IPDAdmissionService,
  IPDAdmissionQueueService,
  IPDBedService,
  IPDOrdersService,
  IPDClinicalNotesService,
  IPDAlertsService,
  IPDConsentService,
  IPDMovementService,
  IPDVitalsService,
  IPDController,
  IPDAdmissionQueueController,
};

export { createAdmissionQueueRouter };
