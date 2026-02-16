/**
 * Doctor Validators & DTOs
 * Validation and response formatting for doctor-related operations
 */

import { DOCTOR_SPECIALIZATIONS } from '../rbac/rolePermissions.js';
import { ValidationError } from '../shared/AppError.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Response DTO for doctor profile
 */
export const formatDoctorProfile = (doctor, options = {}) => {
  const { req, attendanceInfo = {}, salaryInfo = {} } = options;

  // Process profile picture URL
  let profilePicUrl = null;
  if (doctor.profilePic && doctor.profilePic !== '' && doctor.profilePic !== 'uploads/undefined') {
    if (doctor.profilePic.startsWith('http://') || doctor.profilePic.startsWith('https://')) {
      profilePicUrl = doctor.profilePic;
    } else if (req) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePicUrl = `${protocol}://${host}/${doctor.profilePic}`;
    }
  }

  return {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    specialization: doctor.specialization,
    profilePic: profilePicUrl,
    salary: doctor.salary,
    bankDetails: {
      accountNumber: doctor.accountNumber || null,
      ifscCode: doctor.ifscCode || null
    },
    paymentStatus: doctor.paymentStatus,
    lastPaidMonth: doctor.lastPaidMonth,
    lastPaidYear: doctor.lastPaidYear,
    status: doctor.status,
    isActive: doctor.isActive,
    delegatedPermissions: doctor.delegatedPermissions,
    hospitalId: doctor.hospitalId,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
    // Attendance info
    isPresentNow: attendanceInfo.isPresentNow ?? false,
    attendanceUnit: attendanceInfo.attendanceUnit ?? 0,
    totalWorkingMinutes: attendanceInfo.totalWorkingMinutes ?? 0,
    presentToday: attendanceInfo.isPresentNow ?? false,
    // Salary info
    presentDays: salaryInfo.presentDays,
    totalWorkingDays: salaryInfo.totalWorkingDays,
    attendancePercent: salaryInfo.attendancePercent,
    baseSalary: salaryInfo.baseSalary,
    calculatedSalary: salaryInfo.calculatedSalary
  };
};

/**
 * Response DTO for doctor list item
 */
export const formatDoctorListItem = (doctor) => ({
  id: doctor.id,
  name: doctor.name,
  email: doctor.email,
  phone: doctor.phone,
  specialization: doctor.specialization,
  status: doctor.status,
  isActive: doctor.isActive,
  salary: doctor.salary,
  createdAt: doctor.createdAt
});

/**
 * Response DTO for login response
 */
export const formatLoginResponse = (doctor, token, hospital) => ({
  message: 'Login successful',
  token,
  doctor: {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    specialization: doctor.specialization,
    hospitalId: doctor.hospitalId,
    hospital: hospital?.hospitalName
  }
});

/**
 * Request DTO for doctor registration
 */
export const parseRegistrationInput = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim()?.toLowerCase(),
  phone: body.phone?.trim()?.replace(/\D/g, ''),
  specialization: body.specialization?.trim() || 'General',
  password: body.password,
  accountNumber: body.accountNumber?.trim() || null,
  ifscCode: body.ifscCode?.trim() || null
});

/**
 * Request DTO for profile update
 */
export const parseProfileUpdateInput = (body) => {
  const updateData = {};
  const allowedFields = ['name', 'phone', 'specialization'];
  
  allowedFields.forEach((field) => {
    if (body[field]) {
      updateData[field] = body[field];
    }
  });

  // Handle bank details
  if (body.bankDetails) {
    if (body.bankDetails.accountNumber) {
      updateData.accountNumber = String(body.bankDetails.accountNumber);
    }
    if (body.bankDetails.ifscCode) {
      updateData.ifscCode = String(body.bankDetails.ifscCode);
    }
  }

  return updateData;
};

/**
 * Response DTO for paginated doctors
 */
export const formatPaginatedDoctors = (result) => ({
  doctors: result.data.map(formatDoctorListItem),
  pagination: result.pagination
});

// ============================================================================
// Validators
// ============================================================================

/**
 * Validate doctor registration input
 */
export const validateRegistration = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone is required');
  } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (data.specialization && !DOCTOR_SPECIALIZATIONS.includes(data.specialization)) {
    errors.push(`Invalid specialization. Must be one of: ${DOCTOR_SPECIALIZATIONS.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate login input
 */
export const validateLogin = (data) => {
  const errors = [];

  if (!data.emailOrPhone?.trim()) {
    errors.push('Email or phone is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (!data.hospitalId) {
    errors.push('Hospital ID is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate profile update input
 */
export const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.name !== undefined && !data.name?.trim()) {
    errors.push('Name cannot be empty');
  }

  if (data.phone !== undefined) {
    if (!data.phone?.trim()) {
      errors.push('Phone cannot be empty');
    } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push('Phone must be 10 digits');
    }
  }

  if (data.specialization !== undefined && data.specialization && !DOCTOR_SPECIALIZATIONS.includes(data.specialization)) {
    errors.push(`Invalid specialization. Must be one of: ${DOCTOR_SPECIALIZATIONS.join(', ')}`);
  }

  if (data.bankDetails) {
    if (data.bankDetails.accountNumber && !/^\d{9,18}$/.test(data.bankDetails.accountNumber)) {
      errors.push('Invalid account number format');
    }
    if (data.bankDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bankDetails.ifscCode.toUpperCase())) {
      errors.push('Invalid IFSC code format');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate salary update
 */
export const validateSalaryUpdate = (salary) => {
  if (salary === undefined || salary === null) {
    throw new ValidationError('Salary is required');
  }

  const numSalary = Number(salary);
  if (isNaN(numSalary) || numSalary < 0) {
    throw new ValidationError('Salary must be a positive number');
  }

  return numSalary;
};

/**
 * Validate delegated permissions
 */
export const validateDelegatedPermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    throw new ValidationError('Permissions must be an array');
  }

  const validPermissions = permissions.filter(p => typeof p === 'string' && p.trim());
  return validPermissions;
};

/**
 * Validate pagination params
 */
export const validatePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const search = query.search?.trim() || '';
  const specialization = query.specialization?.trim() || null;

  return { page, limit, search, specialization };
};

export default {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateSalaryUpdate,
  validateDelegatedPermissions,
  validatePaginationParams
};



















