/**
 * IPD Patient Movement & Tracking Service
 * Manage patient transfers, movements, and location tracking
 */

import logger from '../utils/logger.js';
import { AppError } from '../shared/AppError.js';

export class IPDMovementService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Record patient entry into ward
   */
  async recordPatientEntry(admissionId, wardId, data, currentUser) {
    try {
      const { roomNumber, bedNumber, admissionTime, enteredBy } = data;

      // Verify ward and bed exist
      const [ward, bed] = await Promise.all([
        this.prisma.ipdWard.findUnique({ where: { id: wardId } }),
        this.prisma.ipdBed.findUnique({
          where: { wardId_bedNumber: { wardId, bedNumber } },
        }),
      ]);

      if (!ward) {
        throw new AppError('Ward not found', 404);
      }

      if (!bed) {
        throw new AppError('Bed not found', 404);
      }

      // Record movement
      const movement = await this.prisma.ipdPatientMovement.create({
        data: {
          admissionId,
          movementType: 'ADMISSION', // ADMISSION, TRANSFER, DISCHARGE, ICU_MOVE, OPERATING_THEATRE
          fromLocation: null,
          toLocation: `${ward.name} - Room ${roomNumber} - Bed ${bedNumber}`,
          fromWardId: null,
          toWardId: wardId,
          fromBedId: null,
          toBedId: bed.id,
          reason: 'Patient admission to ward',
          movementTime: new Date(admissionTime),
          movedBy: enteredBy || currentUser.id,
          notes: data.notes || '',
          hospitalId: currentUser.hospitalId,
        },
      });

      // Update bed status
      await this.prisma.ipdBed.update({
        where: { id: bed.id },
        data: {
          status: 'OCCUPIED',
          occupiedBy: admissionId,
          occupiedSince: new Date(admissionTime),
        },
      });

      logger.info(`Patient entered ward: ${wardId} - Bed ${bedNumber}`);
      return movement;
    } catch (error) {
      logger.error(`Record Patient Entry Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfer patient within hospital
   */
  async transferPatient(admissionId, toWardId, toBedId, data, currentUser) {
    try {
      const { reason, transferTime, notes } = data;

      // Get current admission with ward info
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
        include: { bed: { include: { ward: true } } },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      // Verify destination ward and bed
      const [toWard, toBed] = await Promise.all([
        this.prisma.ipdWard.findUnique({ where: { id: toWardId } }),
        this.prisma.ipdBed.findUnique({ where: { id: toBedId } }),
      ]);

      if (!toWard) {
        throw new AppError('Destination ward not found', 404);
      }

      if (!toBed || toBed.wardId !== toWardId) {
        throw new AppError('Destination bed not found or not in specified ward', 404);
      }

      if (toBed.status === 'OCCUPIED') {
        throw new AppError('Destination bed is already occupied', 400);
      }

      // Record movement
      const movement = await this.prisma.ipdPatientMovement.create({
        data: {
          admissionId,
          movementType: 'TRANSFER',
          fromLocation: `${admission.bed.ward.name} - Bed ${admission.bed.bedNumber}`,
          toLocation: `${toWard.name} - Bed ${toBed.bedNumber}`,
          fromWardId: admission.wardId,
          toWardId: toWardId,
          fromBedId: admission.bedId,
          toBedId: toBedId,
          reason,
          movementTime: new Date(transferTime || Date.now()),
          movedBy: currentUser.id,
          notes,
          hospitalId: currentUser.hospitalId,
        },
      });

      // Release old bed
      await this.prisma.ipdBed.update({
        where: { id: admission.bedId },
        data: {
          status: 'AVAILABLE',
          occupiedBy: null,
          occupiedSince: null,
        },
      });

      // Occupy new bed
      await this.prisma.ipdBed.update({
        where: { id: toBedId },
        data: {
          status: 'OCCUPIED',
          occupiedBy: admissionId,
          occupiedSince: new Date(),
        },
      });

      // Update admission ward info
      await this.prisma.ipdAdmission.update({
        where: { id: admissionId },
        data: {
          wardId: toWardId,
          bedId: toBedId,
        },
      });

      logger.info(`Patient transferred from ward ${admission.wardId} to ${toWardId}`);
      return movement;
    } catch (error) {
      logger.error(`Transfer Patient Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfer patient to ICU
   */
  async transferToICU(admissionId, icuWardId, toBedId, reason, currentUser) {
    try {
      const transfer = await this.transferPatient(
        admissionId,
        icuWardId,
        toBedId,
        {
          reason: `ICU Transfer: ${reason}`,
          transferTime: new Date(),
          notes: `Intensive care required. Reason: ${reason}`,
        },
        currentUser
      );

      // Create ICU monitoring record
      await this.prisma.ipdICUMonitoring.create({
        data: {
          admissionId,
          transferredAt: new Date(),
          transferredBy: currentUser.id,
          icuWardId,
          monitoringStatus: 'ACTIVE',
          alerts: [],
          notes: reason,
        },
      });

      logger.info(`Patient transferred to ICU - Admission ${admissionId}`);
      return transfer;
    } catch (error) {
      logger.error(`Transfer to ICU Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfer patient to operating theatre
   */
  async transferToOperatingTheatre(admissionId, procedureId, otData, currentUser) {
    try {
      const { otNumber, scheduledTime } = otData;

      // Get current admission
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      // Record movement
      const movement = await this.prisma.ipdPatientMovement.create({
        data: {
          admissionId,
          movementType: 'OPERATING_THEATRE',
          toLocation: `Operating Theatre ${otNumber}`,
          fromWardId: admission.wardId,
          toWardId: null,
          fromBedId: admission.bedId,
          toBedId: null,
          reason: `Procedure: ${procedureId}`,
          movementTime: new Date(scheduledTime),
          movedBy: currentUser.id,
          notes: `Patient moved to OT for procedure`,
          hospitalId: currentUser.hospitalId,
        },
      });

      // Update procedure status
      await this.prisma.ipdProcedure.update({
        where: { id: procedureId },
        data: {
          status: 'IN_PROGRESS',
          actualStartTime: new Date(),
          operatingTheatreId: otNumber,
        },
      });

      logger.info(`Patient moved to Operating Theatre for procedure ${procedureId}`);
      return movement;
    } catch (error) {
      logger.error(`Transfer to OT Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Return patient from operating theatre to recovery area
   */
  async returnFromOperatingTheatre(admissionId, procedureId, recoveryData, currentUser) {
    try {
      const { recoveryWardId, recoveryBedId, postOperativeNotes } = recoveryData;

      // Record movement to recovery
      const movement = await this.transferPatient(
        admissionId,
        recoveryWardId,
        recoveryBedId,
        {
          reason: 'Post-operative recovery',
          transferTime: new Date(),
          notes: postOperativeNotes,
        },
        currentUser
      );

      // Update procedure status
      await this.prisma.ipdProcedure.update({
        where: { id: procedureId },
        data: {
          status: 'COMPLETED',
          actualEndTime: new Date(),
        },
      });

      logger.info(`Patient returned from OT to recovery ward`);
      return movement;
    } catch (error) {
      logger.error(`Return from OT Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Discharge patient from ward
   */
  async dischargePatient(admissionId, dischargeData, currentUser) {
    try {
      const {
        dischargeTime,
        dischargeType, // HOME, AGAINST_MEDICAL_ADVICE, TRANSFERRED, EXPIRED
        dischargeNotes,
        followUpInstructions,
      } = dischargeData;

      // Get admission with bed info
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      // Record movement
      const movement = await this.prisma.ipdPatientMovement.create({
        data: {
          admissionId,
          movementType: 'DISCHARGE',
          fromWardId: admission.wardId,
          toWardId: null,
          fromBedId: admission.bedId,
          toBedId: null,
          reason: dischargeType,
          movementTime: new Date(dischargeTime),
          movedBy: currentUser.id,
          notes: dischargeNotes,
          hospitalId: currentUser.hospitalId,
        },
      });

      // Release bed
      await this.prisma.ipdBed.update({
        where: { id: admission.bedId },
        data: {
          status: 'AVAILABLE',
          occupiedBy: null,
          occupiedSince: null,
        },
      });

      // Update admission status
      await this.prisma.ipdAdmission.update({
        where: { id: admissionId },
        data: {
          status: 'DISCHARGED',
          dischargeType,
          dischargeDate: new Date(dischargeTime),
          dischargedBy: currentUser.id,
          followUpInstructions,
          bedId: null,
        },
      });

      logger.info(`Patient discharged from admission ${admissionId}`);
      return movement;
    } catch (error) {
      logger.error(`Discharge Patient Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get patient movement history
   */
  async getPatientMovementHistory(admissionId, skip = 0, take = 20) {
    try {
      const [movements, total] = await Promise.all([
        this.prisma.ipdPatientMovement.findMany({
          where: { admissionId },
          skip,
          take,
          orderBy: { movementTime: 'desc' },
          include: {
            movedByUser: {
              select: { name: true, role: true },
            },
          },
        }),
        this.prisma.ipdPatientMovement.count({ where: { admissionId } }),
      ]);

      return { movements, total, skip, take };
    } catch (error) {
      logger.error(`Get Movement History Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get patient current location
   */
  async getPatientCurrentLocation(admissionId) {
    try {
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
        include: {
          ward: true,
          bed: true,
        },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      if (admission.status === 'DISCHARGED') {
        return {
          status: 'DISCHARGED',
          dischargeType: admission.dischargeType,
          dischargeDate: admission.dischargeDate,
        };
      }

      return {
        admissionId,
        wardName: admission.ward?.name,
        wardId: admission.wardId,
        bedNumber: admission.bed?.bedNumber,
        bedId: admission.bedId,
        currentStatus: admission.status,
        lastUpdated: admission.updatedAt,
      };
    } catch (error) {
      logger.error(`Get Current Location Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ward census (bed occupancy)
   */
  async getWardCensus(wardId) {
    try {
      const [beds, occupiedBeds] = await Promise.all([
        this.prisma.ipdBed.count({ where: { wardId } }),
        this.prisma.ipdBed.count({
          where: {
            wardId,
            status: 'OCCUPIED',
          },
        }),
      ]);

      const occupancy = beds > 0 ? Math.round((occupiedBeds / beds) * 100) : 0;

      return {
        wardId,
        totalBeds: beds,
        occupiedBeds,
        availableBeds: beds - occupiedBeds,
        occupancyPercentage: occupancy,
      };
    } catch (error) {
      logger.error(`Get Ward Census Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get hospital-wide census
   */
  async getHospitalCensus(hospitalId) {
    try {
      const wards = await this.prisma.ipdWard.findMany({
        where: { hospitalId },
      });

      const censusData = await Promise.all(
        wards.map((ward) => this.getWardCensus(ward.id))
      );

      const totalBeds = censusData.reduce((sum, w) => sum + w.totalBeds, 0);
      const occupiedBeds = censusData.reduce((sum, w) => sum + w.occupiedBeds, 0);
      const overallOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      return {
        hospitalId,
        wards: censusData,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        overallOccupancyPercentage: overallOccupancy,
      };
    } catch (error) {
      logger.error(`Get Hospital Census Error: ${error.message}`);
      throw error;
    }
  }
}



















