import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validator';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'property_owner', 'property_seeker']),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  validate,
  verifyEmail
);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Please provide a valid email')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

router.get('/me', protect, getMe);

export default router;

