/**
 * IPD Bed Management Service
 * Manage bed allocation, occupancy, and ward management
 */

import logger from '../../core/utils/logger.js';
import { AppError } from '../../shared/exceptions/AppError.js';

export class IPDBedService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create new bed in ward
   */
  async createBed(data) {
    try {
      const {
        bedNumber,
        wardName,
        roomNumber,
        bedType,
        capacity,
        facilities,
        chargePerDay,
      } = data;

      const bed = await this.prisma.ipdBed.create({
        data: {
          bedNumber,
          wardName,
          roomNumber,
          bedType, // SINGLE, DOUBLE, GENERAL
          capacity,
          facilities: facilities || [],
          chargePerDay,
          status: 'AVAILABLE', // AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING
          hospitalId: data.hospitalId,
        },
      });

      logger.info(`New bed created: ${bedNumber} in ${wardName}`);
      return bed;
    } catch (error) {
      logger.error(`Create Bed Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get bed details with occupancy history
   */
  async getBedDetails(bedId) {
    try {
      const bed = await this.prisma.ipdBed.findUnique({
        where: { id: bedId },
        include: {
          currentOccupant: {
            select: { id: true, name: true, patientId: true },
          },
          occupancyHistory: {
            orderBy: { admissionDate: 'desc' },
            take: 10,
          },
        },
      });

      if (!bed) {
        throw new AppError('Bed not found', 404);
      }

      return bed;
    } catch (error) {
      logger.error(`Get Bed Details Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ward status and occupancy
   */
  async getWardStatus(wardName) {
    try {
      const beds = await this.prisma.ipdBed.findMany({
        where: { wardName },
        include: {
          currentOccupant: {
            select: { name: true, patientId: true },
          },
        },
      });

      const totalBeds = beds.length;
      const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
      const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

      return {
        wardName,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate: occupancyRate.toFixed(2),
        beds,
      };
    } catch (error) {
      logger.error(`Get Ward Status Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all beds for a hospital with filters
   */
  async listBeds(hospitalId, filters = {}, skip = 0, take = 50) {
    try {
      const { status, wardName, bedType } = filters;

      const where = { hospitalId };
      if (status) where.status = status;
      if (wardName) where.wardName = wardName;
      if (bedType) where.bedType = bedType;

      const [beds, total] = await Promise.all([
        this.prisma.ipdBed.findMany({
          where,
          skip,
          take,
          orderBy: [{ wardName: 'asc' }, { bedNumber: 'asc' }],
          include: {
            currentOccupant: {
              select: { name: true, patientId: true },
            },
          },
        }),
        this.prisma.ipdBed.count({ where }),
      ]);

      return { beds, total, skip, take };
    } catch (error) {
      logger.error(`List Beds Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark bed for maintenance or cleaning
   */
  async updateBedStatus(bedId, status, reason = '') {
    try {
      const validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid bed status', 400);
      }

      const bed = await this.prisma.ipdBed.update({
        where: { id: bedId },
        data: {
          status,
          maintenanceReason: reason,
          lastMaintenanceDate: status === 'MAINTENANCE' ? new Date() : undefined,
        },
      });

      logger.info(`Bed ${bed.bedNumber} status updated to ${status}`);
      return bed;
    } catch (error) {
      logger.error(`Update Bed Status Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available beds for admission
   */
  async getAvailableBeds(filters = {}) {
    try {
      const { wardName, bedType, hospitalId } = filters;

      const where = {
        status: 'AVAILABLE',
        hospitalId,
      };
      if (wardName) where.wardName = wardName;
      if (bedType) where.bedType = bedType;

      const beds = await this.prisma.ipdBed.findMany({
        where,
        orderBy: [{ wardName: 'asc' }, { bedNumber: 'asc' }],
      });

      return beds;
    } catch (error) {
      logger.error(`Get Available Beds Error: ${error.message}`);
      throw error;
    }
  }
}
