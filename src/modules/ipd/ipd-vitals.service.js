/**
 * IPD Vitals Monitoring Service
 * Manage patient vital signs monitoring and tracking
 */

import logger from '../../core/utils/logger.js';
import { AppError } from '../../shared/exceptions/AppError.js';

export class IPDVitalsService {
  constructor(prisma, alertsService) {
    this.prisma = prisma;
    this.alertsService = alertsService;
  }

  /**
   * Record vital signs
   */
  async recordVitals(admissionId, vitalsData, currentUser) {
    try {
      const {
        temperature,
        systolicBP,
        diastolicBP,
        pulse,
        respiratoryRate,
        oxygenSaturation,
        bloodGlucose,
        weight,
        notes,
        recordedTime,
      } = vitalsData;

      // Verify admission exists
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      const vitals = await this.prisma.ipdVitalSigns.create({
        data: {
          admissionId,
          temperature,
          systolicBP,
          diastolicBP,
          pulse,
          respiratoryRate,
          oxygenSaturation,
          bloodGlucose,
          weight,
          notes,
          recordedAt: new Date(recordedTime || Date.now()),
          recordedBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
      });

      // Check for abnormalities and create alerts
      await this.checkVitalAbnormalities(admissionId, vitals, currentUser);

      logger.info(`Vital signs recorded for admission ${admissionId}`);
      return vitals;
    } catch (error) {
      logger.error(`Record Vitals Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check vital signs for abnormalities
   */
  async checkVitalAbnormalities(admissionId, vitals, currentUser) {
    try {
      const normalRanges = {
        temperature: { min: 36.5, max: 37.5, unit: '°C' },
        pulse: { min: 60, max: 100, unit: 'bpm' },
        systolicBP: { min: 90, max: 140, unit: 'mmHg' },
        diastolicBP: { min: 60, max: 90, unit: 'mmHg' },
        respiratoryRate: { min: 12, max: 20, unit: 'breaths/min' },
        oxygenSaturation: { min: 95, max: 100, unit: '%' },
      };

      // Check each vital parameter
      const checks = [
        { param: 'temperature', value: vitals.temperature },
        { param: 'pulse', value: vitals.pulse },
        { param: 'systolicBP', value: vitals.systolicBP },
        { param: 'diastolicBP', value: vitals.diastolicBP },
        { param: 'respiratoryRate', value: vitals.respiratoryRate },
        { param: 'oxygenSaturation', value: vitals.oxygenSaturation },
      ];

      for (const check of checks) {
        if (!check.value) continue;

        const range = normalRanges[check.param];
        if (check.value < range.min || check.value > range.max) {
          // Determine severity
          const isAbnormal = Math.abs(check.value - ((range.min + range.max) / 2)) > ((range.max - range.min) / 2);
          const severity = isAbnormal ? 'HIGH' : 'MEDIUM';

          await this.alertsService.createVitalSignAlert(
            admissionId,
            {
              parameter: check.param,
              value: check.value,
              normalRange: range,
              severity,
            },
            currentUser
          );
        }
      }
    } catch (error) {
      logger.error(`Check Vital Abnormalities Error: ${error.message}`);
      // Don't throw - monitoring shouldn't stop due to alert creation
    }
  }

  /**
   * Get recent vitals for admission
   */
  async getRecentVitals(admissionId, limit = 10) {
    try {
      const vitals = await this.prisma.ipdVitalSigns.findMany({
        where: { admissionId },
        take: limit,
        orderBy: { recordedAt: 'desc' },
        include: {
          recordedByUser: {
            select: { name: true, role: true },
          },
        },
      });

      return vitals.reverse(); // Return in chronological order
    } catch (error) {
      logger.error(`Get Recent Vitals Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get vital signs trend
   */
  async getVitalsTrend(admissionId, parameter, days = 7) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const vitals = await this.prisma.ipdVitalSigns.findMany({
        where: {
          admissionId,
          recordedAt: {
            gte: dateFrom,
          },
        },
        orderBy: { recordedAt: 'asc' },
      });

      const trend = vitals.map((v) => ({
        timestamp: v.recordedAt,
        value: v[parameter],
      }));

      // Calculate statistics
      const values = trend.map((t) => t.value).filter((v) => v !== null);
      const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
      const min = values.length > 0 ? Math.min(...values) : null;
      const max = values.length > 0 ? Math.max(...values) : null;

      return {
        parameter,
        days,
        trend,
        statistics: {
          average: average?.toFixed(2),
          minimum: min,
          maximum: max,
          recordCount: values.length,
        },
      };
    } catch (error) {
      logger.error(`Get Vitals Trend Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get vital signs chart data
   */
  async getVitalsChartData(admissionId, startDate, endDate) {
    try {
      const vitals = await this.prisma.ipdVitalSigns.findMany({
        where: {
          admissionId,
          recordedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: { recordedAt: 'asc' },
      });

      // Group by vital parameter
      const chartData = {
        temperature: [],
        bloodPressure: [],
        pulse: [],
        respiratoryRate: [],
        oxygenSaturation: [],
        bloodGlucose: [],
      };

      vitals.forEach((v) => {
        const timestamp = v.recordedAt.getTime();

        if (v.temperature) chartData.temperature.push({ x: timestamp, y: v.temperature });
        if (v.systolicBP && v.diastolicBP) {
          chartData.bloodPressure.push({
            x: timestamp,
            systolic: v.systolicBP,
            diastolic: v.diastolicBP,
          });
        }
        if (v.pulse) chartData.pulse.push({ x: timestamp, y: v.pulse });
        if (v.respiratoryRate) chartData.respiratoryRate.push({ x: timestamp, y: v.respiratoryRate });
        if (v.oxygenSaturation) chartData.oxygenSaturation.push({ x: timestamp, y: v.oxygenSaturation });
        if (v.bloodGlucose) chartData.bloodGlucose.push({ x: timestamp, y: v.bloodGlucose });
      });

      return chartData;
    } catch (error) {
      logger.error(`Get Vitals Chart Data Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create continuous monitoring request
   */
  async startContinuousMonitoring(admissionId, monitoringType, currentUser) {
    try {
      const monitoring = await this.prisma.ipdContinuousMonitoring.create({
        data: {
          admissionId,
          monitoringType, // CARDIAC, RESPIRATORY, NEURO, TEMPERATURE, CONTINUOUS_PULSE_OX
          startTime: new Date(),
          status: 'ACTIVE',
          initiatedBy: currentUser.id,
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Continuous monitoring started for admission ${admissionId} - ${monitoringType}`);
      return monitoring;
    } catch (error) {
      logger.error(`Start Continuous Monitoring Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop continuous monitoring
   */
  async stopContinuousMonitoring(monitoringId, currentUser) {
    try {
      const monitoring = await this.prisma.ipdContinuousMonitoring.update({
        where: { id: monitoringId },
        data: {
          status: 'STOPPED',
          endTime: new Date(),
          stoppedBy: currentUser.id,
        },
      });

      logger.info(`Continuous monitoring stopped - ${monitoringId}`);
      return monitoring;
    } catch (error) {
      logger.error(`Stop Continuous Monitoring Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active monitoring for admission
   */
  async getActiveMonitoring(admissionId) {
    try {
      const monitoring = await this.prisma.ipdContinuousMonitoring.findMany({
        where: {
          admissionId,
          status: 'ACTIVE',
        },
      });

      return monitoring;
    } catch (error) {
      logger.error(`Get Active Monitoring Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate BMI
   */
  calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  }

  /**
   * Get vital statistics summary
   */
  async getVitalStatisticsSummary(admissionId) {
    try {
      const latestVitals = await this.prisma.ipdVitalSigns.findFirst({
        where: { admissionId },
        orderBy: { recordedAt: 'desc' },
      });

      if (!latestVitals) {
        return { message: 'No vital signs recorded yet' };
      }

      const previousVitals = await this.prisma.ipdVitalSigns.findFirst({
        where: { admissionId },
        orderBy: { recordedAt: 'desc' },
        skip: 1,
      });

      return {
        current: {
          temperature: latestVitals.temperature,
          bloodPressure: `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`,
          pulse: latestVitals.pulse,
          respiratoryRate: latestVitals.respiratoryRate,
          oxygenSaturation: latestVitals.oxygenSaturation,
          bloodGlucose: latestVitals.bloodGlucose,
          weight: latestVitals.weight,
          recordedAt: latestVitals.recordedAt,
        },
        trend: previousVitals ? {
          temperatureTrend: this.getTrend(previousVitals.temperature, latestVitals.temperature),
          pulseTrend: this.getTrend(previousVitals.pulse, latestVitals.pulse),
        } : null,
      };
    } catch (error) {
      logger.error(`Get Vital Statistics Summary Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Determine trend direction
   */
  getTrend(previous, current) {
    if (!previous || !current) return 'STABLE';
    if (current > previous) return 'INCREASING';
    if (current < previous) return 'DECREASING';
    return 'STABLE';
  }
}
