/**
 * Onboarding Service
 * Business logic for join requests, registration, and verification
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { 
  JoinRequestRepository, 
  RegistrationTokenRepository,
  VerificationRepository 
} from './onboarding.repository.js';
import { 
  formatJoinRequest,
  formatApplicationStatus,
  formatTokenValidation,
  formatVerificationsQueue,
  formatPublicHospital,
  parseJoinRequestInput,
  parseJoinApplicationInput
} from './onboarding.dto.js';
import { 
  validateJoinRequest,
  validateJoinApplication,
  validateOtp,
  validateTokenParams,
  validateVerificationType,
  validateEmailQuery
} from './onboarding.validators.js';
import { 
  ValidationError, 
  NotFoundError, 
  ForbiddenError,
  ConflictError 
} from '../../shared/exceptions/AppError.js';
import { 
  sendRegistrationInvite, 
  sendApprovalWithCredentials, 
  sendRejectionNotice, 
  sendEmailVerification,
  sendRegistrationConfirmation
} from '../../services/email.service.js';

export class OnboardingService {
  constructor(prisma) {
    this.prisma = prisma;
    this.joinRequestRepo = new JoinRequestRepository(prisma);
    this.tokenRepo = new RegistrationTokenRepository(prisma);
    this.verificationRepo = new VerificationRepository(prisma);
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Send email verification OTP
   */
  async sendEmailVerification(role, userId) {
    const model = role.toLowerCase() === 'admin' ? 'admin' 
      : role.toLowerCase() === 'doctor' ? 'doctor' 
      : 'employee';

    const user = await this.prisma[model].findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma[model].update({
      where: { id: userId },
      data: {
        emailVerificationOtpHash: otpHash,
        emailVerificationOtpExpiresAt: expiresAt,
        emailVerificationOtpUsed: false
      }
    });

    await sendEmailVerification(user.email, user.name || '', otp);

    return { message: 'OTP sent to email' };
  }

  /**
   * Verify email OTP
   */
  async verifyEmail(role, userId, otp) {
    validateOtp(otp);

    const model = role.toLowerCase() === 'admin' ? 'admin' 
      : role.toLowerCase() === 'doctor' ? 'doctor' 
      : 'employee';

    const user = await this.prisma[model].findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (!user.emailVerificationOtpHash || user.emailVerificationOtpHash !== otpHash) {
      throw new ValidationError('Invalid OTP');
    }

    if (!user.emailVerificationOtpExpiresAt || new Date(user.emailVerificationOtpExpiresAt) < new Date()) {
      throw new ValidationError('OTP expired');
    }

    await this.prisma[model].update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerificationOtpHash: null,
        emailVerificationOtpExpiresAt: null,
        emailVerificationOtpUsed: true
      }
    });

    return { message: 'Email verified successfully' };
  }

  // ==================== JOIN REQUESTS ====================

  /**
   * Submit join request
   */
  async submitJoinRequest(data) {
    const parsed = parseJoinRequestInput(data);
    validateJoinRequest(parsed);

    const hospital = await this.prisma.hospital.findUnique({ 
      where: { id: parsed.hospitalId } 
    });
    if (!hospital) {
      throw new NotFoundError('Hospital not found');
    }

    const existing = await this.joinRequestRepo.findByEmail(
      parsed.email, 
      parsed.hospitalId, 
      ['PENDING']
    );
    if (existing) {
      throw new ConflictError('You already have a pending request');
    }

    const joinRequest = await this.joinRequestRepo.create({
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      hospitalId: parsed.hospitalId,
      status: 'PENDING'
    });

    return {
      message: 'Join request submitted. Admin will review soon.',
      joinRequestId: joinRequest.id
    };
  }

  /**
   * Submit full join application
   */
  async submitJoinApplication(data, file = null) {
    const parsed = parseJoinApplicationInput(data, file);
    validateJoinApplication(parsed);

    const hospital = await this.prisma.hospital.findUnique({ 
      where: { id: parsed.hospitalId } 
    });
    if (!hospital) {
      throw new NotFoundError('Hospital not found');
    }

    const existing = await this.joinRequestRepo.findByEmail(
      parsed.email, 
      parsed.hospitalId, 
      ['PENDING', 'FORM_SUBMITTED']
    );
    if (existing) {
      throw new ConflictError('You already have a pending or submitted application');
    }

    const age = parsed.dob 
      ? Math.floor((Date.now() - new Date(parsed.dob)) / (365.25 * 24 * 3600 * 1000)) 
      : null;

    const joinRequest = await this.joinRequestRepo.create({
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      hospitalId: parsed.hospitalId,
      phone: parsed.phone,
      dob: parsed.dob,
      age,
      qualifications: parsed.qualifications,
      specialization: parsed.specialization,
      licenseNumber: parsed.licenseNumber,
      appliedRole: parsed.appliedRole,
      profilePic: parsed.profilePic,
      additionalInfo: parsed.additionalInfo,
      status: 'FORM_SUBMITTED',
      submittedAt: new Date()
    });

    return {
      message: 'Application submitted. Admin will review.',
      joinRequestId: joinRequest.id
    };
  }

  /**
   * Get join requests for hospital (admin)
   */
  async getJoinRequests(hospitalId) {
    const requests = await this.joinRequestRepo.findByHospital(hospitalId);
    return { joinRequests: requests.map(formatJoinRequest) };
  }

  /**
   * Get application status by email
   */
  async getApplicationStatus(email) {
    const validEmail = validateEmailQuery(email);

    const request = await this.joinRequestRepo.findLatestByEmail(validEmail);
    if (!request) {
      throw new NotFoundError('No application found for this email');
    }

    return formatApplicationStatus(request);
  }

  /**
   * Send registration invite
   */
  async sendRegistrationInvite(joinRequestId, hospitalId) {
    const joinRequest = await this.joinRequestRepo.findById(joinRequestId);
    if (!joinRequest) {
      throw new NotFoundError('Join request not found');
    }

    if (String(joinRequest.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    if (joinRequest.status !== 'PENDING') {
      throw new ValidationError('Request is not pending');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const registrationToken = await this.tokenRepo.create({
      token,
      email: joinRequest.email,
      role: joinRequest.role,
      hospitalId: joinRequest.hospitalId,
      joinRequestId: joinRequest.id,
      expiresAt,
      used: false
    });

    await this.joinRequestRepo.update(joinRequest.id, {
      status: 'INVITED',
      registrationTokenId: registrationToken.id
    });

    const hospital = await this.prisma.hospital.findUnique({ 
      where: { id: hospitalId } 
    });
    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register/${joinRequest.role.toLowerCase()}/${token}`;
    
    await sendRegistrationInvite(
      joinRequest.email, 
      joinRequest.name, 
      joinRequest.role, 
      hospital.hospitalName, 
      registrationLink
    );

    return {
      message: 'Invitation sent successfully',
      registrationTokenId: registrationToken.id,
      registrationLink
    };
  }

  /**
   * Reject join request
   */
  async rejectJoinRequest(joinRequestId, reason, hospitalId) {
    const joinRequest = await this.joinRequestRepo.findById(joinRequestId);
    if (!joinRequest) {
      throw new NotFoundError('Join request not found');
    }

    if (String(joinRequest.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    await this.joinRequestRepo.update(joinRequestId, {
      status: 'REJECTED',
      rejectionReason: reason || null
    });

    await sendRejectionNotice(joinRequest.email, joinRequest.name, joinRequest.role, reason);

    return { message: 'Request rejected' };
  }

  /**
   * Approve join request
   */
  async approveJoinRequest(joinRequestId, adminId, hospitalId) {
    const joinRequest = await this.joinRequestRepo.findById(joinRequestId);
    if (!joinRequest) {
      throw new NotFoundError('Join request not found');
    }

    if (String(joinRequest.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    if (joinRequest.status === 'APPROVED') {
      throw new ValidationError('Already approved');
    }

    const defaultPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    if (joinRequest.role === 'DOCTOR') {
      const existing = await this.prisma.doctor.findFirst({ 
        where: { email: joinRequest.email } 
      });
      if (existing) {
        throw new ConflictError('Doctor already exists with this email');
      }

      const doctor = await this.prisma.doctor.create({
        data: {
          name: joinRequest.name,
          email: joinRequest.email,
          phone: joinRequest.phone || '',
          hospitalId: joinRequest.hospitalId,
          specialization: joinRequest.specialization || joinRequest.appliedRole || '',
          profilePic: joinRequest.profilePic || '',
          password: hashedPassword,
          status: 'APPROVED',
          isActive: true,
          approvedBy: adminId,
          defaultPasswordIssued: true
        }
      });

      await this.joinRequestRepo.update(joinRequest.id, {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
        createdUserId: doctor.id
      });

      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor/login`;
      await sendApprovalWithCredentials(doctor.email, doctor.name, 'DOCTOR', loginUrl, defaultPassword);

      return { message: 'Doctor approved and account created', doctorId: doctor.id };
    }

    // EMPLOYEE
    const existing = await this.prisma.employee.findFirst({ 
      where: { email: joinRequest.email } 
    });
    if (existing) {
      throw new ConflictError('Employee already exists with this email');
    }

    const employee = await this.prisma.employee.create({
      data: {
        name: joinRequest.name,
        email: joinRequest.email,
        phone: joinRequest.phone || '',
        hospitalId: joinRequest.hospitalId,
        role: joinRequest.appliedRole || 'EMPLOYEE',
        qualification: joinRequest.qualifications?.length ? joinRequest.qualifications[0] : '',
        profilePic: joinRequest.profilePic || '',
        password: hashedPassword,
        status: 'APPROVED',
        isActive: true,
        approvedBy: adminId,
        defaultPasswordIssued: true
      }
    });

    await this.joinRequestRepo.update(joinRequest.id, {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminId,
      createdUserId: employee.id
    });

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/login`;
    await sendApprovalWithCredentials(employee.email, employee.name, 'EMPLOYEE', loginUrl, defaultPassword);

    return { message: 'Employee approved and account created', employeeId: employee.id };
  }

  // ==================== TOKEN REGISTRATION ====================

  /**
   * Validate registration token
   */
  async validateRegistrationToken(token, role) {
    validateTokenParams(token, role);

    const regToken = await this.tokenRepo.findValidToken(token, role);
    if (!regToken) {
      throw new ValidationError('Invalid or expired registration token');
    }

    const joinRequest = await this.joinRequestRepo.findById(regToken.joinRequestId);
    if (!joinRequest) {
      throw new ValidationError('Associated join request not found');
    }

    return formatTokenValidation(regToken, joinRequest);
  }

  /**
   * Register doctor with token
   */
  async registerDoctorWithToken(token, data) {
    const regToken = await this.tokenRepo.findValidToken(token, 'DOCTOR');
    if (!regToken) {
      throw new ValidationError('Invalid or expired registration token');
    }

    const existingDoctor = await this.prisma.doctor.findFirst({ 
      where: { email: regToken.email } 
    });
    if (existingDoctor) {
      throw new ConflictError('Doctor already registered with this email');
    }

    // Validate password and confirmPassword
    const { validatePasswordRegistration } = await import('./onboarding.validators.js');
    validatePasswordRegistration(data);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const doctor = await this.prisma.doctor.create({
      data: {
        name: data.name || 'Dr. ' + regToken.email.split('@')[0],
        email: regToken.email,
        phone: data.phone,
        specialization: data.specialization,
        qualification: data.qualification,
        password: hashedPassword,
        hospitalId: regToken.hospitalId,
        status: 'PENDING_VERIFICATION',
        isActive: false,
        profilePic: data.profilePhoto || '',
        accountNumber: data.bankDetails?.accountNumber || null,
        ifscCode: data.bankDetails?.ifscCode || null,
        defaultPasswordIssued: false
      }
    });

    await this.tokenRepo.markUsed(regToken.id, doctor.id);

    await this.joinRequestRepo.update(regToken.joinRequestId, {
      status: 'FORM_SUBMITTED',
      submittedAt: new Date()
    });

    // Get hospital name for confirmation email
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: regToken.hospitalId },
      select: { hospitalName: true }
    });

    // Send registration confirmation email
    await sendRegistrationConfirmation(
      doctor.email,
      doctor.name,
      'DOCTOR',
      hospital?.hospitalName || 'Hospital'
    ).catch(err => {
      console.error('Failed to send doctor registration confirmation email:', err.message);
      // Don't throw - email failure shouldn't block registration
    });

    return {
      message: 'Registration submitted. Awaiting admin verification.',
      doctorId: doctor.id
    };
  }

  /**
   * Register employee with token
   */
  async registerEmployeeWithToken(token, data) {
    const regToken = await this.tokenRepo.findValidToken(token, 'EMPLOYEE');
    if (!regToken) {
      throw new ValidationError('Invalid or expired registration token');
    }

    const existingEmployee = await this.prisma.employee.findFirst({ 
      where: { email: regToken.email } 
    });
    if (existingEmployee) {
      throw new ConflictError('Employee already registered with this email');
    }

    // Validate password and confirmPassword
    const { validatePasswordRegistration } = await import('./onboarding.validators.js');
    validatePasswordRegistration(data);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const employee = await this.prisma.employee.create({
      data: {
        name: data.name || regToken.email.split('@')[0],
        email: regToken.email,
        phone: data.phone,
        role: data.role,
        qualification: data.qualification,
        password: hashedPassword,
        hospitalId: regToken.hospitalId,
        status: 'PENDING_VERIFICATION',
        isActive: false,
        profilePic: data.profilePhoto || '',
        accountNumber: data.bankDetails?.accountNumber || null,
        ifscCode: data.bankDetails?.ifscCode || null,
        defaultPasswordIssued: false
      }
    });

    await this.tokenRepo.markUsed(regToken.id, employee.id);

    await this.joinRequestRepo.update(regToken.joinRequestId, {
      status: 'FORM_SUBMITTED',
      submittedAt: new Date()
    });

    // Get hospital name for confirmation email
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: regToken.hospitalId },
      select: { hospitalName: true }
    });

    // Send registration confirmation email
    await sendRegistrationConfirmation(
      employee.email,
      employee.name,
      'EMPLOYEE',
      hospital?.hospitalName || 'Hospital'
    ).catch(err => {
      console.error('Failed to send employee registration confirmation email:', err.message);
      // Don't throw - email failure shouldn't block registration
    });

    return {
      message: 'Registration submitted. Awaiting admin verification.',
      employeeId: employee.id
    };
  }

  // ==================== VERIFICATIONS ====================

  /**
   * Get verifications queue
   */
  async getVerificationsQueue(hospitalId) {
    const [pendingDoctors, pendingEmployees] = await Promise.all([
      this.verificationRepo.findPendingDoctors(hospitalId),
      this.verificationRepo.findPendingEmployees(hospitalId)
    ]);

    return formatVerificationsQueue(pendingDoctors, pendingEmployees);
  }

  /**
   * Approve verification
   */
  async approveVerification(type, userId, adminId, hospitalId) {
    const validType = validateVerificationType(type);

    const user = await this.prisma[validType].findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError(`${validType} not found`);
    }

    if (String(user.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    const defaultPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${validType}/login`;
    await sendApprovalWithCredentials(user.email, user.name, validType.toUpperCase(), loginUrl, defaultPassword);

    await this.prisma[validType].update({
      where: { id: userId },
      data: {
        status: 'APPROVED',
        isActive: true,
        approvedBy: adminId,
        password: hashedPassword
      }
    });

    return { message: `${validType} approved successfully` };
  }

  /**
   * Reject verification
   */
  async rejectVerification(type, userId, reason, hospitalId) {
    const validType = validateVerificationType(type);

    const user = await this.prisma[validType].findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError(`${validType} not found`);
    }

    if (String(user.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    await sendRejectionNotice(user.email, user.name, validType.toUpperCase(), reason);

    await this.prisma[validType].update({
      where: { id: userId },
      data: { status: 'REJECTED' }
    });

    return { message: `${validType} rejected` };
  }

  // ==================== PUBLIC ====================

  /**
   * List public hospitals
   */
  async listPublicHospitals() {
    const hospitals = await this.prisma.hospital.findMany({
      where: { isActive: true },
      select: { id: true, hospitalName: true, address: true }
    });

    return { hospitals: hospitals.map(formatPublicHospital) };
  }
}

export default OnboardingService;
