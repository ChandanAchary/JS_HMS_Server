/**
 * Diagnostic Report Template Controller
 * HTTP handlers for template management
 */

import { DiagnosticTemplateService } from '../services/template.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';

// Service instance cache per request
const getService = (req) => {
  if (!req.templateService) {
    req.templateService = new DiagnosticTemplateService(req.prisma);
  }
  return req.templateService;
};

// ==================== GET TEMPLATES ====================

/**
 * Get all templates for hospital
 */
export async function getTemplates(req, res, next) {
  try {
    const service = getService(req);
    const { category, type, search } = req.query;
    
    const templates = await service.getTemplates(req.hospitalId, {
      testCategory: category,
      templateType: type,
      search
    });
    
    res.json(ApiResponse.success(templates));
  } catch (error) {
    next(error);
  }
}

/**
 * Get templates grouped by category
 */
export async function getTemplatesGrouped(req, res, next) {
  try {
    const service = getService(req);
    const grouped = await service.getTemplatesGroupedByCategory(req.hospitalId);
    
    res.json(ApiResponse.success(grouped));
  } catch (error) {
    next(error);
  }
}

/**
 * Get single template by ID
 */
export async function getTemplateById(req, res, next) {
  try {
    const service = getService(req);
    const template = await service.getTemplateById(req.params.templateId, req.hospitalId);
    
    res.json(ApiResponse.success(template));
  } catch (error) {
    next(error);
  }
}

/**
 * Get template for a specific test
 */
export async function getTemplateForTest(req, res, next) {
  try {
    const service = getService(req);
    const { testCode, testCategory } = req.query;
    
    if (!testCode && !testCategory) {
      return res.status(400).json(ApiResponse.error('testCode or testCategory is required'));
    }
    
    const template = await service.getTemplateForTest(
      testCode,
      testCategory,
      req.hospitalId
    );
    
    res.json(ApiResponse.success(template));
  } catch (error) {
    next(error);
  }
}

/**
 * Get entry form configuration for result entry
 */
export async function getEntryFormConfig(req, res, next) {
  try {
    const service = getService(req);
    const { testCode, testCategory } = req.query;
    
    if (!testCode || !testCategory) {
      return res.status(400).json(ApiResponse.error('testCode and testCategory are required'));
    }
    
    const config = await service.getEntryFormConfig(testCode, testCategory, req.hospitalId);
    
    res.json(ApiResponse.success(config));
  } catch (error) {
    next(error);
  }
}

/**
 * Get print/PDF configuration
 */
export async function getPrintConfig(req, res, next) {
  try {
    const service = getService(req);
    const { testCode, testCategory } = req.query;
    
    const config = await service.getPrintConfig(testCode, testCategory, req.hospitalId);
    
    res.json(ApiResponse.success(config));
  } catch (error) {
    next(error);
  }
}

/**
 * Get entry fields for a template
 */
export async function getEntryFields(req, res, next) {
  try {
    const service = getService(req);
    const { templateCode } = req.params;
    
    const fields = await service.getEntryFieldsForTemplate(templateCode, req.hospitalId);
    
    res.json(ApiResponse.success({ templateCode, fields }));
  } catch (error) {
    next(error);
  }
}

/**
 * Get reference ranges from template
 */
export async function getReferenceRanges(req, res, next) {
  try {
    const service = getService(req);
    const { templateCode } = req.params;
    
    const ranges = await service.getReferenceRangesFromTemplate(templateCode, req.hospitalId);
    
    res.json(ApiResponse.success({ templateCode, referenceRanges: ranges }));
  } catch (error) {
    next(error);
  }
}

// ==================== CREATE TEMPLATES ====================

/**
 * Create new custom template
 */
export async function createTemplate(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.createTemplate(req.body, req.hospitalId, req.user.id);
    
    res.status(201).json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Clone system template for customization
 */
export async function cloneTemplate(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.cloneSystemTemplate(
      req.params.templateId,
      req.hospitalId,
      req.user.id
    );
    
    res.status(201).json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== UPDATE TEMPLATES ====================

/**
 * Update template
 */
export async function updateTemplate(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.updateTemplate(
      req.params.templateId,
      req.body,
      req.hospitalId,
      req.user.id
    );
    
    res.json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Update template sections
 */
export async function updateSections(req, res, next) {
  try {
    const service = getService(req);
    const { sections } = req.body;
    
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json(ApiResponse.error('sections array is required'));
    }
    
    const result = await service.updateTemplateSections(
      req.params.templateId,
      sections,
      req.hospitalId,
      req.user.id
    );
    
    res.json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Update entry fields
 */
export async function updateEntryFields(req, res, next) {
  try {
    const service = getService(req);
    const { entryFields } = req.body;
    
    if (!entryFields || !Array.isArray(entryFields)) {
      return res.status(400).json(ApiResponse.error('entryFields array is required'));
    }
    
    const result = await service.updateEntryFields(
      req.params.templateId,
      entryFields,
      req.hospitalId,
      req.user.id
    );
    
    res.json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Update template styling
 */
export async function updateStyling(req, res, next) {
  try {
    const service = getService(req);
    const { styling } = req.body;
    
    if (!styling || typeof styling !== 'object') {
      return res.status(400).json(ApiResponse.error('styling object is required'));
    }
    
    const result = await service.updateStyling(
      req.params.templateId,
      styling,
      req.hospitalId,
      req.user.id
    );
    
    res.json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Set template as default for category
 */
export async function setAsDefault(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.setAsDefault(
      req.params.templateId,
      req.hospitalId,
      req.user.id
    );
    
    res.json(ApiResponse.success(null, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Create new version of template
 */
export async function createVersion(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.createNewVersion(
      req.params.templateId,
      req.body,
      req.hospitalId,
      req.user.id
    );
    
    res.status(201).json(ApiResponse.success(result.template, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== DELETE TEMPLATES ====================

/**
 * Deactivate template (soft delete)
 */
export async function deactivateTemplate(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.deactivateTemplate(req.params.templateId, req.hospitalId);
    
    res.json(ApiResponse.success(null, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Delete template permanently
 */
export async function deleteTemplate(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.deleteTemplate(req.params.templateId, req.hospitalId);
    
    res.json(ApiResponse.success(null, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN / SEED ====================

/**
 * Seed system templates (admin only)
 */
export async function seedSystemTemplates(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.seedSystemTemplates();
    
    res.json(ApiResponse.success(result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Initialize templates for hospital
 */
export async function initializeHospitalTemplates(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.initializeHospitalTemplates(req.hospitalId, req.user.id);
    
    res.json(ApiResponse.success(result, result.message));
  } catch (error) {
    next(error);
  }
}



















