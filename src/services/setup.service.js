/**
 * Setup Service
 * Business logic for initial system setup
 * 
 * Enterprise 3-Phase Setup Flow:
 * 
 * PHASE 1: ADMIN REGISTRATION
 * 1. POST /api/setup/register-admin → Validate & send OTP
 * 2. POST /api/setup/verify-admin-otp → Verify OTP, create admin account
 * 
 * PHASE 2: ADMIN LOGIN
 * 3. POST /api/auth/login → Check hospitalSetupRequired flag
 * 4. If hospital NOT configured, return hospitalSetupRequired: true
 * 
 * PHASE 3: HOSPITAL CONFIGURATION
 * 5. POST /api/setup/configure-hospital → Create hospital, link to admin
 * 6. GET /api/setup/hospital-setup-status → Check hospital configuration
 * 7. GET /api/setup/onboarding-status → Check all setup phases
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ValidationError, ConflictError, NotFoundError } from '../shared/AppError.js';
import logger from '../utils/logger.js';
import { sendOtpEmail, sendAdminRegistrationConfirmation } from '../services/email.service.js';

// OTP expires in 10 minutes
const OTP_EXPIRY_MINUTES = 10;

// Store pending admin registrations & hospital setups temporarily (in production, use Redis)
const pendingAdminRegistrations = new Map();
const pendingHospitalSetups = new Map();

export class SetupService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Check if system setup is required
   * @returns {{ needsSetup: boolean, message: string }}
   */
  async checkSetupStatus() {
    // Check if any admin exists
    const adminCount = await this.prisma.admin.count();

    if (adminCount === 0) {
      return {
        needsSetup: true,
        message: 'No admin exists. Please create the first admin.'
      };
    }

    return {
      needsSetup: false,
      message: 'System is configured. Please login.'
    };
  }

  /**
   * PHASE 1: Register Admin (Step 1)
   * Validate admin data and send OTP to email
   * 
   * @param {Object} adminData - Admin credentials (name, email, phone, password)
   * @returns {Object} Session ID and masked email
   */
  async registerAdmin(adminData) {
    // Check if any admin already exists
    const existingAdmin = await this.prisma.admin.findFirst();
    if (existingAdmin) {
      throw new ConflictError('An admin already exists. Use /api/auth/login to sign in.');
    }

    // Check if email already pending
    const existingEmail = await this.prisma.admin.findUnique({
      where: { email: adminData.email.toLowerCase().trim() }
    });
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists.');
    }

    // Generate OTP
    const otp = this.generateOTP();
    const hashedOTP = this.hashOTP(otp);
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Store pending admin registration
    pendingAdminRegistrations.set(sessionId, {
      adminData,
      hashedOTP,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0
    });

    this.cleanupExpiredSessions();

    // Send OTP to admin email
    const emailSent = await sendOtpEmail(
      adminData.email,
      adminData.name,
      otp
    );

    if (!emailSent) {
      pendingAdminRegistrations.delete(sessionId);
      throw new ValidationError('Failed to send OTP email. Please check email configuration.');
    }

    logger.info(`[Setup Phase 1] Admin registration OTP sent to ${adminData.email}`);

    return {
      sessionId,
      email: this.maskEmail(adminData.email),
      message: `Verification code sent to ${this.maskEmail(adminData.email)}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
    };
  }

  /**
   * PHASE 1: Verify Admin Registration OTP (Step 2)
   * Create admin account after OTP verification
   * 
   * @param {string} sessionId - Session ID from registerAdmin step
   * @param {string} otp - 6-digit OTP from email
   * @returns {Object} JWT token and admin info
   */
  async verifyAdminRegistrationOTP(sessionId, otp) {
    const session = pendingAdminRegistrations.get(sessionId);

    if (!session) {
      throw new NotFoundError('Invalid or expired session. Please start admin registration again.');
    }

    if (Date.now() > session.expiresAt) {
      pendingAdminRegistrations.delete(sessionId);
      throw new ValidationError('OTP has expired. Please start admin registration again.');
    }

    if (session.attempts >= 5) {
      pendingAdminRegistrations.delete(sessionId);
      throw new ValidationError('Too many failed attempts. Please start admin registration again.');
    }

    // Verify OTP
    const hashedInputOTP = this.hashOTP(otp);
    if (hashedInputOTP !== session.hashedOTP) {
      session.attempts++;
      throw new ValidationError(`Invalid OTP. ${5 - session.attempts} attempts remaining.`);
    }

    // OTP verified - Single tenant: get or create hospital
    const { adminData } = session;
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // SINGLE TENANT LOGIC: Check if hospital already exists
    let hospital = await this.prisma.hospital.findFirst({
      where: {} // Get the first (and only) hospital in single-tenant system
    });

    // If no hospital exists (first admin registration), create it
    if (!hospital) {
      hospital = await this.prisma.hospital.create({
        data: {
          hospitalName: 'Default Hospital', // User will configure this in Phase 3
          address: '' // Will be configured in Phase 3
        }
      });
      logger.info('[Setup Phase 1] Default hospital created for single-tenant system');
    } else {
      logger.info('[Setup Phase 1] Hospital already exists, reusing for new admin');
    }

    // Create admin linked to the (existing or newly created) hospital
    const admin = await this.prisma.admin.create({
      data: {
        name: adminData.name.trim(),
        email: adminData.email.toLowerCase().trim(),
        phone: adminData.phone.replace(/\D/g, ''),
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        hospitalId: hospital.id, // Link to THE (single) hospital
        isOwner: true, // Owner of the hospital
        emailVerified: true, // Verified via OTP
        registrationStep: 'ADMIN_CREATED',
        isPasswordChanged: true
      }
    });

    logger.info(`[Setup Phase 1] Super Admin created: ${admin.email} (Hospital: ${hospital.id})`);

    // Clean up session
    pendingAdminRegistrations.delete(sessionId);

    // Send confirmation email
    await sendAdminRegistrationConfirmation(
      admin.email,
      admin.name,
      'http://localhost:3000/api/admin/auth/login' // or get from config
    ).catch(err => {
      logger.error('Failed to send admin registration confirmation email:', err.message);
      // Don't throw - email failure shouldn't block registration
    });

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      message: 'Admin account created. Confirmation email sent. Please login to continue with hospital setup.'
    };
  }

  /**
   * PHASE 3: Configure Hospital (Step 1)
   * Create hospital and link to admin
   * 
   * @param {string} adminId - Admin ID from JWT
   * @param {Object} hospitalData - Hospital configuration data
   * @returns {Object} Hospital created with success message
   */
  async configureHospital(adminId, hospitalData) {
    // Verify admin exists and has no hospital yet
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new NotFoundError('Admin not found.');
    }
    // If admin already linked to a hospital, perform an update
    if (admin.hospitalId) {
      const updatedHospital = await this.prisma.hospital.update({
        where: { id: admin.hospitalId },
        data: {
          hospitalName: hospitalData.hospitalName?.trim() || undefined,
          address: hospitalData.address?.trim() || undefined,
          contactEmail: hospitalData.contactEmail?.toLowerCase().trim() || undefined,
          contactPhone: hospitalData.contactPhone ? hospitalData.contactPhone.replace(/\D/g, '') : undefined,
          city: hospitalData.city?.trim() || undefined,
          state: hospitalData.state?.trim() || undefined,
          country: hospitalData.country?.trim() || undefined,
          registrationType: hospitalData.registrationType?.trim() || undefined,
          registrationNumber: hospitalData.registrationNumber?.trim() || undefined,
          logo: hospitalData.logo || undefined
        }
      });

      logger.info(`[Setup Phase 3] Hospital updated: ${updatedHospital.hospitalName} by admin: ${admin.email}`);

      // Ensure system config reflects setup completion
      await this.prisma.systemConfig.upsert({
        where: { id: 'system_config' },
        update: {
          isSetupComplete: true,
          setupCompletedAt: new Date(),
          setupCompletedBy: adminId
        },
        create: {
          id: 'system_config',
          isSetupComplete: true,
          setupCompletedAt: new Date(),
          setupCompletedBy: adminId
        }
      });

      return {
        id: updatedHospital.id,
        hospitalName: updatedHospital.hospitalName,
        address: updatedHospital.address,
        contactEmail: updatedHospital.contactEmail,
        city: updatedHospital.city,
        state: updatedHospital.state,
        country: updatedHospital.country,
        message: 'Hospital updated successfully.'
      };
    }

    // Admin not linked to a hospital yet - check if any hospital exists in single-tenant
    const existingHospital = await this.prisma.hospital.findFirst();
    if (existingHospital) {
      // Link admin to existing hospital and optionally update it
      const hospital = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.hospital.update({
          where: { id: existingHospital.id },
          data: {
            hospitalName: hospitalData.hospitalName?.trim() || existingHospital.hospitalName,
            address: hospitalData.address?.trim() || existingHospital.address,
            contactEmail: hospitalData.contactEmail?.toLowerCase().trim() || existingHospital.contactEmail,
            contactPhone: hospitalData.contactPhone ? hospitalData.contactPhone.replace(/\D/g, '') : existingHospital.contactPhone,
            city: hospitalData.city?.trim() || existingHospital.city,
            state: hospitalData.state?.trim() || existingHospital.state,
            country: hospitalData.country?.trim() || existingHospital.country,
            registrationType: hospitalData.registrationType?.trim() || existingHospital.registrationType,
            registrationNumber: hospitalData.registrationNumber?.trim() || existingHospital.registrationNumber,
            logo: hospitalData.logo || existingHospital.logo
          }
        });

        await tx.admin.update({
          where: { id: adminId },
          data: {
            hospitalId: updated.id,
            isOwner: true,
            registrationStep: 'COMPLETE'
          }
        });

        await tx.systemConfig.upsert({
          where: { id: 'system_config' },
          update: {
            isSetupComplete: true,
            setupCompletedAt: new Date(),
            setupCompletedBy: adminId
          },
          create: {
            id: 'system_config',
            isSetupComplete: true,
            setupCompletedAt: new Date(),
            setupCompletedBy: adminId
          }
        });

        return updated;
      });

      logger.info(`[Setup Phase 3] Existing hospital linked/updated: ${hospital.hospitalName} -> admin: ${admin.email}`);

      return {
        id: hospital.id,
        hospitalName: hospital.hospitalName,
        address: hospital.address,
        contactEmail: hospital.contactEmail,
        city: hospital.city,
        state: hospital.state,
        country: hospital.country,
        message: 'Hospital linked and updated successfully.'
      };
    }

    // No hospital exists - create a new one and link to admin
    const hospital = await this.prisma.$transaction(async (tx) => {
      const newHospital = await tx.hospital.create({
        data: {
          hospitalName: hospitalData.hospitalName.trim(),
          address: hospitalData.address.trim(),
          contactEmail: hospitalData.contactEmail.toLowerCase().trim(),
          contactPhone: hospitalData.contactPhone.replace(/\D/g, ''),
          city: hospitalData.city?.trim() || '',
          state: hospitalData.state?.trim() || '',
          country: hospitalData.country?.trim() || 'India',
          registrationType: hospitalData.registrationType?.trim() || 'Hospital',
          registrationNumber: hospitalData.registrationNumber?.trim() || '',
          logo: hospitalData.logo || '',
          isActive: true
        }
      });

      // Update admin to link hospital
      await tx.admin.update({
        where: { id: adminId },
        data: {
          hospitalId: newHospital.id,
          isOwner: true,
          registrationStep: 'COMPLETE'
        }
      });

      // Create SystemConfig entry (if not exists)
      await tx.systemConfig.upsert({
        where: { id: 'system_config' },
        update: {
          isSetupComplete: true,
          setupCompletedAt: new Date(),
          setupCompletedBy: adminId
        },
        create: {
          id: 'system_config',
          isSetupComplete: true,
          setupCompletedAt: new Date(),
          setupCompletedBy: adminId
        }
      });

      return newHospital;
    });

    logger.info(`[Setup Phase 3] Hospital configured: ${hospital.hospitalName} linked to admin: ${admin.email}`);

    return {
      id: hospital.id,
      hospitalName: hospital.hospitalName,
      address: hospital.address,
      contactEmail: hospital.contactEmail,
      city: hospital.city,
      state: hospital.state,
      country: hospital.country,
      message: 'Hospital configured successfully. System is now ready for operations.'
    };
  }

  /**
   * Get Hospital Setup Status
   * Check if hospital is configured for this admin
   * 
   * @param {string} adminId - Admin ID
   * @returns {Object} Hospital setup status
   */
  async getHospitalSetupStatus(adminId) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { hospital: true }
    });

    if (!admin) {
      throw new NotFoundError('Admin not found.');
    }

    return {
      isHospitalConfigured: !!admin.hospitalId && !!admin.hospital,
      hospitalSetupRequired: !admin.hospitalId,
      hospital: admin.hospital ? {
        id: admin.hospital.id,
        hospitalName: admin.hospital.hospitalName,
        address: admin.hospital.address,
        registrationNumber: admin.hospital.registrationNumber,
        city: admin.hospital.city,
        state: admin.hospital.state,
        country: admin.hospital.country
      } : null
    };
  }

  /**
   * Get Complete Onboarding Status
   * Check all setup phases completion
   * 
   * @param {string} adminId - Admin ID
   * @returns {Object} Complete setup status
   */
  async getOnboardingStatus(adminId) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { hospital: true }
    });

    if (!admin) {
      throw new NotFoundError('Admin not found.');
    }

    const systemConfig = await this.prisma.systemConfig.findUnique({
      where: { id: 'system_config' }
    });

    return {
      phase1: {
        name: 'Admin Registration',
        completed: true,
        completedAt: admin.createdAt,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      },
      phase2: {
        name: 'Admin Login',
        completed: true,
        message: 'Admin logged in successfully'
      },
      phase3: {
        name: 'Hospital Configuration',
        completed: !!admin.hospitalId,
        completedAt: admin.hospital?.createdAt || null,
        hospital: admin.hospital ? {
          id: admin.hospital.id,
          hospitalName: admin.hospital.hospitalName,
          address: admin.hospital.address,
          city: admin.hospital.city
        } : null
      },
      systemReady: systemConfig?.isSetupComplete || false,
      nextStep: !admin.hospitalId ? 'Configure hospital information' : 'System ready for operations'
    };
  }

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
   * Clean up expired pending sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [key, value] of pendingAdminRegistrations.entries()) {
      if (value.expiresAt < now) {
        pendingAdminRegistrations.delete(key);
      }
    }
    for (const [key, value] of pendingHospitalSetups.entries()) {
      if (value.expiresAt < now) {
        pendingHospitalSetups.delete(key);
      }
    }
  }
}

export default SetupService;



















