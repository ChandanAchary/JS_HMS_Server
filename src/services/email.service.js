import nodemailer from "nodemailer";

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
        <h2 style="color: #2563eb; margin-top: 0;">✅ Account Successfully Created</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Congratulations! Your Super Admin account has been successfully created and verified.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>✓ Email Verified</strong> - Your account is ready to use
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
            <strong>⚠️ Important:</strong> Keep your password secure and never share it with anyone.
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
    subject: "✅ Account Successfully Created - Ready to Login",
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
        <h2 style="color: #10b981; margin-top: 0;">✅ Login Verified</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Your OTP has been successfully verified. You are now logged in to your ${role} account.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>✓ Login Successful</strong> - Your session is active
          </p>
        </div>
        
        <h3 style="color: #333;">Login Details:</h3>
        <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
          <li>✓ <strong>Email:</strong> ${email}</li>
          <li>✓ <strong>Role:</strong> ${role}</li>
          <li>✓ <strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;">
            <strong>🔒 Security Tip:</strong> If you did not login to your account, please change your password immediately.
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
    subject: `✅ Login Verified - ${role} Account`,
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
        <h2 style="color: #10b981; margin-top: 0;">✅ Registration Complete</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Welcome to <strong>${hospitalName}</strong>! Your ${role} account registration has been completed successfully.
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065f46;">
            <strong>✓ Registration Successful</strong> - Account is active
          </p>
        </div>
        
        <h3 style="color: #333;">Account Information:</h3>
        <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
          <li>✓ <strong>Name:</strong> ${name}</li>
          <li>✓ <strong>Role:</strong> ${role}</li>
          <li>✓ <strong>Hospital:</strong> ${hospitalName}</li>
          <li>✓ <strong>Email:</strong> ${email}</li>
        </ul>
        
        <h3 style="color: #333;">What's Next?</h3>
        <ol style="color: #555; line-height: 1.8;">
          <li>Login to your account using your email and password</li>
          <li>Complete your profile if required</li>
          <li>Start using the hospital management system</li>
        </ol>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>ℹ️ Need Help?</strong> Contact your hospital administrator for support.
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
    subject: `✅ Registration Complete - Welcome to ${hospitalName}`,
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
        <h1 style="color: #2563eb; margin: 0;">🏥 HMS Hub</h1>
        <p style="color: #666;">Hospital Management System</p>
      </div>
      
      <h2 style="color: #333;">Welcome to HMS Hub, ${adminName}! 🎉</h2>
      
      <p>Congratulations! Your organization <strong>${hospitalName}</strong> has been successfully registered on HMS Hub.</p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">Your Organization Portal</p>
        <h2 style="margin: 0; font-size: 24px; word-break: break-all;">
          <a href="${hospitalUrl}" style="color: white; text-decoration: none;">${hospitalUrl}</a>
        </h2>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">📋 Quick Start Guide</h3>
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
          <strong>💡 Tip:</strong> Bookmark your portal URL for quick access. All your team members will use this URL to access the system.
        </p>
      </div>
      
      <h3 style="color: #333;">🌟 What you can do now:</h3>
      <ul style="color: #555; line-height: 1.8;">
        <li>✅ Manage doctors and staff</li>
        <li>✅ Track attendance</li>
        <li>✅ Handle patient registrations</li>
        <li>✅ Process billing</li>
        <li>✅ Generate reports</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${hospitalUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Go to Your Portal →
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p>Need help? Contact our support team at support@hmshub.com</p>
        <p>© ${new Date().getFullYear()} HMS Hub. All rights reserved.</p>
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

© ${new Date().getFullYear()} HMS Hub
  `;

  return sendViaBrevo({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: `🎉 Welcome to HMS Hub - ${hospitalName} is now live!`,
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
  sendTransactionalEmail
};
