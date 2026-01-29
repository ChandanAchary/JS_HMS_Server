/**
 * Attendance Service
 * Business logic layer for Attendance operations
 */

import { AttendanceRepository, AttendanceSessionRepository } from './attendance.repository.js';
import { 
  ValidationError,
  NotFoundError 
} from '../../shared/exceptions/AppError.js';
import { calculateAttendanceStatus } from '../../services/attendanceStatus.service.js';
import { localDateString } from '../../utils/date.utils.js';
import { getFileUrl } from '../../core/utils/file.utils.js';

export class AttendanceService {
  constructor(prisma) {
    this.prisma = prisma;
    this.attendanceRepo = new AttendanceRepository(prisma);
    this.sessionRepo = new AttendanceSessionRepository(prisma);
  }

  /**
   * Get today's date string
   */
  getTodayStr() {
    return localDateString();
  }

  /**
   * Check if user is a doctor
   */
  isDoctor(role) {
    return role === 'DOCTOR';
  }

  /**
   * Check-in user
   */
  async checkIn(userId, role, hospitalId, location, file = null) {
    const today = this.getTodayStr();
    const isDoctor = this.isDoctor(role);

    // Find or create attendance record
    let attendance = await this.attendanceRepo.findTodayAttendance(userId, today, hospitalId, isDoctor);
    
    if (!attendance) {
      const createData = {
        role: role || 'EMPLOYEE',
        date: today,
        hospitalId
      };
      
      if (isDoctor) {
        createData.doctorId = userId;
      } else {
        createData.employeeId = userId;
      }
      
      attendance = await this.attendanceRepo.create(createData);
    }

    if (!attendance || !attendance.id) {
      throw new Error('Check-in failed: attendance record missing');
    }

    // Check for open session
    const openSession = await this.sessionRepo.findOpenSession(attendance.id);
    if (openSession) {
      throw new ValidationError('Already checked in');
    }

    // Create session
    const sessionData = {
      attendanceId: attendance.id,
      checkInTime: new Date(),
      checkInLat: location.latitude,
      checkInLng: location.longitude
    };

    let session = await this.sessionRepo.create(sessionData);

    // Attach selfie if provided
    if (file) {
      const path = getFileUrl(file);
      if (path) {
        session = await this.sessionRepo.update(session.id, { checkInSelfie: path });
      }
    }

    return { attendance, session };
  }

  /**
   * Check-out user
   */
  async checkOut(userId, role, hospitalId, location, file = null) {
    const today = this.getTodayStr();
    const isDoctor = this.isDoctor(role);

    // Find today's attendance
    const attendance = await this.attendanceRepo.findTodayAttendance(userId, today, hospitalId, isDoctor);
    if (!attendance) {
      throw new ValidationError('No attendance record for today');
    }

    // Find open session
    const openSession = await this.sessionRepo.findOpenSession(attendance.id);
    if (!openSession) {
      throw new ValidationError('Not checked in');
    }

    // Calculate duration
    const checkOutTime = new Date();
    const checkInTime = new Date(openSession.checkInTime);
    const durationMinutes = Math.max(0, Math.round((checkOutTime - checkInTime) / 60000));

    // Update session
    let updatedSession = await this.sessionRepo.update(openSession.id, {
      checkOutTime,
      checkOutLat: location.latitude,
      checkOutLng: location.longitude,
      durationMinutes
    });

    // Attach selfie if provided
    if (file) {
      const path = getFileUrl(file);
      if (path) {
        updatedSession = await this.sessionRepo.update(updatedSession.id, { checkOutSelfie: path });
      }
    }

    // Update total working minutes
    await this.attendanceRepo.update(attendance.id, {
      totalWorkingMinutes: (attendance.totalWorkingMinutes || 0) + durationMinutes
    });

    return { attendanceId: attendance.id, session: updatedSession };
  }

  /**
   * Get today's attendance status
   */
  async getTodayStatus(userId, role, hospitalId) {
    const today = this.getTodayStr();
    const isDoctor = this.isDoctor(role);

    const attendance = await this.attendanceRepo.findTodayAttendance(userId, today, hospitalId, isDoctor);
    const sessions = attendance 
      ? await this.sessionRepo.findByAttendanceId(attendance.id) 
      : [];

    const statusInfo = calculateAttendanceStatus(sessions);

    return { attendance, sessions, statusInfo };
  }

  /**
   * Get attendance history
   */
  async getHistory(userId, role, hospitalId) {
    const isDoctor = this.isDoctor(role);
    const history = await this.attendanceRepo.getHistory(userId, hospitalId, isDoctor);

    // Batch fetch sessions
    const attendanceIds = history.map(h => h.id);
    const allSessions = await this.sessionRepo.findByAttendanceIds(attendanceIds);

    // Attach sessions to records
    const historyWithSessions = history.map(rec => ({
      ...rec,
      sessions: allSessions.filter(s => s.attendanceId === rec.id)
    }));

    return historyWithSessions;
  }

  /**
   * Get admin dashboard summary (all users for today)
   */
  async getAdminDashboardSummary(hospitalId) {
    const today = this.getTodayStr();

    // Fetch all employees and doctors
    const [employees, doctors] = await Promise.all([
      this.prisma.employee.findMany({
        where: { hospitalId },
        select: { id: true, name: true, role: true }
      }),
      this.prisma.doctor.findMany({
        where: { hospitalId },
        select: { id: true, name: true, specialization: true }
      })
    ]);

    // Build user map
    const userMap = {};
    employees.forEach(emp => {
      userMap[emp.id] = {
        userId: emp.id,
        name: emp.name,
        role: emp.role || 'Employee'
      };
    });
    doctors.forEach(doc => {
      userMap[doc.id] = {
        userId: doc.id,
        name: doc.name,
        role: doc.specialization || 'Doctor'
      };
    });

    // Fetch today's attendance
    const employeeIds = employees.map(e => e.id);
    const doctorIds = doctors.map(d => d.id);

    const [employeeAttendance, doctorAttendance] = await Promise.all([
      this.attendanceRepo.findEmployeeAttendanceByDate(today, hospitalId, employeeIds),
      this.attendanceRepo.findDoctorAttendanceByDate(today, hospitalId, doctorIds)
    ]);

    const todayRecords = [...employeeAttendance, ...doctorAttendance];

    // Batch fetch sessions
    const attendanceIds = todayRecords.map(r => r.id);
    const allSessions = await this.sessionRepo.findByAttendanceIds(attendanceIds);

    // Build summary
    const summary = Object.values(userMap).map(user => {
      const todayRecord = todayRecords.find(r => 
        r.employeeId === user.userId || r.doctorId === user.userId
      );
      const sessions = todayRecord 
        ? allSessions.filter(s => s.attendanceId === todayRecord.id) 
        : [];
      const statusInfo = calculateAttendanceStatus(sessions);

      return {
        userId: String(user.userId),
        name: user.name,
        role: user.role,
        attendanceUnit: statusInfo.attendanceUnit,
        totalWorkingMinutes: statusInfo.totalWorkingMinutes,
        isPresentNow: statusInfo.isPresentNow
      };
    });

    return summary;
  }

  /**
   * Get user attendance details (admin view)
   */
  async getUserAttendanceDetails(userId, hospitalId) {
    // Find user
    let user = await this.prisma.employee.findUnique({ where: { id: userId } });
    let userLabel = null;
    let isDoctor = false;

    if (user) {
      userLabel = `Employee (${user.role || 'Employee'})`;
    } else {
      user = await this.prisma.doctor.findUnique({ where: { id: userId } });
      if (user) {
        userLabel = `Doctor (${user.specialization || 'General'})`;
        isDoctor = true;
      }
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Fetch attendance records
    const attendanceRecords = await this.attendanceRepo.getHistory(userId, hospitalId, isDoctor);

    // Batch fetch sessions
    const attendanceIds = attendanceRecords.map(r => r.id);
    const allSessions = await this.sessionRepo.findByAttendanceIds(attendanceIds);

    // Map days
    const days = attendanceRecords.map(rec => {
      const recSessions = allSessions.filter(s => s.attendanceId === rec.id);
      const sessions = recSessions.map(s => ({
        checkIn: s.checkInTime || null,
        checkOut: s.checkOutTime || null
      }));

      const { attendanceUnit, totalWorkingMinutes } = calculateAttendanceStatus(recSessions);
      const workingHours = +(totalWorkingMinutes / 60).toFixed(2);

      return {
        date: rec.date,
        sessions,
        attendanceUnit,
        workingHours
      };
    });

    // Calculate totals
    const totalWorkingMinutes = attendanceRecords.reduce((acc, rec) => {
      const recSessions = allSessions.filter(s => s.attendanceId === rec.id);
      const { totalWorkingMinutes } = calculateAttendanceStatus(recSessions);
      return acc + totalWorkingMinutes;
    }, 0);

    const totalWorkingHours = +(totalWorkingMinutes / 60).toFixed(2);
    const totalAttendanceUnits = days.reduce((acc, d) => acc + d.attendanceUnit, 0);

    return {
      user,
      userLabel,
      days,
      totals: {
        totalWorkingHours,
        totalAttendanceUnits
      }
    };
  }
}

export default AttendanceService;
