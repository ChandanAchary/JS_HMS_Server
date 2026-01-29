/**
 * PublicRegistration Service
 * Business logic for public registration operations
 */

import { NotFoundError, ValidationError, ConflictError } from '../../shared/exceptions/AppError.js';
import {
  PublicHospitalRepository,
  PublicFormTemplateRepository,
  PublicJoinRequestRepository
} from './publicRegistration.repository.js';
import {
  parseFormData,
  extractProfilePhotoUrl,
  extractFormFields
} from './publicRegistration.dto.js';
import {
  validateRole,
  validateFormDataExists,
  validateApplicationFields,
  validateStatusCheckInput
} from './publicRegistration.validators.js';

// Import shared form template utilities
import { defaultDoctorFields, defaultEmployeeFields } from '../../utils/defaultFormFields.js';

export class PublicRegistrationService {
  constructor(prisma) {
    this.prisma = prisma;
    this.hospitalRepository = new PublicHospitalRepository(prisma);
    this.formTemplateRepository = new PublicFormTemplateRepository(prisma);
    this.joinRequestRepository = new PublicJoinRequestRepository(prisma);
  }

  // =====================
  // Hospital Operations
  // =====================

  /**
   * Get all active hospitals for public listing
   */
  async getHospitalsList() {
    const hospitals = await this.hospitalRepository.findAllActive();
    return hospitals;
  }

  /**
   * Get hospital details by ID
   */
  async getHospitalDetails(hospitalId) {
    const hospital = await this.hospitalRepository.findById(hospitalId);

    if (!hospital) {
      throw new NotFoundError('Hospital not found');
    }

    if (!hospital.isActive) {
      throw new ValidationError('Hospital is currently not accepting applications');
    }

    return hospital;
  }

  // =====================
  // Form Operations
  // =====================

  /**
   * Get registration form for a hospital and role
   */
  async getRegistrationForm(hospitalId, role) {
    const validatedRole = validateRole(role);

    // Verify hospital exists and is active
    const hospital = await this.getHospitalDetails(hospitalId);

    // Try to get existing form template
    let template = await this.formTemplateRepository.findByHospitalAndType(hospitalId, validatedRole);

    // If not found, try with synonyms
    if (!template) {
      template = await this.formTemplateRepository.findByHospitalWithSynonyms(hospitalId, validatedRole);
    }

    // If still not found, create default template
    if (!template) {
      template = await this._initializeFormTemplate(hospitalId, validatedRole);
    }

    // Ensure fields is always an array
    template.fields = Array.isArray(template.schema) ? template.schema : [];

    return {
      template,
      hospitalName: hospital.hospitalName
    };
  }

  /**
   * Initialize form template with default fields
   */
  async _initializeFormTemplate(hospitalId, role) {
    const defaultFields = role === 'DOCTOR' ? defaultDoctorFields : defaultEmployeeFields;

    const template = await this.prisma.formTemplate.create({
      data: {
        hospitalId,
        type: role,
        name: `${role} Registration`,
        schema: defaultFields
      }
    });

    template.fields = Array.isArray(template.schema) ? template.schema : [];
    return template;
  }

  // =====================
  // Application Operations
  // =====================

  /**
   * Submit public registration application
   */
  async submitApplication(hospitalId, role, body, file) {
    const validatedRole = validateRole(role);

    // Verify hospital exists and is active
    const hospital = await this.getHospitalDetails(hospitalId);

    // Parse form data (handles JSON string or object)
    const formData = parseFormData(body);
    validateFormDataExists(formData);

    // Extract common fields
    const fields = extractFormFields(formData);
    validateApplicationFields(fields.email, fields.name);

    const email = fields.email.toLowerCase();

    // Check for existing pending application
    const existingPending = await this.joinRequestRepository.findPendingByEmail(hospitalId, email);
    if (existingPending) {
      throw new ConflictError(
        'An application with this email is already pending review',
        { existingRequestId: existingPending.id }
      );
    }

    // Get form template for validation
    const { template } = await this.getRegistrationForm(hospitalId, validatedRole);

    // Validate form data against template
    const validationResult = await this._validateFormSubmission(template, formData);
    if (!validationResult.isValid) {
      throw new ValidationError(
        'Form validation failed',
        { errors: validationResult.errors }
      );
    }

    // Handle profile photo
    const profilePhotoUrl = extractProfilePhotoUrl(file, formData);

    // Calculate age if DOB is provided
    const age = fields.dob ? this._calculateAge(fields.dob) : null;

    // Prepare join request data
    const joinRequestData = {
      hospitalId,
      email,
      name: fields.name,
      phone: fields.phone,
      formData: {
        ...formData,
        profilePhotoUrl,
        age
      },
      role: validatedRole,
      status: 'FORM_SUBMITTED',
      submittedAt: new Date(),
      notes: `Applied for ${validatedRole} position via public registration`
    };

    // Add role-specific fields
    if (validatedRole === 'DOCTOR') {
      if (fields.qualification) joinRequestData.qualification = fields.qualification;
      if (fields.specialization) joinRequestData.specialization = fields.specialization;
      if (fields.licenseNumber) joinRequestData.licenseNumber = fields.licenseNumber;
    }

    // Create join request
    const joinRequest = await this.joinRequestRepository.create(joinRequestData);

    return joinRequest;
  }

  /**
   * Check application status by email or phone
   */
  async checkApplicationStatus(email, phone, hospitalId = null) {
    validateStatusCheckInput(email, phone);

    const joinRequest = await this.joinRequestRepository.findLatestByEmailOrPhone(
      email?.toLowerCase(),
      phone,
      hospitalId
    );

    if (!joinRequest) {
      throw new NotFoundError('No application found with the provided details');
    }

    return joinRequest;
  }
  // =====================
  // Single-Tenant Methods
  // =====================

  /**
   * Get registration form for single-tenant (auto-detect hospital)
   */
  async getRegistrationFormSingleTenant(role) {
    const validatedRole = validateRole(role);

    // Get the single hospital
    const hospital = await this.hospitalRepository.findFirstActive();
    if (!hospital) {
      throw new NotFoundError('Hospital not configured');
    }

    // Try to get existing form template
    let template = await this.formTemplateRepository.findByHospitalAndType(hospital.id, validatedRole);

    // If not found, create default template
    if (!template) {
      template = await this._initializeFormTemplate(hospital.id, validatedRole);
    }

    // Ensure fields is always an array
    template.fields = Array.isArray(template.schema) ? template.schema : [];

    return {
      template,
      hospitalName: hospital.hospitalName
    };
  }

  /**
   * Submit application for single-tenant (auto-detect hospital)
   */
  async submitApplicationSingleTenant(role, formData, profilePhotoFile) {
    const validatedRole = validateRole(role);
    validateFormDataExists(formData);

    // Get the single hospital
    const hospital = await this.hospitalRepository.findFirstActive();
    if (!hospital) {
      throw new NotFoundError('Hospital not configured');
    }

    // Check for duplicate applications
    const existingRequest = await this.joinRequestRepository.findActiveByEmailAndRole(
      formData.email?.toLowerCase(),
      validatedRole,
      hospital.id
    );

    if (existingRequest) {
      throw new ConflictError('An application for this email already exists. Please check your application status.');
    }

    // Get form template
    let template = await this.formTemplateRepository.findByHospitalAndType(hospital.id, validatedRole);
    if (!template) {
      template = await this._initializeFormTemplate(hospital.id, validatedRole);
    }

    // Validate form data
    const validation = await this._validateFormSubmission(template, formData);
    if (!validation.isValid) {
      throw new ValidationError('Form validation failed', validation.errors);
    }

    // Validate application fields
    validateApplicationFields(formData);

    // Extract profile photo URL
    const profilePhotoUrl = extractProfilePhotoUrl(profilePhotoFile);
    const formFields = extractFormFields(formData, template);

    // Create join request
    const joinRequest = await this.joinRequestRepository.create({
      hospitalId: hospital.id,
      email: formData.email.toLowerCase(),
      phone: formData.phone,
      fullName: formData.fullName,
      role: validatedRole,
      formFields,
      profilePhoto: profilePhotoUrl,
      status: 'PENDING'
    });

    return joinRequest;
  }

  /**
   * Check application status for single-tenant (auto-detect hospital)
   */
  async checkApplicationStatusSingleTenant(email, phone) {
    validateStatusCheckInput(email, phone);

    // Get the single hospital
    const hospital = await this.hospitalRepository.findFirstActive();
    if (!hospital) {
      throw new NotFoundError('Hospital not configured');
    }

    const joinRequest = await this.joinRequestRepository.findLatestByEmailOrPhone(
      email?.toLowerCase(),
      phone,
      hospital.id
    );

    if (!joinRequest) {
      throw new NotFoundError('No application found with the provided details');
    }

    return joinRequest;
  }
  // =====================
  // Helper Methods
  // =====================

  /**
   * Validate form submission against template schema
   */
  async _validateFormSubmission(template, formData) {
    const fields = Array.isArray(template.schema) ? template.schema : [];
    const errors = [];

    for (const field of fields) {
      if (!field.isEnabled) continue;

      const value = formData[field.fieldName];

      // Required field check
      if (field.isRequired && (value === undefined || value === null || value === '')) {
        errors.push({ field: field.fieldName, message: `${field.fieldLabel} is required` });
        continue;
      }

      if (value === undefined || value === null || value === '') continue;

      const type = (field.fieldType || '').toLowerCase();

      // Email validation
      if (type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be a valid email` });
        }
      }

      // Phone validation
      if (type === 'tel') {
        if (!/^[0-9]{10,15}$/.test(String(value).replace(/\D/g, ''))) {
          errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be 10-15 digits` });
        }
      }

      // Date validation
      if (type === 'date') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
          errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be in YYYY-MM-DD format` });
        }
      }

      // Custom validation rules
      if (field.validation) {
        const validation = field.validation;
        const valLen = String(value).length;

        if (validation.min && valLen < validation.min) {
          errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be at least ${validation.min} characters` });
        }
        if (validation.max && valLen > validation.max) {
          errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be at most ${validation.max} characters` });
        }
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(String(value))) {
            errors.push({ field: field.fieldName, message: `${field.fieldLabel} format is invalid` });
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Calculate age from date of birth
   */
  _calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}

export default PublicRegistrationService;
