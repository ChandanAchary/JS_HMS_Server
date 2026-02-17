/**
 * Attendance Controller
 * HTTP request handlers for attendance endpoints
 */

import { AttendanceService } from '../services/attendance.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';
import { HttpStatus } from '../constants/HttpStatus.js';
import {
  formatTodayStatus,
  formatHistoryItem,
  formatCheckInResponse,
  formatCheckOutResponse,
  formatAdminSummaryItem,
  formatUserAttendanceDetails
} from './attendance.validators.js';
import {
  validateCheckIn,
  validateCheckOut,
  parseLocationInput,
  validateUserId
} from './attendance.validators.js';

/**
 * Get service instance from request
 */
const getService = (req) => new AttendanceService(req.tenantPrisma);

/**
 * @desc Check-in attendance
 * @route POST /api/v1/attendance/check-in
 */
export const checkIn = async (req, res, next) => {
  try {
    const { id: userId, role, hospitalId } = req.user || {};
    validateUserId(userId);

    const locationInput = parseLocationInput(req);
    const location = validateCheckIn(locationInput);

    const service = getService(req);
    const { attendance, session, distanceFromHospital } = await service.checkIn(userId, role, hospitalId, location, req.file);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatCheckInResponse(attendance, session, distanceFromHospital))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Check-out attendance
 * @route POST /api/v1/attendance/check-out
 */
export const checkOut = async (req, res, next) => {
  try {
    const { id: userId, role, hospitalId } = req.user || {};
    validateUserId(userId);

    const locationInput = parseLocationInput(req);
    const location = validateCheckOut(locationInput);

    const service = getService(req);
    const { attendanceId, session, distanceFromHospital } = await service.checkOut(userId, role, hospitalId, location, req.file);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatCheckOutResponse(attendanceId, session, distanceFromHospital))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get today's attendance status
 * @route GET /api/v1/attendance/today
 */
export const getTodayAttendance = async (req, res, next) => {
  try {
    const { id: userId, role, hospitalId } = req.user;

    const service = getService(req);
    const { attendance, sessions, statusInfo } = await service.getTodayStatus(userId, role, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatTodayStatus(attendance, sessions, statusInfo))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get attendance history
 * @route GET /api/v1/attendance/my-history
 */
export const getMyAttendanceHistory = async (req, res, next) => {
  try {
    const { id: userId, role, hospitalId } = req.user;

    const service = getService(req);
    const history = await service.getHistory(userId, role, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(history.map(rec => formatHistoryItem(rec, rec.sessions || [])))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get admin dashboard summary (all users)
 * @route GET /api/v1/attendance/admin/summary
 */
export const getAdminDashboardSummary = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        ApiResponse.error('Unauthorized', HttpStatus.UNAUTHORIZED)
      );
    }

    const { hospitalId } = req.user;
    const service = getService(req);
    const summary = await service.getAdminDashboardSummary(hospitalId);

    return res.status(HttpStatus.OK).json(ApiResponse.success(summary));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get user attendance details (admin view)
 * @route GET /api/v1/attendance/admin/:userId
 */
export const getUserAttendanceDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { hospitalId } = req.user;

    if (!userId) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        ApiResponse.error('Missing userId', HttpStatus.BAD_REQUEST)
      );
    }

    const service = getService(req);
    const { user, userLabel, days, totals } = await service.getUserAttendanceDetails(userId, hospitalId);

    return res.status(HttpStatus.OK).json(
      ApiResponse.success(formatUserAttendanceDetails(user, userLabel, days, totals))
    );
  } catch (error) {
    next(error);
  }
};

export default {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendanceHistory,
  getAdminDashboardSummary,
  getUserAttendanceDetails
};



















