/**
 * Password DTOs (Data Transfer Objects)
 * Define request/response shapes for password endpoints
 */

/**
 * Forgot Password Request DTO
 * Step 1: Request OTP
 */
export class ForgotPasswordDto {
  constructor(data) {
    this.email = data?.email?.trim().toLowerCase() || '';
    this.userType = data?.userType?.toUpperCase() || '';
  }

  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    const validUserTypes = ['ADMIN', 'EMPLOYEE', 'DOCTOR'];
    if (!this.userType) {
      errors.push('User type is required');
    } else if (!validUserTypes.includes(this.userType)) {
      errors.push('User type must be ADMIN, EMPLOYEE, or DOCTOR');
    }

    return { valid: errors.length === 0, errors };
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

/**
 * Reset Password with OTP DTO
 * Step 2: Reset password using OTP
 */
export class ResetPasswordDto {
  constructor(data) {
    this.email = data?.email?.trim().toLowerCase() || '';
    this.userType = data?.userType?.toUpperCase() || '';
    this.otp = data?.otp?.toString().trim() || '';
    this.newPassword = data?.newPassword || '';
    this.confirmPassword = data?.confirmPassword || '';
  }

  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    const validUserTypes = ['ADMIN', 'EMPLOYEE', 'DOCTOR'];
    if (!this.userType) {
      errors.push('User type is required');
    } else if (!validUserTypes.includes(this.userType)) {
      errors.push('User type must be ADMIN, EMPLOYEE, or DOCTOR');
    }

    if (!this.otp) {
      errors.push('OTP is required');
    } else if (!/^\d{6}$/.test(this.otp)) {
      errors.push('OTP must be 6 digits');
    }

    if (!this.newPassword) {
      errors.push('New password is required');
    } else if (this.newPassword.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!this.confirmPassword) {
      errors.push('Confirm password is required');
    }

    if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return { valid: errors.length === 0, errors };
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

/**
 * Send OTP DTO
 * For first login or change password OTP request
 */
export class SendOTPDto {
  constructor(data) {
    this.userId = data?.userId || '';
    this.userType = data?.userType?.toUpperCase() || '';
  }

  validate() {
    const errors = [];

    const validUserTypes = ['ADMIN', 'EMPLOYEE', 'DOCTOR'];
    if (this.userType && !validUserTypes.includes(this.userType)) {
      errors.push('User type must be ADMIN, EMPLOYEE, or DOCTOR');
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Change Password with OTP DTO
 * For first login password change or regular password change with OTP
 */
export class ChangePasswordWithOTPDto {
  constructor(data) {
    this.currentPassword = data?.currentPassword || '';
    this.newPassword = data?.newPassword || '';
    this.confirmPassword = data?.confirmPassword || '';
    this.otp = data?.otp?.toString().trim() || '';
  }

  validate() {
    const errors = [];

    if (!this.currentPassword) {
      errors.push('Current password is required');
    }

    if (!this.newPassword) {
      errors.push('New password is required');
    } else if (this.newPassword.length < 8) {
      errors.push('New password must be at least 8 characters');
    }

    if (!this.confirmPassword) {
      errors.push('Confirm password is required');
    }

    if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!this.otp) {
      errors.push('OTP is required');
    } else if (!/^\d{6}$/.test(this.otp)) {
      errors.push('OTP must be 6 digits');
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Password Reset Success Response DTO
 */
export class PasswordResetResponseDto {
  constructor(success, message) {
    this.success = success;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
