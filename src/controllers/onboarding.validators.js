/**
 * Onboarding Validators & DTOs
 * Validation and response formatting for onboarding operations
 */

import { ValidationError } from '../shared/AppError.js';
import { EMPLOYEE_ROLES, DOCTOR_SPECIALIZATIONS } from '../rbac/rolePermissions.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Format join request response - simple list format
 */
export const formatJoinRequest = (request) => ({
  id: request.id,
  name: request.name,
  email: request.email,
  role: request.role,
  hospitalId: request.hospitalId,
  phone: request.phone,
  status: request.status,
  submittedAt: request.submittedAt,
  rejectionReason: request.rejectionReason
});

/**
 * Format join request details - role-specific detailed format
 */
export const formatJoinRequestDetails = (request) => {
  // Base fields for all roles
  const base = {
    id: request.id,
    name: request.name,
    email: request.email,
    phone: request.phone,
    role: request.role,
    hospitalId: request.hospitalId,
    profilePic: request.profilePic,
    status: request.status,
    submittedAt: request.submittedAt,
    updatedAt: request.updatedAt,
    approvedAt: request.approvedAt,
    approvedBy: request.approvedBy,
    rejectionReason: request.rejectionReason
  };

  // Role-specific fields
  if (request.role === 'DOCTOR') {
    return {
      ...base,
      specialization: request.specialization,
      licenseNumber: request.licenseNumber,
      qualification: request.qualification,
      dob: request.dob,
      age: request.age,
      qualifications: request.qualifications,
      formData: request.formData
    };
  } else if (request.role === 'EMPLOYEE') {
    return {
      ...base,
      appliedRole: request.appliedRole,
      qualification: request.qualification,
      dob: request.dob,
      age: request.age,
      formData: request.formData
    };
  }

  // Default: return all fields if role is unknown
  return request;
};

/**
 * Format application status response
 */
export const formatApplicationStatus = (request) => ({
  status: request.status,
  hospitalId: request.hospitalId,
  submittedAt: request.submittedAt,
  rejectionReason: request.rejectionReason
});

/**
 * Format token validation response
 */
export const formatTokenValidation = (token, joinRequest) => ({
  valid: true,
  role: token.role,
  email: token.email,
  name: joinRequest.name,
  hospitalId: token.hospitalId
});

/**
 * Format verification queue item (without sensitive data)
 */
export const formatVerificationItem = (user) => {
  const { password, ...rest } = user;
  return {
    ...rest,
    bankDetails: {
      accountNumber: rest.accountNumber || null,
      ifscCode: rest.ifscCode || null
    }
  };
};

/**
 * Format verifications queue response
 */
export const formatVerificationsQueue = (doctors, employees) => ({
  doctors: doctors.map(formatVerificationItem),
  employees: employees.map(formatVerificationItem),
  total: doctors.length + employees.length
});

/**
 * Format public hospital list item
 */
export const formatPublicHospital = (hospital) => ({
  id: hospital.id,
  hospitalName: hospital.hospitalName,
  address: hospital.address
});

/**
 * Parse join request input
 * For EMPLOYEE: appliedRole is required
 * For DOCTOR: specialization is required
 */
export const parseJoinRequestInput = (body) => ({
  name: body.name?.trim(),
  email: body.email?.toLowerCase().trim(),
  role: body.role?.toUpperCase(),
  hospitalId: body.hospitalId,
  phone: body.phone?.trim(),
  appliedRole: body.appliedRole?.toUpperCase(), // For EMPLOYEE role
  specialization: body.specialization?.toUpperCase() // For DOCTOR role
});

/**
 * Parse join application input (detailed form)
 */
export const parseJoinApplicationInput = (body, file = null) => {
  // Determine the profile pic URL/path
  let profilePicUrl = body.profilePhoto || null;
  
  if (file) {
    if (file.url) {
      profilePicUrl = file.url;
    } else if (file.secure_url) {
      profilePicUrl = file.secure_url;
    } else if (file.filename && file.filename !== 'undefined') {
      profilePicUrl = `/uploads/${file.filename}`;
    } else if (file.path && file.path !== 'undefined') {
      profilePicUrl = file.path;
    }
  }

  return {
    name: body.name?.trim(),
    email: body.email?.toLowerCase().trim(),
    role: body.role?.toUpperCase(),
    hospitalId: body.hospitalId,
    phone: body.phone?.trim(),
    dob: body.dob ? new Date(body.dob) : null,
    qualifications: body.qualifications 
      ? (Array.isArray(body.qualifications) ? body.qualifications : [body.qualifications]) 
      : [],
    specialization: body.specialization || null,
    licenseNumber: body.licenseNumber || null,
    appliedRole: body.appliedRole || null,
    profilePic: profilePicUrl,
    additionalInfo: body.additionalInfo || null
  };
};

// ============================================================================
// Validators
// ============================================================================

/**
 * Valid roles for onboarding
 */
export const VALID_ROLES = ['DOCTOR', 'EMPLOYEE'];

/**
 * Valid join request statuses
 */
export const JOIN_REQUEST_STATUSES = ['PENDING', 'INVITED', 'FORM_SUBMITTED', 'APPROVED', 'REJECTED'];

/**
 * Validate join request input
 * For EMPLOYEE role, appliedRole is REQUIRED at submission time
 */
export const validateJoinRequest = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.role) {
    errors.push('Role is required');
  } else if (!VALID_ROLES.includes(data.role.toUpperCase())) {
    errors.push('Role must be DOCTOR or EMPLOYEE');
  }

  if (!data.hospitalId) {
    errors.push('Hospital ID is required');
  }

  // For EMPLOYEE role, appliedRole is required at submission time (proper RBAC)
  if (data.role?.toUpperCase() === 'EMPLOYEE') {
    if (!data.appliedRole?.trim()) {
      errors.push('Applied Role is required for Employee position');
    } else if (!EMPLOYEE_ROLES.includes(data.appliedRole.toUpperCase())) {
      errors.push(`Invalid applied role. Must be one of: ${EMPLOYEE_ROLES.join(', ')}`);
    }
  }

  // For DOCTOR role, specialization is required
  if (data.role?.toUpperCase() === 'DOCTOR') {
    if (!data.specialization?.trim()) {
      errors.push('Specialization is required for Doctor position');
    } else if (!DOCTOR_SPECIALIZATIONS.includes(data.specialization.toUpperCase())) {
      errors.push(`Invalid specialization. Must be one of: ${DOCTOR_SPECIALIZATIONS.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate join application input (detailed form)
 */
export const validateJoinApplication = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.role) {
    errors.push('Role is required');
  } else if (!VALID_ROLES.includes(data.role.toUpperCase())) {
    errors.push('Role must be DOCTOR or EMPLOYEE');
  }

  if (!data.hospitalId) {
    errors.push('Hospital ID is required');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone is required');
  }

  // For EMPLOYEE role, appliedRole is required and must be valid
  if (data.role?.toUpperCase() === 'EMPLOYEE') {
    if (!data.appliedRole?.trim()) {
      errors.push('Applied Role is required for Employee position');
    } else if (!EMPLOYEE_ROLES.includes(data.appliedRole.toUpperCase())) {
      errors.push(`Invalid applied role. Must be one of: ${EMPLOYEE_ROLES.join(', ')}`);
    }
  }

  // For DOCTOR role, specialization is required
  if (data.role?.toUpperCase() === 'DOCTOR') {
    if (!data.specialization?.trim()) {
      errors.push('Specialization is required for Doctor position');
    } else if (!DOCTOR_SPECIALIZATIONS.includes(data.specialization.toUpperCase())) {
      errors.push(`Invalid specialization. Must be one of: ${DOCTOR_SPECIALIZATIONS.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate OTP
 */
export const validateOtp = (otp) => {
  if (!otp || !/^\d{6}$/.test(otp)) {
    throw new ValidationError('Invalid OTP format');
  }
  return true;
};

/**
 * Validate registration token params
 */
export const validateTokenParams = (token, role) => {
  if (!token) {
    throw new ValidationError('Token is required');
  }

  if (!role || !['doctor', 'employee'].includes(role.toLowerCase())) {
    throw new ValidationError('Invalid role');
  }

  return true;
};

/**
 * Validate verification type
 */
export const validateVerificationType = (type) => {
  if (!['doctor', 'employee'].includes(type.toLowerCase())) {
    throw new ValidationError('Invalid type. Must be doctor or employee');
  }
  return type.toLowerCase();
};

/**
 * Validate email query param
 */
export const validateEmailQuery = (email) => {
  if (!email?.trim()) {
    throw new ValidationError('Email is required');
  }
  return email.trim().toLowerCase();
};

/**
 * Validate password and confirm password for registration
 */
export const validatePasswordRegistration = (data) => {
  const errors = [];

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push('Password must contain at least 1 uppercase, 1 lowercase, and 1 number');
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  }

  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

export default {
  VALID_ROLES,
  JOIN_REQUEST_STATUSES,
  validateJoinRequest,
  validateJoinApplication,
  validateOtp,
  validateTokenParams,
  validateVerificationType,
  validateEmailQuery,
  validatePasswordRegistration
};



















