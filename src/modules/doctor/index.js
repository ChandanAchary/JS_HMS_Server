/**
 * Doctor Module
 * 
 * Handles doctor management including:
 * - Doctor registration and authentication
 * - Profile management
 * - Specialization-based operations
 * 
 * @module modules/doctor
 */

export { default as doctorRoutes } from './doctor.routes.js';
export { DoctorService } from './doctor.service.js';
export { DoctorRepository } from './doctor.repository.js';
export * as doctorController from './doctor.controller.js';
export * as doctorDto from './doctor.dto.js';
export * as doctorValidators from './doctor.validators.js';

export default {
  name: 'doctor'
};
