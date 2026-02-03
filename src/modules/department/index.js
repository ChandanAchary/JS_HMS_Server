/**
 * Department Module
 * Hospital department listing and management
 */

export { default as departmentRoutes } from './department.routes.js';
export { DepartmentService } from './department.service.js';
export * as departmentController from './department.controller.js';
export * from './department.constants.js';

export default {
  name: 'department'
};
