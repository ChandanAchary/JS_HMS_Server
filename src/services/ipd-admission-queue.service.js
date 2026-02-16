/**
 * IPD Admission Queue Service
 * 
 * Handles the workflow of patient admission from OPD to IPD:
 * 1. Doctor marks patient as needing IPD in OPD consultation
 * 2. Admission request created in IPD queue
 * 3. Bed manager/ward in-charge approves and allocates bed
 * 4. Admission is created and patient enters IPD
 * 
 * Status flow: PENDING -> APPROVED -> ADMITTED (or REJECTED)
 */

import logger from '../utils/logger.js';
import { AppError } from '../shared/AppError.js';

export class IPDAdmissionQueueService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create IPD admission request from OPD consultation
   * Called by doctor after completing OPD consultation if IPD is needed
   * 
   * @param {object} data - Admission request data
   * @param {string} currentUser - User creating the request (doctor)
   */
  async createAdmissionRequest(data, currentUser) {
    try {
      const {
        patientId,
        visitId,
        admissionReason,
        initialDiagnosis,
        estimatedLOS,
        priority,
        medicalHistory,
        allergies,
        emergencyContact,
        recommendedDepartment,
        notes,
      } = data;

      // Validate required fields
      if (!patientId || !admissionReason) {
        throw new AppError('Patient ID and admission reason required', 400);
      }

      // Check if patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, firstName: true, lastName: true, dateOfBirth: true, hospitalId: true }
      });

      if (!patient) {
        throw new AppError('Patient not found', 404);
      }

      // Check if patient already has active admission request
      const existingRequest = await this.prisma.ipdAdmissionRequest.findFirst({
        where: {
          patientId,
          status: 'PENDING'
        }
      });

      if (existingRequest) {
        throw new AppError('Patient already has a pending admission request', 400);
      }

      // Create admission request
      const admissionRequest = await this.prisma.ipdAdmissionRequest.create({
        data: {
          patientId,
          visitId,
          admissionReason,
          initialDiagnosis,
          estimatedLOS: estimatedLOS || 3,
          priority: priority || 'NORMAL',
          medicalHistory,
          allergies,
          emergencyContact,
          recommendedDepartment,
          notes,
          status: 'PENDING',
          requestedBy: currentUser.id,
          requestedAt: new Date(),
          hospitalId: patient.hospitalId,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              bloodGroup: true,
              phone: true,
            }
          },
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
        }
      });

      logger.info(`IPD admission request created for patient ${patientId} by doctor ${currentUser.id}`);
      
      return {
        success: true,
        message: 'Admission request created successfully',
        data: admissionRequest
      };
    } catch (error) {
      logger.error(`Create Admission Request Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get pending IPD admission requests
   * Used by bed manager/ward in-charge to see pending admissions
   */
  async getPendingAdmissionRequests(hospitalId, options = {}) {
    try {
      const { priority, limit = 50, offset = 0, department } = options;

      const whereClause = {
        hospitalId,
        status: 'PENDING'
      };

      if (priority) {
        whereClause.priority = priority;
      }

      if (department) {
        whereClause.recommendedDepartment = department;
      }

      const requests = await this.prisma.ipdAdmissionRequest.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              bloodGroup: true,
              phone: true,
              medicalHistory: true,
              allergies: true,
            }
          },
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              specialization: true,
            }
          },
        },
        orderBy: [
          { priority: 'asc' }, // HIGH priority first
          { requestedAt: 'asc' } // Oldest requests first (FIFO)
        ],
        take: limit,
        skip: offset
      });

      const total = await this.prisma.ipdAdmissionRequest.count({
        where: whereClause
      });

      return {
        success: true,
        data: requests,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get Pending Requests Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all admission requests for a patient
   */
  async getPatientAdmissionRequests(patientId) {
    try {
      const requests = await this.prisma.ipdAdmissionRequest.findMany({
        where: { patientId },
        include: {
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
          approvedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
          admission: {
            select: {
              id: true,
              status: true,
              admissionDate: true,
            }
          }
        },
        orderBy: { requestedAt: 'desc' }
      });

      return {
        success: true,
        data: requests
      };
    } catch (error) {
      logger.error(`Get Patient Requests Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Approve admission request
   * Called by bed manager/ward in-charge when bed is available
   */
  async approveAdmissionRequest(requestId, bedId, currentUser) {
    try {
      // Get the admission request
      const request = await this.prisma.ipdAdmissionRequest.findUnique({
        where: { id: requestId },
        include: { patient: true }
      });

      if (!request) {
        throw new AppError('Admission request not found', 404);
      }

      if (request.status !== 'PENDING') {
        throw new AppError(`Cannot approve request with status ${request.status}`, 400);
      }

      // Check if bed is available
      const bed = await this.prisma.ipdBed.findUnique({
        where: { id: bedId }
      });

      if (!bed || bed.status !== 'AVAILABLE') {
        throw new AppError('Bed not available', 400);
      }

      // Update request status
      const approvedRequest = await this.prisma.ipdAdmissionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedBy: currentUser.id,
          approvedAt: new Date(),
          allocatedBedId: bedId,
        },
        include: {
          patient: true,
          approvedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
          allocatedBed: {
            select: {
              id: true,
              bedNumber: true,
              wardName: true,
            }
          }
        }
      });

      logger.info(`Admission request ${requestId} approved by ${currentUser.id} for bed ${bedId}`);

      return {
        success: true,
        message: 'Admission request approved. Bed allocated.',
        data: approvedRequest
      };
    } catch (error) {
      logger.error(`Approve Request Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reject admission request
   * Called by bed manager if admission is not needed or rejected
   */
  async rejectAdmissionRequest(requestId, rejectionReason, currentUser) {
    try {
      const request = await this.prisma.ipdAdmissionRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        throw new AppError('Admission request not found', 404);
      }

      if (request.status !== 'PENDING') {
        throw new AppError(`Cannot reject request with status ${request.status}`, 400);
      }

      const rejectedRequest = await this.prisma.ipdAdmissionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          rejectedBy: currentUser.id,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || 'No reason provided',
        },
        include: {
          patient: true,
          rejectedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          }
        }
      });

      logger.info(`Admission request ${requestId} rejected by ${currentUser.id}`);

      return {
        success: true,
        message: 'Admission request rejected',
        data: rejectedRequest
      };
    } catch (error) {
      logger.error(`Reject Request Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get admission request details
   */
  async getAdmissionRequest(requestId) {
    try {
      const request = await this.prisma.ipdAdmissionRequest.findUnique({
        where: { id: requestId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              bloodGroup: true,
              phone: true,
              medicalHistory: true,
              allergies: true,
            }
          },
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              specialization: true,
            }
          },
          approvedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
          rejectedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            }
          },
          allocatedBed: {
            select: {
              id: true,
              bedNumber: true,
              wardName: true,
              roomNumber: true,
            }
          },
          admission: {
            select: {
              id: true,
              status: true,
              admissionDate: true,
              dischargeSummary: true,
            }
          }
        }
      });

      if (!request) {
        throw new AppError('Admission request not found', 404);
      }

      return {
        success: true,
        data: request
      };
    } catch (error) {
      logger.error(`Get Request Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get IPD admission queue statistics
   */
  async getAdmissionQueueStats(hospitalId) {
    try {
      const stats = await Promise.all([
        this.prisma.ipdAdmissionRequest.count({ where: { hospitalId, status: 'PENDING' } }),
        this.prisma.ipdAdmissionRequest.count({ where: { hospitalId, status: 'APPROVED' } }),
        this.prisma.ipdAdmissionRequest.count({ where: { hospitalId, status: 'ADMITTED' } }),
        this.prisma.ipdAdmissionRequest.count({ where: { hospitalId, status: 'REJECTED' } }),
      ]);

      const avgWaitTime = await this.prisma.ipdAdmissionRequest.aggregate({
        where: { hospitalId, status: 'PENDING' },
        _avg: {
          createdAt: true
        }
      });

      return {
        success: true,
        data: {
          pending: stats[0],
          approved: stats[1],
          admitted: stats[2],
          rejected: stats[3],
          totalInQueue: stats[0] + stats[1],
          averageWaitTime: avgWaitTime._avg.createdAt
        }
      };
    } catch (error) {
      logger.error(`Get Queue Stats Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create audit log
   */
  async createAuditLog(user, action, requestId, patientId) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action,
          entityType: 'IPD_ADMISSION_REQUEST',
          entityId: requestId,
          patientId,
          details: `${action} for admission request ${requestId}`,
          timestamp: new Date(),
          hospitalId: user.hospitalId,
        }
      });
    } catch (error) {
      logger.warn(`Audit log creation failed: ${error.message}`);
    }
  }
}



















