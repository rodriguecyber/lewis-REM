import express from 'express';
import { body } from 'express-validator';
import {
  createBid,
  getBids,
  getBid,
  updateBidStatus,
  deleteBid,
} from '../controllers/bidController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('message').optional().trim(),
  ],
  validate,
  createBid
);

router.get('/', getBids);
router.get('/:id', getBid);

router.put(
  '/:id/status',
  authorize('admin', 'property_owner'),
  [body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')],
  validate,
  updateBidStatus
);

router.delete('/:id', deleteBid);

export default router;

