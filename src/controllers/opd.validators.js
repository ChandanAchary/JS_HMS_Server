/**
 * OPD Module Validators & DTOs
 * Response formatting and validation for OPD-related data
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

class VitalsDTO {
  /**
   * Format vital signs for API response
   */
  static formatVitalsResponse(vitals) {
    if (!vitals) return null;

    return {
      id: vitals.id,
      visitId: vitals.visitId,
      patientId: vitals.patientId,
      measurements: {
        height: {
          value: vitals.height,
          unit: 'cm',
          display: vitals.height ? `${vitals.height} cm` : null,
        },
        weight: {
          value: vitals.weight,
          unit: 'kg',
          display: vitals.weight ? `${vitals.weight} kg` : null,
        },
        bmi: {
          value: vitals.bmi,
          unit: 'kg/m²',
          display: vitals.bmi ? `${vitals.bmi} kg/m²` : null,
          category: this._getBMICategory(vitals.bmi),
        },
        bloodPressure: {
          systolic: vitals.bloodPressureSystolic,
          diastolic: vitals.bloodPressureDiastolic,
          unit: 'mmHg',
          display: vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
            ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`
            : null,
          category: this._getBPCategory(vitals.bloodPressureSystolic, vitals.bloodPressureDiastolic),
        },
        pulseRate: {
          value: vitals.pulseRate,
          unit: 'bpm',
          display: vitals.pulseRate ? `${vitals.pulseRate} bpm` : null,
        },
        temperature: {
          value: vitals.temperature,
          unit: '°C',
          display: vitals.temperature ? `${vitals.temperature}°C` : null,
        },
        respiratoryRate: {
          value: vitals.respiratoryRate,
          unit: 'breaths/min',
          display: vitals.respiratoryRate ? `${vitals.respiratoryRate} breaths/min` : null,
        },
        oxygenSaturation: {
          value: vitals.oxygenSaturation,
          unit: '%',
          display: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : null,
        },
      },
      recordedAt: vitals.recordedAt,
      recordedBy: {
        id: vitals.recordedBy,
        name: vitals.recordedByName,
      },
      createdAt: vitals.createdAt,
      updatedAt: vitals.updatedAt,
    };
  }

  /**
   * Get BMI category based on WHO classification
   * @private
   */
  static _getBMICategory(bmi) {
    if (!bmi) return null;
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese Class I';
    if (bmi < 40) return 'Obese Class II';
    return 'Obese Class III';
  }

  /**
   * Get Blood Pressure category based on ACC/AHA guidelines
   * @private
   */
  static _getBPCategory(systolic, diastolic) {
    if (!systolic || !diastolic) return null;

    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic < 140 || diastolic < 90) return 'Stage 1 Hypertension';
    if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
    return 'Hypertensive Crisis';
  }

  /**
   * Format vital signs history for list response
   */
  static formatVitalsHistoryResponse(vitalsArray) {
    if (!vitalsArray || vitalsArray.length === 0) return [];

    return vitalsArray.map(vitals => this.formatVitalsResponse(vitals));
  }

  /**
   * Format vital signs comparison response
   */
  static formatComparisonResponse(comparison) {
    return {
      current: this.formatVitalsResponse(comparison.current),
      previous: comparison.previous ? this.formatVitalsResponse(comparison.previous) : null,
      trend: comparison.comparison,
    };
  }
}

// ============================================================================
// Validators
// ============================================================================

// OPD validator functions can be added here as needed

export { VitalsDTO };

















