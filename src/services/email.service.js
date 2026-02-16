import nodemailer from 'nodemailer';

const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || "587", 10);
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER || "apikey";
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY || "";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || "no-reply@localhost";
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "Hospital Management System";

const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: BREVO_SMTP_PORT,
  secure: BREVO_SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: BREVO_SMTP_USER,
    pass: BREVO_SMTP_KEY
  } 
});

// Internal helper functions removed (not used). We send via Brevo REST API below.

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not set in environment variables.");
}

// Add a safe fetch getter so Node versions without global fetch still work
const getFetch = async () => {
  if (typeof fetch === "function") return fetch;
  try {
    const { default: nodeFetch } = await import("node-fetch");
    return nodeFetch;
  } catch (err) {
    console.warn("Global fetch not available and node-fetch not installed.");
    return null;
  }
};

const sendViaBrevo = async (payload) => {
  try {
    const _fetch = await getFetch();
    if (typeof _fetch !== "function") {
      console.warn("No fetch available; cannot send email via Brevo REST API");
      return false;
    }

    const resp = await _fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": String(BREVO_API_KEY).trim()
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Brevo REST send failed:", resp.status, text);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Brevo REST send error:", err?.message || err);
    return false;
  }
};

export const sendRegistrationInvite = async (email, name, role, hospitalName, registrationLink) => {
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>You've been invited to join <strong>${hospitalName}</strong> as a <strong>${role}</strong>.</p>
    <p>
      <a href="${registrationLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Complete Registration</a>
    </p>
    <p>Link expires soon. If you didn't expect this, ignore the email.</p>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `You're invited to join ${hospitalName}`,
    htmlContent: html
  });
};

export const sendApprovalWithCredentials = async (email, name, role, loginUrl, defaultPassword) => {
  const html = `
    <h2>Account Approved, ${name}!</h2>
    <p>Your ${role} account has been approved and is ready to use.</p>
    <h3>Login Credentials:</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> <code>${defaultPassword}</code></p>
    <p>
      <a href="${loginUrl}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Login Now</a>
    </p>
    <p><strong>Please change your password immediately after login.</strong></p>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: "Your Account Has Been Approved",
    htmlContent: html
  });
};

export const sendRejectionNotice = async (email, name, role, reason) => {
  const html = `
    <h2>Application Update</h2>
    <p>Dear ${name},</p>
    <p>Thank you for your interest in joining us as a ${role}.</p>
    <p>Unfortunately, your application has been rejected at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
    <p>If you have any questions, please contact the hospital administration.</p>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: "Application Status Update",
    htmlContent: html
  });
};

/**
 * Send a one-time 6-digit OTP to an email for verification
 * @param {string} email
 * @param {string} name
 * @param {string} otp - plain 6-digit code
 */
export const sendOtpEmail = async (email, name = "", otp) => {
  const html = `
    <p>Hi ${name || "User"},</p>
    <p>Your verification code is: <strong style="font-size:18px">${otp}</strong></p>
    <p>This code will expire in 10 minutes. Do not share it with anyone.</p>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: "Your verification code",
    htmlContent: html,
    textContent: `Your verification code is: ${otp}. It expires in 10 minutes.`
  });
};

/**
 * Send admin registration confirmation email
 * @param {string} email - Admin email
 * @param {string} name - Admin name
 * @param {string} loginUrl - URL to login page
 */
export const sendAdminRegistrationConfirmation = async (email, name, loginUrl = "http://localhost:3000/admin/login") => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2563eb; margin-top: 0;">âœ… Account Successfully Created</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Congratulations! Your Super Admin account has been successfully created and verified.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>âœ“ Email Verified</strong> - Your account is ready to use
          </p>
        </div>
        
        <h3 style="color: #333;">Next Steps:</h3>
        <ol style="color: #555; line-height: 1.8;">
          <li><strong>Login to your account:</strong> Use your email to access the admin panel</li>
          <li><strong>Configure hospital details:</strong> Complete Phase 3 setup with hospital information</li>
          <li><strong>Invite team members:</strong> Add doctors and staff to your hospital</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Admin Panel
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;">
            <strong>âš ï¸ Important:</strong> Keep your password secure and never share it with anyone.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Hospital Management System | ${new Date().getFullYear()}
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: "âœ… Account Successfully Created - Ready to Login",
    htmlContent: html,
    textContent: `Your admin account has been successfully created and verified. You can now login to continue with hospital setup.`
  });
};

/**
 * Send login OTP verification confirmation email
 * @param {string} email - Admin/User email
 * @param {string} name - User name
 * @param {string} role - User role (ADMIN, DOCTOR, EMPLOYEE, etc.)
 */
export const sendLoginOtpConfirmation = async (email, name, role = "Admin") => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #10b981; margin-top: 0;">âœ… Login Verified</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your OTP has been successfully verified. You are now logged in to your ${role} account.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>âœ“ Login Successful</strong> - Your session is active
          </p>
        </div>
        
        <h3 style="color: #333;">Login Details:</h3>
        <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
          <li>âœ“ <strong>Email:</strong> ${email}</li>
          <li>âœ“ <strong>Role:</strong> ${role}</li>
          <li>âœ“ <strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;">
            <strong>ðŸ”’ Security Tip:</strong> If you did not login to your account, please change your password immediately.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Hospital Management System | ${new Date().getFullYear()}
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `âœ… Login Verified - ${role} Account`,
    htmlContent: html,
    textContent: `Your OTP has been verified. You are now logged in to your ${role} account.`
  });
};

/**
 * Send registration confirmation email after token-based registration
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} role - User role (DOCTOR, EMPLOYEE, etc.)
 * @param {string} hospitalName - Hospital name
 */
export const sendRegistrationConfirmation = async (email, name, role, hospitalName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #10b981; margin-top: 0;">âœ… Registration Complete</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Welcome to <strong>${hospitalName}</strong>! Your ${role} account registration has been completed successfully.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>âœ“ Registration Successful</strong> - Account is active
          </p>
        </div>
        
        <h3 style="color: #333;">Account Information:</h3>
        <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
          <li>âœ“ <strong>Name:</strong> ${name}</li>
          <li>âœ“ <strong>Role:</strong> ${role}</li>
          <li>âœ“ <strong>Hospital:</strong> ${hospitalName}</li>
          <li>âœ“ <strong>Email:</strong> ${email}</li>
        </ul>
        
        <h3 style="color: #333;">What's Next?</h3>
        <ol style="color: #555; line-height: 1.8;">
          <li>Login to your account using your email and password</li>
          <li>Complete your profile if required</li>
          <li>Start using the hospital management system</li>
        </ol>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>â„¹ï¸ Need Help?</strong> Contact your hospital administrator for support.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Hospital Management System | ${new Date().getFullYear()}
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `âœ… Registration Complete - Welcome to ${hospitalName}`,
    htmlContent: html,
    textContent: `Your registration as ${role} at ${hospitalName} is complete. You can now login to your account.`
  });
};

/**
 * Send welcome email to tenant admin after successful registration
 * Includes the hospital subdomain URL
 * 
 * @param {string} email - Admin email
 * @param {string} adminName - Admin name
 * @param {string} hospitalName - Hospital/Organization name
 * @param {string} hospitalUrl - Full URL (e.g., https://apollo.nexushms.com)
 * @param {string} subdomain - Just the subdomain part
 */
export const sendTenantWelcomeEmail = async (email, adminName, hospitalName, hospitalUrl, subdomain) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">ðŸ¥ HMS Hub</h1>
        <p style="color: #666;">Hospital Management System</p>
      </div>
      
      <h2 style="color: #333;">Welcome to HMS Hub, ${adminName}! ðŸŽ‰</h2>
      
      <p>Congratulations! Your organization <strong>${hospitalName}</strong> has been successfully registered on HMS Hub.</p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">Your Organization Portal</p>
        <h2 style="margin: 0; font-size: 24px; word-break: break-all;">
          <a href="${hospitalUrl}" style="color: white; text-decoration: none;">${hospitalUrl}</a>
        </h2>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">ðŸ“‹ Quick Start Guide</h3>
        <ol style="color: #555; line-height: 1.8;">
          <li><strong>Access your portal:</strong> Visit <a href="${hospitalUrl}" style="color: #2563eb;">${hospitalUrl}</a></li>
          <li><strong>Login:</strong> Use your registered email to login</li>
          <li><strong>Set up your team:</strong> Invite doctors and staff members</li>
          <li><strong>Configure forms:</strong> Customize registration forms</li>
          <li><strong>Start managing:</strong> Add patients and manage appointments</li>
        </ol>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e;">
          <strong>ðŸ’¡ Tip:</strong> Bookmark your portal URL for quick access. All your team members will use this URL to access the system.
        </p>
      </div>
      
      <h3 style="color: #333;">ðŸŒŸ What you can do now:</h3>
      <ul style="color: #555; line-height: 1.8;">
        <li>âœ… Manage doctors and staff</li>
        <li>âœ… Track attendance</li>
        <li>âœ… Handle patient registrations</li>
        <li>âœ… Process billing</li>
        <li>âœ… Generate reports</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${hospitalUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Go to Your Portal â†’
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p>Need help? Contact our support team at support@hmshub.com</p>
        <p>Â© ${new Date().getFullYear()} HMS Hub. All rights reserved.</p>
      </div>
    </div>
  `;

  const textContent = `
Welcome to HMS Hub, ${adminName}!

Congratulations! Your organization "${hospitalName}" has been successfully registered.

Your Organization Portal: ${hospitalUrl}

Quick Start:
1. Visit ${hospitalUrl}
2. Login with your registered email
3. Set up your team by inviting doctors and staff
4. Configure registration forms
5. Start managing patients and appointments

Need help? Contact support@hmshub.com

Â© ${new Date().getFullYear()} HMS Hub
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `ðŸŽ‰ Welcome to HMS Hub - ${hospitalName} is now live!`,
    htmlContent: html,
    textContent
  });
};

// Add this wrapper so existing imports of sendEmailVerification keep working.
// It sends a 6-digit OTP (if one is passed it will use it, otherwise it generates one).
export const sendEmailVerification = async (email, name = "", otpOrLink) => {
  // If caller passes a 6-digit OTP, use it; otherwise generate a new OTP.
  const otpCandidate = String(otpOrLink || "");
  const otp = /^\d{6}$/.test(otpCandidate)
    ? otpCandidate
    : String(Math.floor(100000 + Math.random() * 900000)); 

  return sendOtpEmail(email, name, otp);
};

export const sendPasswordUpdateNotification = async (email, recipientName = "User") => {
  const mailOptions = {
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: "Password Update Required - Hospital Management System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Update Your Password</h2>
        <p>Hi ${recipientName},</p>
        <p>Your account has been created. As a security measure, please update your password on your first login.</p>
        <p style="color: #666; margin-top: 20px;">
          You will be prompted to change your password after logging in with your default credentials.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false };
  }
};

/**
 * Generic transactional email function for custom emails
 * @param {Object} opts
 * @param {string} opts.to - Recipient email
 * @param {string} opts.subject - Email subject
 * @param {string} opts.htmlContent - HTML body
 * @param {string} [opts.textContent] - Plain text body
 */
export const sendTransactionalEmail = async ({ to, subject, htmlContent, textContent }) => {
  if (!to || !subject || !htmlContent) {
    throw new Error('Missing required email fields: to, subject, htmlContent');
  }
  
  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent,
    textContent
  });
};

/**
 * Send password reset OTP email with enhanced security messaging
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit OTP
 */
export const sendPasswordResetEmail = async (email, name = "User", otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #dc2626; margin-top: 0;">ðŸ” Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Use the verification code below to complete your password reset:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; border: 2px dashed #9ca3af; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
          </div>
        </div>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #991b1b;">
            <strong>â° This code expires in 10 minutes.</strong><br>
            Do not share this code with anyone.
          </p>
        </div>
        
        <div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #854d0e;">
            <strong>ðŸ”’ Security Notice:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Hospital Management System | ${new Date().getFullYear()}<br>
          This is an automated security email.
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: "ðŸ” Password Reset Code - Hospital Management System",
    htmlContent: html,
    textContent: `Your password reset code is: ${otp}. This code expires in 10 minutes. Do not share it with anyone. If you did not request this, please ignore this email.`
  });
};

/**
 * Send password changed confirmation email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 */
export const sendPasswordChangedEmail = async (email, name = "User") => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #10b981; margin-top: 0;">âœ… Password Changed Successfully</h2>
        <p>Hi <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your password has been successfully changed. You can now use your new password to log in to your account.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>âœ“ Password Updated</strong> - ${new Date().toLocaleString()}
          </p>
        </div>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #991b1b;">
            <strong>âš ï¸ Didn't make this change?</strong><br>
            If you did not change your password, your account may have been compromised. Please contact your administrator immediately and request a password reset.
          </p>
        </div>
        
        <h3 style="color: #333;">Security Tips:</h3>
        <ul style="color: #555; line-height: 1.8;">
          <li>Never share your password with anyone</li>
          <li>Use a strong, unique password</li>
          <li>Enable two-factor authentication if available</li>
          <li>Log out from shared or public devices</li>
        </ul>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Hospital Management System | ${new Date().getFullYear()}<br>
          This is an automated security notification.
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: "âœ… Password Changed Successfully - Hospital Management System",
    htmlContent: html,
    textContent: `Your password has been successfully changed. If you did not make this change, please contact your administrator immediately.`
  });
};

/**
 * Send critical value notification email
 * @param {string} email - Recipient email (doctor/patient)
 * @param {string} patientName - Patient name
 * @param {string} reportNumber - Report number
 * @param {Array} criticalValues - Array of critical values
 * @param {string} hospitalName - Hospital name
 */
export const sendCriticalValueNotification = async (email, patientName, reportNumber, criticalValues, hospitalName) => {
  const criticalValuesHtml = criticalValues.map(cv => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${cv.testName}</td>
      <td style="border: 1px solid #ddd; padding: 8px; color: #dc2626; font-weight: bold;">${cv.value} ${cv.unit || ''}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${cv.referenceRange || 'N/A'}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${cv.reason || 'Critical'}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <h2 style="color: #dc2626; margin: 0;">🚨 CRITICAL VALUE ALERT</h2>
        </div>
        
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Report Number:</strong> ${reportNumber}</p>
        <p><strong>Hospital:</strong> ${hospitalName}</p>
        <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
        
        <h3 style="color: #dc2626;">Critical Values Detected:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Value</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Reference Range</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${criticalValuesHtml}
          </tbody>
        </table>
        
        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #9a3412;">
            <strong>⚠️ IMMEDIATE ACTION REQUIRED</strong><br>
            These values require immediate medical attention. Please contact the patient or referring physician immediately.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          This is an automated critical value notification from ${hospitalName}<br>
          Generated on: ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `🚨 CRITICAL VALUE ALERT - Report ${reportNumber}`,
    htmlContent: html,
    textContent: `CRITICAL VALUE ALERT: Patient ${patientName}, Report ${reportNumber}. Critical values detected requiring immediate attention.`
  });
};

/**
 * Send report delivery notification to patient
 * @param {string} email - Patient email
 * @param {string} patientName - Patient name
 * @param {string} reportNumber - Report number
 * @param {string} reportUrl - URL to view report
 * @param {string} hospitalName - Hospital name
 */
export const sendReportDeliveryNotification = async (email, patientName, reportNumber, reportUrl, hospitalName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #10b981; margin-top: 0;">📧 Your Diagnostic Report is Ready</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your diagnostic report is now available for viewing.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>✓ Report Ready</strong><br>
            Report Number: <strong>${reportNumber}</strong><br>
            Generated: ${new Date().toLocaleString()}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportUrl}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Report
          </a>
        </div>
        
        <h3 style="color: #333;">What's Next?</h3>
        <ul style="color: #555; line-height: 1.8;">
          <li>Click the button above to view your report online</li>
          <li>You can download or print the report for your records</li>
          <li>Share the report with your doctor if needed</li>
          <li>Contact us if you have any questions about your results</li>
        </ul>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>ℹ️ Need Help?</strong> Contact ${hospitalName} for any questions about your report.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          ${hospitalName} | ${new Date().getFullYear()}<br>
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `📧 Your Diagnostic Report is Ready - ${reportNumber}`,
    htmlContent: html,
    textContent: `Dear ${patientName}, your diagnostic report ${reportNumber} is now ready. Visit ${reportUrl} to view your report.`
  });
};

/**
 * Send result released notification to patient
 * @param {string} email - Patient email
 * @param {string} patientName - Patient name
 * @param {string} testName - Test name
 * @param {string} reportNumber - Report/Result number
 * @param {string} viewUrl - URL to view results
 * @param {string} hospitalName - Hospital name
 */
export const sendResultReleasedNotification = async (email, patientName, testName, reportNumber, viewUrl, hospitalName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #3b82f6; margin-top: 0;">🔬 Test Results Released</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your test results are now available for viewing.
        </p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>✓ Results Available</strong><br>
            Test: <strong>${testName}</strong><br>
            Report #: ${reportNumber}<br>
            Released: ${new Date().toLocaleString()}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${viewUrl}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Results
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Important:</strong> Please consult with your doctor to interpret your test results properly.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          ${hospitalName} | ${new Date().getFullYear()}<br>
          This is an automated notification.
        </p>
      </div>
    </div>
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `🔬 Test Results Released - ${testName}`,
    htmlContent: html,
    textContent: `Dear ${patientName}, your test results for ${testName} (Report #${reportNumber}) are now available. Visit ${viewUrl} to view your results.`
  });
};

export default {
  sendEmailVerification,
  sendRegistrationInvite,
  sendApprovalWithCredentials,
  sendRejectionNotice,
  sendOtpEmail,
  sendAdminRegistrationConfirmation,
  sendLoginOtpConfirmation,
  sendRegistrationConfirmation,
  sendTenantWelcomeEmail,
  sendTransactionalEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendCriticalValueNotification,
  sendReportDeliveryNotification,
  sendResultReleasedNotification
};




















