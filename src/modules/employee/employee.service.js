/**
 * Employee Service
 * Business logic layer for Employee operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EmployeeRepository } from './employee.repository.js';
import { 
  NotFoundError, 
  ConflictError, 
  AuthenticationError, 
  AuthorizationError,
  ValidationError 
} from '../../shared/exceptions/AppError.js';
import { getPermissionsForRole } from '../../rbac/rolePermissions.js';
import { calculateAttendanceStatus } from '../../services/attendanceStatus.service.js';
import { calculateMonthlySalary } from '../../services/salary.service.js';
import { localDateString } from '../../utils/date.utils.js';
import { normalizeEmail, normalizePhone } from '../../utils/validation.utils.js';
import { getFileUrl } from '../../core/utils/file.utils.js';

export class EmployeeService {
  constructor(prisma) {
    this.prisma = prisma;
    this.repository = new EmployeeRepository(prisma);
  }

  /**
   * Register new employee
   */
  async register(data, file = null) {
    // Check for existing employee
    const existing = await this.repository.existsByEmailOrPhone(
      normalizeEmail(data.email),
      normalizePhone(data.phone)
    );

    if (existing) {
      throw new ConflictError('Employee already exists with this email or phone number');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Get profile pic path
    const profilePicPath = getFileUrl(file) || '';

    // Create employee
    const employee = await this.repository.create({
      name: data.name,
      email: normalizeEmail(data.email),
      phone: normalizePhone(data.phone),
      qualification: data.qualification,
      role: data.role,
      password: hashedPassword,
      profilePic: profilePicPath,
      accountNumber: data.accountNumber || null,
      ifscCode: data.ifscCode || null,
      isLoggedIn: false
    });

    return employee;
  }

  /**
   * Login employee
   */
  async login(emailOrPhone, password, hospitalId) {
    // Verify hospital exists and is active
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      throw new NotFoundError('Hospital not found');
    }

    if (!hospital.isActive) {
      throw new AuthorizationError('Hospital is currently inactive. Please contact support.');
    }

    // Find employee
    const employee = await this.repository.findByEmailOrPhone(
      normalizeEmail(emailOrPhone) || normalizePhone(emailOrPhone),
      hospitalId
    );

    if (!employee) {
      throw new NotFoundError('Employee not found in this hospital');
    }

    if (employee.isDeleted) {
      throw new AuthorizationError('Account deleted. Contact admin.');
    }

    // Check status for SaaS
    if (employee.status === 'PENDING' || employee.status === 'REJECTED') {
      throw new AuthorizationError('Account not approved. Contact your administrator.');
    }

    if (!employee.isActive) {
      throw new AuthorizationError('Account is inactive. Contact your administrator.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update login status
    await this.repository.updateLoginStatus(employee.id, true);

    // Compute permissions
    const basePerms = getPermissionsForRole('EMPLOYEE');
    const delegated = Array.isArray(employee.delegatedPermissions) ? employee.delegatedPermissions : [];
    const permissions = Array.from(new Set([...(basePerms || []), ...delegated]));

    // Generate token
    const token = jwt.sign(
      { 
        id: employee.id, 
        role: 'EMPLOYEE', 
        hospitalId: employee.hospitalId, 
        permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { employee, token, hospital };
  }

  /**
   * Get employee profile with attendance and salary info
   */
  async getProfile(userId, hospitalId, req = null) {
    const employee = await this.repository.findById(userId, {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        qualification: true,
        role: true,
        profilePic: true,
        salary: true,
        accountNumber: true,
        ifscCode: true,
        paymentStatus: true,
        lastPaidMonth: true,
        lastPaidYear: true,
        status: true,
        isActive: true,
        delegatedPermissions: true,
        createdAt: true,
        updatedAt: true,
        hospitalId: true
      }
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    // Get today's attendance
    const today = localDateString();
    const attendance = await this.prisma.attendance.findFirst({
      where: { employeeId: userId, hospitalId, date: today }
    });

    const sessions = attendance 
      ? await this.prisma.attendanceSession.findMany({ where: { attendanceId: attendance.id } }) 
      : [];

    const attendanceInfo = calculateAttendanceStatus(sessions);

    // Get salary info
    let salaryInfo = {};
    try {
      const now = new Date();
      salaryInfo = await calculateMonthlySalary(userId, now.getFullYear(), now.getMonth() + 1);
    } catch (err) {
      console.error('Profile salary calc error:', err);
    }

    return { employee, attendanceInfo, salaryInfo };
  }

  /**
   * Update employee profile
   */
  async updateProfile(userId, hospitalId, updateData, file = null) {
    const employee = await this.repository.findById(userId);

    if (!employee || String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    // Handle profile pic
    if (file) {
      const profilePicPath = getFileUrl(file);
      if (profilePicPath) {
        updateData.profilePic = profilePicPath;
      }
    }

    await this.repository.update(userId, updateData);
    return { message: 'Profile updated successfully' };
  }

  /**
   * Logout employee
   */
  async logout(userId, hospitalId) {
    const employee = await this.repository.findById(userId);

    if (!employee || String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.updateLoginStatus(userId, false);
    return { message: 'Logged out successfully' };
  }

  /**
   * Soft delete employee account
   */
  async deleteAccount(userId, hospitalId) {
    const employee = await this.repository.findById(userId);

    if (!employee || String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.softDelete(userId);
    return { message: 'Account deleted successfully. You cannot log in again.' };
  }

  /**
   * List employees for hospital
   */
  async listEmployees(hospitalId, options = {}) {
    return this.repository.findAllByHospital(hospitalId, options);
  }

  /**
   * List employees with pagination
   */
  async listEmployeesWithPagination(hospitalId, paginationParams) {
    return this.repository.findWithPagination(hospitalId, paginationParams);
  }

  /**
   * Get employee by ID (admin view)
   */
  async getEmployeeById(employeeId, hospitalId) {
    const employee = await this.repository.findById(employeeId);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    return employee;
  }

  /**
   * Update employee salary (admin)
   */
  async updateSalary(employeeId, hospitalId, salary) {
    const employee = await this.repository.findById(employeeId);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    const numSalary = Number(salary);
    if (isNaN(numSalary) || numSalary < 0) {
      throw new ValidationError('Invalid salary value');
    }

    await this.repository.updateSalary(employeeId, numSalary);
    return { message: 'Salary updated successfully' };
  }

  /**
   * Update delegated permissions (admin)
   */
  async updateDelegatedPermissions(employeeId, hospitalId, permissions) {
    const employee = await this.repository.findById(employeeId);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.updateDelegatedPermissions(employeeId, permissions);
    return { message: 'Permissions updated successfully' };
  }

  /**
   * Delete employee (admin)
   */
  async deleteEmployee(employeeId, hospitalId) {
    const employee = await this.repository.findById(employeeId);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (String(employee.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.softDelete(employeeId);
    return { message: 'Employee deleted successfully' };
  }
}

export default EmployeeService;
