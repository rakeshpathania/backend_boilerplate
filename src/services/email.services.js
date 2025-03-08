import nodemailer from "nodemailer";
import { EMAIL } from "../config/index.js";
import { APIError, logger } from "../utils/error-handler.js";

const transport = nodemailer.createTransport(EMAIL?.smtp);

// Verify email transport connection
if (process.env.NODE_ENV !== "test") {
  try {
    await transport.verify();
    logger.info("Connected to email server");
  } catch (error) {
    logger.warn(
      "Unable to connect to email server. Check SMTP configuration in .env"
    );
  }
}

/**
 * Base email template
 * @param {string} content
 * @returns {string}
 */
const createEmailTemplate = (content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      ${content}
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        If you didn't request this email, please ignore it.
      </p>
    </body>
  </html>
`;

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email content in HTML
 * @param {string} [pdfPath] - Optional PDF attachment path
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const msg = {
      from: EMAIL?.from,
      to,
      subject,
      html: createEmailTemplate(htmlContent),
    };
    await transport.sendMail(msg);
  } catch (error) {
    throw new APIError("Failed to send email", {
      message: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Send reset password email
 * @param {string} to - Recipient email
 * @param {string} token - Reset password token
 */
const sendResetPasswordEmail = async (to, token) => {
  const resetPasswordUrl = `${EMAIL.reset.linkUrl}/accounts/reset-password?token=${token}`;
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>Dear user,</p>
    <p>To reset your password, please click the button below:</p>
    <a href="${resetPasswordUrl}" 
       style="display: inline-block; 
              padding: 10px 20px; 
              margin: 20px 0; 
              background-color: #1BB095; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;">
      Reset Password
    </a>
  `;

  await sendEmail(to, "Reset Password", htmlContent);
};

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${EMAIL.app.frontendUrl}/verify-email?token=${token}`;
  const htmlContent = `
    <h2>Email Verification</h2>
    <p>Dear user,</p>
    <p>To verify your email address, please click the button below:</p>
    <a href="${verificationUrl}" 
       style="display: inline-block; 
              padding: 10px 20px; 
              margin: 20px 0; 
              background-color: #1BB095; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;">
      Verify Email
    </a>
  `;

  await sendEmail(to, "Email Verification", htmlContent);
};

/**
 * Send OTP verification email
 * @param {string} otp - One-time password
 * @param {Object} recipient - Recipient details
 * @param {string} subject - Email subject
 */
const sendOtpVerificationEmail = async (otp, recipient, subject) => {
  const htmlContent = `
    <h2>OTP Verification</h2>
    <p>Dear ${recipient.name},</p>
    <p>Your verification code is:</p>
    <div style="background-color: #f4f4f4; 
                padding: 10px; 
                margin: 20px 0; 
                text-align: center; 
                font-size: 24px; 
                letter-spacing: 5px;">
      ${otp}
    </div>
    <p>This code will expire in 10 minutes.</p>
  `;

  await sendEmail(recipient.email, subject, htmlContent);
};

export {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendOtpVerificationEmail,
};
