/**
 * Auth DTOs (Data Transfer Objects)
 * Define request/response shapes for auth endpoints
 */

/**
 * Login Request DTO
 */
export class LoginRequestDto {
  constructor(emailOrPhone, password, userType) {
    this.emailOrPhone = emailOrPhone?.trim() || '';
    this.password = password || '';
    this.userType = userType?.toUpperCase() || '';
  }

  validate() {
    const errors = [];
    if (!this.emailOrPhone) errors.push('Email or phone is required');
    if (!this.password) errors.push('Password is required');
    if (!this.userType) errors.push('User type is required');
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Login Response DTO
 */
export class LoginResponseDto {
  constructor(user, token, permissions = []) {
    this.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      // For DOCTOR expose `specialization`, for EMPLOYEE expose `appliedRole`.
      // `avatar` was unused in the codebase so we replace it with these role-specific fields.
      ...(user.role === 'DOCTOR' ? { specialization: user.specialization || null } : {}),
      ...(user.role === 'EMPLOYEE' ? { appliedRole: user.appliedRole || null } : {}),
    };
    this.token = token;
    this.permissions = permissions;
    this.expiresIn = '7d';
  }
}

/**
 * Register Request DTO
 */
export class RegisterRequestDto {
  constructor(data) {
    this.name = data.name?.trim() || '';
    this.email = data.email?.trim().toLowerCase() || '';
    this.phone = data.phone?.replace(/\D/g, '') || '';
    this.password = data.password || '';
    this.role = data.role?.toUpperCase() || 'EMPLOYEE';
  }

  validate() {
    const errors = [];
    if (!this.name) errors.push('Name is required');
    if (!this.email) errors.push('Email is required');
    if (!this.phone || this.phone.length < 10) errors.push('Valid phone is required');
    if (!this.password || this.password.length < 8) errors.push('Password must be at least 8 characters');
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Change Password DTO
 */
export class ChangePasswordDto {
  constructor(currentPassword, newPassword, confirmPassword) {
    this.currentPassword = currentPassword || '';
    this.newPassword = newPassword || '';
    this.confirmPassword = confirmPassword || '';
  }

  validate() {
    const errors = [];
    if (!this.currentPassword) errors.push('Current password is required');
    if (!this.newPassword) errors.push('New password is required');
    if (this.newPassword.length < 8) errors.push('New password must be at least 8 characters');
    if (this.newPassword !== this.confirmPassword) errors.push('Passwords do not match');
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Verify OTP DTO
 */
export class VerifyOtpDto {
  constructor(email, otp) {
    this.email = email?.trim().toLowerCase() || '';
    this.otp = otp || '';
  }

  validate() {
    const errors = [];
    if (!this.email) errors.push('Email is required');
    if (!this.otp || this.otp.length !== 6) errors.push('Valid 6-digit OTP is required');
    return { valid: errors.length === 0, errors };
  }
}
