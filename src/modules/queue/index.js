/**
 * Queue Module
 * Entry point for queue management system
 */

export { default as queueRoutes } from './queue.routes.js';
export { QueueService } from './queue.service.js';
export { QueueRepository } from './queue.repository.js';
export * from './queue.constants.js';
export * as queueController from './queue.controller.js';
