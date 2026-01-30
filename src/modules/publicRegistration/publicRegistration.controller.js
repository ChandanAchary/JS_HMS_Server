/**
 * PublicRegistration Controller
 * HTTP handlers for public registration operations
 * 
 * Single-tenant: All operations use the single hospital automatically
 */

import PublicRegistrationService from './publicRegistration.service.js';
import { ApiResponse } from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/constants/HttpStatus.js';
import {
  formatRegistrationForm,
  formatApplicationSubmitted,
  formatApplicationStatus
} from './publicRegistration.dto.js';


/**
 * Get public registration form for a role
 * GET /api/public/join/registration-form/:role
 * 
 * Single-tenant: Automatically uses the single hospital
 */
export const getRegistrationForm = async (req, res, next) => {
  try {
    const { role } = req.params;

    const service = new PublicRegistrationService(req.prisma);
    const { template, hospitalName } = await service.getRegistrationFormSingleTenant(role);

    res.status(HttpStatus.OK).json(
      ApiResponse.success(
        formatRegistrationForm(template, hospitalName),
        'Registration form retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Submit public registration application
 * POST /api/public/join/apply/:role
 * 
 * Single-tenant: Automatically uses the single hospital
 */
export const submitApplication = async (req, res, next) => {
  try {
    const { role } = req.params;

    console.log('[PublicRegistration] Received application:', {
      role,
      bodyFields: Object.keys(req.body),
      hasFile: !!req.file
    });

    const service = new PublicRegistrationService(req.prisma);
    const joinRequest = await service.submitApplicationSingleTenant(
      role,
      req.body,
      req.file
    );

    res.status(HttpStatus.CREATED).json(
      ApiResponse.success(
        formatApplicationSubmitted(joinRequest),
        'Application submitted successfully'
      )
    );
  } catch (error) {
    console.error('[PublicRegistration] Error:', {
      message: error.message,
      details: error.details || error.metadata || {},
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    next(error);
  }
};

/**
 * Check application status
 * GET /api/public/join/application-status
 * 
 * Single-tenant: Automatically uses the single hospital
 * Query params: email or phone
 */
export const checkApplicationStatus = async (req, res, next) => {
  try {
    const { email, phone } = req.query;

    const service = new PublicRegistrationService(req.prisma);
    const joinRequest = await service.checkApplicationStatusSingleTenant(email, phone);

    res.status(HttpStatus.OK).json(
      ApiResponse.success(
        formatApplicationStatus(joinRequest),
        'Application status retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getRegistrationForm,
  submitApplication,
  checkApplicationStatus
};
