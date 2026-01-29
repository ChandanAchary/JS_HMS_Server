/**
 * Employee DTOs (Data Transfer Objects)
 */

/**
 * Response DTO for employee profile
 */
export const formatEmployeeProfile = (employee, options = {}) => {
  const { req, attendanceInfo = {}, salaryInfo = {} } = options;

  // Process profile picture URL
  let profilePicUrl = null;
  if (employee.profilePic && employee.profilePic !== '' && employee.profilePic !== 'uploads/undefined') {
    if (employee.profilePic.startsWith('http://') || employee.profilePic.startsWith('https://')) {
      profilePicUrl = employee.profilePic;
    } else if (req) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePicUrl = `${protocol}://${host}/${employee.profilePic}`;
    }
  }

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    qualification: employee.qualification,
    role: employee.role,
    profilePic: profilePicUrl,
    salary: employee.salary,
    bankDetails: {
      accountNumber: employee.accountNumber || null,
      ifscCode: employee.ifscCode || null
    },
    paymentStatus: employee.paymentStatus,
    lastPaidMonth: employee.lastPaidMonth,
    lastPaidYear: employee.lastPaidYear,
    status: employee.status,
    isActive: employee.isActive,
    delegatedPermissions: employee.delegatedPermissions,
    hospitalId: employee.hospitalId,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
    // Attendance info
    isPresentNow: attendanceInfo.isPresentNow ?? false,
    attendanceUnit: attendanceInfo.attendanceUnit ?? 0,
    totalWorkingMinutes: attendanceInfo.totalWorkingMinutes ?? 0,
    presentToday: attendanceInfo.isPresentNow ?? false,
    // Salary info
    presentDays: salaryInfo.presentDays,
    totalWorkingDays: salaryInfo.totalWorkingDays,
    attendancePercent: salaryInfo.attendancePercent,
    baseSalary: salaryInfo.baseSalary,
    calculatedSalary: salaryInfo.calculatedSalary
  };
};

/**
 * Response DTO for employee list item
 */
export const formatEmployeeListItem = (employee) => ({
  id: employee.id,
  name: employee.name,
  email: employee.email,
  phone: employee.phone,
  qualification: employee.qualification,
  role: employee.role,
  status: employee.status,
  isActive: employee.isActive,
  salary: employee.salary,
  createdAt: employee.createdAt
});

/**
 * Response DTO for login response
 */
export const formatLoginResponse = (employee, token, hospital) => ({
  message: 'Login successful',
  token,
  employee: {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    hospitalId: employee.hospitalId,
    hospital: hospital?.hospitalName
  }
});

/**
 * Request DTO for employee registration
 */
export const parseRegistrationInput = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim()?.toLowerCase(),
  phone: body.phone?.trim()?.replace(/\D/g, ''),
  qualification: body.qualification?.trim(),
  role: body.role?.trim() || 'EMPLOYEE',
  password: body.password,
  accountNumber: body.accountNumber?.trim() || null,
  ifscCode: body.ifscCode?.trim() || null
});

/**
 * Request DTO for profile update
 */
export const parseProfileUpdateInput = (body) => {
  const updateData = {};
  const allowedFields = ['name', 'phone', 'qualification', 'role'];
  
  allowedFields.forEach((field) => {
    if (body[field]) {
      updateData[field] = body[field];
    }
  });

  // Handle bank details
  if (body.bankDetails) {
    if (body.bankDetails.accountNumber) {
      updateData.accountNumber = body.bankDetails.accountNumber;
    }
    if (body.bankDetails.ifscCode) {
      updateData.ifscCode = body.bankDetails.ifscCode;
    }
  }

  return updateData;
};

/**
 * Response DTO for paginated employees
 */
export const formatPaginatedEmployees = (result) => ({
  employees: result.data.map(formatEmployeeListItem),
  pagination: result.pagination
});

export default {
  formatEmployeeProfile,
  formatEmployeeListItem,
  formatLoginResponse,
  parseRegistrationInput,
  parseProfileUpdateInput,
  formatPaginatedEmployees
};
