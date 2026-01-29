/**
 * Attendance DTOs (Data Transfer Objects)
 */

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
export const formatCheckInResponse = (attendance, session) => ({
  message: 'Checked in',
  attendance: {
    id: attendance.id,
    date: attendance.date
  },
  session: formatSession(session)
});

/**
 * Response DTO for check-out success
 */
export const formatCheckOutResponse = (attendanceId, session) => ({
  message: 'Checked out',
  attendanceId,
  session: formatSession(session)
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

export default {
  formatSession,
  formatTodayStatus,
  formatHistoryItem,
  formatCheckInResponse,
  formatCheckOutResponse,
  formatAdminSummaryItem,
  formatUserAttendanceDetails
};
