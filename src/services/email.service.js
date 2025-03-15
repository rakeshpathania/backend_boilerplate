import nodemailer from "nodemailer";
import { EMAIL } from "../config/index.js";
import { APIError, logger } from "../utils/error-handler.js";

class EmailService {
  constructor() {
    this.transport = nodemailer.createTransport(EMAIL?.smtp);
    this.verifyConnection();
  }

  async verifyConnection() {
    if (process.env.NODE_ENV !== "test") {
      try {
        await this.transport.verify();
        logger.info("Connected to email server");
      } catch (error) {
        logger.warn(
          "Unable to connect to email server. Check SMTP configuration in .env"
        );
      }
    }
  }

  createEmailTemplate(content) {
    return `
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
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      const msg = {
        from: EMAIL?.from,
        to,
        subject,
        html: this.createEmailTemplate(htmlContent),
      };
      await this.transport.sendMail(msg);
    } catch (error) {
      throw new APIError("Failed to send email", {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  async sendResetPasswordEmail(to, token) {
    const resetPasswordUrl = `${EMAIL.reset.linkUrl}/accounts/reset-password?token=${token}`;
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Dear user,</p>
      <p>To reset your password, please click the button below:</p>
      <a href="${resetPasswordUrl}" 
         style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #1BB095; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    `;
    await this.sendEmail(to, "Reset Password", htmlContent);
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${EMAIL.app.frontendUrl}/verify-email?token=${token}`;
    const htmlContent = `
      <h2>Email Verification</h2>
      <p>Dear user,</p>
      <p>To verify your email address, please click the button below:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #1BB095; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
    `;
    await this.sendEmail(to, "Email Verification", htmlContent);
  }

  async sendOtpVerificationEmail(otp, recipient, subject) {
    const htmlContent = `
      <h2>OTP Verification</h2>
      <p>Dear ${recipient.name},</p>
      <p>Your verification code is:</p>
      <div style="background-color: #f4f4f4; padding: 10px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
    `;
    await this.sendEmail(recipient.email, subject, htmlContent);
  }
}

export default EmailService;
