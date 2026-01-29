/**
 * Employee Module
 * 
 * Handles employee management including:
 * - Employee registration and authentication
 * - Profile management
 * - Role-based operations
 * 
 * @module modules/employee
 */

export { default as employeeRoutes } from './employee.routes.js';
export { EmployeeService } from './employee.service.js';
export { EmployeeRepository } from './employee.repository.js';
export * as employeeController from './employee.controller.js';
export * as employeeDto from './employee.dto.js';
export * as employeeValidators from './employee.validators.js';

export default {
  name: 'employee'
};
