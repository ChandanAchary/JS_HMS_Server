/**
 * Doctor Service
 * Business logic layer for Doctor operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DoctorRepository } from './doctor.repository.js';
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

export class DoctorService {
  constructor(prisma) {
    this.prisma = prisma;
    this.repository = new DoctorRepository(prisma);
  }

  /**
   * Register new doctor
   */
  async register(data, file = null) {
    // Check for existing doctor
    const existing = await this.repository.existsByEmailOrPhone(
      normalizeEmail(data.email),
      normalizePhone(data.phone)
    );

    if (existing) {
      throw new ConflictError('Doctor already exists with this email or phone number');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Get profile pic path
    const profilePicPath = getFileUrl(file) || '';

    // Create doctor
    const doctor = await this.repository.create({
      name: data.name,
      email: normalizeEmail(data.email),
      phone: normalizePhone(data.phone),
      specialization: data.specialization || 'General',
      password: hashedPassword,
      profilePic: profilePicPath,
      accountNumber: data.accountNumber || null,
      ifscCode: data.ifscCode || null,
      isLoggedIn: false
    });

    return doctor;
  }

  /**
   * Login doctor
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

    // Find doctor
    const doctor = await this.repository.findByEmailOrPhone(
      normalizeEmail(emailOrPhone) || normalizePhone(emailOrPhone),
      hospitalId
    );

    if (!doctor) {
      throw new NotFoundError('Doctor not found in this hospital');
    }

    if (doctor.isDeleted) {
      throw new AuthorizationError('Account deleted. Contact admin.');
    }

    // Check status for SaaS
    if (doctor.status === 'PENDING' || doctor.status === 'REJECTED') {
      throw new AuthorizationError('Account not approved. Contact your administrator.');
    }

    if (!doctor.isActive) {
      throw new AuthorizationError('Account is inactive. Contact your administrator.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update login status
    await this.repository.updateLoginStatus(doctor.id, true);

    // Compute permissions
    const basePerms = getPermissionsForRole('DOCTOR');
    const delegated = Array.isArray(doctor.delegatedPermissions) ? doctor.delegatedPermissions : [];
    const permissions = Array.from(new Set([...(basePerms || []), ...delegated]));

    // Generate token
    const token = jwt.sign(
      { 
        id: doctor.id, 
        role: 'DOCTOR', 
        hospitalId: doctor.hospitalId, 
        permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { doctor, token, hospital };
  }

  /**
   * Get doctor profile with attendance and salary info
   */
  async getProfile(userId, hospitalId, req = null) {
    const doctor = await this.repository.findById(userId);

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    // Get today's attendance
    const today = localDateString();
    const attendance = await this.prisma.attendance.findFirst({
      where: { doctorId: userId, hospitalId, date: today }
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
      console.error('Doctor profile salary calc error:', err);
    }

    return { doctor, attendanceInfo, salaryInfo };
  }

  /**
   * Update doctor profile
   */
  async updateProfile(userId, hospitalId, updateData, file = null) {
    const doctor = await this.repository.findById(userId);

    if (!doctor || String(doctor.hospitalId) !== String(hospitalId)) {
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
   * Logout doctor
   */
  async logout(userId, hospitalId) {
    const doctor = await this.repository.findById(userId);

    if (!doctor || String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.updateLoginStatus(userId, false);
    return { message: 'Logged out successfully' };
  }

  /**
   * Soft delete doctor account
   */
  async deleteAccount(userId, hospitalId) {
    const doctor = await this.repository.findById(userId);

    if (!doctor || String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.softDelete(userId);
    return { message: 'Account deleted successfully. You cannot log in again.' };
  }

  /**
   * List doctors for hospital
   */
  async listDoctors(hospitalId, options = {}) {
    return this.repository.findAllByHospital(hospitalId, options);
  }

  /**
   * List doctors with pagination
   */
  async listDoctorsWithPagination(hospitalId, paginationParams) {
    return this.repository.findWithPagination(hospitalId, paginationParams);
  }

  /**
   * Get doctor by ID (admin view)
   */
  async getDoctorById(doctorId, hospitalId) {
    const doctor = await this.repository.findById(doctorId);

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    return doctor;
  }

  /**
   * Update doctor salary (admin)
   */
  async updateSalary(doctorId, hospitalId, salary) {
    const doctor = await this.repository.findById(doctorId);

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    const numSalary = Number(salary);
    if (isNaN(numSalary) || numSalary < 0) {
      throw new ValidationError('Invalid salary value');
    }

    await this.repository.updateSalary(doctorId, numSalary);
    return { message: 'Salary updated successfully' };
  }

  /**
   * Update delegated permissions (admin)
   */
  async updateDelegatedPermissions(doctorId, hospitalId, permissions) {
    const doctor = await this.repository.findById(doctorId);

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.updateDelegatedPermissions(doctorId, permissions);
    return { message: 'Permissions updated successfully' };
  }

  /**
   * Delete doctor (admin)
   */
  async deleteDoctor(doctorId, hospitalId) {
    const doctor = await this.repository.findById(doctorId);

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (String(doctor.hospitalId) !== String(hospitalId)) {
      throw new AuthorizationError('Unauthorized');
    }

    await this.repository.softDelete(doctorId);
    return { message: 'Doctor deleted successfully' };
  }
}

export default DoctorService;
