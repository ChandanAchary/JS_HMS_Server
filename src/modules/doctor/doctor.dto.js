/**
 * Doctor DTOs (Data Transfer Objects)
 */

/**
 * Response DTO for doctor profile
 */
export const formatDoctorProfile = (doctor, options = {}) => {
  const { req, attendanceInfo = {}, salaryInfo = {} } = options;

  // Process profile picture URL
  let profilePicUrl = null;
  if (doctor.profilePic && doctor.profilePic !== '' && doctor.profilePic !== 'uploads/undefined') {
    if (doctor.profilePic.startsWith('http://') || doctor.profilePic.startsWith('https://')) {
      profilePicUrl = doctor.profilePic;
    } else if (req) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePicUrl = `${protocol}://${host}/${doctor.profilePic}`;
    }
  }

  return {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    specialization: doctor.specialization,
    profilePic: profilePicUrl,
    salary: doctor.salary,
    bankDetails: {
      accountNumber: doctor.accountNumber || null,
      ifscCode: doctor.ifscCode || null
    },
    paymentStatus: doctor.paymentStatus,
    lastPaidMonth: doctor.lastPaidMonth,
    lastPaidYear: doctor.lastPaidYear,
    status: doctor.status,
    isActive: doctor.isActive,
    delegatedPermissions: doctor.delegatedPermissions,
    hospitalId: doctor.hospitalId,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
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
 * Response DTO for doctor list item
 */
export const formatDoctorListItem = (doctor) => ({
  id: doctor.id,
  name: doctor.name,
  email: doctor.email,
  phone: doctor.phone,
  specialization: doctor.specialization,
  status: doctor.status,
  isActive: doctor.isActive,
  salary: doctor.salary,
  createdAt: doctor.createdAt
});

/**
 * Response DTO for login response
 */
export const formatLoginResponse = (doctor, token, hospital) => ({
  message: 'Login successful',
  token,
  doctor: {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    specialization: doctor.specialization,
    hospitalId: doctor.hospitalId,
    hospital: hospital?.hospitalName
  }
});

/**
 * Request DTO for doctor registration
 */
export const parseRegistrationInput = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim()?.toLowerCase(),
  phone: body.phone?.trim()?.replace(/\D/g, ''),
  specialization: body.specialization?.trim() || 'General',
  password: body.password,
  accountNumber: body.accountNumber?.trim() || null,
  ifscCode: body.ifscCode?.trim() || null
});

/**
 * Request DTO for profile update
 */
export const parseProfileUpdateInput = (body) => {
  const updateData = {};
  const allowedFields = ['name', 'phone', 'specialization'];
  
  allowedFields.forEach((field) => {
    if (body[field]) {
      updateData[field] = body[field];
    }
  });

  // Handle bank details
  if (body.bankDetails) {
    if (body.bankDetails.accountNumber) {
      updateData.accountNumber = String(body.bankDetails.accountNumber);
    }
    if (body.bankDetails.ifscCode) {
      updateData.ifscCode = String(body.bankDetails.ifscCode);
    }
  }

  return updateData;
};

/**
 * Response DTO for paginated doctors
 */
export const formatPaginatedDoctors = (result) => ({
  doctors: result.data.map(formatDoctorListItem),
  pagination: result.pagination
});

export default {
  formatDoctorProfile,
  formatDoctorListItem,
  formatLoginResponse,
  parseRegistrationInput,
  parseProfileUpdateInput,
  formatPaginatedDoctors
};
