/**
 * Admin Service
 * Business logic for admin operations
 * 
 * Admin creation flow:
 * 1. First admin created via POST /api/setup/initiate + verify-otp (SUPER_ADMIN)
 * 2. Any admin can create up to 2 more admins via POST /api/admin/create-admin
 * 3. Max 3 admins total
 * 
 * Login flow (OTP verified):
 * 1. POST /api/admin/auth/login - Verify password, send OTP to email
 * 2. POST /api/admin/auth/verify-login-otp - Verify OTP, return JWT token
 * 
 * Superadmin restrictions:
 * - Cannot delete self
 * - Can edit self with OTP verification
 * - Full CRUD access for all other admins, doctors, employees
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { 
  AdminRepository, 
  HospitalRepository, 
  AssignmentRepository,
  FormTemplateRepository,
  PayrollRepository 
} from './admin.repository.js';
import { 
  formatAdminProfile, 
  formatAdminLoginResponse,
  formatHospitalProfile,
  formatEmployeeForAdmin,
  formatDoctorForAdmin,
  formatDashboardSummary,
  formatPresentTodayItem,
  formatAttendanceSummaryItem,
  formatAssignment,
  formatFormTemplate,
  formatPayrollDetails
} from '../controllers/admin.validators.js';
import { 
  validateAdminRegister,
  validateAdminLogin,
  validateProfileUpdate,
  validateSalaryUpdate,
  validateAssignmentCreate,
  validateDelegatedPermissions,
  validateHospitalUpdate,
  validateFormRole,
  validatePayrollInput
} from '../controllers/admin.validators.js';
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError,
  ConflictError 
} from '../shared/AppError.js';
import { getFileUrl, deleteLocalFile } from '../utils/file.utils.js';
import { getPermissionsForRole } from '../rbac/rolePermissions.js';
import { getRoleDisplayName } from '../utils/displayNames.js';
import { localDateString } from '../utils/date.utils.js';
import { calculateMonthlySalary } from '../services/salary.service.js';
import { hasOverlap } from '../utils/timeOverlap.js';
import { defaultDoctorFields, defaultEmployeeFields } from '../utils/defaultFormFields.js';
import { getDefaultFormSchema } from '../services/formTemplate.service.js';
import { sendOtpEmail, sendLoginOtpConfirmation, sendTransactionalEmail } from '../services/email.service.js';
import logger from '../utils/logger.js';

// OTP expires in 10 minutes
const OTP_EXPIRY_MINUTES = 10;

// Store pending login sessions (in production, use Redis)
const pendingLogins = new Map();

export class AdminService {
  constructor(prisma) {
    this.prisma = prisma;
    this.adminRepo = new AdminRepository(prisma);
    this.hospitalRepo = new HospitalRepository(prisma);
    this.assignmentRepo = new AssignmentRepository(prisma);
    this.formTemplateRepo = new FormTemplateRepository(prisma);
    this.payrollRepo = new PayrollRepository(prisma);
  }

  // ==================== HELPERS ====================

  /**
   * Generate 6-digit OTP
   */
  generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  /**
   * Hash OTP for secure storage
   */
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Mask email for privacy
   */
  maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : local[0] + '*';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Clean up expired login sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [key, value] of pendingLogins.entries()) {
      if (value.expiresAt < now) {
        pendingLogins.delete(key);
      }
    }
  }

  // ==================== AUTH ====================

  /**
   * Create additional admin (max 3 total)
   * Any existing admin can create more admins
   * Option to send credentials via email
   */
  async createAdmin(data, creatorId, hospitalId, sendCredentialsEmail = false) {
    // Validate input
    validateAdminRegister(data);

    // Check admin count (max 3)
    const adminCount = await this.adminRepo.count();
    if (adminCount >= 3) {
      throw new ForbiddenError('Maximum admin limit reached (3 admins allowed)');
    }

    // Check if email already exists
    const emailExists = await this.prisma.admin.findFirst({
      where: { email: data.email.toLowerCase() }
    });
    if (emailExists) {
      throw new ConflictError('An admin with this email already exists');
    }

    // Check if phone already exists
    const phoneExists = await this.prisma.admin.findFirst({
      where: { phone: data.phone.replace(/\D/g, '') }
    });
    if (phoneExists) {
      throw new ConflictError('An admin with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Get hospital info for email
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId }
    });

    // Create admin
    const admin = await this.prisma.admin.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.replace(/\D/g, ''),
        password: hashedPassword,
        role: 'ADMIN', // All additional admins get ADMIN role
        hospitalId: hospitalId,
        isOwner: false,
        emailVerified: true, // Auto-verify when created by admin
        registrationStep: 'COMPLETE',
        isPasswordChanged: false // Should change password on first login
      }
    });

    logger.info(`[Admin] New admin created: ${admin.email} by admin ID: ${creatorId}`);

    // Send credentials via email if requested
    let emailSent = false;
    if (sendCredentialsEmail) {
      const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      emailSent = await this.sendAdminCredentialsEmail(
        admin.email,
        admin.name,
        data.password, // Send plain password in email
        hospital?.hospitalName || 'Hospital',
        loginUrl
      );
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      createdAt: admin.createdAt,
      credentialsEmailSent: emailSent
    };
  }

  /**
   * Send credentials email to new admin
   */
  async sendAdminCredentialsEmail(email, name, password, hospitalName, loginUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome to ${hospitalName}!</h2>
        <p>Hi ${name},</p>
        <p>You have been added as an <strong>Admin</strong> to ${hospitalName}'s Hospital Management System.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <code style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Important:</strong> Please change your password immediately after your first login for security.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Login Now →
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 12px;">
          If you did not expect this email, please contact your administrator.
        </p>
      </div>
    `;

    try {
      await sendTransactionalEmail({
        to: email,
        subject: `Your Admin Account - ${hospitalName}`,
        htmlContent: html
      });
      logger.info(`[Admin] Credentials email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`[Admin] Failed to send credentials email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send credentials email manually (for existing admin)
   */
  async resendAdminCredentials(adminId, newPassword, requesterId) {
    const admin = await this.adminRepo.findByIdWithHospital(adminId);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { 
        password: hashedPassword,
        isPasswordChanged: false
      }
    });

    // Send email
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const emailSent = await this.sendAdminCredentialsEmail(
      admin.email,
      admin.name,
      newPassword,
      admin.hospital?.hospitalName || 'Hospital',
      loginUrl
    );

    logger.info(`[Admin] Credentials reset and emailed for ${admin.email} by admin ID: ${requesterId}`);

    return {
      success: true,
      email: admin.email,
      emailSent
    };
  }

  /**
   * Step 1: Admin login - verify password and send OTP
   */
  async initiateLogin(credentials) {
    validateAdminLogin(credentials);

    const admin = await this.adminRepo.findByEmailOrPhone(credentials.emailOrPhone);

    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    const isMatch = await bcrypt.compare(credentials.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if OTP is required (every 7 days)
    const now = new Date();
    const lastOtpVerifiedAt = admin.lastOtpVerifiedAt ? new Date(admin.lastOtpVerifiedAt) : null;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (lastOtpVerifiedAt && (now - lastOtpVerifiedAt) < SEVEN_DAYS_MS) {
      // No OTP required, login directly
      const permissions = getPermissionsForRole(admin.role || 'ADMIN');
      const token = jwt.sign(
        {
          id: admin.id,
          role: admin.role || 'ADMIN',
          hospitalId: admin.hospitalId,
          tenantId: admin.hospitalId,
          hospitalName: admin.hospital?.hospitalName,
          permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      logger.info(`[Admin] Login (no OTP needed) for ${admin.email}`);
      return formatAdminLoginResponse(admin, token);
    }

    // OTP required
    const otp = this.generateOTP();
    const hashedOTP = this.hashOTP(otp);
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Store pending login
    pendingLogins.set(sessionId, {
      adminId: admin.id,
      hashedOTP,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0
    });

    // Also store OTP in database for persistence
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        emailVerificationOTP: hashedOTP,
        emailVerificationOTPExpiry: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
      }
    });

    // Clean up expired sessions
    this.cleanupExpiredSessions();

    // Send OTP to admin email
    const emailSent = await sendOtpEmail(admin.email, admin.name, otp);

    if (!emailSent) {
      pendingLogins.delete(sessionId);
      throw new ValidationError('Failed to send OTP. Please try again.');
    }

    logger.info(`[Admin] Login OTP sent to ${admin.email}`);

    return {
      sessionId,
      email: this.maskEmail(admin.email),
      message: `Verification code sent to ${this.maskEmail(admin.email)}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
    };
  }

  /**
   * Step 2: Verify login OTP and return token
   */
  async verifyLoginOTP(sessionId, otp) {
    const session = pendingLogins.get(sessionId);

    if (!session) {
      throw new NotFoundError('Invalid or expired session. Please login again.');
    }

    // Check expiry
    if (Date.now() > session.expiresAt) {
      pendingLogins.delete(sessionId);
      throw new ValidationError('OTP has expired. Please login again.');
    }

    // Check max attempts (5 attempts)
    if (session.attempts >= 5) {
      pendingLogins.delete(sessionId);
      throw new ValidationError('Too many failed attempts. Please login again.');
    }

    // Verify OTP
    const hashedInputOTP = this.hashOTP(otp);
    if (hashedInputOTP !== session.hashedOTP) {
      session.attempts++;
      throw new ValidationError(`Invalid OTP. ${5 - session.attempts} attempts remaining.`);
    }

    // OTP verified - generate token
    const admin = await this.adminRepo.findByIdWithHospital(session.adminId);
    if (!admin) {
      pendingLogins.delete(sessionId);
      throw new NotFoundError('Admin not found');
    }


    // Clear OTP from database and update lastOtpVerifiedAt
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        emailVerificationOTP: null,
        emailVerificationOTPExpiry: null,
        lastOtpVerifiedAt: new Date()
      }
    });

    // Clean up session
    pendingLogins.delete(sessionId);

    const permissions = getPermissionsForRole(admin.role || 'ADMIN');

    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role || 'ADMIN',
        hospitalId: admin.hospitalId,
        tenantId: admin.hospitalId,
        hospitalName: admin.hospital?.hospitalName,
        permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info(`[Admin] Login successful for ${admin.email}`);

    // Send login confirmation email
    await sendLoginOtpConfirmation(
      admin.email,
      admin.name,
      admin.role || 'Admin'
    ).catch(err => {
      logger.error('Failed to send login confirmation email:', err.message);
      // Don't throw - email failure shouldn't block login
    });

    return formatAdminLoginResponse(admin, token);
  }

  /**
   * Resend login OTP
   */
  async resendLoginOTP(sessionId) {
    const session = pendingLogins.get(sessionId);

    if (!session) {
      throw new NotFoundError('Invalid or expired session. Please login again.');
    }

    const admin = await this.adminRepo.findById(session.adminId);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Generate new OTP
    const otp = this.generateOTP();
    session.hashedOTP = this.hashOTP(otp);
    session.expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    session.attempts = 0;

    // Update database
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        emailVerificationOTP: session.hashedOTP,
        emailVerificationOTPExpiry: new Date(session.expiresAt)
      }
    });

    // Send OTP
    const emailSent = await sendOtpEmail(admin.email, admin.name, otp);

    if (!emailSent) {
      throw new ValidationError('Failed to resend OTP. Please try again.');
    }

    logger.info(`[Admin] Login OTP resent to ${admin.email}`);

    return {
      message: `New verification code sent to ${this.maskEmail(admin.email)}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
    };
  }

  // ==================== PROFILE ====================

  /**
   * Get admin profile
   */
  async getProfile(adminId, req = null) {
    const admin = await this.adminRepo.findByIdWithHospital(adminId);
    
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    return formatAdminProfile(admin, req);
  }

  /**
   * Update admin profile
   */
  async updateProfile(adminId, data) {
    validateProfileUpdate(data);

    // Check email uniqueness
    if (data.email) {
      const conflict = await this.prisma.admin.findFirst({
        where: { email: data.email, NOT: { id: adminId } }
      });
      if (conflict) throw new ConflictError('Email already in use');
    }

    // Check phone uniqueness
    if (data.phone) {
      const conflict = await this.prisma.admin.findFirst({
        where: { phone: data.phone, NOT: { id: adminId } }
      });
      if (conflict) throw new ConflictError('Phone already in use');
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.address !== undefined) updateData.address = data.address;

    return this.adminRepo.update(adminId, updateData);
  }

  /**
   * Update admin profile photo
   */
  async updateProfilePhoto(adminId, file) {
    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    const admin = await this.adminRepo.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Delete old photo if local
    deleteLocalFile(admin.profilePhoto);

    const profilePhotoUrl = getFileUrl(file);
    if (!profilePhotoUrl) {
      throw new ValidationError('Failed to process uploaded file');
    }

    const updated = await this.adminRepo.update(adminId, { 
      profilePhoto: profilePhotoUrl 
    });

    return { 
      message: 'Profile photo updated', 
      profilePhoto: updated.profilePhoto 
    };
  }

  /**
   * Delete admin by ID
   * SUPER_ADMIN cannot delete themselves
   * Only SUPER_ADMIN can delete other admins
   */
  async deleteAdmin(adminId, requesterId, requesterRole) {
    // Get requester info
    const requester = await this.adminRepo.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('Requester admin not found');
    }

    // Only SUPER_ADMIN can delete admins
    if (requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Only SUPER_ADMIN can delete other admins');
    }

    // Check if at least one admin remains
    const adminCount = await this.adminRepo.count();
    if (adminCount <= 1) {
      throw new ValidationError('At least one admin must exist');
    }

    const target = await this.adminRepo.findById(adminId);
    if (!target) {
      throw new NotFoundError('Admin not found');
    }

    // SUPER_ADMIN cannot delete themselves
    if (String(requesterId) === String(adminId)) {
      throw new ForbiddenError('SUPER_ADMIN cannot delete themselves. Transfer ownership first or contact system support.');
    }

    await this.adminRepo.delete(adminId);

    logger.info(`[Admin] Admin ${target.email} deleted by SUPER_ADMIN ${requester.email}`);

    return {
      message: 'Admin removed successfully',
      deletedAdmin: {
        id: target.id,
        email: target.email,
        name: target.name
      }
    };
  }

  // ==================== SUPER_ADMIN PROFILE UPDATE WITH OTP ====================

  /**
   * Initiate profile update for SUPER_ADMIN (requires OTP)
   */
  async initiateProfileUpdate(adminId, updateData) {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Only SUPER_ADMIN requires OTP for profile update
    if (admin.role !== 'SUPER_ADMIN') {
      // Regular admins can update directly
      return { requiresOTP: false };
    }

    // Generate OTP
    const otp = this.generateOTP();
    const hashedOTP = this.hashOTP(otp);
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Store pending update
    pendingLogins.set(`profile_${sessionId}`, {
      adminId: admin.id,
      updateData,
      hashedOTP,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0
    });

    // Send OTP
    const emailSent = await sendOtpEmail(admin.email, admin.name, otp);
    if (!emailSent) {
      pendingLogins.delete(`profile_${sessionId}`);
      throw new ValidationError('Failed to send OTP. Please try again.');
    }

    logger.info(`[Admin] Profile update OTP sent to SUPER_ADMIN ${admin.email}`);

    return {
      requiresOTP: true,
      sessionId,
      message: `Verification code sent to ${this.maskEmail(admin.email)}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
    };
  }

  /**
   * Verify OTP and complete SUPER_ADMIN profile update
   */
  async verifyProfileUpdateOTP(sessionId, otp) {
    const session = pendingLogins.get(`profile_${sessionId}`);

    if (!session) {
      throw new NotFoundError('Invalid or expired session. Please try again.');
    }

    if (Date.now() > session.expiresAt) {
      pendingLogins.delete(`profile_${sessionId}`);
      throw new ValidationError('OTP has expired. Please try again.');
    }

    if (session.attempts >= 5) {
      pendingLogins.delete(`profile_${sessionId}`);
      throw new ValidationError('Too many failed attempts. Please try again.');
    }

    const hashedInputOTP = this.hashOTP(otp);
    if (hashedInputOTP !== session.hashedOTP) {
      session.attempts++;
      throw new ValidationError(`Invalid OTP. ${5 - session.attempts} attempts remaining.`);
    }

    // OTP verified - perform update
    const updatedAdmin = await this.updateProfile(session.adminId, session.updateData);

    // Clean up session
    pendingLogins.delete(`profile_${sessionId}`);

    logger.info(`[Admin] SUPER_ADMIN profile updated with OTP verification`);

    return updatedAdmin;
  }

  // ==================== STAFF MANAGEMENT ====================

  /**
   * Get all employees
   */
  async getAllEmployees(hospitalId) {
    const employees = await this.prisma.employee.findMany({ 
      where: { hospitalId } 
    });

    const payrolls = await this.prisma.payroll.findMany({
      where: { employeeId: { not: null }, hospitalId }
    });

    const paidMap = payrolls.reduce((acc, p) => {
      acc[String(p.userId)] = p.paid;
      return acc;
    }, {});

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const results = [];
    for (const emp of employees) {
      try {
        const salaryInfo = await calculateMonthlySalary(emp.id, year, month);
        results.push(formatEmployeeForAdmin(emp, salaryInfo, !!paidMap[String(emp.id)]));
      } catch (err) {
        results.push(formatEmployeeForAdmin(emp, null, !!paidMap[String(emp.id)]));
      }
    }

    return results;
  }

  /**
   * Get all doctors
   */
  async getAllDoctors(hospitalId) {
    const doctors = await this.prisma.doctor.findMany({ 
      where: { hospitalId } 
    });

    const payrolls = await this.prisma.payroll.findMany({
      where: { doctorId: { not: null }, hospitalId }
    });

    const paidMap = payrolls.reduce((acc, p) => {
      acc[String(p.userId)] = p.paid;
      return acc;
    }, {});

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const results = [];
    for (const doc of doctors) {
      try {
        const salaryInfo = await calculateMonthlySalary(doc.id, year, month);
        results.push(formatDoctorForAdmin(doc, salaryInfo, !!paidMap[String(doc.id)]));
      } catch (err) {
        results.push(formatDoctorForAdmin(doc, null, !!paidMap[String(doc.id)]));
      }
    }

    return results;
  }

  /**
   * Get employee profile by admin
   */
  async getEmployeeProfile(employeeId, hospitalId) {
    const employee = await this.prisma.employee.findUnique({ 
      where: { id: employeeId } 
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (String(employee.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Unauthorized');
    }

    const presentToday = await this.computePresentToday(employeeId, 'EMPLOYEE');

    try {
      const now = new Date();
      const salaryInfo = await calculateMonthlySalary(employeeId, now.getFullYear(), now.getMonth() + 1);
      return { ...employee, presentToday, ...salaryInfo };
    } catch (err) {
      return { ...employee, presentToday };
    }
  }

  /**
   * Get doctor profile by admin
   */
  async getDoctorProfile(doctorId, hospitalId) {
    const doctor = await this.prisma.doctor.findUnique({ 
      where: { id: doctorId } 
    });

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (String(doctor.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Unauthorized');
    }

    const presentToday = await this.computePresentToday(doctorId, 'DOCTOR');

    try {
      const now = new Date();
      const salaryInfo = await calculateMonthlySalary(doctorId, now.getFullYear(), now.getMonth() + 1);
      return { ...doctor, presentToday, ...salaryInfo };
    } catch (err) {
      return { ...doctor, presentToday };
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(employeeId, hospitalId) {
    const employee = await this.prisma.employee.findUnique({ 
      where: { id: employeeId } 
    });

    if (!employee || String(employee.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Unauthorized');
    }

    await this.prisma.employee.delete({ where: { id: employeeId } });
    return { message: 'Employee removed successfully' };
  }

  /**
   * Delete doctor
   */
  async deleteDoctor(doctorId, hospitalId) {
    const doctor = await this.prisma.doctor.findUnique({ 
      where: { id: doctorId } 
    });

    if (!doctor || String(doctor.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Unauthorized');
    }

    await this.prisma.doctor.delete({ where: { id: doctorId } });
    return { message: 'Doctor removed successfully' };
  }

  /**
   * Update employee salary
   */
  async updateEmployeeSalary(employeeId, salary, hospitalId) {
    const validSalary = validateSalaryUpdate(salary);

    const employee = await this.prisma.employee.findUnique({ 
      where: { id: employeeId } 
    });

    if (!employee || String(employee.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Unauthorized');
    }

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { salary: validSalary }
    });
  }

  /**
   * Update doctor salary
   */
  async updateDoctorSalary(doctorId, salary, hospitalId) {
    const validSalary = validateSalaryUpdate(salary);

    const doctor = await this.prisma.doctor.findUnique({ 
      where: { id: doctorId } 
    });

    if (!doctor || String(doctor.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Unauthorized');
    }

    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: { salary: validSalary }
    });
  }

  // ==================== DASHBOARD ====================

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(hospitalId) {
    const today = localDateString();

    const [employeesCount, doctorsCount] = await Promise.all([
      this.prisma.employee.count({ where: { hospitalId } }),
      this.prisma.doctor.count({ where: { hospitalId } })
    ]);

    const presentRecords = await this.prisma.attendance.findMany({
      where: { hospitalId, date: today },
      include: { sessions: true }
    });

    const presentUserIds = presentRecords
      .filter(r => r.sessions && r.sessions.some(s => s.checkInTime && !s.checkOutTime))
      .map(r => r.role === 'DOCTOR' ? r.doctorId : r.employeeId)
      .filter(Boolean);

    const presentTodayCount = new Set(presentUserIds).size;

    let totalPatientsServed = 0;
    try {
      totalPatientsServed = await this.prisma.patient.count({ where: { hospitalId } });
      if (!totalPatientsServed) {
        const bills = await this.prisma.bill.findMany({ 
          where: { hospitalId }, 
          select: { patientId: true } 
        });
        totalPatientsServed = new Set(bills.map(b => b.patientId)).size;
      }
    } catch {
      const bills = await this.prisma.bill.findMany({ 
        where: { hospitalId }, 
        select: { patientId: true } 
      });
      totalPatientsServed = new Set(bills.map(b => b.patientId)).size;
    }

    return formatDashboardSummary({
      employeesCount,
      doctorsCount,
      presentTodayCount,
      totalPatientsServed
    });
  }

  /**
   * Get today's attendance summary
   */
  async getTodayAttendanceSummary(hospitalId) {
    const today = localDateString();

    const records = await this.prisma.attendance.findMany({
      where: { date: today, hospitalId },
      include: { sessions: true }
    });

    const map = {};
    records.forEach((rec) => {
      const userId = rec.role === 'DOCTOR' ? rec.doctorId : rec.employeeId;
      if (!userId) return;

      map[String(userId)] = formatAttendanceSummaryItem(userId, rec.sessions || []);
    });

    return map;
  }

  /**
   * Get present today list
   */
  async getPresentToday(hospitalId) {
    const today = localDateString();

    const records = await this.prisma.attendance.findMany({
      where: { date: today, hospitalId },
      include: { sessions: true },
      take: 1000
    });

    const presentRecords = records.filter(
      r => r.sessions && r.sessions.some(s => s.checkInTime && !s.checkOutTime)
    );

    const empRecords = presentRecords.filter(r => r.role === 'EMPLOYEE');
    const docRecords = presentRecords.filter(r => r.role === 'DOCTOR');

    const empIds = empRecords.map(r => r.employeeId).filter(Boolean);
    const docIds = docRecords.map(r => r.doctorId).filter(Boolean);

    const [employeesDocs, doctorsDocs] = await Promise.all([
      empIds.length ? this.prisma.employee.findMany({
        where: { id: { in: empIds } },
        select: { id: true, name: true, role: true }
      }) : Promise.resolve([]),
      docIds.length ? this.prisma.doctor.findMany({
        where: { id: { in: docIds } },
        select: { id: true, name: true, specialization: true }
      }) : Promise.resolve([])
    ]);

    const attMap = presentRecords.reduce((acc, r) => {
      const userId = r.role === 'DOCTOR' ? r.doctorId : r.employeeId;
      if (!userId) return acc;
      acc[String(userId)] = formatAttendanceSummaryItem(userId, r.sessions || []);
      return acc;
    }, {});

    const employees = employeesDocs.map(e => 
      formatPresentTodayItem(e, attMap[String(e.id)], false)
    );

    const doctors = doctorsDocs.map(d => ({
      ...formatPresentTodayItem(d, attMap[String(d.id)], true),
      specialization: getRoleDisplayName ? getRoleDisplayName(d.specialization) : d.specialization
    }));

    return { success: true, employees, doctors };
  }

  // ==================== PERMISSIONS ====================

  /**
   * Set delegated permissions
   */
  async setDelegatedPermissions(userId, permissions, requester) {
    validateDelegatedPermissions(permissions);

    if (!['TENANT_ADMIN', 'SUPER_ADMIN'].includes(requester.role)) {
      throw new ForbiddenError('Only tenant admins may assign delegated permissions');
    }

    const allowed = new Set(getPermissionsForRole(requester.role));
    const toAssign = permissions.filter(p => allowed.has(p));

    if (toAssign.length === 0) {
      throw new ValidationError('No valid permissions to assign');
    }

    let user = await this.prisma.employee.findUnique({ where: { id: userId } });
    let userType = 'employee';
    if (!user) {
      user = await this.prisma.doctor.findUnique({ where: { id: userId } });
      userType = 'doctor';
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (String(user.hospitalId) !== String(requester.hospitalId) && requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Unauthorized: user belongs to different tenant');
    }

    const updated = await this.prisma[userType].update({
      where: { id: userId },
      data: {
        delegatedPermissions: Array.from(new Set([...(user.delegatedPermissions || []), ...toAssign]))
      }
    });

    return { message: 'Delegated permissions updated', user: updated };
  }

  /**
   * Get delegated permissions
   */
  async getDelegatedPermissions(userId, hospitalId, requesterRole) {
    let user = await this.prisma.employee.findUnique({
      where: { id: userId },
      select: { delegatedPermissions: true, hospitalId: true }
    });
    
    if (!user) {
      user = await this.prisma.doctor.findUnique({
        where: { id: userId },
        select: { delegatedPermissions: true, hospitalId: true }
      });
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (String(user.hospitalId) !== String(hospitalId) && requesterRole !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Unauthorized');
    }

    return { delegatedPermissions: user.delegatedPermissions || [] };
  }

  // ==================== HOSPITAL ====================

  /**
   * Get hospital profile
   */
  async getHospitalProfile(hospitalId, req = null) {
    if (!hospitalId) {
      throw new ValidationError('Admin not associated with a hospital');
    }

    const hospital = await this.hospitalRepo.findById(hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital not found');
    }

    return formatHospitalProfile(hospital, req);
  }

  /**
   * Update hospital profile
   */
  async updateHospitalProfile(hospitalId, data) {
    if (!hospitalId) {
      throw new ValidationError('Admin not associated with a hospital');
    }

    validateHospitalUpdate(data);

    const updateData = {};
    const fields = [
      'hospitalName', 'registrationType', 'registrationNumber',
      'address', 'city', 'state', 'country', 'contactEmail', 'contactPhone'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const updated = await this.hospitalRepo.update(hospitalId, updateData);
    return { message: 'Hospital profile updated', hospital: updated };
  }

  /**
   * Update hospital logo
   */
  async updateHospitalLogo(hospitalId, file) {
    if (!hospitalId) {
      throw new ValidationError('Admin not associated with a hospital');
    }

    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    const hospital = await this.hospitalRepo.findById(hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital not found');
    }

    deleteLocalFile(hospital.logo);

    const logoUrl = getFileUrl(file);
    if (!logoUrl) {
      throw new ValidationError('Failed to process uploaded file');
    }

    const updated = await this.hospitalRepo.update(hospitalId, { logo: logoUrl });
    return { message: 'Hospital logo updated', logo: updated.logo };
  }

  // ==================== ASSIGNMENTS ====================

  /**
   * Create assignment
   */
  async createAssignment(data, adminId, hospitalId) {
    validateAssignmentCreate(data);

    // Validate assignee
    if (data.assigneeType === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: data.assigneeId }
      });
      if (!doctor || doctor.status !== 'Active' || String(doctor.hospitalId) !== String(hospitalId)) {
        throw new ValidationError('Doctor not available');
      }
    } else {
      const emp = await this.prisma.employee.findUnique({
        where: { id: data.assigneeId }
      });
      if (!emp || emp.status !== 'Active' || String(emp.hospitalId) !== String(hospitalId)) {
        throw new ValidationError('Employee not available');
      }
    }

    // Check overlap
    const existing = await this.assignmentRepo.findByAssignee(
      hospitalId, 
      data.assigneeType, 
      data.assigneeId
    );

    if (hasOverlap(existing, new Date(data.startDateTime), new Date(data.endDateTime))) {
      throw new ConflictError('Overlapping assignment detected');
    }

    const assignment = await this.assignmentRepo.create({
      hospitalId,
      assigneeType: data.assigneeType,
      assigneeId: data.assigneeId,
      title: data.title,
      description: data.description,
      department: data.department,
      startDateTime: new Date(data.startDateTime),
      endDateTime: new Date(data.endDateTime),
      shiftType: data.shiftType,
      createdBy: adminId
    });

    return { message: 'Assignment created', assignment: formatAssignment(assignment) };
  }

  /**
   * Get assignments for user
   */
  async getAssignmentsForUser(userId, role, hospitalId) {
    const where = { hospitalId };

    if (role === 'DOCTOR') {
      where.assigneeType = 'DOCTOR';
      where.assigneeId = userId;
    } else if (role === 'EMPLOYEE') {
      where.assigneeType = 'EMPLOYEE';
      where.assigneeId = userId;
    }

    const assignments = await this.prisma.assignment.findMany({
      where,
      orderBy: { startDateTime: 'asc' }
    });

    return assignments.map(formatAssignment);
  }

  // ==================== FORM TEMPLATES ====================

  /**
   * Get default form schema
   */
  getDefaultSchema(role) {
    const validRole = validateFormRole(role);
    return { defaultSchema: getDefaultFormSchema(validRole) };
  }

  /**
   * Initialize form template
   */
  async initializeForm(role, hospitalId, adminId) {
    const validRole = validateFormRole(role);

    const admin = await this.adminRepo.findById(adminId);
    if (!admin || admin.hospitalId !== hospitalId) {
      throw new ForbiddenError('Forbidden');
    }

    let template = await this.formTemplateRepo.findByHospitalAndType(hospitalId, validRole);

    if (!template) {
      template = await this.formTemplateRepo.create({
        hospitalId,
        type: validRole,
        fields: getDefaultFormSchema(validRole)
      });
    }

    return template;
  }

  /**
   * Get form template
   */
  async getFormTemplate(role, hospitalId) {
    const validRole = validateFormRole(role);

    let template = await this.formTemplateRepo.findByHospitalAndType(hospitalId, validRole);

    if (!template) {
      const fields = validRole === 'DOCTOR' ? defaultDoctorFields : defaultEmployeeFields;
      template = await this.formTemplateRepo.create({
        hospitalId,
        type: validRole,
        name: `${validRole} Registration`,
        schema: fields
      });
    }

    return formatFormTemplate(template);
  }

  /**
   * Get all form template fields for editing
   */
  async getFormTemplateFields(role, hospitalId) {
    const validRole = validateFormRole(role);

    let template = await this.formTemplateRepo.findByHospitalAndType(hospitalId, validRole);

    if (!template) {
      const fields = validRole === 'DOCTOR' ? defaultDoctorFields : defaultEmployeeFields;
      template = await this.formTemplateRepo.create({
        hospitalId,
        type: validRole,
        name: `${validRole} Registration`,
        schema: fields
      });
    }

    return {
      templateId: template.id,
      role: validRole,
      fields: (template.schema || []).sort((a, b) => (a.order || 0) - (b.order || 0))
    };
  }

  /**
   * Update form template (all fields)
   */
  async updateFormTemplate(role, hospitalId, fields) {
    const validRole = validateFormRole(role);

    if (!Array.isArray(fields)) {
      throw new ValidationError('Fields must be an array');
    }

    // Sanitize and validate fields
    const sanitized = fields.map((f, idx) => ({
      id: f.id || `field_${validRole.toLowerCase()}_${Date.now()}_${idx}`,
      fieldName: f.fieldName || f.id || `field_${idx}`,
      fieldLabel: f.fieldLabel || '',
      fieldType: String(f.fieldType || 'text').toLowerCase(),
      isRequired: !!f.isRequired,
      isEnabled: f.isEnabled !== false,
      placeholder: f.placeholder || '',
      helpText: f.helpText || '',
      options: Array.isArray(f.options) ? f.options : (typeof f.options === 'string' ? f.options.split(',').map(s => s.trim()).filter(Boolean) : []),
      validation: f.validation || null,
      order: typeof f.order === 'number' ? f.order : idx + 1
    }));

    const updated = await this.formTemplateRepo.update(hospitalId, validRole, { schema: sanitized });

    return formatFormTemplate(updated);
  }

  /**
   * Update a single form field
   */
  async updateFormField(role, fieldId, hospitalId, updateData) {
    const validRole = validateFormRole(role);

    const template = await this.formTemplateRepo.findByHospitalAndType(hospitalId, validRole);
    if (!template) {
      throw new NotFoundError('Form template not found');
    }

    const fields = template.schema || [];
    const fieldIndex = fields.findIndex(f => f.id === fieldId);

    if (fieldIndex === -1) {
      throw new NotFoundError('Field not found');
    }

    // Update field properties
    const field = fields[fieldIndex];
    Object.assign(field, updateData);

    const updated = await this.formTemplateRepo.update(hospitalId, validRole, { schema: fields });

    return {
      field: field,
      message: 'Field updated'
    };
  }

  /**
   * Add custom field to form template
   */
  async addFormField(role, hospitalId, fieldData) {
    const validRole = validateFormRole(role);
    const { fieldName, fieldLabel, fieldType, isRequired, options, placeholder, helpText, validation } = fieldData;

    if (!fieldName || !fieldLabel || !fieldType) {
      throw new ValidationError('fieldName, fieldLabel, and fieldType are required');
    }

    let template = await this.formTemplateRepo.findByHospitalAndType(hospitalId, validRole);

    if (!template) {
      const fields = validRole === 'DOCTOR' ? defaultDoctorFields : defaultEmployeeFields;
      template = await this.formTemplateRepo.create({
        hospitalId,
        type: validRole,
        name: `${validRole} Registration`,
        schema: fields
      });
    }

    const newField = {
      id: `field_${validRole.toLowerCase()}_${fieldName}_${Date.now()}`,
      fieldName,
      fieldLabel,
      fieldType: String(fieldType).toLowerCase(),
      isRequired: !!isRequired,
      isEnabled: true,
      placeholder: placeholder || '',
      helpText: helpText || '',
      options: Array.isArray(options) ? options : (options ? String(options).split(',').map(s => s.trim()).filter(Boolean) : []),
      validation: validation || null,
      order: ((template.schema || []).length) + 1
    };

    const fields = template.schema || [];
    fields.push(newField);

    const updated = await this.formTemplateRepo.update(hospitalId, validRole, { schema: fields });

    return {
      field: newField,
      message: 'Custom field added'
    };
  }

  /**
   * Delete a custom form field
   */
  async deleteFormField(role, fieldId, hospitalId) {
    const validRole = validateFormRole(role);

    const template = await this.formTemplateRepo.findByHospitalAndType(hospitalId, validRole);
    if (!template) {
      throw new NotFoundError('Form template not found');
    }

    const field = (template.schema || []).find(f => f.id === fieldId);
    if (!field) {
      throw new NotFoundError('Field not found');
    }

    // Prevent deletion of default fields
    const defaultFieldNames = [
      'profilePhoto', 'fullName', 'dateOfBirth', 'age', 'email', 'mobileNumber',
      'qualification', 'specialization', 'medicalLicenseNumber', 'roleApplied'
    ];

    if (defaultFieldNames.includes(field.fieldName)) {
      throw new ForbiddenError('Cannot delete default form fields');
    }

    const updatedFields = (template.schema || []).filter(f => f.id !== fieldId);
    const updated = await this.formTemplateRepo.update(hospitalId, validRole, { schema: updatedFields });

    return {
      message: 'Field deleted successfully'
    };
  }

  // ==================== HELPERS ====================

  /**
   * Compute if user is present today
   */
  async computePresentToday(userId, role = 'EMPLOYEE') {
    const today = localDateString();
    const whereClause = { date: today };

    if (role === 'DOCTOR') {
      whereClause.doctorId = userId;
    } else {
      whereClause.employeeId = userId;
    }

    const record = await this.prisma.attendance.findFirst({ where: whereClause });
    if (!record) return false;

    const sessions = await this.prisma.attendanceSession.findMany({
      where: { attendanceId: record.id }
    });

    return sessions.some(s => s.checkInTime && !s.checkOutTime);
  }
}

export default AdminService;



















