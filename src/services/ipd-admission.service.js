/**
 * IPD Module - In-Patient Department Management
 * Core service for admission, clinical management, and patient tracking
 */

import logger from '../utils/logger.js';
import { AppError } from '../shared/AppError.js';
import { ApiResponse } from '../shared/ApiResponse.js';

export class IPDAdmissionService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Admit patient to IPD - Create IPD admission record
   */
  async admitPatient(data, currentUser) {
    try {
      const {
        patientId,
        bedId,
        wardName,
        roomNumber,
        admissionReason,
        admittingDoctorId,
        departmentId,
        initialDiagnosis,
        medicalHistory,
        allergies,
        emergencyContact,
      } = data;

      // Validate required fields
      if (!patientId || !bedId || !admittingDoctorId) {
        throw new AppError('Patient ID, Bed ID, and Admitting Doctor required', 400);
      }

      // Check if patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new AppError('Patient not found', 404);
      }

      // Check if bed is available
      const bed = await this.prisma.ipdBed.findUnique({
        where: { id: bedId },
      });

      if (!bed || bed.status !== 'AVAILABLE') {
        throw new AppError('Bed not available', 400);
      }

      // Create admission record
      const admission = await this.prisma.ipdAdmission.create({
        data: {
          patientId,
          bedId,
          wardName,
          roomNumber,
          admissionReason,
          admittingDoctorId,
          departmentId,
          initialDiagnosis,
          medicalHistory,
          allergies,
          emergencyContact,
          admissionDate: new Date(),
          status: 'ACTIVE',
          admittedBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
        include: {
          patient: true,
          bed: true,
          admittingDoctor: true,
        },
      });

      // Update bed status
      await this.prisma.ipdBed.update({
        where: { id: bedId },
        data: {
          status: 'OCCUPIED',
          occupiedBy: patientId,
          occupiedDate: new Date(),
        },
      });

      // Create audit log
      await this.createAuditLog(currentUser, 'IPD_ADMIT', admission.id, patientId);

      logger.info(`Patient ${patientId} admitted to IPD by ${currentUser.id}`);
      return admission;
    } catch (error) {
      logger.error(`IPD Admission Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get IPD admission details
   */
  async getAdmission(admissionId) {
    try {
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
        include: {
          patient: true,
          bed: true,
          admittingDoctor: true,
          clinicalNotes: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          transfers: {
            orderBy: { transferDate: 'desc' },
            take: 5,
          },
          discharge: true,
        },
      });

      if (!admission) {
        throw new AppError('Admission record not found', 404);
      }

      return admission;
    } catch (error) {
      logger.error(`Get Admission Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get patient's active IPD admission
   */
  async getActiveAdmission(patientId) {
    try {
      const admission = await this.prisma.ipdAdmission.findFirst({
        where: {
          patientId,
          status: 'ACTIVE',
        },
        include: {
          patient: true,
          bed: true,
          admittingDoctor: true,
        },
      });

      return admission;
    } catch (error) {
      logger.error(`Get Active Admission Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all IPD admissions with pagination
   */
  async listAdmissions(filters = {}, skip = 0, take = 20) {
    try {
      const { status, wardName, departmentId, dateFrom, dateTo } = filters;

      const where = {};
      if (status) where.status = status;
      if (wardName) where.wardName = wardName;
      if (departmentId) where.departmentId = departmentId;
      if (dateFrom || dateTo) {
        where.admissionDate = {};
        if (dateFrom) where.admissionDate.gte = new Date(dateFrom);
        if (dateTo) where.admissionDate.lte = new Date(dateTo);
      }

      const [admissions, total] = await Promise.all([
        this.prisma.ipdAdmission.findMany({
          where,
          skip,
          take,
          orderBy: { admissionDate: 'desc' },
          include: {
            patient: true,
            bed: true,
            admittingDoctor: true,
          },
        }),
        this.prisma.ipdAdmission.count({ where }),
      ]);

      return { admissions, total, skip, take };
    } catch (error) {
      logger.error(`List Admissions Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create clinical note (Doctor/Nurse Progress Note)
   */
  async createClinicalNote(admissionId, data, currentUser) {
    try {
      const { noteType, content, observations, vitals } = data;

      // Verify admission exists
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      const note = await this.prisma.ipdClinicalNote.create({
        data: {
          admissionId,
          noteType, // DOCTOR_ROUND, NURSING_CARE, PROGRESS_NOTE
          content,
          observations,
          vitals,
          createdBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
        include: {
          createdByUser: true,
        },
      });

      await this.createAuditLog(currentUser, 'IPD_NOTE_CREATED', note.id, admissionId);
      logger.info(`Clinical note created for admission ${admissionId}`);

      return note;
    } catch (error) {
      logger.error(`Create Clinical Note Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get clinical notes for admission
   */
  async getClinicalNotes(admissionId, skip = 0, take = 20) {
    try {
      const [notes, total] = await Promise.all([
        this.prisma.ipdClinicalNote.findMany({
          where: { admissionId },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            createdByUser: {
              select: { id: true, name: true, role: true },
            },
          },
        }),
        this.prisma.ipdClinicalNote.count({ where: { admissionId } }),
      ]);

      return { notes, total, skip, take };
    } catch (error) {
      logger.error(`Get Clinical Notes Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create clinical alert (Allergies, Critical Values, etc.)
   */
  async createAlert(admissionId, data, currentUser) {
    try {
      const { alertType, description, severity, isAcknowledged } = data;

      const alert = await this.prisma.ipdAlert.create({
        data: {
          admissionId,
          alertType, // ALLERGY, CRITICAL_VALUE, INFECTION, MEDICATION_INTERACTION
          description,
          severity, // HIGH, MEDIUM, LOW
          isAcknowledged: isAcknowledged || false,
          createdBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Alert created for admission ${admissionId}`);
      return alert;
    } catch (error) {
      logger.error(`Create Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, currentUser) {
    try {
      const alert = await this.prisma.ipdAlert.update({
        where: { id: alertId },
        data: {
          isAcknowledged: true,
          acknowledgedBy: currentUser.id,
          acknowledgedAt: new Date(),
        },
      });

      logger.info(`Alert ${alertId} acknowledged by ${currentUser.id}`);
      return alert;
    } catch (error) {
      logger.error(`Acknowledge Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create audit log for compliance tracking
   */
  async createAuditLog(user, action, recordId, patientId) {
    try {
      await this.prisma.ipdAuditLog.create({
        data: {
          action,
          recordId,
          patientId,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          timestamp: new Date(),
          hospitalId: user.hospitalId,
        },
      });
    } catch (error) {
      logger.error(`Audit Log Error: ${error.message}`);
      // Don't throw - audit logging should not fail the main operation
    }
  }

  /**
   * Get audit logs for compliance/medico-legal review
   */
  async getAuditLogs(filters = {}, skip = 0, take = 50) {
    try {
      const { patientId, userId, action, dateFrom, dateTo } = filters;

      const where = {};
      if (patientId) where.patientId = patientId;
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom) where.timestamp.gte = new Date(dateFrom);
        if (dateTo) where.timestamp.lte = new Date(dateTo);
      }

      const [logs, total] = await Promise.all([
        this.prisma.ipdAuditLog.findMany({
          where,
          skip,
          take,
          orderBy: { timestamp: 'desc' },
        }),
        this.prisma.ipdAuditLog.count({ where }),
      ]);

      return { logs, total, skip, take };
    } catch (error) {
      logger.error(`Get Audit Logs Error: ${error.message}`);
      throw error;
    }
  }
}



















