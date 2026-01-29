/**
 * Patient Controller
 * HTTP request handlers for patient endpoints
 */

import { PatientService } from './patient.service.js';
import { ApiResponse } from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/enums/HttpStatus.js';
import { 
  formatPatient,
  formatPatientSearchResults,
  formatPaginatedPatients,
  parsePatientInput
} from './patient.dto.js';
import { 
  validatePatientCreate,
  validateSearchQuery,
  validatePaginationParams
} from './patient.validators.js';

// Allowed roles for patient access
const ALLOWED_ROLES = ['BILLING_ENTRY', 'BILLING_EXIT', 'ADMIN'];

/**
 * Get service instance from request
 */
const getService = (req) => new PatientService(req.tenantPrisma);

/**
 * Check if user has required role
 */
const requireRoles = (req, res, allowedRoles) => {
  const role = req.user?.role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(HttpStatus.FORBIDDEN).json(
      ApiResponse.error('Forbidden', HttpStatus.FORBIDDEN)
    );
  }
  return null;
};

/**
 * @desc Get all patients with billing history
 * @route GET /api/v1/patients
 */
export const getAllPatients = async (req, res, next) => {
  try {
    const deny = requireRoles(req, res, ALLOWED_ROLES);
    if (deny) return;

    const { hospitalId } = req.user;
    const service = getService(req);
    const { patients, billsByPatient } = await service.getAllPatients(hospitalId);

    return res.status(HttpStatus.OK).json(
      formatPatientSearchResults(patients, billsByPatient)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Search patients by query
 * @route GET /api/v1/patients/search
 */
export const searchPatients = async (req, res, next) => {
  try {
    const deny = requireRoles(req, res, ALLOWED_ROLES);
    if (deny) return;

    const query = validateSearchQuery(req.query.q || '');
    
    if (!query) {
      return res.status(HttpStatus.OK).json(
        ApiResponse.success({ success: true, patients: [] })
      );
    }

    const { hospitalId } = req.user;
    const service = getService(req);
    const { patients, billsByPatient } = await service.searchPatients(hospitalId, query);

    return res.status(HttpStatus.OK).json(
      formatPatientSearchResults(patients, billsByPatient)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get patient by patientId
 * @route GET /api/v1/patients/:patientId
 */
export const getPatient = async (req, res, next) => {
  try {
    const deny = requireRoles(req, res, ALLOWED_ROLES);
    if (deny) return;

    const { patientId } = req.params;
    const { hospitalId } = req.user;
    
    const service = getService(req);
    const patient = await service.getPatient(patientId, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ patient: formatPatient(patient) })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get patients with pagination
 * @route GET /api/v1/patients/paginated
 */
export const getPatientsPaginated = async (req, res, next) => {
  try {
    const deny = requireRoles(req, res, ALLOWED_ROLES);
    if (deny) return;

    const { hospitalId } = req.user;
    const paginationParams = validatePaginationParams(req.query);

    const service = getService(req);
    const result = await service.getPatientsWithPagination(hospitalId, paginationParams);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatPaginatedPatients(result, result.billsByPatient))
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getAllPatients,
  searchPatients,
  getPatient,
  getPatientsPaginated
};
