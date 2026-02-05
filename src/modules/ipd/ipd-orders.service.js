/**
 * IPD Clinical Orders & Procedures Service
 * Manage orders for labs, medications, procedures, and care plans
 */

import logger from '../../core/utils/logger.js';
import { AppError } from '../../shared/exceptions/AppError.js';

export class IPDOrdersService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create clinical order (Lab, Medication, Procedure)
   */
  async createOrder(admissionId, data, currentUser) {
    try {
      const {
        orderType, // LAB, MEDICATION, PROCEDURE, IMAGING
        description,
        orderedItems,
        urgency,
        prescriptions,
        notes,
      } = data;

      // Verify admission exists
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      const order = await this.prisma.ipdOrder.create({
        data: {
          admissionId,
          orderType,
          description,
          orderedItems,
          urgency, // STAT, HIGH, ROUTINE
          prescriptions,
          notes,
          status: 'PENDING', // PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
          orderedBy: currentUser.id,
          orderDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Order created for admission ${admissionId}`);
      return order;
    } catch (error) {
      logger.error(`Create Order Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const validStatuses = [
        'PENDING',
        'ACCEPTED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
      ];

      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid order status', 400);
      }

      const order = await this.prisma.ipdOrder.update({
        where: { id: orderId },
        data: {
          status,
          statusNotes: notes,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

      logger.info(`Order ${orderId} status updated to ${status}`);
      return order;
    } catch (error) {
      logger.error(`Update Order Status Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get orders for admission
   */
  async getAdmissionOrders(admissionId, filters = {}, skip = 0, take = 20) {
    try {
      const { status, orderType } = filters;

      const where = { admissionId };
      if (status) where.status = status;
      if (orderType) where.orderType = orderType;

      const [orders, total] = await Promise.all([
        this.prisma.ipdOrder.findMany({
          where,
          skip,
          take,
          orderBy: { orderDate: 'desc' },
          include: {
            results: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        }),
        this.prisma.ipdOrder.count({ where }),
      ]);

      return { orders, total, skip, take };
    } catch (error) {
      logger.error(`Get Orders Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create medication administration record (MAR)
   */
  async recordMedicationAdministration(admissionId, data, currentUser) {
    try {
      const {
        medicationName,
        dosage,
        route,
        administeredTime,
        orderedById,
        prescriptionDetails,
        notes,
      } = data;

      const mar = await this.prisma.ipdMedicationAdministration.create({
        data: {
          admissionId,
          medicationName,
          dosage,
          route, // ORAL, IV, IM, SC, TOPICAL
          administeredTime: new Date(administeredTime),
          administeredBy: currentUser.id,
          orderedById,
          prescriptionDetails,
          notes,
          status: 'ADMINISTERED',
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Medication administered for admission ${admissionId}`);
      return mar;
    } catch (error) {
      logger.error(`Record Medication Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get medication administration records (MAR) for admission
   */
  async getMedicationAdministrationRecords(admissionId, skip = 0, take = 50) {
    try {
      const [records, total] = await Promise.all([
        this.prisma.ipdMedicationAdministration.findMany({
          where: { admissionId },
          skip,
          take,
          orderBy: { administeredTime: 'desc' },
          include: {
            administeredByUser: {
              select: { name: true, role: true },
            },
          },
        }),
        this.prisma.ipdMedicationAdministration.count({ where: { admissionId } }),
      ]);

      return { records, total, skip, take };
    } catch (error) {
      logger.error(`Get MAR Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create care plan (Multidisciplinary)
   */
  async createCarePlan(admissionId, data, currentUser) {
    try {
      const {
        planName,
        objectives,
        interventions,
        disciplines, // DOCTOR, NURSE, PHYSIOTHERAPY, DIETICIAN, SOCIAL_WORKER
        duration,
        notes,
      } = data;

      const carePlan = await this.prisma.ipdCarePlan.create({
        data: {
          admissionId,
          planName,
          objectives,
          interventions,
          disciplines,
          duration,
          notes,
          createdBy: currentUser.id,
          status: 'ACTIVE',
          createdDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Care plan created for admission ${admissionId}`);
      return carePlan;
    } catch (error) {
      logger.error(`Create Care Plan Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get care plans for admission
   */
  async getCarePlans(admissionId) {
    try {
      const plans = await this.prisma.ipdCarePlan.findMany({
        where: { admissionId },
        orderBy: { createdDate: 'desc' },
        include: {
          createdByUser: {
            select: { name: true, role: true },
          },
        },
      });

      return plans;
    } catch (error) {
      logger.error(`Get Care Plans Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Schedule procedure
   */
  async scheduleProcedure(admissionId, data, currentUser) {
    try {
      const {
        procedureName,
        description,
        scheduledDate,
        location, // OT, PROCEDURE_ROOM, BEDSIDE
        surgeonId,
        assistingStaff,
        preOperativeNotes,
      } = data;

      const procedure = await this.prisma.ipdProcedure.create({
        data: {
          admissionId,
          procedureName,
          description,
          scheduledDate: new Date(scheduledDate),
          location,
          surgeonId,
          assistingStaff,
          preOperativeNotes,
          status: 'SCHEDULED', // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
          scheduledBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Procedure scheduled for admission ${admissionId}`);
      return procedure;
    } catch (error) {
      logger.error(`Schedule Procedure Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get procedures for admission
   */
  async getAdmissionProcedures(admissionId) {
    try {
      const procedures = await this.prisma.ipdProcedure.findMany({
        where: { admissionId },
        orderBy: { scheduledDate: 'asc' },
        include: {
          surgeon: {
            select: { name: true, specialization: true },
          },
        },
      });

      return procedures;
    } catch (error) {
      logger.error(`Get Procedures Error: ${error.message}`);
      throw error;
    }
  }
}
