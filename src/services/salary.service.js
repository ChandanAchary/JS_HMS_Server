import { tenantPrisma as prisma } from "../core/database/tenantDb.js";
import { calculateAttendanceStatus } from "./attendanceStatus.service.js";

// Helper: get ISO date range strings for a month (YYYY-MM-DD)
function getMonthStartEnd(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  return { startStr, endStr };
}

/**
 * Get present days (distinct dates) for a user in a month/year
 * @param {String} userId
 * @param {Number} year
 * @param {Number} month // 1-12
 */
export const getPresentDays = async (userId, year, month) => {
  const { startStr, endStr } = getMonthStartEnd(year, month);

  // Fetch attendance records in range for this user (doctorId OR employeeId)
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: { 
        gte: startStr, 
        lte: endStr 
      },
      userId: userId
    },
    select: { id: true, date: true }
  });

  if (attendanceRecords.length === 0) return 0;

  const attendanceIds = attendanceRecords.map((r) => r.id);
  const sessions = await prisma.attendanceSession.findMany({ 
    where: { attendanceId: { in: attendanceIds } }, 
    select: { attendanceId: true } 
  });

  const presentAttendanceIds = new Set(sessions.map((s) => s.attendanceId));
  return presentAttendanceIds.size;
};

/**
 * Calculate monthly salary for a user (doctor/employee)
 * @param {string} userId
 * @param {number} year
 * @param {number} month (1-12)
 * @returns {Promise<Object>} { presentDays, totalWorkingDays, attendancePercent, baseSalary, calculatedSalary }
 */
export const calculateMonthlySalary = async (userId, year, month) => {
  try {
    // Get all attendance records for this user for the given month
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startStr,
          lte: endStr
        },
        userId: userId
      }
    });

    // Fetch sessions in batch for these attendance records
    const attendanceIds = attendanceRecords.map((r) => r.id);
    const allSessions = attendanceIds.length > 0 ? await prisma.attendanceSession.findMany({ where: { attendanceId: { in: attendanceIds } } }) : [];

    // Count present days (attendanceUnit = 1 if any session exists)
    let presentDays = 0;
    attendanceRecords.forEach((rec) => {
      const recSessions = allSessions.filter((s) => s.attendanceId === rec.id);
      const { attendanceUnit } = calculateAttendanceStatus(recSessions || []);
      presentDays += attendanceUnit;
    });

    // Calculate total working days in the month (excluding weekends if needed)
    const totalWorkingDays = getWorkingDaysInMonth(year, month);

    // Fetch base salary from Employee/Doctor
    let user = await prisma.employee.findUnique({ where: { id: userId } });
    if (!user) user = await prisma.doctor.findUnique({ where: { id: userId } });
    const baseSalary = user?.salary || 0;

    // Calculate salary based on attendance
    const attendancePercent = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;
    const calculatedSalary = Math.round((baseSalary * presentDays) / totalWorkingDays);

    return {
      presentDays,
      totalWorkingDays,
      attendancePercent: Math.round(attendancePercent * 100) / 100,
      baseSalary,
      calculatedSalary
    };
  } catch (err) {
    console.error("Doctor profile salary calc error:", err);
    throw err;
  }
};

/**
 * Helper: Get working days in a month (Mon-Fri)
 */
function getWorkingDaysInMonth(year, month) {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) count++; // Exclude Sunday (0) and Saturday (6)
  }
  return count;
}

export default { getPresentDays, calculateMonthlySalary };
