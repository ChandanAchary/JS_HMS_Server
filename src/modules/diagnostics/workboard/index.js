/**
 * Diagnostic Workboard Module
 * Result entry, review, and approval workflows
 */

export { default as workboardRoutes } from './workboard.routes.js';
export { WorkboardService } from './workboard.service.js';
export * as workboardController from './workboard.controller.js';

export default {
  name: 'diagnostic-workboard'
};
