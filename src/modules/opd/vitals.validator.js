/**
 * Vital Signs Validators
 * Input validation for vital signs data
 */

class VitalsValidator {
  /**
   * Validate vital signs input data
   * @param {object} vitalsData - Input data from request
   * @returns {object} - { isValid: boolean, errors: array }
   */
  validateVitalsInput(vitalsData) {
    const errors = [];

    if (!vitalsData) {
      errors.push('Vital signs data is required');
      return { isValid: false, errors };
    }

    // At least one vital must be provided
    const hasData =
      vitalsData.height ||
      vitalsData.weight ||
      vitalsData.bloodPressureSystolic ||
      vitalsData.bloodPressureDiastolic ||
      vitalsData.pulseRate ||
      vitalsData.temperature ||
      vitalsData.respiratoryRate ||
      vitalsData.oxygenSaturation;

    if (!hasData) {
      errors.push('At least one vital sign must be provided');
    }

    // Validate height (cm)
    if (vitalsData.height !== undefined && vitalsData.height !== null) {
      const height = parseFloat(vitalsData.height);
      if (isNaN(height) || height <= 0 || height > 300) {
        errors.push('Height must be a valid number between 1-300 cm');
      }
    }

    // Validate weight (kg)
    if (vitalsData.weight !== undefined && vitalsData.weight !== null) {
      const weight = parseFloat(vitalsData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 500) {
        errors.push('Weight must be a valid number between 1-500 kg');
      }
    }

    // Validate BP Systolic
    if (vitalsData.bloodPressureSystolic !== undefined && vitalsData.bloodPressureSystolic !== null) {
      const sys = parseInt(vitalsData.bloodPressureSystolic);
      if (isNaN(sys) || sys < 50 || sys > 300) {
        errors.push('Systolic BP must be between 50-300 mmHg');
      }
    }

    // Validate BP Diastolic
    if (vitalsData.bloodPressureDiastolic !== undefined && vitalsData.bloodPressureDiastolic !== null) {
      const dia = parseInt(vitalsData.bloodPressureDiastolic);
      if (isNaN(dia) || dia < 30 || dia > 200) {
        errors.push('Diastolic BP must be between 30-200 mmHg');
      }
    }

    // Validate BP - systolic should be > diastolic
    if (
      vitalsData.bloodPressureSystolic &&
      vitalsData.bloodPressureDiastolic
    ) {
      const sys = parseInt(vitalsData.bloodPressureSystolic);
      const dia = parseInt(vitalsData.bloodPressureDiastolic);
      if (sys <= dia) {
        errors.push('Systolic BP must be greater than Diastolic BP');
      }
    }

    // Validate Pulse Rate (bpm)
    if (vitalsData.pulseRate !== undefined && vitalsData.pulseRate !== null) {
      const pulse = parseInt(vitalsData.pulseRate);
      if (isNaN(pulse) || pulse < 20 || pulse > 200) {
        errors.push('Pulse rate must be between 20-200 bpm');
      }
    }

    // Validate Temperature (°C)
    if (vitalsData.temperature !== undefined && vitalsData.temperature !== null) {
      const temp = parseFloat(vitalsData.temperature);
      if (isNaN(temp) || temp < 35 || temp > 42) {
        errors.push('Temperature must be between 35-42°C (95-107.6°F)');
      }
    }

    // Validate Respiratory Rate (breaths/min)
    if (vitalsData.respiratoryRate !== undefined && vitalsData.respiratoryRate !== null) {
      const rr = parseInt(vitalsData.respiratoryRate);
      if (isNaN(rr) || rr < 8 || rr > 60) {
        errors.push('Respiratory rate must be between 8-60 breaths/min');
      }
    }

    // Validate Oxygen Saturation (%)
    if (vitalsData.oxygenSaturation !== undefined && vitalsData.oxygenSaturation !== null) {
      const spO2 = parseFloat(vitalsData.oxygenSaturation);
      if (isNaN(spO2) || spO2 < 70 || spO2 > 100) {
        errors.push('Oxygen saturation must be between 70-100%');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate required parameters for vitals endpoints
   * @param {object} params - Route/query parameters
   * @returns {object} - { isValid: boolean, errors: array }
   */
  validateParams(params) {
    const errors = [];

    if (!params.visitId || typeof params.visitId !== 'string') {
      errors.push('Valid visitId is required');
    }

    if (!params.hospitalId || typeof params.hospitalId !== 'string') {
      errors.push('Valid hospitalId is required');
    }

    if (!params.patientId || typeof params.patientId !== 'string') {
      errors.push('Valid patientId is required');
    }

    if (!params.recordedBy || typeof params.recordedBy !== 'string') {
      errors.push('recordedBy (staff ID) is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get vitals as formatted string (for display)
   */
  formatVitalsForDisplay(vitals) {
    if (!vitals) return null;

    return {
      height: vitals.height ? `${vitals.height} cm` : '-',
      weight: vitals.weight ? `${vitals.weight} kg` : '-',
      bmi: vitals.bmi ? `${vitals.bmi} kg/m²` : '-',
      bloodPressure: vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
        ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`
        : '-',
      pulseRate: vitals.pulseRate ? `${vitals.pulseRate} bpm` : '-',
      temperature: vitals.temperature ? `${vitals.temperature}°C` : '-',
      respiratoryRate: vitals.respiratoryRate ? `${vitals.respiratoryRate} breaths/min` : '-',
      oxygenSaturation: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '-',
      recordedAt: vitals.recordedAt ? new Date(vitals.recordedAt).toLocaleString() : '-',
      recordedByName: vitals.recordedByName || 'Unknown',
    };
  }
}

export default new VitalsValidator();
