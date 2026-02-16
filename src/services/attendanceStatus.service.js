/**
 * ============================================================
 * ATTENDANCE STATUS SERVICE (SINGLE SOURCE OF TRUTH)
 * ============================================================
 * This module is the ONLY place where attendance status logic lives.
 * All controllers MUST use this service.
 * 
 * Rules:
 * - attendanceUnit: Binary (0 or 1). 1 if at least ONE session exists on a date.
 * - totalWorkingMinutes: Sum of completed session durations
 * - isPresentNow: Boolean. True if an open session exists (checkInTime set, checkOutTime null)
 */

export const MAX_SESSION_MINUTES = 480; // 8 hours cap for a single session

/**
 * Calculate attendance status from an array of sessions
 * @param {Array} sessions - Array of { checkInTime, checkOutTime, ... }
 * @returns {Object} { attendanceUnit (0|1), totalWorkingMinutes (number), isPresentNow (boolean) }
 */
export const calculateAttendanceStatus = (sessions = []) => {
  // ✅ Rule 1: Binary attendance unit (1 if any session exists)
  const attendanceUnit = sessions.length > 0 ? 1 : 0;

  // ✅ Rule 2: Total working minutes = sum of completed session durations
  let totalWorkingMinutes = 0;
  sessions.forEach((session) => {
    if (session.checkInTime && session.checkOutTime) {
      const minutes = Math.floor(
        (new Date(session.checkOutTime) - new Date(session.checkInTime)) / 60000
      );
      totalWorkingMinutes += minutes;
    }
  });

  // ✅ Rule 3: isPresentNow = true if open session exists (no checkout time)
  const isPresentNow = sessions.some((s) => s.checkInTime && !s.checkOutTime);

  return {
    attendanceUnit,
    totalWorkingMinutes,
    isPresentNow
  };
};

export default calculateAttendanceStatus;

















