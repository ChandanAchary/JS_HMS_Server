/**
 * Attendance Repository
 * Data access layer for Attendance entity
 */

export class AttendanceRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find attendance by ID
   */
  async findById(id) {
    return this.prisma.attendance.findUnique({
      where: { id }
    });
  }

  /**
   * Find today's attendance for user
   */
  async findTodayAttendance(userId, date, hospitalId, isDoctor = false) {
    const whereClause = { 
      date, 
      hospitalId 
    };
    
    if (isDoctor) {
      whereClause.doctorId = userId;
    } else {
      whereClause.employeeId = userId;
    }

    return this.prisma.attendance.findFirst({ where: whereClause });
  }

  /**
   * Create attendance record
   */
  async create(data) {
    return this.prisma.attendance.create({ data });
  }

  /**
   * Update attendance record
   */
  async update(id, data) {
    return this.prisma.attendance.update({
      where: { id },
      data
    });
  }

  /**
   * Get attendance history for user
   */
  async getHistory(userId, hospitalId, isDoctor = false) {
    const whereClause = { hospitalId };
    
    if (isDoctor) {
      whereClause.doctorId = userId;
    } else {
      whereClause.employeeId = userId;
    }

    return this.prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
  }

  /**
   * Get attendance records by IDs
   */
  async findByIds(ids) {
    return this.prisma.attendance.findMany({
      where: { id: { in: ids } }
    });
  }

  /**
   * Get all attendance for a specific date and hospital
   */
  async findByDateAndHospital(date, hospitalId) {
    return this.prisma.attendance.findMany({
      where: { date, hospitalId }
    });
  }

  /**
   * Get employee attendance for date
   */
  async findEmployeeAttendanceByDate(date, hospitalId, employeeIds) {
    if (!employeeIds.length) return [];
    
    return this.prisma.attendance.findMany({
      where: {
        date,
        hospitalId,
        employeeId: { in: employeeIds }
      }
    });
  }

  /**
   * Get doctor attendance for date
   */
  async findDoctorAttendanceByDate(date, hospitalId, doctorIds) {
    if (!doctorIds.length) return [];
    
    return this.prisma.attendance.findMany({
      where: {
        date,
        hospitalId,
        doctorId: { in: doctorIds }
      }
    });
  }
}

export class AttendanceSessionRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find session by ID
   */
  async findById(id) {
    return this.prisma.attendanceSession.findUnique({
      where: { id }
    });
  }

  /**
   * Find open session (no checkout) for attendance
   */
  async findOpenSession(attendanceId) {
    return this.prisma.attendanceSession.findFirst({
      where: { 
        attendanceId, 
        checkOutTime: null 
      },
      orderBy: { checkInTime: 'desc' }
    });
  }

  /**
   * Get all sessions for attendance
   */
  async findByAttendanceId(attendanceId) {
    return this.prisma.attendanceSession.findMany({
      where: { attendanceId }
    });
  }

  /**
   * Get sessions for multiple attendance records
   */
  async findByAttendanceIds(attendanceIds) {
    if (!attendanceIds.length) return [];
    
    return this.prisma.attendanceSession.findMany({
      where: { attendanceId: { in: attendanceIds } }
    });
  }

  /**
   * Create session
   */
  async create(data) {
    return this.prisma.attendanceSession.create({ data });
  }

  /**
   * Update session
   */
  async update(id, data) {
    return this.prisma.attendanceSession.update({
      where: { id },
      data
    });
  }
}

export default { AttendanceRepository, AttendanceSessionRepository };

















