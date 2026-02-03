/**
 * Visit Controller
 * HTTP request handlers for visit endpoints
 */

import { VisitService } from './visit.service.js';
import { 
  formatPatientEntryResponse, 
  formatVisitList, 
  formatServiceDashboard 
} from './visit.dto.js';
import { 
  validatePatientEntry, 
  validateVisitUpdate, 
  parsePatientEntryInput 
} from './visit.validators.js';
import { ApiResponse } from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/enums/HttpStatus.js';
import { AppError } from '../../shared/exceptions/AppError.js';

/**
 * Get service instance from request
 */
const getService = (req) => new VisitService(req.tenantPrisma);

/**
 * @desc Register patient with visit type (Patient Entry)
 * @route POST /api/v1/visits/patient-entry
 */
export const registerPatientEntry = async (req, res, next) => {
  try {
    const hospitalId = req.hospitalId || req.user?.hospitalId;
    const userId = req.user?.id;

    // Parse input
    const input = parsePatientEntryInput(req.body);

    // Validate input
    const validation = validatePatientEntry(req.body);
    if (!validation.isValid) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Validation failed', HttpStatus.BAD_REQUEST, validation.errors)
      );
    }

    // Prepare patient data
    const patientData = {
      name: input.patientName,
      age: input.age,
      gender: input.gender,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      bloodGroup: input.bloodGroup,
      city: input.city,
      state: input.state,
      address: input.address,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
    };

    // Prepare visit data
    const visitData = {
      visitType: input.visitType,
      chiefComplaint: input.chiefComplaint,
      symptoms: input.symptoms,
      notes: input.notes,
      assignedDoctorId: input.assignedDoctorId,
      assignedDoctorName: input.assignedDoctorName,
      departmentCode: input.departmentCode,
      priority: input.priority,
      isEmergency: input.isEmergency,
    };

    // Register patient entry
    const service = getService(req);
    const result = await service.registerPatientEntry(
      hospitalId,
      patientData,
      visitData,
      userId
    );

    return res.status(HttpStatus.CREATED).json(
      formatPatientEntryResponse(
        result.patient,
        result.visit,
        result.bill,
        result.queueInfo
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all visits with filters
 * @route GET /api/v1/visits
 */
export const getVisits = async (req, res, next) => {
  try {
    const hospitalId = req.hospitalId || req.user?.hospitalId;
    const { status, visitType, visitCategory, patientId, fromDate, toDate } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (visitType) filters.visitType = visitType;
    if (visitCategory) filters.visitCategory = visitCategory;
    if (patientId) filters.patientId = patientId;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const service = getService(req);
    const visits = await service.getVisits(hospitalId, filters);

    return res.status(HttpStatus.OK).json(formatVisitList(visits));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get visit by ID
 * @route GET /api/v1/visits/:visitId
 */
export const getVisitById = async (req, res, next) => {
  try {
    const { visitId } = req.params;
    const service = getService(req);
    const visit = await service.getVisitById(visitId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ success: true, data: visit })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update visit status
 * @route PATCH /api/v1/visits/:visitId/status
 */
export const updateVisitStatus = async (req, res, next) => {
  try {
    const { visitId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!status) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Status is required', HttpStatus.BAD_REQUEST)
      );
    }

    const validation = validateVisitUpdate({ status });
    if (!validation.isValid) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Validation failed', HttpStatus.BAD_REQUEST, validation.errors)
      );
    }

    const service = getService(req);
    const visit = await service.updateVisitStatus(visitId, status, userId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ 
        success: true, 
        message: 'Visit status updated',
        data: visit 
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get OPD consultation queue (for doctors/staff)
 * @route GET /api/v1/visits/queue/opd
 */
export const getOPDQueue = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { status } = req.query;

    const service = getService(req);
    const queueEntries = await service.getServiceQueuePatients(
      hospitalId,
      'CONSULTATION',
      status
    );

    return res.status(HttpStatus.OK).json(
      formatServiceDashboard(queueEntries, {
        serviceType: 'CONSULTATION',
        serviceName: 'OPD Consultation',
        description: 'Out-patient department consultation queue',
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get IPD admission queue
 * @route GET /api/v1/visits/queue/ipd
 */
export const getIPDQueue = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { status } = req.query;

    const service = getService(req);
    const queueEntries = await service.getServiceQueuePatients(
      hospitalId,
      'ADMISSION',
      status
    );

    return res.status(HttpStatus.OK).json(
      formatServiceDashboard(queueEntries, {
        serviceType: 'ADMISSION',
        serviceName: 'IPD Admission',
        description: 'In-patient department admission queue',
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get diagnostic services queue
 * @route GET /api/v1/visits/queue/diagnostics
 */
export const getDiagnosticsQueue = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { status } = req.query;

    const service = getService(req);
    const queueEntries = await service.getServiceQueuePatients(
      hospitalId,
      'DIAGNOSTIC',
      status
    );

    return res.status(HttpStatus.OK).json(
      formatServiceDashboard(queueEntries, {
        serviceType: 'DIAGNOSTIC',
        serviceName: 'Diagnostic Services',
        description: 'Laboratory and diagnostic tests queue',
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get other services queue
 * @route GET /api/v1/visits/queue/services
 */
export const getOtherServicesQueue = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { status } = req.query;

    const service = getService(req);
    const queueEntries = await service.getServiceQueuePatients(
      hospitalId,
      'SERVICE',
      status
    );

    return res.status(HttpStatus.OK).json(
      formatServiceDashboard(queueEntries, {
        serviceType: 'SERVICE',
        serviceName: 'Other Services',
        description: 'Vaccination, physiotherapy, and other services queue',
      })
    );
  } catch (error) {
    next(error);
  }
};
