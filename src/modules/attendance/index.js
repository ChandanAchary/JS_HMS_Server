/**
 * Attendance Module
 * 
 * Handles attendance management including:
 * - Check-in/Check-out with location tracking
 * - Selfie capture for verification
 * - Attendance history and reports
 * 
 * @module modules/attendance
 */

export { default as attendanceRoutes } from './attendance.routes.js';
export { AttendanceService } from './attendance.service.js';
export { AttendanceRepository, AttendanceSessionRepository } from './attendance.repository.js';
export * as attendanceController from './attendance.controller.js';
export * as attendanceDto from './attendance.dto.js';
export * as attendanceValidators from './attendance.validators.js';

export default {
  name: 'attendance'
};
