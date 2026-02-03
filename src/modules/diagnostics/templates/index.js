/**
 * Diagnostic Report Templates Module
 * Config-driven templates for various diagnostic test reports
 */

export { default as templateRoutes } from './template.routes.js';
export { DiagnosticTemplateService } from './template.service.js';
export { DiagnosticTemplateRepository } from './template.repository.js';

// Default templates
export { 
  DEFAULT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getDefaultTemplateByCode,
  getDefaultTemplatesByCategory,
  getDefaultTemplateForCategory,
  
  // Individual templates for direct use
  BLOOD_TEST_DEFAULT_TEMPLATE,
  CBC_TEMPLATE,
  LFT_TEMPLATE,
  LIPID_TEMPLATE,
  TFT_TEMPLATE,
  XRAY_TEMPLATE,
  USG_TEMPLATE,
  CT_TEMPLATE,
  MRI_TEMPLATE,
  ECG_TEMPLATE,
  ECHO_TEMPLATE,
  PATHOLOGY_TEMPLATE,
  URINE_ROUTINE_TEMPLATE
} from './defaultTemplates.js';
