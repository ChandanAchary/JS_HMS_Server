/**
 * Onboarding DTOs (Data Transfer Objects)
 */

/**
 * Format join request response - simple list format
 */
export const formatJoinRequest = (request) => ({
  id: request.id,
  name: request.name,
  email: request.email,
  role: request.role,
  hospitalId: request.hospitalId,
  phone: request.phone,
  status: request.status,
  submittedAt: request.submittedAt,
  rejectionReason: request.rejectionReason
});

/**
 * Format join request details - role-specific detailed format
 */
export const formatJoinRequestDetails = (request) => {
  // Base fields for all roles
  const base = {
    id: request.id,
    name: request.name,
    email: request.email,
    phone: request.phone,
    role: request.role,
    hospitalId: request.hospitalId,
    profilePic: request.profilePic,
    status: request.status,
    submittedAt: request.submittedAt,
    updatedAt: request.updatedAt,
    approvedAt: request.approvedAt,
    approvedBy: request.approvedBy,
    rejectionReason: request.rejectionReason
  };

  // Role-specific fields
  if (request.role === 'DOCTOR') {
    return {
      ...base,
      specialization: request.specialization,
      licenseNumber: request.licenseNumber,
      qualification: request.qualification,
      dob: request.dob,
      age: request.age,
      qualifications: request.qualifications,
      formData: request.formData
    };
  } else if (request.role === 'EMPLOYEE') {
    return {
      ...base,
      appliedRole: request.appliedRole,
      qualification: request.qualification,
      dob: request.dob,
      age: request.age,
      formData: request.formData
    };
  }

  // Default: return all fields if role is unknown
  return request;
};

/**
 * Format application status response
 */
export const formatApplicationStatus = (request) => ({
  status: request.status,
  hospitalId: request.hospitalId,
  submittedAt: request.submittedAt,
  rejectionReason: request.rejectionReason
});

/**
 * Format token validation response
 */
export const formatTokenValidation = (token, joinRequest) => ({
  valid: true,
  role: token.role,
  email: token.email,
  name: joinRequest.name,
  hospitalId: token.hospitalId
});

/**
 * Format verification queue item (without sensitive data)
 */
export const formatVerificationItem = (user) => {
  const { password, ...rest } = user;
  return {
    ...rest,
    bankDetails: {
      accountNumber: rest.accountNumber || null,
      ifscCode: rest.ifscCode || null
    }
  };
};

/**
 * Format verifications queue response
 */
export const formatVerificationsQueue = (doctors, employees) => ({
  doctors: doctors.map(formatVerificationItem),
  employees: employees.map(formatVerificationItem),
  total: doctors.length + employees.length
});

/**
 * Format public hospital list item
 */
export const formatPublicHospital = (hospital) => ({
  id: hospital.id,
  hospitalName: hospital.hospitalName,
  address: hospital.address
});

/**
 * Parse join request input
 * For EMPLOYEE: appliedRole is required
 * For DOCTOR: specialization is required
 */
export const parseJoinRequestInput = (body) => ({
  name: body.name?.trim(),
  email: body.email?.toLowerCase().trim(),
  role: body.role?.toUpperCase(),
  hospitalId: body.hospitalId,
  phone: body.phone?.trim(),
  appliedRole: body.appliedRole?.toUpperCase(), // For EMPLOYEE role
  specialization: body.specialization?.toUpperCase() // For DOCTOR role
});

/**
 * Parse join application input (detailed form)
 */
export const parseJoinApplicationInput = (body, file = null) => {
  // Determine the profile pic URL/path
  let profilePicUrl = body.profilePhoto || null;
  
  if (file) {
    if (file.url) {
      profilePicUrl = file.url;
    } else if (file.secure_url) {
      profilePicUrl = file.secure_url;
    } else if (file.filename && file.filename !== 'undefined') {
      profilePicUrl = `/uploads/${file.filename}`;
    } else if (file.path && file.path !== 'undefined') {
      profilePicUrl = file.path;
    }
  }

  return {
    name: body.name?.trim(),
    email: body.email?.toLowerCase().trim(),
    role: body.role?.toUpperCase(),
    hospitalId: body.hospitalId,
    phone: body.phone?.trim(),
    dob: body.dob ? new Date(body.dob) : null,
    qualifications: body.qualifications 
      ? (Array.isArray(body.qualifications) ? body.qualifications : [body.qualifications]) 
      : [],
    specialization: body.specialization || null,
    licenseNumber: body.licenseNumber || null,
    appliedRole: body.appliedRole || null,
    profilePic: profilePicUrl,
    additionalInfo: body.additionalInfo || null
  };
};

export default {
  formatJoinRequest,
  formatJoinRequestDetails,
  formatApplicationStatus,
  formatTokenValidation,
  formatVerificationItem,
  formatVerificationsQueue,
  formatPublicHospital,
  parseJoinRequestInput,
  parseJoinApplicationInput
};
