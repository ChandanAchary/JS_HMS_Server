/**
 * Vital Signs Controller
 * HTTP request handlers for vital signs operations
 */

import vitalsService from './vitals.service.js';
import vitalsValidator from './vitals.validator.js';

class VitalsController {
  /**
   * Record vital signs for a patient visit (OPD Triage Entry)
   * POST /api/opd/:visitId/vitals
   */
  async recordVitals(req, res) {
    try {
      const { visitId } = req.params;
      const { patientId, hospitalId } = req.user || {}; // From auth middleware
      const recordedBy = req.user?.id || req.body.recordedBy; // Staff/Nurse ID
      const vitalsData = req.body;

      // Validate parameters
      const paramValidation = vitalsValidator.validateParams({
        visitId,
        patientId,
        hospitalId,
        recordedBy,
      });

      if (!paramValidation.isValid) {
        return res.status(400).json({
          success: false,
          errors: paramValidation.errors,
        });
      }

      // Validate vital signs data
      const dataValidation = vitalsValidator.validateVitalsInput(vitalsData);
      if (!dataValidation.isValid) {
        return res.status(400).json({
          success: false,
          errors: dataValidation.errors,
        });
      }

      // Record vitals
      const result = await vitalsService.recordVitals(
        visitId,
        hospitalId,
        patientId,
        vitalsData,
        recordedBy
      );

      // Format response
      const formattedVitals = vitalsValidator.formatVitalsForDisplay(result);

      return res.status(201).json({
        success: true,
        message: 'Vital signs recorded successfully',
        data: {
          id: result.id,
          visitId: result.visitId,
          patientId: result.patientId,
          vitals: formattedVitals,
          rawData: result, // Include raw data for detailed display if needed
          recordedAt: result.recordedAt,
        },
      });
    } catch (error) {
      console.error('Error recording vital signs:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error recording vital signs',
      });
    }
  }

  /**
   * Get vital signs for a specific visit
   * GET /api/opd/:visitId/vitals
   */
  async getVitalsByVisit(req, res) {
    try {
      const { visitId } = req.params;

      if (!visitId) {
        return res.status(400).json({
          success: false,
          message: 'visitId is required',
        });
      }

      const vitals = await vitalsService.getVitalsByVisit(visitId);

      if (!vitals) {
        return res.status(404).json({
          success: false,
          message: `No vital signs found for visit ${visitId}`,
        });
      }

      const formattedVitals = vitalsValidator.formatVitalsForDisplay(vitals);

      return res.status(200).json({
        success: true,
        data: {
          visitId,
          vitals: formattedVitals,
          rawData: vitals,
        },
      });
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching vital signs',
      });
    }
  }

  /**
   * Get vital signs history for a patient
   * GET /api/patient/:patientId/vitals/history?limit=10
   */
  async getVitalsHistory(req, res) {
    try {
      const { patientId } = req.params;
      const { limit = 10 } = req.query;

      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'patientId is required',
        });
      }

      const vitals = await vitalsService.getVitalsHistory(patientId, parseInt(limit));

      if (vitals.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No vital signs history found',
          data: [],
        });
      }

      const formattedVitals = vitals.map(v => ({
        visitId: v.visitId,
        visitDetails: v.patientVisit,
        vitals: vitalsValidator.formatVitalsForDisplay(v),
        rawData: v,
        recordedAt: v.recordedAt,
      }));

      return res.status(200).json({
        success: true,
        message: `Found ${vitals.length} vital signs records`,
        data: formattedVitals,
      });
    } catch (error) {
      console.error('Error fetching vital signs history:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching vital signs history',
      });
    }
  }

  /**
   * Update vital signs for a visit
   * PUT /api/opd/:visitId/vitals
   */
  async updateVitals(req, res) {
    try {
      const { visitId } = req.params;
      const recordedBy = req.user?.id || req.body.recordedBy;
      const updateData = req.body;

      if (!visitId) {
        return res.status(400).json({
          success: false,
          message: 'visitId is required',
        });
      }

      // Validate vital signs data
      const dataValidation = vitalsValidator.validateVitalsInput(updateData);
      if (!dataValidation.isValid) {
        return res.status(400).json({
          success: false,
          errors: dataValidation.errors,
        });
      }

      const result = await vitalsService.updateVitals(visitId, updateData, recordedBy);

      const formattedVitals = vitalsValidator.formatVitalsForDisplay(result);

      return res.status(200).json({
        success: true,
        message: 'Vital signs updated successfully',
        data: {
          visitId: result.visitId,
          vitals: formattedVitals,
          rawData: result,
          recordedAt: result.recordedAt,
        },
      });
    } catch (error) {
      console.error('Error updating vital signs:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error updating vital signs',
      });
    }
  }

  /**
   * Get vital signs with comparison to previous records
   * GET /api/opd/:visitId/vitals/comparison
   */
  async getVitalsWithComparison(req, res) {
    try {
      const { visitId } = req.params;

      if (!visitId) {
        return res.status(400).json({
          success: false,
          message: 'visitId is required',
        });
      }

      const comparison = await vitalsService.getVitalsWithComparison(visitId);

      if (!comparison.current) {
        return res.status(404).json({
          success: false,
          message: 'No vital signs found for this visit',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          visitId,
          current: {
            vitals: vitalsValidator.formatVitalsForDisplay(comparison.current),
            rawData: comparison.current,
          },
          previous: comparison.previous
            ? {
                vitals: vitalsValidator.formatVitalsForDisplay(comparison.previous),
                rawData: comparison.previous,
              }
            : null,
          comparison: comparison.comparison,
          note: comparison.previous ? 'Positive values indicate increase from previous visit' : 'No previous records for comparison',
        },
      });
    } catch (error) {
      console.error('Error fetching vitals with comparison:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching vitals with comparison',
      });
    }
  }

  /**
   * Check if vitals have been recorded for a visit
   * GET /api/opd/:visitId/vitals/status
   */
  async checkVitalsStatus(req, res) {
    try {
      const { visitId } = req.params;

      if (!visitId) {
        return res.status(400).json({
          success: false,
          message: 'visitId is required',
        });
      }

      const hasVitals = await vitalsService.hasVitalsRecorded(visitId);

      return res.status(200).json({
        success: true,
        data: {
          visitId,
          vitalsRecorded: hasVitals,
          status: hasVitals ? 'VITALS_RECORDED' : 'PENDING_VITALS',
        },
      });
    } catch (error) {
      console.error('Error checking vitals status:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error checking vitals status',
      });
    }
  }
}

export default new VitalsController();
