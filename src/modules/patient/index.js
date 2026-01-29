/**
 * Patient Module
 * 
 * Handles patient management including:
 * - Patient registration
 * - Patient search
 * - Patient billing history
 * 
 * @module modules/patient
 */

export { default as patientRoutes } from './patient.routes.js';
export { PatientService } from './patient.service.js';
export { PatientRepository } from './patient.repository.js';
export * as patientController from './patient.controller.js';
export * as patientDto from './patient.dto.js';
export * as patientValidators from './patient.validators.js';

export default {
  name: 'patient'
};
