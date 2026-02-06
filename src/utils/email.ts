import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Account',
    html: `
      <h2>Welcome to Lewis Real Estate</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy this link: ${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

