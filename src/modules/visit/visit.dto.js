/**
 * Visit DTOs
 * Data transfer objects for visit endpoints
 */

import { ApiResponse } from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/enums/HttpStatus.js';

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
