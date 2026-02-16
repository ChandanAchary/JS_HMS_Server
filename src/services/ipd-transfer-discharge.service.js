/**
 * IPD Transfer & Discharge Service
 * Manage patient transfers and discharge procedures
 */

import logger from '../utils/logger.js';
import { AppError } from '../shared/AppError.js';

export class IPDTransferDischargeService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Transfer patient between wards/beds
   */
  async transferPatient(admissionId, data, currentUser) {
    try {
      const { newBedId, transferReason, expectedDuration } = data;

      // Get current admission
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
        include: { bed: true },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      if (admission.status !== 'ACTIVE') {
        throw new AppError('Can only transfer active admissions', 400);
      }

      // Verify new bed exists and is available
      const newBed = await this.prisma.ipdBed.findUnique({
        where: { id: newBedId },
      });

      if (!newBed || newBed.status !== 'AVAILABLE') {
        throw new AppError('New bed not available', 400);
      }

      // Create transfer record
      const transfer = await this.prisma.ipdTransfer.create({
        data: {
          admissionId,
          fromBedId: admission.bedId,
          toBedId: newBedId,
          transferReason,
          expectedDuration,
          transferDate: new Date(),
          transferredBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
        include: {
          fromBed: true,
          toBed: true,
        },
      });

      // Update admission with new bed
      await this.prisma.ipdAdmission.update({
        where: { id: admissionId },
        data: { bedId: newBedId },
      });

      // Update old bed status
      await this.prisma.ipdBed.update({
        where: { id: admission.bedId },
        data: {
          status: 'AVAILABLE',
          occupiedBy: null,
          occupiedDate: null,
        },
      });

      // Update new bed status
      await this.prisma.ipdBed.update({
        where: { id: newBedId },
        data: {
          status: 'OCCUPIED',
          occupiedBy: admission.patientId,
          occupiedDate: new Date(),
        },
      });

      logger.info(
        `Patient transferred from bed ${admission.bed.bedNumber} to ${newBed.bedNumber}`
      );

      return transfer;
    } catch (error) {
      logger.error(`Transfer Patient Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initiate discharge process
   */
  async initiateDischarge(admissionId, data, currentUser) {
    try {
      const {
        dischargeType, // HOME, REFERRAL, ABSCONDED, EXPIRED
        finalDiagnosis,
        treatmentSummary,
        followUpNotes,
        medications,
        restrictionsAndPrecautions,
        dischargeDate,
      } = data;

      // Verify admission exists
      const admission = await this.prisma.ipadmission.findUnique({
        where: { id: admissionId },
        include: { bed: true },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      // Create discharge record
      const discharge = await this.prisma.ipdDischarge.create({
        data: {
          admissionId,
          dischargeType,
          finalDiagnosis,
          treatmentSummary,
          followUpNotes,
          medications,
          restrictionsAndPrecautions,
          dischargeDate: new Date(dischargeDate) || new Date(),
          dischargedBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
      });

      // Update admission status
      await this.prisma.ipdAdmission.update({
        where: { id: admissionId },
        data: { status: 'DISCHARGED' },
      });

      // Free up the bed
      await this.prisma.ipdBed.update({
        where: { id: admission.bedId },
        data: {
          status: 'CLEANING',
          occupiedBy: null,
          occupiedDate: null,
        },
      });

      logger.info(`Discharge initiated for admission ${admissionId}`);

      return discharge;
    } catch (error) {
      logger.error(`Initiate Discharge Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate discharge summary
   */
  async generateDischargeSummary(admissionId) {
    try {
      const discharge = await this.prisma.ipdDischarge.findUnique({
        where: { admissionId },
        include: {
          admission: {
            include: {
              patient: true,
              admittingDoctor: true,
            },
          },
        },
      });

      if (!discharge) {
        throw new AppError('No discharge record found', 404);
      }

      // Generate summary document
      const summary = {
        patientName: discharge.admission.patient.name,
        patientId: discharge.admission.patientId,
        admissionDate: discharge.admission.admissionDate,
        dischargeDate: discharge.dischargeDate,
        admittingDoctor: discharge.admission.admittingDoctor.name,
        finalDiagnosis: discharge.finalDiagnosis,
        treatmentSummary: discharge.treatmentSummary,
        followUpNotes: discharge.followUpNotes,
        medications: discharge.medications,
        restrictions: discharge.restrictionsAndPrecautions,
        generatedAt: new Date(),
      };

      logger.info(`Discharge summary generated for admission ${admissionId}`);

      return summary;
    } catch (error) {
      logger.error(`Generate Discharge Summary Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transfer history for patient
   */
  async getTransferHistory(patientId) {
    try {
      const transfers = await this.prisma.ipdTransfer.findMany({
        where: {
          admission: { patientId },
        },
        orderBy: { transferDate: 'desc' },
        include: {
          fromBed: {
            select: { bedNumber, wardName },
          },
          toBed: {
            select: { bedNumber, wardName },
          },
        },
      });

      return transfers;
    } catch (error) {
      logger.error(`Get Transfer History Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get discharge details
   */
  async getDischargeDetails(admissionId) {
    try {
      const discharge = await this.prisma.ipdDischarge.findUnique({
        where: { admissionId },
        include: {
          admission: {
            include: {
              patient: true,
              bed: true,
            },
          },
        },
      });

      if (!discharge) {
        throw new AppError('No discharge record found', 404);
      }

      return discharge;
    } catch (error) {
      logger.error(`Get Discharge Details Error: ${error.message}`);
      throw error;
    }
  }
}



















