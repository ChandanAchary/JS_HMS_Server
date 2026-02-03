/**
 * Diagnostics Module
 * Entry point for diagnostic system functionality
 */

export { default as diagnosticsRoutes } from './diagnostics.routes.js';
export { DiagnosticsService } from './diagnostics.service.js';
export { DiagnosticsRepository } from './diagnostics.repository.js';
export { DiagnosticsBillingService } from './diagnostics.billing.service.js';
export { DIAGNOSTIC_TEST_SEED, seedDiagnosticTests } from './diagnostics.seed.js';
export * from './diagnostics.dto.js';
export * from './diagnostics.validators.js';

// Report Templates
export { 
  templateRoutes,
  DiagnosticTemplateService, 
  DiagnosticTemplateRepository,
  DEFAULT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getDefaultTemplateByCode,
  getDefaultTemplatesByCategory,
  getDefaultTemplateForCategory
} from './templates/index.js';

// Workboard (Result Entry & Workflow)
export { 
  workboardRoutes, 
  WorkboardService 
} from './workboard/index.js';
