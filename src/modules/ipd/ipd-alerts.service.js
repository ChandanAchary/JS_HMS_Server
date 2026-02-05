/**
 * IPD Alerts & Clinical Warnings Service
 * Manage clinical alerts, flag-alerts, and real-time notifications
 */

import logger from '../../core/utils/logger.js';
import { AppError } from '../../shared/exceptions/AppError.js';

export class IPDAlertsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create clinical alert
   */
  async createAlert(admissionId, data, currentUser) {
    try {
      const {
        alertType, // CRITICAL, HIGH, MEDIUM, LOW
        category, // VITALS, LABS, MEDICATION, ALLERGY, INFECTION, FALL_RISK
        message,
        details,
        actionRequired,
        relatedOrderId,
        relatedNoteId,
      } = data;

      // Verify admission exists
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
        include: { patient: true },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      const alert = await this.prisma.ipdAlert.create({
        data: {
          admissionId,
          alertType,
          category,
          message,
          details,
          actionRequired,
          relatedOrderId,
          relatedNoteId,
          createdBy: currentUser.id,
          createdDate: new Date(),
          status: 'ACTIVE', // ACTIVE, ACKNOWLEDGED, RESOLVED
          priority: alertType === 'CRITICAL' ? 1 : alertType === 'HIGH' ? 2 : 3,
          hospitalId: currentUser.hospitalId,
        },
      });

      // Notify relevant staff
      await this.notifyAlertRecipients(alert, admission);

      logger.info(`Alert created for admission ${admissionId} - ${alertType}`);
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
          status: 'ACKNOWLEDGED',
          acknowledgedBy: currentUser.id,
          acknowledgedDate: new Date(),
        },
      });

      logger.info(`Alert ${alertId} acknowledged by ${currentUser.name}`);
      return alert;
    } catch (error) {
      logger.error(`Acknowledge Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId, resolutionNotes, currentUser) {
    try {
      const alert = await this.prisma.ipdAlert.update({
        where: { id: alertId },
        data: {
          status: 'RESOLVED',
          resolutionNotes,
          resolvedBy: currentUser.id,
          resolvedDate: new Date(),
        },
      });

      logger.info(`Alert ${alertId} resolved`);
      return alert;
    } catch (error) {
      logger.error(`Resolve Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active alerts for admission
   */
  async getAdmissionAlerts(admissionId, filters = {}) {
    try {
      const { status = 'ACTIVE', alertType } = filters;

      const where = {
        admissionId,
        ...(status && { status }),
        ...(alertType && { alertType }),
      };

      const alerts = await this.prisma.ipdAlert.findMany({
        where,
        orderBy: { priority: 'asc', createdDate: 'desc' },
        include: {
          createdByUser: {
            select: { name: true, role: true },
          },
        },
      });

      return alerts;
    } catch (error) {
      logger.error(`Get Alerts Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create vital sign alert
   */
  async createVitalSignAlert(admissionId, vitalData, currentUser) {
    try {
      const { parameter, value, normalRange, severity } = vitalData;

      // Check if value is outside normal range
      const isAbnormal = value < normalRange.min || value > normalRange.max;

      if (!isAbnormal) {
        return null;
      }

      const alertMessage = `${parameter} reading of ${value} is outside normal range (${normalRange.min}-${normalRange.max})`;

      const alert = await this.createAlert(
        admissionId,
        {
          alertType: severity || 'HIGH',
          category: 'VITALS',
          message: alertMessage,
          details: {
            parameter,
            value,
            normalRange,
            timestamp: new Date(),
          },
          actionRequired: true,
        },
        currentUser
      );

      return alert;
    } catch (error) {
      logger.error(`Create Vital Sign Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create lab value alert
   */
  async createLabValueAlert(admissionId, labData, currentUser) {
    try {
      const { testName, value, referenceRange, criticalFlag, unit } = labData;

      if (!criticalFlag && value >= referenceRange.min && value <= referenceRange.max) {
        return null;
      }

      const severity = criticalFlag ? 'CRITICAL' : 'HIGH';
      const alertMessage = `Lab result ${testName}: ${value} ${unit} - ${criticalFlag ? 'CRITICAL' : 'ABNORMAL'}`;

      const alert = await this.createAlert(
        admissionId,
        {
          alertType: severity,
          category: 'LABS',
          message: alertMessage,
          details: {
            testName,
            value,
            unit,
            referenceRange,
            criticalFlag,
          },
          actionRequired: criticalFlag,
        },
        currentUser
      );

      return alert;
    } catch (error) {
      logger.error(`Create Lab Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create allergy alert
   */
  async createAllergyAlert(admissionId, allergyData, currentUser) {
    try {
      const { allergen, reaction, severity } = allergyData;

      const alert = await this.createAlert(
        admissionId,
        {
          alertType: severity || 'HIGH',
          category: 'ALLERGY',
          message: `ALLERGY ALERT: Patient has documented allergy to ${allergen} - Reaction: ${reaction}`,
          details: {
            allergen,
            reaction,
            severity,
          },
          actionRequired: true,
        },
        currentUser
      );

      return alert;
    } catch (error) {
      logger.error(`Create Allergy Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create medication interaction alert
   */
  async createMedicationInteractionAlert(admissionId, medicationData, currentUser) {
    try {
      const { medication1, medication2, interaction } = medicationData;

      const alert = await this.createAlert(
        admissionId,
        {
          alertType: 'HIGH',
          category: 'MEDICATION',
          message: `DRUG INTERACTION: ${medication1} interacts with ${medication2} - ${interaction}`,
          details: {
            medication1,
            medication2,
            interaction,
          },
          actionRequired: true,
        },
        currentUser
      );

      return alert;
    } catch (error) {
      logger.error(`Create Medication Interaction Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create infection control alert
   */
  async createInfectionControlAlert(admissionId, data, currentUser) {
    try {
      const { infectionType, precautions, isolationRequired } = data;

      const alert = await this.createAlert(
        admissionId,
        {
          alertType: 'CRITICAL',
          category: 'INFECTION',
          message: `INFECTION CONTROL: ${infectionType} detected. Precautions: ${precautions}`,
          details: {
            infectionType,
            precautions,
            isolationRequired,
            notificationRequired: true,
          },
          actionRequired: true,
        },
        currentUser
      );

      // Notify infection control team
      await this.notifyInfectionControl(alert);

      return alert;
    } catch (error) {
      logger.error(`Create Infection Control Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create fall risk alert
   */
  async createFallRiskAlert(admissionId, riskLevel, currentUser) {
    try {
      const riskLevels = {
        HIGH: 'Patient is at HIGH risk of falls - Implement fall prevention measures',
        MEDIUM: 'Patient is at MEDIUM risk of falls - Monitor closely',
        LOW: 'Patient is at LOW risk of falls',
      };

      const alert = await this.createAlert(
        admissionId,
        {
          alertType: riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
          category: 'FALL_RISK',
          message: riskLevels[riskLevel],
          details: {
            riskLevel,
            preventionMeasures: [
              'Bed alarm enabled',
              'Call bell within reach',
              'Non-slip footwear',
              'Clear pathways',
            ],
          },
          actionRequired: riskLevel === 'HIGH',
        },
        currentUser
      );

      return alert;
    } catch (error) {
      logger.error(`Create Fall Risk Alert Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify alert recipients
   */
  async notifyAlertRecipients(alert, admission) {
    try {
      // Determine who should be notified based on alert type
      let recipients = [];

      // Always notify assigned doctor and nurse
      if (admission.assignedDoctorId) recipients.push(admission.assignedDoctorId);
      if (admission.assignedNurseId) recipients.push(admission.assignedNurseId);

      // For critical alerts, also notify ward in-charge
      if (alert.alertType === 'CRITICAL') {
        const ward = await this.prisma.ipdWard.findUnique({
          where: { id: admission.wardId },
        });
        if (ward?.inChargeId) recipients.push(ward.inChargeId);
      }

      // Create notifications for all recipients
      for (const userId of recipients) {
        await this.prisma.notification.create({
          data: {
            userId,
            title: `Alert: ${alert.message}`,
            message: alert.message,
            type: 'ALERT',
            relatedEntity: 'ADMISSION',
            relatedId: alert.admissionId,
            priority: alert.alertType,
            read: false,
          },
        });
      }

      logger.info(`Alert notifications sent for admission ${admission.id}`);
    } catch (error) {
      logger.error(`Notify Alert Recipients Error: ${error.message}`);
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Notify infection control team
   */
  async notifyInfectionControl(alert) {
    try {
      // Find all staff with infection control role
      const infectionControlStaff = await this.prisma.user.findMany({
        where: { role: 'INFECTION_CONTROL' },
      });

      for (const staff of infectionControlStaff) {
        await this.prisma.notification.create({
          data: {
            userId: staff.id,
            title: 'Infection Control Alert',
            message: alert.message,
            type: 'INFECTION_ALERT',
            relatedEntity: 'ALERT',
            relatedId: alert.id,
            priority: 'CRITICAL',
            read: false,
          },
        });
      }
    } catch (error) {
      logger.error(`Notify Infection Control Error: ${error.message}`);
    }
  }

  /**
   * Get alert statistics for ward/hospital
   */
  async getAlertStatistics(filters = {}) {
    try {
      const { wardId, hospitalId, dateFrom, dateTo } = filters;

      const where = {};
      if (wardId) where.admission = { wardId };
      if (hospitalId) where.hospitalId = hospitalId;
      if (dateFrom || dateTo) {
        where.createdDate = {};
        if (dateFrom) where.createdDate.gte = new Date(dateFrom);
        if (dateTo) where.createdDate.lte = new Date(dateTo);
      }

      const [byType, byStatus, byCategory] = await Promise.all([
        this.prisma.ipdAlert.groupBy({
          by: ['alertType'],
          where,
          _count: true,
        }),
        this.prisma.ipdAlert.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        this.prisma.ipdAlert.groupBy({
          by: ['category'],
          where,
          _count: true,
        }),
      ]);

      return { byType, byStatus, byCategory };
    } catch (error) {
      logger.error(`Get Alert Statistics Error: ${error.message}`);
      throw error;
    }
  }
}
