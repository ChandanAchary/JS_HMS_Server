/**
 * Admin Validators & DTOs
 * Validation functions and response formatting for admin operations
 */

import { ValidationError } from '../shared/AppError.js';
import { getFileUrl, processProfilePicUrl } from '../utils/file.utils.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

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

// ============================================================================
// Validators
// ============================================================================

/**
 * Validate admin registration
 */
export const validateAdminRegister = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  }

  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate admin login
 */
export const validateAdminLogin = (data) => {
  const errors = [];

  if (!data.emailOrPhone?.trim()) {
    errors.push('Email or phone is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate profile update
 */
export const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate salary update
 */
export const validateSalaryUpdate = (salary) => {
  if (salary === undefined || salary === null || salary < 0) {
    throw new ValidationError('Invalid salary value');
  }
  return Number(salary);
};

/**
 * Validate assignment creation
 */
export const validateAssignmentCreate = (data) => {
  const errors = [];

  if (!data.assigneeType) {
    errors.push('Assignee type is required');
  } else if (!['DOCTOR', 'EMPLOYEE'].includes(data.assigneeType)) {
    errors.push('Assignee type must be DOCTOR or EMPLOYEE');
  }

  if (!data.assigneeId) {
    errors.push('Assignee ID is required');
  }

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.startDateTime) {
    errors.push('Start date/time is required');
  }

  if (!data.endDateTime) {
    errors.push('End date/time is required');
  }

  if (data.startDateTime && data.endDateTime) {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);
    if (start >= end) {
      errors.push('End date/time must be after start date/time');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate delegated permissions
 */
export const validateDelegatedPermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    throw new ValidationError('Permissions must be an array');
  }
  return true;
};

/**
 * Validate hospital profile update
 */
export const validateHospitalUpdate = (data) => {
  const errors = [];

  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.push('Invalid contact email format');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate form template role
 */
export const validateFormRole = (role) => {
  if (!['DOCTOR', 'EMPLOYEE'].includes(role?.toUpperCase())) {
    throw new ValidationError('Invalid role. Must be DOCTOR or EMPLOYEE');
  }
  return role.toUpperCase();
};

/**
 * Validate payroll input
 */
export const validatePayrollInput = (data) => {
  const errors = [];

  if (!data.amount || Number(data.amount) <= 0) {
    errors.push('Amount must be greater than zero');
  }

  const validModes = ['BANK_TRANSFER', 'UPI', 'MANUAL'];
  const normalizedMode = (data.paymentMode || '').toUpperCase();
  if (!validModes.includes(normalizedMode)) {
    errors.push('Invalid payment mode');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return {
    amount: Number(data.amount),
    paymentMode: normalizedMode
  };
};

/**
 * Validate new password with confirmation
 */
export const validateNewPassword = (data) => {
  const errors = [];

  if (!data.newPassword) {
    errors.push('New password is required');
  } else if (data.newPassword.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  }

  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

export default {
  validateAdminRegister,
  validateAdminLogin,
  validateProfileUpdate,
  validateSalaryUpdate,
  validateAssignmentCreate,
  validateDelegatedPermissions,
  validateHospitalUpdate,
  validateFormRole,
  validatePayrollInput,
  validateNewPassword
};
 



















