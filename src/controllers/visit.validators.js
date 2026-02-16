/**
 * Visit Validators & DTOs
 * Input validation and response formatting for visit endpoints
 */

import { VISIT_TYPES, PRIORITY_LEVELS } from '../services/visit.constants.js';
import { ApiResponse } from '../shared/ApiResponse.js';
import { HttpStatus } from '../constants/HttpStatus.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Format patient visit response
 */
export const formatVisit = (visit) => {
  return {
    id: visit.id,
    visitId: visit.visitId,
    patientId: visit.patientId,
    patientName: visit.patient?.name,
    visitType: visit.visitType,
    visitCategory: visit.visitCategory,
    chiefComplaint: visit.chiefComplaint,
    symptoms: visit.symptoms,
    status: visit.status,
    priority: visit.priority,
    isEmergency: visit.isEmergency,
    assignedDoctorId: visit.assignedDoctorId,
    assignedDoctorName: visit.assignedDoctorName,
    departmentCode: visit.departmentCode,
    billId: visit.billId,
    visitDate: visit.visitDate,
    registeredAt: visit.registeredAt,
    startedAt: visit.startedAt,
    completedAt: visit.completedAt,
    createdBy: visit.createdBy,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
  };
};

/**
 * Format patient entry response
 */
export const formatPatientEntryResponse = (patient, visit, bill, queueInfo) => {
  return ApiResponse.success({
    success: true,
    message: 'Patient registered successfully',
    data: {
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        city: patient.city,
        state: patient.state,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
      },
      visit: formatVisit(visit),
      billing: bill ? {
        billId: bill.billId,
        totalAmount: bill.totalAmount,
        paymentStatus: bill.paymentStatus,
      } : null,
      queue: queueInfo ? {
        queueNumber: queueInfo.queueNumber,
        tokenNumber: queueInfo.tokenNumber,
        position: queueInfo.position,
        serviceQueueName: queueInfo.serviceQueueName,
        estimatedWaitTime: queueInfo.estimatedWaitTime,
      } : null,
    },
  }, HttpStatus.CREATED);
};

/**
 * Format visit list response
 */
export const formatVisitList = (visits) => {
  return ApiResponse.success({
    success: true,
    data: {
      visits: visits.map(formatVisit),
      count: visits.length,
    },
  });
};

/**
 * Format service dashboard queue response
 */
export const formatServiceDashboard = (queueEntries, serviceInfo) => {
  return ApiResponse.success({
    success: true,
    data: {
      service: serviceInfo,
      queue: queueEntries.map(entry => ({
        queueNumber: entry.queueNumber,
        tokenNumber: entry.tokenNumber,
        position: entry.position,
        priority: entry.priority,
        isEmergency: entry.isEmergency,
        status: entry.status,
        patient: {
          patientId: entry.patient.patientId,
          name: entry.patient.name,
          age: entry.patient.age,
          gender: entry.patient.gender,
          phone: entry.patient.phone,
        },
        visit: {
          visitId: entry.diagnosticOrder?.patientVisits?.[0]?.visitId,
          visitType: entry.diagnosticOrder?.patientVisits?.[0]?.visitType,
          chiefComplaint: entry.diagnosticOrder?.patientVisits?.[0]?.chiefComplaint,
        },
        serviceName: entry.serviceName,
        joinedAt: entry.joinedAt,
        estimatedWaitTime: entry.estimatedWaitTime,
        calledAt: entry.calledAt,
        servedAt: entry.servedAt,
      })),
      statistics: {
        total: queueEntries.length,
        waiting: queueEntries.filter(e => e.status === 'WAITING').length,
        called: queueEntries.filter(e => e.status === 'CALLED').length,
        serving: queueEntries.filter(e => e.status === 'SERVING').length,
        emergencies: queueEntries.filter(e => e.isEmergency).length,
      },
    },
  });
};

// ============================================================================
// Validators
// ============================================================================

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



















