/**
 * Attendance Validators & DTOs
 * Validation functions and response formatting for attendance-related operations
 */

import { ValidationError } from '../shared/AppError.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Response DTO for attendance session
 */
export const formatSession = (session) => ({
  id: session.id,
  checkInTime: session.checkInTime,
  checkOutTime: session.checkOutTime,
  checkInLat: session.checkInLat,
  checkInLng: session.checkInLng,
  checkOutLat: session.checkOutLat,
  checkOutLng: session.checkOutLng,
  checkInSelfie: session.checkInSelfie,
  checkOutSelfie: session.checkOutSelfie,
  durationMinutes: session.durationMinutes
});

/**
 * Response DTO for today's attendance status
 */
export const formatTodayStatus = (attendance, sessions, statusInfo) => ({
  isPresentNow: statusInfo.isPresentNow,
  checkedIn: statusInfo.isPresentNow,
  checkedOut: sessions.length > 0 && sessions.every(s => s.checkOutTime),
  sessions: sessions.map(formatSession),
  totalWorkingMinutes: attendance?.totalWorkingMinutes || 0,
  attendanceUnit: statusInfo.attendanceUnit
});

/**
 * Response DTO for attendance history item
 */
export const formatHistoryItem = (attendance, sessions) => ({
  id: attendance.id,
  date: attendance.date,
  totalWorkingMinutes: attendance.totalWorkingMinutes || 0,
  sessions: sessions.map(formatSession)
});

/**
 * Response DTO for check-in success
 */
export const formatCheckInResponse = (attendance, session, distanceFromHospital = null) => ({
  message: 'Checked in',
  attendance: {
    id: attendance.id,
    date: attendance.date
  },
  session: formatSession(session),
  distanceFromHospital
});

/**
 * Response DTO for check-out success
 */
export const formatCheckOutResponse = (attendanceId, session, distanceFromHospital = null) => ({
  message: 'Checked out',
  attendanceId,
  session: formatSession(session),
  distanceFromHospital
});

/**
 * Response DTO for admin attendance summary
 */
export const formatAdminSummaryItem = (user, statusInfo) => ({
  userId: String(user.userId),
  name: user.name,
  role: user.role,
  attendanceUnit: statusInfo.attendanceUnit,
  totalWorkingMinutes: statusInfo.totalWorkingMinutes,
  isPresentNow: statusInfo.isPresentNow
});

/**
 * Response DTO for user attendance details (admin view)
 */
export const formatUserAttendanceDetails = (user, userLabel, days, totals) => ({
  user: {
    name: user.name,
    role: userLabel
  },
  days,
  totalWorkingHours: totals.totalWorkingHours,
  totalAttendanceUnits: totals.totalAttendanceUnits
});

// ============================================================================
// Validators
// ============================================================================

/**
 * Validate check-in input
 */
export const validateCheckIn = (data) => {
  const errors = [];

  if (data.latitude === undefined || data.latitude === null) {
    errors.push('Latitude is required for check-in');
  } else {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude');
    }
  }

  if (data.longitude === undefined || data.longitude === null) {
    errors.push('Longitude is required for check-in');
  } else {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude)
  };
};

/**
 * Validate check-out input
 */
export const validateCheckOut = (data) => {
  const errors = [];

  if (data.latitude === undefined || data.latitude === null) {
    errors.push('Latitude is required for check-out');
  } else {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude');
    }
  }

  if (data.longitude === undefined || data.longitude === null) {
    errors.push('Longitude is required for check-out');
  } else {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude)
  };
};

/**
 * Parse location from request body/query
 */
export const parseLocationInput = (req) => {
  const latitudeRaw = req.body?.latitude ?? req.body?.lat ?? req.query?.latitude ?? req.query?.lat;
  const longitudeRaw = req.body?.longitude ?? req.body?.lng ?? req.query?.longitude ?? req.query?.lng;

  return {
    latitude: latitudeRaw,
    longitude: longitudeRaw
  };
};

/**
 * Validate user ID from request
 */
export const validateUserId = (userId) => {
  if (!userId) {
    throw new ValidationError('Invalid user id');
  }
  return userId;
};

export default {
  validateCheckIn,
  validateCheckOut,
  parseLocationInput,
  validateUserId
};



















