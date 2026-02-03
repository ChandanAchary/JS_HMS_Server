/**
 * Diagnostic Report Template Repository
 * Data access layer for report template management
 */

export class DiagnosticTemplateRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // ==================== CREATE ====================

  /**
   * Create a new report template
   */
  async createTemplate(data) {
    return this.prisma.diagnosticReportTemplate.create({
      data: {
        hospitalId: data.hospitalId || null,
        templateCode: data.templateCode,
        templateName: data.templateName,
        description: data.description,
        testCategory: data.testCategory,
        testSubCategory: data.testSubCategory,
        testId: data.testId,
        testCode: data.testCode,
        templateType: data.templateType || 'TABULAR',
        headerConfig: data.headerConfig || {},
        sections: data.sections || [],
        entryFields: data.entryFields || [],
        referenceRanges: data.referenceRanges || {},
        footerConfig: data.footerConfig || {},
        styling: data.styling || {},
        printConfig: data.printConfig || {},
        version: 1,
        isActive: true,
        isDefault: data.isDefault || false,
        isSystemTemplate: data.isSystemTemplate || false,
        createdBy: data.createdBy
      }
    });
  }

  /**
   * Create multiple templates (for seeding)
   */
  async createManyTemplates(templates) {
    return this.prisma.diagnosticReportTemplate.createMany({
      data: templates,
      skipDuplicates: true
    });
  }

  // ==================== READ ====================

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    return this.prisma.diagnosticReportTemplate.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  /**
   * Get template by code for a hospital
   * Falls back to system template if hospital-specific not found
   */
  async getTemplateByCode(templateCode, hospitalId) {
    // First try hospital-specific
    let template = await this.prisma.diagnosticReportTemplate.findFirst({
      where: {
        templateCode,
        hospitalId,
        isActive: true
      }
    });

    // Fall back to system template
    if (!template) {
      template = await this.prisma.diagnosticReportTemplate.findFirst({
        where: {
          templateCode,
          hospitalId: null,
          isSystemTemplate: true,
          isActive: true
        }
      });
    }

    return template;
  }

  /**
   * Get template by test code
   */
  async getTemplateByTestCode(testCode, hospitalId) {
    // First try test-specific template for hospital
    let template = await this.prisma.diagnosticReportTemplate.findFirst({
      where: {
        testCode,
        hospitalId,
        isActive: true
      }
    });

    // Fall back to test-specific system template
    if (!template) {
      template = await this.prisma.diagnosticReportTemplate.findFirst({
        where: {
          testCode,
          hospitalId: null,
          isSystemTemplate: true,
          isActive: true
        }
      });
    }

    return template;
  }

  /**
   * Get default template for category
   */
  async getDefaultTemplateForCategory(testCategory, hospitalId) {
    // Hospital-specific default
    let template = await this.prisma.diagnosticReportTemplate.findFirst({
      where: {
        testCategory,
        hospitalId,
        isDefault: true,
        isActive: true
      }
    });

    // Fall back to system default
    if (!template) {
      template = await this.prisma.diagnosticReportTemplate.findFirst({
        where: {
          testCategory,
          hospitalId: null,
          isSystemTemplate: true,
          isDefault: true,
          isActive: true
        }
      });
    }

    return template;
  }

  /**
   * Get all templates for hospital (includes system templates)
   */
  async getTemplatesForHospital(hospitalId, filters = {}) {
    const where = {
      isActive: true,
      OR: [
        { hospitalId },
        { hospitalId: null, isSystemTemplate: true }
      ]
    };

    if (filters.testCategory) {
      where.testCategory = filters.testCategory;
    }

    if (filters.templateType) {
      where.templateType = filters.templateType;
    }

    if (filters.search) {
      where.OR = [
        ...where.OR,
        { templateName: { contains: filters.search, mode: 'insensitive' } },
        { templateCode: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.diagnosticReportTemplate.findMany({
      where,
      orderBy: [
        { testCategory: 'asc' },
        { templateName: 'asc' }
      ],
      include: {
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  /**
   * Get all system templates
   */
  async getSystemTemplates() {
    return this.prisma.diagnosticReportTemplate.findMany({
      where: {
        hospitalId: null,
        isSystemTemplate: true,
        isActive: true
      },
      orderBy: [
        { testCategory: 'asc' },
        { templateName: 'asc' }
      ]
    });
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(testCategory, hospitalId = null) {
    return this.prisma.diagnosticReportTemplate.findMany({
      where: {
        testCategory,
        isActive: true,
        OR: [
          { hospitalId },
          { hospitalId: null, isSystemTemplate: true }
        ]
      },
      orderBy: { templateName: 'asc' }
    });
  }

  // ==================== UPDATE ====================

  /**
   * Update template
   */
  async updateTemplate(id, data) {
    return this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: {
        templateName: data.templateName,
        description: data.description,
        testSubCategory: data.testSubCategory,
        templateType: data.templateType,
        headerConfig: data.headerConfig,
        sections: data.sections,
        entryFields: data.entryFields,
        referenceRanges: data.referenceRanges,
        footerConfig: data.footerConfig,
        styling: data.styling,
        printConfig: data.printConfig,
        isDefault: data.isDefault,
        updatedBy: data.updatedBy,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update template sections only
   */
  async updateTemplateSections(id, sections, updatedBy) {
    return this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: {
        sections,
        updatedBy,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update template entry fields only
   */
  async updateTemplateEntryFields(id, entryFields, updatedBy) {
    return this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: {
        entryFields,
        updatedBy,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update template styling
   */
  async updateTemplateStyling(id, styling, updatedBy) {
    return this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: {
        styling,
        updatedBy,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Set template as default for category
   */
  async setAsDefault(id, testCategory, hospitalId) {
    // Remove default from other templates in same category
    await this.prisma.diagnosticReportTemplate.updateMany({
      where: {
        testCategory,
        hospitalId,
        isDefault: true,
        id: { not: id }
      },
      data: { isDefault: false }
    });

    // Set this one as default
    return this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: { isDefault: true }
    });
  }

  /**
   * Create new version of template (for version control)
   */
  async createNewVersion(id, data) {
    const existing = await this.getTemplateById(id);
    if (!existing) return null;

    // Deactivate old version
    await this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: { isActive: false }
    });

    // Create new version
    return this.prisma.diagnosticReportTemplate.create({
      data: {
        hospitalId: existing.hospitalId,
        templateCode: existing.templateCode,
        templateName: data.templateName || existing.templateName,
        description: data.description || existing.description,
        testCategory: existing.testCategory,
        testSubCategory: data.testSubCategory || existing.testSubCategory,
        testId: existing.testId,
        testCode: existing.testCode,
        templateType: data.templateType || existing.templateType,
        headerConfig: data.headerConfig || existing.headerConfig,
        sections: data.sections || existing.sections,
        entryFields: data.entryFields || existing.entryFields,
        referenceRanges: data.referenceRanges || existing.referenceRanges,
        footerConfig: data.footerConfig || existing.footerConfig,
        styling: data.styling || existing.styling,
        printConfig: data.printConfig || existing.printConfig,
        version: existing.version + 1,
        previousVersion: id,
        isActive: true,
        isDefault: existing.isDefault,
        isSystemTemplate: false, // Customized versions are not system templates
        createdBy: data.updatedBy
      }
    });
  }

  // ==================== DELETE ====================

  /**
   * Soft delete template (deactivate)
   */
  async deactivateTemplate(id) {
    return this.prisma.diagnosticReportTemplate.update({
      where: { id },
      data: { 
        isActive: false,
        isDefault: false
      }
    });
  }

  /**
   * Hard delete template (only for non-system templates)
   */
  async deleteTemplate(id) {
    const template = await this.getTemplateById(id);
    if (template?.isSystemTemplate) {
      throw new Error('Cannot delete system templates');
    }

    return this.prisma.diagnosticReportTemplate.delete({
      where: { id }
    });
  }

  // ==================== CLONE ====================

  /**
   * Clone system template for hospital customization
   */
  async cloneTemplateForHospital(templateId, hospitalId, createdBy) {
    const source = await this.getTemplateById(templateId);
    if (!source) return null;

    // Check if hospital already has this template
    const existing = await this.prisma.diagnosticReportTemplate.findFirst({
      where: {
        templateCode: source.templateCode,
        hospitalId
      }
    });

    if (existing) {
      return existing; // Return existing instead of creating duplicate
    }

    return this.prisma.diagnosticReportTemplate.create({
      data: {
        hospitalId,
        templateCode: source.templateCode,
        templateName: source.templateName,
        description: source.description,
        testCategory: source.testCategory,
        testSubCategory: source.testSubCategory,
        testId: source.testId,
        testCode: source.testCode,
        templateType: source.templateType,
        headerConfig: source.headerConfig,
        sections: source.sections,
        entryFields: source.entryFields,
        referenceRanges: source.referenceRanges,
        footerConfig: source.footerConfig,
        styling: source.styling,
        printConfig: source.printConfig,
        version: 1,
        isActive: true,
        isDefault: source.isDefault,
        isSystemTemplate: false,
        createdBy
      }
    });
  }

  // ==================== STATS ====================

  /**
   * Get template usage statistics
   */
  async getTemplateStats(hospitalId) {
    const templates = await this.prisma.diagnosticReportTemplate.groupBy({
      by: ['testCategory'],
      where: {
        isActive: true,
        OR: [
          { hospitalId },
          { hospitalId: null, isSystemTemplate: true }
        ]
      },
      _count: { id: true }
    });

    return templates.map(t => ({
      category: t.testCategory,
      count: t._count.id
    }));
  }

  /**
   * Check if template code exists
   */
  async templateCodeExists(templateCode, hospitalId) {
    const count = await this.prisma.diagnosticReportTemplate.count({
      where: {
        templateCode,
        hospitalId
      }
    });
    return count > 0;
  }
}
