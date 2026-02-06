import express from 'express';
import { body } from 'express-validator';
import {
  getStatistics,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/statistics', getStatistics);
router.get('/users', getAllUsers);
router.put(
  '/users/:id',
  [
    body('role').optional().isIn(['admin', 'property_owner', 'property_seeker']),
    body('isVerified').optional().isBoolean(),
  ],
  validate,
  updateUser
);
router.delete('/users/:id', deleteUser);

export default router;

