/**
 * PublicRegistration Validators & DTOs
 * Validation and response formatting for public registration operations
 */

import { ValidationError } from '../shared/AppError.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Format hospital for public listing
 */
export const formatPublicHospitalList = (hospital) => ({
  id: hospital.id,
  hospitalName: hospital.hospitalName,
  address: hospital.address,
  latitude: hospital.latitude,
  longitude: hospital.longitude
});

/**
 * Format hospital details
 */
export const formatPublicHospitalDetails = (hospital) => ({
  id: hospital.id,
  hospitalName: hospital.hospitalName,
  address: hospital.address,
  latitude: hospital.latitude,
  longitude: hospital.longitude,
  emailDomain: hospital.emailDomain,
  isActive: hospital.isActive
});

/**
 * Format registration form response
 */
export const formatRegistrationForm = (template, hospitalName) => ({
  template,
  fields: template.schema || [],
  hospitalName
});

/**
 * Format application submission response
 */
export const formatApplicationSubmitted = (joinRequest) => ({
  message: 'Application submitted successfully',
  joinRequestId: joinRequest.id,
  status: 'PENDING',
  nextSteps: 'Your application has been submitted. You can check the status using your email address.'
});

/**
 * Format application status response
 */
export const formatApplicationStatus = (joinRequest) => {
  const response = {
    status: joinRequest.status,
    role: joinRequest.role,
    hospitalName: joinRequest.Hospital?.hospitalName,
    submittedAt: joinRequest.submittedAt,
    updatedAt: joinRequest.updatedAt
  };

  if (joinRequest.status === 'APPROVED') {
    response.approved = true;
    response.loginInstructions = {
      message: 'Your application has been approved. You can now log in with your credentials.',
      email: joinRequest.email,
      note: 'Check your email for login credentials and password sent by the hospital.'
    };
  }

  if (joinRequest.status === 'REJECTED') {
    response.rejected = true;
    if (joinRequest.rejectionReason) {
      response.rejectionReason = joinRequest.rejectionReason;
    }
  }

  return response;
};

/**
 * Parse form data from request (handles both JSON and form-data)
 */
export const parseFormData = (body) => {
  const raw = body?.formData ?? body ?? body.formData;
  
  if (!raw) {
    return null;
  }

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return raw;
};

/**
 * Extract profile photo URL from file upload
 */
export const extractProfilePhotoUrl = (file, formData) => {
  if (!file) {
    return formData?.profilePhotoUrl || null;
  }

  if (file.url) {
    return file.url;
  } else if (file.secure_url) {
    return file.secure_url;
  } else if (file.filename && file.filename !== 'undefined') {
    return `/uploads/${file.filename}`;
  } else if (file.path && file.path !== 'undefined') {
    return file.path;
  }

  return formData?.profilePhotoUrl || null;
};

/**
 * Extract common fields from form data
 */
export const extractFormFields = (formData) => ({
  email: formData.email || formData.Email || formData['Email Address'] || '',
  name: formData.fullName || formData.Full_Name || formData['Full Name'] || '',
  phone: formData.mobileNumber || formData.phone || formData.Mobile_Number || null,
  dob: formData.dateOfBirth || formData.date_of_birth || formData.dob || null,
  qualification: formData.qualification || null,
  specialization: formData.specialization || formData.Specialization || null,
  licenseNumber: formData.medicalLicenseNumber || formData.license_number || null,
  appliedRole: formData.roleApplied || formData.roleAppliedFor || formData.role_applied_for || null
});

// ============================================================================
// Validators
// ============================================================================

/**
 * Valid roles for public registration
 */
export const VALID_ROLES = ['DOCTOR', 'EMPLOYEE'];

/**
 * Validate role parameter
 */
export const validateRole = (role) => {
  if (!role) {
    throw new ValidationError('Role parameter is missing');
  }

  if (!VALID_ROLES.includes(role.toUpperCase())) {
    throw new ValidationError('Invalid role. Must be DOCTOR or EMPLOYEE');
  }

  return role.toUpperCase();
};

/**
 * Validate form data exists
 */
export const validateFormDataExists = (formData) => {
  if (!formData) {
    throw new ValidationError('formData is required');
  }
  return true;
};

/**
 * Validate required application fields
 */
export const validateApplicationFields = (email, name) => {
  const errors = [];

  if (!email) {
    errors.push('Email is required in form data');
  }

  if (!name) {
    errors.push('Name is required in form data');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate status check input
 */
export const validateStatusCheckInput = (email, phone) => {
  if (!email && !phone) {
    throw new ValidationError('Email or phone is required');
  }
  return true;
};

/**
 * Validate hospital ID parameter
 */
export const validateHospitalId = (hospitalId) => {
  if (!hospitalId) {
    throw new ValidationError('Hospital ID is required');
  }
  return hospitalId;
};

export default {
  VALID_ROLES,
  validateRole,
  validateFormDataExists,
  validateApplicationFields,
  validateStatusCheckInput,
  validateHospitalId
};



















