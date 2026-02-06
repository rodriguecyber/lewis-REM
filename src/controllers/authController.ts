import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import User from '../models/User';
import { generateVerificationToken, generateResetToken } from '../utils/generateToken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AppError } from '../middleware/errorHandler';

const generateJWT = (userId: string, email: string, role: string): string => {
  return jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET || '', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'property_seeker',
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    const token = generateJWT(user._id.toString(), user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateJWT(user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
      return;
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();
      res.status(500).json({ success: false, message: 'Failed to send email' });
      return;
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    const jwtToken = generateJWT(user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        token: jwtToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
          isVerified: user?.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

