/**
 * Employee Controller
 * HTTP request handlers for employee endpoints
 */

import { EmployeeService } from './employee.service.js';
import { ApiResponse } from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/enums/HttpStatus.js';
import { 
  formatEmployeeProfile, 
  formatLoginResponse,
  formatEmployeeListItem,
  formatPaginatedEmployees,
  parseRegistrationInput,
  parseProfileUpdateInput
} from './employee.dto.js';
import { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate,
  validateSalaryUpdate,
  validateDelegatedPermissions,
  validatePaginationParams
} from './employee.validators.js';

/**
 * Get service instance from request
 */
const getService = (req) => new EmployeeService(req.tenantPrisma);

/**
 * @desc Register new employee
 * @route POST /api/v1/employees/register
 */
export const register = async (req, res, next) => {
  try {
    const input = parseRegistrationInput(req.body);
    validateRegistration(input);

    const service = getService(req);
    await service.register(input, req.file);

    return res.status(HttpStatus.CREATED).json(
      ApiResponse.created({ message: 'Employee registered successfully' })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login employee
 * @route POST /api/v1/employees/login/:hospitalId
 */
export const login = async (req, res, next) => {
  try {
    // Support JSON body or multipart/form-data
    let payload = req.body ?? {};
    if (typeof payload.formData === 'string') {
      try { 
        payload = JSON.parse(payload.formData); 
      } catch (e) { 
        /* ignore parse error */ 
      }
    }

    const { emailOrPhone, password } = payload;
    const hospitalId = req.params.hospitalId || req.hospitalId;

    validateLogin({ emailOrPhone, password, hospitalId });

    const service = getService(req);
    const result = await service.login(emailOrPhone, password, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatLoginResponse(result.employee, result.token, result.hospital))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get employee profile
 * @route GET /api/v1/employees/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const { id: userId, hospitalId } = req.user;
    const service = getService(req);
    const { employee, attendanceInfo, salaryInfo } = await service.getProfile(userId, hospitalId, req);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatEmployeeProfile(employee, { req, attendanceInfo, salaryInfo }))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update employee profile
 * @route PUT /api/v1/employees/profile
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
 * @desc Logout employee
 * @route POST /api/v1/employees/logout
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
 * @desc Delete employee account (soft delete)
 * @route DELETE /api/v1/employees/profile
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
 * @desc List employees (admin)
 * @route GET /api/v1/employees
 */
export const listEmployees = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const select = req.body?.select || req.query?.select || null;

    const service = getService(req);
    const employees = await service.listEmployees(hospitalId, { select });

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ employees: employees.map(formatEmployeeListItem) })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List employees with pagination (admin)
 * @route GET /api/v1/employees/paginated
 */
export const listEmployeesPaginated = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const paginationParams = validatePaginationParams(req.query);

    const service = getService(req);
    const result = await service.listEmployeesWithPagination(hospitalId, paginationParams);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatPaginatedEmployees(result))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get employee by ID (admin)
 * @route GET /api/v1/employees/:id
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: employeeId } = req.params;

    const service = getService(req);
    const employee = await service.getEmployeeById(employeeId, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success({ employee: formatEmployeeListItem(employee) })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update employee salary (admin)
 * @route PUT /api/v1/employees/:id/salary
 */
export const updateSalary = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: employeeId } = req.params;
    const salary = validateSalaryUpdate(req.body.salary);

    const service = getService(req);
    const result = await service.updateSalary(employeeId, hospitalId, salary);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update delegated permissions (admin)
 * @route PUT /api/v1/employees/:id/delegated-permissions
 */
export const updateDelegatedPermissions = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: employeeId } = req.params;
    const permissions = validateDelegatedPermissions(req.body.permissions || []);

    const service = getService(req);
    const result = await service.updateDelegatedPermissions(employeeId, hospitalId, permissions);

    return res.status(HttpStatus.OK).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete employee (admin)
 * @route DELETE /api/v1/employees/:id
 */
export const deleteEmployee = async (req, res, next) => {
  try {
    const { hospitalId } = req.user;
    const { id: employeeId } = req.params;

    const service = getService(req);
    const result = await service.deleteEmployee(employeeId, hospitalId);

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
  listEmployees,
  listEmployeesPaginated,
  getEmployeeById,
  updateSalary,
  updateDelegatedPermissions,
  deleteEmployee
};
