/**
 * Visit Validators
 * Input validation for visit endpoints
 */

import { VISIT_TYPES, PRIORITY_LEVELS } from './visit.constants.js';

/**
 * Validate patient entry input
 */
export const validatePatientEntry = (data) => {
  const errors = [];

  // Required patient fields
  if (!data.patientName || !data.patientName.trim()) {
    errors.push('Patient name is required');
  }

  if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.push('Valid gender is required (Male, Female, Other)');
  }

  if (!data.phone || !data.phone.trim()) {
    errors.push('Mobile number is required');
  } else if (!/^[0-9]{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Mobile number must be 10 digits');
  }

  // Age or DOB required
  if (!data.age && !data.dateOfBirth) {
    errors.push('Either age or date of birth is required');
  }

  if (data.age && (isNaN(data.age) || data.age < 0 || data.age > 150)) {
    errors.push('Age must be between 0 and 150');
  }

  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth');
    } else if (dob > new Date()) {
      errors.push('Date of birth cannot be in the future');
    }
  }

  // Required visit fields
  if (!data.visitType || !Object.values(VISIT_TYPES).includes(data.visitType)) {
    errors.push('Valid visit type is required');
  }

  // Optional fields validation
  if (data.bloodGroup) {
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(data.bloodGroup)) {
      errors.push('Invalid blood group');
    }
  }

  if (data.emergencyContactPhone && !/^[0-9]{10}$/.test(data.emergencyContactPhone.replace(/\D/g, ''))) {
    errors.push('Emergency contact phone must be 10 digits');
  }

  if (data.priority && !Object.values(PRIORITY_LEVELS).includes(data.priority)) {
    errors.push('Invalid priority level');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate visit update input
 */
export const validateVisitUpdate = (data) => {
  const errors = [];

  if (data.status && !['REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(data.status)) {
    errors.push('Invalid status');
  }

  if (data.priority && !Object.values(PRIORITY_LEVELS).includes(data.priority)) {
    errors.push('Invalid priority level');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

/**
 * Parse and sanitize patient entry input
 */
export const parsePatientEntryInput = (data) => {
  return {
    // Patient details
    patientName: data.patientName?.trim(),
    gender: data.gender,
    age: data.age ? parseInt(data.age) : (data.dateOfBirth ? calculateAge(data.dateOfBirth) : null),
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    phone: data.phone?.replace(/\D/g, ''),
    bloodGroup: data.bloodGroup?.trim() || null,
    city: data.city?.trim() || null,
    state: data.state?.trim() || null,
    address: data.address?.trim() || '',
    emergencyContactName: data.emergencyContactName?.trim() || null,
    emergencyContactPhone: data.emergencyContactPhone?.replace(/\D/g, '') || null,

    // Visit details
    visitType: data.visitType,
    chiefComplaint: data.chiefComplaint?.trim() || null,
    symptoms: data.symptoms || null,
    notes: data.notes?.trim() || null,
    assignedDoctorId: data.assignedDoctorId || null,
    assignedDoctorName: data.assignedDoctorName?.trim() || null,
    departmentCode: data.departmentCode?.trim() || null,
    priority: data.priority || 'NORMAL',
    isEmergency: data.isEmergency || false,
  };
};
