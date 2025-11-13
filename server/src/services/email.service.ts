import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@midjourney-library.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Midjourney Style Library';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter(EMAIL_CONFIG);
  }
  return transporter;
};

/**
 * Send email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    // Skip sending emails in test/development if SMTP is not configured
    if (!process.env.SMTP_USER && process.env.NODE_ENV !== 'production') {
      logger.info(`[EMAIL] Would send to ${to}: ${subject}`);
      logger.debug(`[EMAIL] Content: ${html}`);
      return;
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    const transport = getTransporter();
    const info = await transport.sendMail(mailOptions);

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Welcome to Midjourney Style Library!';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Welcome ${name}!</h1>
        <p>Thank you for joining Midjourney Style Library.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and discover amazing Midjourney styles</li>
          <li>Create and share your own styles</li>
          <li>Save styles to your collections</li>
          <li>Follow other creators</li>
        </ul>
        <p>Free users can view up to 20 styles. Upgrade to Premium for unlimited access!</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </p>
        <p>Happy creating!<br>The Midjourney Style Library Team</p>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

/**
 * Send email verification
 */
export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const subject = 'Verify your email address';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Verify Your Email</h1>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p>
          <a href="${verificationUrl}"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const subject = 'Reset your password';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p>
          <a href="${resetUrl}"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

/**
 * Send subscription activated email
 */
export const sendSubscriptionActivatedEmail = async (
  to: string,
  name: string,
  plan: string
): Promise<void> => {
  const subject = 'Your Premium subscription is active!';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">🎉 Welcome to Premium!</h1>
        <p>Hi ${name},</p>
        <p>Your ${plan} subscription is now active!</p>
        <p>You now have access to:</p>
        <ul>
          <li>✨ Unlimited style views</li>
          <li>🚀 Unlimited style creation</li>
          <li>📤 50MB upload limit</li>
          <li>⭐ Priority support</li>
          <li>🎁 Early access to new features</li>
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Creating
          </a>
        </p>
        <p>Thank you for your support!<br>The Midjourney Style Library Team</p>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

/**
 * Send subscription canceled email
 */
export const sendSubscriptionCanceledEmail = async (
  to: string,
  name: string,
  endDate: Date
): Promise<void> => {
  const subject = 'Your subscription has been canceled';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Subscription Canceled</h1>
        <p>Hi ${name},</p>
        <p>Your Premium subscription has been canceled.</p>
        <p>You'll continue to have access to Premium features until <strong>${endDate.toLocaleDateString()}</strong>.</p>
        <p>After that, you'll be moved to the Free plan with:</p>
        <ul>
          <li>Access to 20 styles</li>
          <li>5 style creations per month</li>
          <li>5MB upload limit</li>
        </ul>
        <p>We'd love to have you back! You can reactivate your subscription anytime.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reactivate Subscription
          </a>
        </p>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

/**
 * Send payment failed email
 */
export const sendPaymentFailedEmail = async (
  to: string,
  name: string,
  amount: number
): Promise<void> => {
  const subject = 'Payment Failed - Action Required';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #DC2626;">Payment Failed</h1>
        <p>Hi ${name},</p>
        <p>We were unable to process your payment of $${amount.toFixed(2)}.</p>
        <p>Please update your payment method to continue enjoying Premium features.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing"
             style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </p>
        <p>If you have any questions, please contact support.</p>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionCanceledEmail,
  sendPaymentFailedEmail,
};
