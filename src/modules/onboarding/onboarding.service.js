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
  formatJoinRequestDetails,
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
} from '../../services/email.service.js';import { EMPLOYEE_ROLES } from '../../constants/roles.js';
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
      appliedRole: parsed.appliedRole, // Now captured for EMPLOYEE role
      specialization: parsed.specialization, // Now captured for DOCTOR role
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
   * Get a single join request by id (admin)
   */
  async getJoinRequest(joinRequestId, hospitalId) {
    const joinRequest = await this.joinRequestRepo.findById(joinRequestId);
    if (!joinRequest) {
      throw new NotFoundError('Join request not found');
    }

    if (String(joinRequest.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    // Return role-specific formatted join request
    return { joinRequest: formatJoinRequestDetails(joinRequest) };
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
   * @param appliedRoleOverride - Optional: provide appliedRole if legacy request is missing it
   */
  async approveJoinRequest(joinRequestId, adminId, hospitalId, appliedRoleOverride = null) {
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

      // Check if phone is already used by another doctor
      const phoneExists = await this.prisma.doctor.findFirst({
        where: { 
          phone: joinRequest.phone || '',
          NOT: { id: undefined } // Ensure we find any existing records
        }
      });
      if (phoneExists) {
        throw new ConflictError('Doctor already exists with this phone number');
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
          status: 'ACTIVE',
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

    // Check if phone is already used by another employee
    const phoneExists = await this.prisma.employee.findFirst({
      where: { 
        phone: joinRequest.phone || '',
        NOT: { id: undefined } // Ensure we find any existing records
      }
    });
    if (phoneExists) {
      throw new ConflictError('Employee already exists with this phone number');
    }

    // Validate that appliedRole is set - allow override for legacy requests
    // First check if appliedRole exists at root level
    let effectiveAppliedRole = joinRequest.appliedRole;
    
    // If not, try to extract from formData (for legacy requests or recent registrations)
    if (!effectiveAppliedRole && joinRequest.formData) {
      const formDataObj = typeof joinRequest.formData === 'string' 
        ? JSON.parse(joinRequest.formData) 
        : joinRequest.formData;
      
      // Check both new and old field names in formData
      effectiveAppliedRole = formDataObj?.roleApplied || 
                             formDataObj?.roleAppliedFor || 
                             formDataObj?.appliedRole || 
                             formDataObj?.role_applied_for || null;
      
      if (effectiveAppliedRole) {
        console.log('[DEBUG] Extracted appliedRole from formData:', effectiveAppliedRole);
      }
    }
    
    // If not, try to use the admin-provided override from request body
    if (!effectiveAppliedRole && appliedRoleOverride) {
      effectiveAppliedRole = appliedRoleOverride;
    }
    
    // If still no appliedRole, check if one exists in specialization field (legacy compatibility)
    if (!effectiveAppliedRole && joinRequest.role === 'EMPLOYEE') {
      // For legacy records where appliedRole might not be set, check common patterns
      if (joinRequest.specialization && EMPLOYEE_ROLES.includes(String(joinRequest.specialization).toUpperCase())) {
        effectiveAppliedRole = joinRequest.specialization;
      }
    }
    
    // Final validation - appliedRole is absolutely required for EMPLOYEE approval
    if (!effectiveAppliedRole) {
      throw new ValidationError(
        `Cannot approve employee: Applied role is missing from join request. ` +
        `Please provide appliedRole in the approval request body.\n\n` +
        `Example: POST /api/onboarding/admin/join-requests/${joinRequestId}/approve\n` +
        `Body: { "appliedRole": "NURSE" }\n\n` +
        `Valid values: ${EMPLOYEE_ROLES.join(', ')}\n\n` +
        `Alternatively, update the join request first using:\n` +
        `PUT /api/onboarding/admin/join-requests/${joinRequestId}\n` +
        `Body: { "appliedRole": "NURSE" }`
      );
    }

    // Validate that the provided appliedRole is valid
    if (!EMPLOYEE_ROLES.includes(String(effectiveAppliedRole).toUpperCase())) {
      throw new ValidationError(
        `Invalid applied role: ${effectiveAppliedRole}. Must be one of: ${EMPLOYEE_ROLES.join(', ')}`
      );
    }

    // Normalize legacy role names and common variations
    let normalizedAppliedRole = String(effectiveAppliedRole).toUpperCase().trim();
    if (normalizedAppliedRole === 'NURSE_OPD' || normalizedAppliedRole === 'NURSE_IPD') {
      normalizedAppliedRole = 'NURSE';
    }

    const employee = await this.prisma.employee.create({
      data: {
        name: joinRequest.name,
        email: joinRequest.email,
        phone: joinRequest.phone || '',
        hospitalId: joinRequest.hospitalId,
        role: normalizedAppliedRole,
        qualification: joinRequest.qualifications?.length ? joinRequest.qualifications[0] : '',
        profilePic: joinRequest.profilePic || '',
        password: hashedPassword,
        status: 'ACTIVE',
        isActive: true,
        approvedBy: adminId,
        defaultPasswordIssued: true
      }
    });

    // Update join request with approval details AND save the appliedRole
    await this.joinRequestRepo.update(joinRequest.id, {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminId,
      createdUserId: employee.id,
      appliedRole: normalizedAppliedRole // Save the resolved appliedRole to the root level
    });

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/login`;
    await sendApprovalWithCredentials(employee.email, employee.name, 'EMPLOYEE', loginUrl, defaultPassword);

    return { message: 'Employee approved and account created', employeeId: employee.id };
  }

  /**
   * Update join request (admin can fix missing fields before approval)
   */
  async updateJoinRequest(joinRequestId, data, hospitalId) {
    const joinRequest = await this.joinRequestRepo.findById(joinRequestId);
    if (!joinRequest) {
      throw new NotFoundError('Join request not found');
    }

    if (String(joinRequest.hospitalId) !== String(hospitalId)) {
      throw new ForbiddenError('Access denied');
    }

    // Only allow updates on pending/form-submitted requests
    if (!['PENDING', 'FORM_SUBMITTED'].includes(joinRequest.status)) {
      throw new ValidationError(
        `Cannot update request with status '${joinRequest.status}'. ` +
        `Only PENDING and FORM_SUBMITTED requests can be updated.`
      );
    }

    // If updating appliedRole, validate it
    if (data.appliedRole) {
      const normalized = String(data.appliedRole).toUpperCase().trim();
      if (!EMPLOYEE_ROLES.includes(normalized) && 
          normalized !== 'NURSE_OPD' && normalized !== 'NURSE_IPD') {
        throw new ValidationError(
          `Invalid appliedRole. Must be one of: ${EMPLOYEE_ROLES.join(', ')}`
        );
      }
    }

    const updateData = {};
    if (data.appliedRole !== undefined) updateData.appliedRole = data.appliedRole;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.qualifications !== undefined) updateData.qualifications = data.qualifications;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber;
    if (data.additionalInfo !== undefined) updateData.additionalInfo = data.additionalInfo;

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const updated = await this.joinRequestRepo.update(joinRequestId, updateData);
    return {
      message: 'Join request updated successfully',
      joinRequest: updated
    };
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

    // Validate that role is set and is not the generic EMPLOYEE
    if (!data.role || data.role === 'EMPLOYEE') {
      throw new ValidationError(
        `Invalid role for employee registration. ` +
        `Employee must register with a specific role (e.g., PATHOLOGY, XRAY, NURSE, BILLING_ENTRY, etc.), ` +
        `not the generic EMPLOYEE role.`
      );
    }

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
