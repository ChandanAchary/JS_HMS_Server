/**
 * Admin DTOs (Data Transfer Objects)
 * Response formatting functions for admin operations
 */

import { getFileUrl, processProfilePicUrl } from '../../core/utils/file.utils.js';

/**
 * Format admin profile for response
 */
export const formatAdminProfile = (admin, req = null) => {
  const profilePhotoUrl = processProfilePicUrl(admin.profilePhoto, req);
  
  let hospitalData = null;
  if (admin.hospital) {
    const logoUrl = processProfilePicUrl(admin.hospital.logo, req);
    hospitalData = {
      ...admin.hospital,
      logo: logoUrl
    };
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    profilePhoto: profilePhotoUrl,
    role: admin.role,
    designation: admin.designation,
    address: admin.address,
    hospitalId: admin.hospitalId,
    isOwner: admin.isOwner,
    emailVerified: admin.emailVerified,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
    hospital: hospitalData
  };
};

/**
 * Format admin login response
 */
export const formatAdminLoginResponse = (admin, token) => ({
  message: 'Login successful',
  token,
  admin: {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    hospitalId: admin.hospitalId
  },
  hospitalId: admin.hospitalId,
  hospitalName: admin.hospital?.hospitalName || null
});

/**
 * Format hospital profile for response
 */
export const formatHospitalProfile = (hospital, req = null) => {
  const logoUrl = processProfilePicUrl(hospital.logo, req);
  
  return {
    ...hospital,
    logo: logoUrl
  };
};

/**
 * Format employee for admin view (without sensitive data)
 */
export const formatEmployeeForAdmin = (employee, salaryInfo = null, paidStatus = false) => {
  const { password, ...rest } = employee;
  
  const result = {
    ...rest,
    bankDetails: {
      accountNumber: employee.accountNumber || null,
      ifscCode: employee.ifscCode || null
    },
    paid: paidStatus
  };

  if (salaryInfo) {
    result.presentDays = salaryInfo.presentDays;
    result.totalWorkingDays = salaryInfo.totalWorkingDays;
    result.attendancePercent = salaryInfo.attendancePercent;
    result.baseSalary = salaryInfo.baseSalary;
    result.calculatedSalary = salaryInfo.calculatedSalary;
  }

  return result;
};

/**
 * Format doctor for admin view (without sensitive data)
 */
export const formatDoctorForAdmin = (doctor, salaryInfo = null, paidStatus = false) => {
  const { password, ...rest } = doctor;
  
  const result = {
    ...rest,
    bankDetails: {
      accountNumber: doctor.accountNumber || null,
      ifscCode: doctor.ifscCode || null
    },
    paid: paidStatus
  };

  if (salaryInfo) {
    result.presentDays = salaryInfo.presentDays;
    result.totalWorkingDays = salaryInfo.totalWorkingDays;
    result.attendancePercent = salaryInfo.attendancePercent;
    result.baseSalary = salaryInfo.baseSalary;
    result.calculatedSalary = salaryInfo.calculatedSalary;
  }

  return result;
};

/**
 * Format dashboard summary
 */
export const formatDashboardSummary = (stats) => ({
  success: true,
  stats: {
    employeesCount: stats.employeesCount || 0,
    doctorsCount: stats.doctorsCount || 0,
    presentTodayCount: stats.presentTodayCount || 0,
    totalPatientsServed: stats.totalPatientsServed || 0
  }
});

/**
 * Format present today response
 */
export const formatPresentTodayItem = (user, attendanceInfo = {}, isDoctor = false) => ({
  id: user.id,
  name: user.name,
  ...(isDoctor ? { specialization: user.specialization } : { role: user.role }),
  attendanceUnit: attendanceInfo.attendanceUnit || 0,
  totalWorkingMinutes: attendanceInfo.totalWorkingMinutes || 0,
  isPresentNow: attendanceInfo.isPresentNow || false
});

/**
 * Format attendance summary item
 */
export const formatAttendanceSummaryItem = (userId, sessions) => {
  const hasOpenSession = sessions.some(s => s.checkInTime && !s.checkOutTime);
  
  let totalWorkingMinutes = 0;
  sessions.forEach(s => {
    if (s.checkInTime && s.checkOutTime) {
      totalWorkingMinutes += Math.floor((new Date(s.checkOutTime) - new Date(s.checkInTime)) / 60000);
    }
  });

  return {
    attendanceUnit: sessions.length > 0 ? 1 : 0,
    totalWorkingMinutes,
    isPresentNow: hasOpenSession
  };
};

/**
 * Format assignment
 */
export const formatAssignment = (assignment) => ({
  id: assignment.id,
  hospitalId: assignment.hospitalId,
  assigneeType: assignment.assigneeType,
  assigneeId: assignment.assigneeId,
  title: assignment.title,
  description: assignment.description,
  department: assignment.department,
  startDateTime: assignment.startDateTime,
  endDateTime: assignment.endDateTime,
  shiftType: assignment.shiftType,
  status: assignment.status,
  createdBy: assignment.createdBy,
  createdAt: assignment.createdAt
});

/**
 * Format form template
 */
export const formatFormTemplate = (template) => ({
  template,
  fields: template.schema || []
});

/**
 * Format payroll details
 */
export const formatPayrollDetails = (user, role, salaryInfo) => ({
  userId: user.id,
  name: user.name,
  role: role === 'DOCTOR' ? `Doctor (${user.specialization})` : `Employee (${user.role})`,
  roleType: role,
  attendanceDays: salaryInfo.presentDays,
  totalWorkingDays: salaryInfo.totalWorkingDays,
  attendancePercent: salaryInfo.attendancePercent,
  baseSalary: salaryInfo.baseSalary,
  calculatedSalary: salaryInfo.calculatedSalary
});

export default {
  formatAdminProfile,
  formatAdminLoginResponse,
  formatHospitalProfile,
  formatEmployeeForAdmin,
  formatDoctorForAdmin,
  formatDashboardSummary,
  formatPresentTodayItem,
  formatAttendanceSummaryItem,
  formatAssignment,
  formatFormTemplate,
  formatPayrollDetails
};
