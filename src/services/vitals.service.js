/**
 * Vital Signs Service
 * Handles recording, retrieving, and managing vital signs during OPD triage
 */

import prisma from '../core/database/prismaClient.js';

class VitalsService {
  /**
   * Calculate BMI from height (cm) and weight (kg)
   * BMI = weight (kg) / (height (m))^2
   * @param {number} heightCm - Height in centimeters
   * @param {number} weightKg - Weight in kilograms
   * @returns {number|null} - Calculated BMI or null if insufficient data
   */
  calculateBMI(heightCm, weightKg) {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      return null;
    }
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  }

  /**
   * Record vital signs for a patient visit
   * @param {string} visitId - Patient visit ID
   * @param {string} hospitalId - Hospital ID
   * @param {string} patientId - Patient ID
   * @param {object} vitalsData - Vital signs data from request
   * @param {string} recordedBy - Employee/Nurse ID who recorded vitals
   * @returns {object} - Created vital signs record
   */
  async recordVitals(visitId, hospitalId, patientId, vitalsData, recordedBy) {
    try {
      // Verify visit exists and belongs to this patient
      const visit = await prisma.patientVisit.findUnique({
        where: { visitId },
        include: { patient: true },
      });

      if (!visit) {
        throw new Error(`Visit ${visitId} not found`);
      }

      if (visit.patientId !== patientId) {
        throw new Error(`Visit does not belong to patient ${patientId}`);
      }

      if (visit.hospitalId !== hospitalId) {
        throw new Error(`Visit does not belong to hospital ${hospitalId}`);
      }

      // Extract vital measurements
      const {
        height, // cm
        weight, // kg
        bloodPressureSystolic, // mmHg
        bloodPressureDiastolic, // mmHg
        pulseRate, // bpm
        temperature, // °C or °F
        respiratoryRate, // breaths/min
        oxygenSaturation, // %
      } = vitalsData;

      // Calculate BMI if height and weight are provided
      const bmi = this.calculateBMI(height, weight);

      // Create vital signs record
      const vitalSigns = await prisma.vitalSigns.create({
        data: {
          hospitalId,
          patientId,
          visitId,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          bmi,
          bloodPressureSystolic: bloodPressureSystolic
            ? parseInt(bloodPressureSystolic)
            : null,
          bloodPressureDiastolic: bloodPressureDiastolic
            ? parseInt(bloodPressureDiastolic)
            : null,
          pulseRate: pulseRate ? parseInt(pulseRate) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
          oxygenSaturation: oxygenSaturation
            ? parseFloat(oxygenSaturation)
            : null,
          recordedBy,
          recordedByName: vitalsData.recordedByName || null,
          recordedAt: new Date(),
        },
      });

      return vitalSigns;
    } catch (error) {
      throw new Error(`Error recording vital signs: ${error.message}`);
    }
  }

  /**
   * Get vital signs for a specific visit
   * @param {string} visitId - Patient visit ID
   * @returns {object|null} - Vital signs record or null if not found
   */
  async getVitalsByVisit(visitId) {
    try {
      const vitals = await prisma.vitalSigns.findFirst({
        where: { visitId },
        orderBy: { recordedAt: 'desc' }, // Get latest if multiple records
      });

      return vitals;
    } catch (error) {
      throw new Error(`Error fetching vital signs: ${error.message}`);
    }
  }

  /**
   * Get vital signs history for a patient (all visits)
   * @param {string} patientId - Patient ID
   * @param {number} limit - Number of records to fetch (default 10)
   * @returns {array} - List of vital signs records ordered by date (newest first)
   */
  async getVitalsHistory(patientId, limit = 10) {
    try {
      const vitals = await prisma.vitalSigns.findMany({
        where: { patientId },
        orderBy: { recordedAt: 'desc' },
        take: limit,
        include: {
          patientVisit: {
            select: {
              visitId: true,
              visitType: true,
              visitDate: true,
              chiefComplaint: true,
            },
          },
        },
      });

      return vitals;
    } catch (error) {
      throw new Error(`Error fetching vital signs history: ${error.message}`);
    }
  }

  /**
   * Update vital signs for a visit
   * @param {string} visitId - Patient visit ID
   * @param {object} updateData - Fields to update
   * @param {string} recordedBy - Employee/Nurse ID performing update
   * @returns {object} - Updated vital signs record
   */
  async updateVitals(visitId, updateData, recordedBy) {
    try {
      // Get existing vitals
      const existingVitals = await prisma.vitalSigns.findFirst({
        where: { visitId },
      });

      if (!existingVitals) {
        throw new Error(`No vital signs found for visit ${visitId}`);
      }

      // Prepare update data
      const updatePayload = {
        ...updateData,
        recordedBy,
        recordedAt: new Date(),
      };

      // Recalculate BMI if height or weight changed
      const height = updateData.height || existingVitals.height;
      const weight = updateData.weight || existingVitals.weight;
      if (updateData.height || updateData.weight) {
        updatePayload.bmi = this.calculateBMI(height, weight);
      }

      const updatedVitals = await prisma.vitalSigns.update({
        where: { id: existingVitals.id },
        data: updatePayload,
      });

      return updatedVitals;
    } catch (error) {
      throw new Error(`Error updating vital signs: ${error.message}`);
    }
  }

  /**
   * Check if vitals have been recorded for a visit
   * @param {string} visitId - Patient visit ID
   * @returns {boolean}
   */
  async hasVitalsRecorded(visitId) {
    try {
      const vitals = await prisma.vitalSigns.findFirst({
        where: { visitId },
      });
      return !!vitals;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get vitals with comparison to patient's previous records
   * Useful for identifying trends
   * @param {string} visitId - Patient visit ID
   * @returns {object} - Current vitals with previous vitals for comparison
   */
  async getVitalsWithComparison(visitId) {
    try {
      const visit = await prisma.patientVisit.findUnique({
        where: { visitId },
      });

      if (!visit) {
        throw new Error(`Visit ${visitId} not found`);
      }

      // Get current vitals
      const currentVitals = await this.getVitalsByVisit(visitId);

      // Get previous vitals (if any)
      const previousVitals = await prisma.vitalSigns.findMany({
        where: {
          patientId: visit.patientId,
          visitId: { not: visitId }, // Exclude current visit
        },
        orderBy: { recordedAt: 'desc' },
        take: 1,
      });

      return {
        current: currentVitals,
        previous: previousVitals.length > 0 ? previousVitals[0] : null,
        comparison: currentVitals && previousVitals.length > 0 ? this._compareVitals(currentVitals, previousVitals[0]) : null,
      };
    } catch (error) {
      throw new Error(`Error fetching vitals with comparison: ${error.message}`);
    }
  }

  /**
   * Compare two vital sign records to identify changes
   * @private
   */
  _compareVitals(current, previous) {
    return {
      heightChange: current.height && previous.height ? current.height - previous.height : null,
      weightChange: current.weight && previous.weight ? current.weight - previous.weight : null,
      bmiChange: current.bmi && previous.bmi ? current.bmi - previous.bmi : null,
      systolicChange: current.bloodPressureSystolic && previous.bloodPressureSystolic ? current.bloodPressureSystolic - previous.bloodPressureSystolic : null,
      diastolicChange: current.bloodPressureDiastolic && previous.bloodPressureDiastolic ? current.bloodPressureDiastolic - previous.bloodPressureDiastolic : null,
      pulseChange: current.pulseRate && previous.pulseRate ? current.pulseRate - previous.pulseRate : null,
      temperatureChange: current.temperature && previous.temperature ? current.temperature - previous.temperature : null,
      respiratoryRateChange: current.respiratoryRate && previous.respiratoryRate ? current.respiratoryRate - previous.respiratoryRate : null,
      oxygenSaturationChange: current.oxygenSaturation && previous.oxygenSaturation ? current.oxygenSaturation - previous.oxygenSaturation : null,
    };
  }

  /**
   * Delete vital signs record (admin/audit purposes)
   * @param {string} visitId - Patient visit ID
   * @param {string} reason - Reason for deletion
   * @returns {boolean}
   */
  async deleteVitals(visitId, reason = 'Admin deletion') {
    try {
      const vitals = await prisma.vitalSigns.findFirst({
        where: { visitId },
      });

      if (!vitals) {
        throw new Error(`No vital signs found for visit ${visitId}`);
      }

      await prisma.vitalSigns.delete({
        where: { id: vitals.id },
      });

      return true;
    } catch (error) {
      throw new Error(`Error deleting vital signs: ${error.message}`);
    }
  }
}

export default new VitalsService();



















