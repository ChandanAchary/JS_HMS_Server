/**
 * Diagnostic Report Template Routes
 * API endpoints for template management
 */

import { Router } from 'express';
import * as templateController from './template.controller.js';

const router = Router();

// ==================== PUBLIC / READ ROUTES ====================

/**
 * @route   GET /api/diagnostics/templates
 * @desc    Get all templates for hospital (includes system templates)
 * @query   category, type, search
 * @access  Protected
 */
router.get('/', templateController.getTemplates);

/**
 * @route   GET /api/diagnostics/templates/grouped
 * @desc    Get templates grouped by category
 * @access  Protected
 */
router.get('/grouped', templateController.getTemplatesGrouped);

/**
 * @route   GET /api/diagnostics/templates/for-test
 * @desc    Get template for a specific test
 * @query   testCode, testCategory
 * @access  Protected
 */
router.get('/for-test', templateController.getTemplateForTest);

/**
 * @route   GET /api/diagnostics/templates/entry-form
 * @desc    Get entry form configuration for result entry
 * @query   testCode, testCategory
 * @access  Protected
 */
router.get('/entry-form', templateController.getEntryFormConfig);

/**
 * @route   GET /api/diagnostics/templates/print-config
 * @desc    Get print/PDF configuration
 * @query   testCode, testCategory
 * @access  Protected
 */
router.get('/print-config', templateController.getPrintConfig);

/**
 * @route   GET /api/diagnostics/templates/entry-fields/:templateCode
 * @desc    Get entry fields for a template code
 * @access  Protected
 */
router.get('/entry-fields/:templateCode', templateController.getEntryFields);

/**
 * @route   GET /api/diagnostics/templates/reference-ranges/:templateCode
 * @desc    Get reference ranges from template
 * @access  Protected
 */
router.get('/reference-ranges/:templateCode', templateController.getReferenceRanges);

/**
 * @route   GET /api/diagnostics/templates/:templateId
 * @desc    Get single template by ID
 * @access  Protected
 */
router.get('/:templateId', templateController.getTemplateById);

// ==================== CREATE ROUTES ====================

/**
 * @route   POST /api/diagnostics/templates
 * @desc    Create new custom template
 * @body    { templateCode, templateName, testCategory, templateType, sections, entryFields, ... }
 * @access  Protected (Admin/Lab Supervisor)
 */
router.post('/', templateController.createTemplate);

/**
 * @route   POST /api/diagnostics/templates/:templateId/clone
 * @desc    Clone system template for hospital customization
 * @access  Protected (Admin/Lab Supervisor)
 */
router.post('/:templateId/clone', templateController.cloneTemplate);

// ==================== UPDATE ROUTES ====================

/**
 * @route   PUT /api/diagnostics/templates/:templateId
 * @desc    Update template (full update)
 * @body    { templateName, description, sections, entryFields, styling, ... }
 * @access  Protected (Admin/Lab Supervisor)
 */
router.put('/:templateId', templateController.updateTemplate);

/**
 * @route   PATCH /api/diagnostics/templates/:templateId/sections
 * @desc    Update template sections only
 * @body    { sections: [...] }
 * @access  Protected (Admin/Lab Supervisor)
 */
router.patch('/:templateId/sections', templateController.updateSections);

/**
 * @route   PATCH /api/diagnostics/templates/:templateId/entry-fields
 * @desc    Update entry fields (form configuration)
 * @body    { entryFields: [...] }
 * @access  Protected (Admin/Lab Supervisor)
 */
router.patch('/:templateId/entry-fields', templateController.updateEntryFields);

/**
 * @route   PATCH /api/diagnostics/templates/:templateId/styling
 * @desc    Update template styling
 * @body    { styling: {...} }
 * @access  Protected (Admin/Lab Supervisor)
 */
router.patch('/:templateId/styling', templateController.updateStyling);

/**
 * @route   POST /api/diagnostics/templates/:templateId/set-default
 * @desc    Set template as default for its category
 * @access  Protected (Admin/Lab Supervisor)
 */
router.post('/:templateId/set-default', templateController.setAsDefault);

/**
 * @route   POST /api/diagnostics/templates/:templateId/version
 * @desc    Create new version of template
 * @body    { changes... }
 * @access  Protected (Admin/Lab Supervisor)
 */
router.post('/:templateId/version', templateController.createVersion);

// ==================== DELETE ROUTES ====================

/**
 * @route   POST /api/diagnostics/templates/:templateId/deactivate
 * @desc    Deactivate template (soft delete)
 * @access  Protected (Admin/Lab Supervisor)
 */
router.post('/:templateId/deactivate', templateController.deactivateTemplate);

/**
 * @route   DELETE /api/diagnostics/templates/:templateId
 * @desc    Delete template permanently
 * @access  Protected (Admin only)
 */
router.delete('/:templateId', templateController.deleteTemplate);

// ==================== ADMIN / INITIALIZATION ROUTES ====================

/**
 * @route   POST /api/diagnostics/templates/seed
 * @desc    Seed system templates (run once)
 * @access  Protected (Super Admin)
 */
router.post('/seed', templateController.seedSystemTemplates);

/**
 * @route   POST /api/diagnostics/templates/initialize
 * @desc    Initialize templates for hospital (clone all system templates)
 * @access  Protected (Admin)
 */
router.post('/initialize', templateController.initializeHospitalTemplates);

export default router;
