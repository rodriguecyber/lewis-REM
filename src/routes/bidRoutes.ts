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

/**
 * @swagger
 * /bids:
 *   post:
 *     summary: Create a bid on a property
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - amount
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID of the property to bid on
 *                 example: 507f1f77bcf86cd799439011
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Bid amount
 *                 example: 48000
 *               message:
 *                 type: string
 *                 description: Optional message from bidder
 *                 example: I'm very interested in this property
 *     responses:
 *       201:
 *         description: Bid created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         bid:
 *                           $ref: '#/components/schemas/Bid'
 *       400:
 *         description: Validation error or property not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Property not found
 */
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

/**
 * @swagger
 * /bids:
 *   get:
 *     summary: Get bids
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by property ID
 *     responses:
 *       200:
 *         description: List of bids
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         bids:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Bid'
 *     description: Returns user's own bids or bids on user's properties. Admins see all bids.
 */
router.get('/', getBids);

/**
 * @swagger
 * /bids/{id}:
 *   get:
 *     summary: Get bid by ID
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID
 *     responses:
 *       200:
 *         description: Bid details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         bid:
 *                           $ref: '#/components/schemas/Bid'
 *       403:
 *         description: Not authorized to view this bid
 *       404:
 *         description: Bid not found
 */
router.get('/:id', getBid);

/**
 * @swagger
 * /bids/{id}/status:
 *   put:
 *     summary: Update bid status (accept or reject)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 description: New bid status
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Bid status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         bid:
 *                           $ref: '#/components/schemas/Bid'
 *     description: When a bid is accepted, the property status changes to 'pending' and all other pending bids are rejected. Only property owners and admins can update bid status.
 */
router.put(
  '/:id/status',
  authorize('admin', 'property_owner'),
  [body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')],
  validate,
  updateBidStatus
);

/**
 * @swagger
 * /bids/{id}:
 *   delete:
 *     summary: Delete a bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bid ID
 *     responses:
 *       200:
 *         description: Bid deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not authorized (must be bidder or admin)
 *       404:
 *         description: Bid not found
 */
router.delete('/:id', deleteBid);

export default router;

