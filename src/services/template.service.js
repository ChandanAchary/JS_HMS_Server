/**
 * Diagnostic Report Template Service
 * Business logic for template management
 */

import { DiagnosticTemplateRepository } from './template.repository.js';
import { 
  DEFAULT_TEMPLATES,
  getDefaultTemplateByCode,
  getDefaultTemplatesByCategory,
  getDefaultTemplateForCategory 
} from './defaultTemplates.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../shared/AppError.js';

export class DiagnosticTemplateService {
  constructor(prisma) {
    this.repository = new DiagnosticTemplateRepository(prisma);
    this.prisma = prisma;
  }

  // ==================== TEMPLATE RETRIEVAL ====================

  /**
   * Get template for a specific test
   * Priority: Test-specific > Category default > System default
   */
  async getTemplateForTest(testCode, testCategory, hospitalId) {
    // 1. Try test-specific template
    let template = await this.repository.getTemplateByTestCode(testCode, hospitalId);
    
    // 2. Try category default
    if (!template) {
      template = await this.repository.getDefaultTemplateForCategory(testCategory, hospitalId);
    }
    
    // 3. Return with default structure if not found
    if (!template) {
      // Get from embedded defaults
      template = getDefaultTemplateByCode(`${testCategory}_DEFAULT`) || 
                 getDefaultTemplateForCategory(testCategory);
    }

    return template;
  }

  /**
   * Get all available templates for hospital
   */
  async getTemplates(hospitalId, filters = {}) {
    const templates = await this.repository.getTemplatesForHospital(hospitalId, filters);
    
    return templates.map(t => this.formatTemplate(t));
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId, hospitalId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template) {
      throw new NotFoundError('Template');
    }

    // Check access: Hospital can access own templates + system templates
    if (template.hospitalId && template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied to this template');
    }

    return this.formatTemplate(template);
  }

  /**
   * Get templates grouped by category
   */
  async getTemplatesGroupedByCategory(hospitalId) {
    const templates = await this.repository.getTemplatesForHospital(hospitalId);
    
    const grouped = {};
    templates.forEach(t => {
      const cat = t.category || t.testCategory;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(this.formatTemplate(t));
    });

    return grouped;
  }

  /**
   * Get entry form fields for a template
   */
  async getEntryFieldsForTemplate(templateCode, hospitalId) {
    const template = await this.repository.getTemplateByCode(templateCode, hospitalId);
    
    if (!template) {
      // Fall back to default
      const defaultTemplate = getDefaultTemplateByCode(templateCode);
      return defaultTemplate?.entryFields || [];
    }

    return template.entryFields || [];
  }

  /**
   * Get reference ranges from template
   */
  async getReferenceRangesFromTemplate(templateCode, hospitalId) {
    const template = await this.repository.getTemplateByCode(templateCode, hospitalId);
    
    if (!template) {
      const defaultTemplate = getDefaultTemplateByCode(templateCode);
      return defaultTemplate?.referenceRanges || {};
    }

    return template.referenceRanges || {};
  }

  // ==================== TEMPLATE CREATION ====================

  /**
   * Create a new custom template for hospital
   */
  async createTemplate(data, hospitalId, userId) {
    // Validate
    this.validateTemplateData(data);

    // Check for duplicate code
    const exists = await this.repository.templateCodeExists(data.templateCode, hospitalId);
    if (exists) {
      throw new ValidationError(`Template code '${data.templateCode}' already exists for this hospital`);
    }

    const template = await this.repository.createTemplate({
      ...data,
      hospitalId,
      isSystemTemplate: false,
      createdBy: userId
    });

    return {
      template: this.formatTemplate(template),
      message: 'Template created successfully'
    };
  }

  /**
   * Clone a system template for hospital customization
   */
  async cloneSystemTemplate(templateId, hospitalId, userId) {
    const sourceTemplate = await this.repository.getTemplateById(templateId);
    
    if (!sourceTemplate) {
      throw new NotFoundError('Source template');
    }

    if (!sourceTemplate.isSystemTemplate) {
      throw new ValidationError('Can only clone system templates');
    }

    const cloned = await this.repository.cloneTemplateForHospital(templateId, hospitalId, userId);
    
    return {
      template: this.formatTemplate(cloned),
      message: 'Template cloned successfully. You can now customize it.'
    };
  }

  // ==================== TEMPLATE UPDATE ====================

  /**
   * Update template
   */
  async updateTemplate(templateId, data, hospitalId, userId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template) {
      throw new NotFoundError('Template');
    }

    // Can't edit system templates directly
    if (template.isSystemTemplate) {
      throw new ForbiddenError('Cannot edit system templates. Clone it first to customize.');
    }

    // Can only edit own templates
    if (template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    const updated = await this.repository.updateTemplate(templateId, {
      ...data,
      updatedBy: userId
    });

    return {
      template: this.formatTemplate(updated),
      message: 'Template updated successfully'
    };
  }

  /**
   * Update specific sections of a template
   */
  async updateTemplateSections(templateId, sections, hospitalId, userId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template || template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    if (template.isSystemTemplate) {
      throw new ForbiddenError('Cannot edit system templates');
    }

    // Validate sections
    this.validateSections(sections);

    const updated = await this.repository.updateTemplateSections(templateId, sections, userId);

    return {
      template: this.formatTemplate(updated),
      message: 'Template sections updated'
    };
  }

  /**
   * Update entry fields (form configuration)
   */
  async updateEntryFields(templateId, entryFields, hospitalId, userId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template || template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    if (template.isSystemTemplate) {
      throw new ForbiddenError('Cannot edit system templates');
    }

    // Validate entry fields
    this.validateEntryFields(entryFields);

    const updated = await this.repository.updateTemplateEntryFields(templateId, entryFields, userId);

    return {
      template: this.formatTemplate(updated),
      message: 'Entry fields updated'
    };
  }

  /**
   * Update template styling
   */
  async updateStyling(templateId, styling, hospitalId, userId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template || template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    if (template.isSystemTemplate) {
      throw new ForbiddenError('Cannot edit system templates');
    }

    const updated = await this.repository.updateTemplateStyling(templateId, styling, userId);

    return {
      template: this.formatTemplate(updated),
      message: 'Template styling updated'
    };
  }

  /**
   * Set template as default for category
   */
  async setAsDefault(templateId, hospitalId, userId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template) {
      throw new NotFoundError('Template');
    }

    // Can set hospital-specific or system templates as default
    if (template.hospitalId && template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    await this.repository.setAsDefault(templateId, template.category || template.testCategory, template.hospitalId);

    return {
      message: `Template set as default for ${template.category || template.testCategory}`
    };
  }

  /**
   * Create new version (versioning support)
   */
  async createNewVersion(templateId, data, hospitalId, userId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template || template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    const newVersion = await this.repository.createNewVersion(templateId, {
      ...data,
      updatedBy: userId
    });

    return {
      template: this.formatTemplate(newVersion),
      previousVersion: templateId,
      message: `Template version ${newVersion.version} created`
    };
  }

  // ==================== TEMPLATE DELETION ====================

  /**
   * Deactivate template (soft delete)
   */
  async deactivateTemplate(templateId, hospitalId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template) {
      throw new NotFoundError('Template');
    }

    if (template.isSystemTemplate) {
      throw new ForbiddenError('Cannot deactivate system templates');
    }

    if (template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    await this.repository.deactivateTemplate(templateId);

    return { message: 'Template deactivated' };
  }

  /**
   * Delete template permanently
   */
  async deleteTemplate(templateId, hospitalId) {
    const template = await this.repository.getTemplateById(templateId);
    
    if (!template) {
      throw new NotFoundError('Template');
    }

    if (template.isSystemTemplate) {
      throw new ForbiddenError('Cannot delete system templates');
    }

    if (template.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    await this.repository.deleteTemplate(templateId);

    return { message: 'Template deleted permanently' };
  }

  // ==================== SEED & INITIALIZATION ====================

  /**
   * Seed system templates
   */
  async seedSystemTemplates() {
    const templates = DEFAULT_TEMPLATES.map(t => ({
      templateCode: t.templateCode,
      templateName: t.templateName,
      description: t.description,
      category: t.testCategory || t.category,
      testSubCategory: t.testSubCategory || null,
      testId: t.testId || null,
      testCode: t.testCode || null,
      templateType: t.templateType,
      headerConfig: t.headerConfig || {},
      sections: t.sections || [],
      entryFields: t.entryFields || [],
      referenceRanges: t.referenceRanges || {},
      footerConfig: t.footerConfig || {},
      styling: t.styling || {},
      printConfig: t.printConfig || {},
      version: 1,
      isActive: true,
      isDefault: t.isDefault || false,
      isSystemTemplate: true,
      hospitalId: null
    }));

    const result = await this.repository.createManyTemplates(templates);

    return {
      count: result.count,
      message: `${result.count} system templates seeded`
    };
  }

  /**
   * Initialize templates for a new hospital
   * Clones all system templates for customization
   */
  async initializeHospitalTemplates(hospitalId, userId) {
    const systemTemplates = await this.repository.getSystemTemplates();
    
    let clonedCount = 0;
    for (const template of systemTemplates) {
      try {
        await this.repository.cloneTemplateForHospital(template.id, hospitalId, userId);
        clonedCount++;
      } catch (error) {
        console.error(`Failed to clone template ${template.templateCode}:`, error.message);
      }
    }

    return {
      totalSystemTemplates: systemTemplates.length,
      cloned: clonedCount,
      message: `Initialized ${clonedCount} templates for hospital`
    };
  }

  // ==================== VALIDATION ====================

  validateTemplateData(data) {
    const errors = [];

    if (!data.templateCode?.trim()) {
      errors.push('Template code is required');
    } else if (!/^[A-Z0-9_]+$/.test(data.templateCode)) {
      errors.push('Template code must be uppercase alphanumeric with underscores');
    }

    if (!data.templateName?.trim()) {
      errors.push('Template name is required');
    }

    if (!data.testCategory?.trim()) {
      errors.push('Test category is required');
    }

    const validTypes = ['TABULAR', 'NARRATIVE', 'MIXED', 'CUSTOM'];
    if (data.templateType && !validTypes.includes(data.templateType)) {
      errors.push(`Invalid template type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (data.sections && !Array.isArray(data.sections)) {
      errors.push('Sections must be an array');
    }

    if (data.entryFields && !Array.isArray(data.entryFields)) {
      errors.push('Entry fields must be an array');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('. '));
    }
  }

  validateSections(sections) {
    if (!Array.isArray(sections)) {
      throw new ValidationError('Sections must be an array');
    }

    sections.forEach((section, index) => {
      if (!section.id) {
        throw new ValidationError(`Section at index ${index} missing 'id'`);
      }
      if (!section.type) {
        throw new ValidationError(`Section '${section.id}' missing 'type'`);
      }
    });
  }

  validateEntryFields(fields) {
    if (!Array.isArray(fields)) {
      throw new ValidationError('Entry fields must be an array');
    }

    const validTypes = ['text', 'number', 'select', 'multiselect', 'textarea', 'richtext', 'file_upload', 'checkbox', 'date', 'time', 'array', 'object'];

    fields.forEach((field, index) => {
      if (!field.id) {
        throw new ValidationError(`Field at index ${index} missing 'id'`);
      }
      if (!field.label) {
        throw new ValidationError(`Field '${field.id}' missing 'label'`);
      }
      if (field.type && !validTypes.includes(field.type)) {
        throw new ValidationError(`Field '${field.id}' has invalid type '${field.type}'`);
      }
    });
  }

  // ==================== FORMATTING ====================

  formatTemplate(template) {
    if (!template) return null;

    return {
      id: template.id,
      templateCode: template.templateCode,
      templateName: template.templateName,
      description: template.description,
      testCategory: template.category || template.testCategory,
      testSubCategory: template.testSubCategory,
      testCode: template.testCode,
      templateType: template.templateType,
      
      // Structure
      headerConfig: template.headerConfig,
      sections: template.sections,
      entryFields: template.entryFields,
      referenceRanges: template.referenceRanges,
      footerConfig: template.footerConfig,
      
      // Styling
      styling: template.styling,
      printConfig: template.printConfig,
      
      // Metadata
      version: template.version,
      isDefault: template.isDefault,
      isSystemTemplate: template.isSystemTemplate,
      isActive: template.isActive,
      
      // Hospital info
      hospitalId: template.hospitalId,
      hospitalName: template.hospital?.hospitalName || (template.isSystemTemplate ? 'System Template' : null),
      
      // Audit
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }

  // ==================== TEMPLATE RESOLUTION ====================

  /**
   * Resolve which template to use for a diagnostic result
   * This is the main method called when generating/displaying results
   */
  async resolveTemplateForResult(diagnosticResult, hospitalId) {
    const { testCode, testCategory } = diagnosticResult;

    // Priority order:
    // 1. Test-specific hospital template
    // 2. Test-specific system template
    // 3. Category default hospital template
    // 4. Category default system template
    // 5. Fallback embedded template

    let template = await this.getTemplateForTest(testCode, testCategory, hospitalId);

    if (!template) {
      // Use embedded default as last resort
      template = getDefaultTemplateForCategory(testCategory) || 
                 getDefaultTemplateByCode('BLOOD_TEST_DEFAULT');
    }

    return template;
  }

  /**
   * Get entry form configuration for entering results
   */
  async getEntryFormConfig(testCode, testCategory, hospitalId) {
    const template = await this.resolveTemplateForResult({ testCode, testCategory }, hospitalId);
    
    if (!template) {
      return {
        fields: [
          { id: 'resultValue', label: 'Result', type: 'text', required: true },
          { id: 'notes', label: 'Notes', type: 'textarea', required: false }
        ],
        templateType: 'GENERIC'
      };
    }

    return {
      templateId: template.id,
      templateCode: template.templateCode,
      templateName: template.templateName,
      templateType: template.templateType,
      fields: template.entryFields || [],
      sections: template.sections || [],
      referenceRanges: template.referenceRanges || {}
    };
  }

  /**
   * Get print/PDF configuration for a result
   */
  async getPrintConfig(testCode, testCategory, hospitalId) {
    const template = await this.resolveTemplateForResult({ testCode, testCategory }, hospitalId);
    
    return {
      templateId: template?.id,
      headerConfig: template?.headerConfig || {},
      sections: template?.sections || [],
      footerConfig: template?.footerConfig || {},
      styling: template?.styling || {},
      printConfig: template?.printConfig || {}
    };
  }
}



















