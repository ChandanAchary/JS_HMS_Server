/**
 * Doctor Controller
 * HTTP request handlers for doctor endpoints
 */

import { DoctorService } from './doctor.service.js';
import { ApiResponse } from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/enums/HttpStatus.js';
import { 
  formatDoctorProfile, 
  formatLoginResponse,
  formatDoctorListItem,
  formatPaginatedDoctors,
  parseRegistrationInput,
  parseProfileUpdateInput
} from './doctor.dto.js';
import { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate,
  validateSalaryUpdate,
  validateDelegatedPermissions,
  validatePaginationParams
} from './doctor.validators.js';

/**
 * Get service instance from request
 */
const getService = (req) => new DoctorService(req.tenantPrisma);

/**
 * @desc Register new doctor
 * @route POST /api/v1/doctors/register
 */
export const register = async (req, res, next) => {
  try {
    const input = parseRegistrationInput(req.body);
    validateRegistration(input);

    const service = getService(req);
    await service.register(input, req.file);

    return res.status(HttpStatus.CREATED).json(
      ApiResponse.created({ message: 'Doctor registered successfully' })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login doctor
 * @route POST /api/v1/doctors/login/:hospitalId
 */
export const login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;
    const hospitalId = req.params.hospitalId || req.hospitalId;

    validateLogin({ emailOrPhone, password, hospitalId });

    const service = getService(req);
    const result = await service.login(emailOrPhone, password, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatLoginResponse(result.doctor, result.token, result.hospital))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get doctor profile
 * @route GET /api/v1/doctors/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const { id: userId, hospitalId } = req.user;
    const service = getService(req);
    const { doctor, attendanceInfo, salaryInfo } = await service.getProfile(userId, hospitalId, req);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatDoctorProfile(doctor, { req, attendanceInfo, salaryInfo }))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update doctor profile
 * @route PUT /api/v1/doctors/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { id: userId, hospitalId } = req.user;
    const updateData = parseProfileUpdateInput(req.body);
    validateProfileUpdate(req.body);

    const service = getService(req);
    const result = await service.updateProfile(userId, hospitalId, updateData, req.file);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Logout doctor
 * @route POST /api/v1/doctors/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { id: userId, hospitalId } = req.user;
    const service = getService(req);
    const result = await service.logout(userId, hospitalId);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete doctor account (soft delete)
 * @route DELETE /api/v1/doctors/profile
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { id: userId, hospitalId } = req.user;
    const service = getService(req);
    const result = await service.deleteAccount(userId, hospitalId);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List doctors (admin)
 * @route GET /api/v1/doctors
 */
export const listDoctors = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const select = req.body?.select || req.query?.select || null;

    const service = getService(req);
    const doctors = await service.listDoctors(hospitalId, { select });

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ doctors: doctors.map(formatDoctorListItem) })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List doctors with pagination (admin)
 * @route GET /api/v1/doctors/paginated
 */
export const listDoctorsPaginated = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const paginationParams = validatePaginationParams(req.query);

    const service = getService(req);
    const result = await service.listDoctorsWithPagination(hospitalId, paginationParams);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatPaginatedDoctors(result))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get doctor by ID (admin)
 * @route GET /api/v1/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: doctorId } = req.params;

    const service = getService(req);
    const doctor = await service.getDoctorById(doctorId, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ doctor: formatDoctorListItem(doctor) })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update doctor salary (admin)
 * @route PUT /api/v1/doctors/:id/salary
 */
export const updateSalary = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: doctorId } = req.params;
    const salary = validateSalaryUpdate(req.body.salary);

    const service = getService(req);
    const result = await service.updateSalary(doctorId, hospitalId, salary);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update delegated permissions (admin)
 * @route PUT /api/v1/doctors/:id/delegated-permissions
 */
export const updateDelegatedPermissions = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: doctorId } = req.params;
    const permissions = validateDelegatedPermissions(req.body.permissions || []);

    const service = getService(req);
    const result = await service.updateDelegatedPermissions(doctorId, hospitalId, permissions);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete doctor (admin)
 * @route DELETE /api/v1/doctors/:id
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: doctorId } = req.params;

    const service = getService(req);
    const result = await service.deleteDoctor(doctorId, hospitalId);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  deleteAccount,
  listDoctors,
  listDoctorsPaginated,
  getDoctorById,
  updateSalary,
  updateDelegatedPermissions,
  deleteDoctor
};
