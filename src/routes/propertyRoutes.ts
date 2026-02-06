import express from 'express';
import { body } from 'express-validator';
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} from '../controllers/propertyController';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import { validate } from '../middleware/validator';

const router = express.Router();

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties (public)
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [house, apartment, land, commercial, car, other]
 *         description: Filter by property type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, pending, sold, rented]
 *         description: Filter by property status
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of properties
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
 *                         properties:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Property'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             pages:
 *                               type: integer
 */
router.get('/', getProperties);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get property by ID (public)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
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
 *                         property:
 *                           $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getProperty);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /properties/my/properties:
 *   get:
 *     summary: Get current user's properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's properties
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
 *                         properties:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Property'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my/properties', getMyProperties);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property listing
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - price
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: Beautiful 3 Bedroom House
 *               description:
 *                 type: string
 *                 example: Spacious house in prime location
 *               type:
 *                 type: string
 *                 enum: [house, apartment, land, commercial, car, other]
 *                 example: house
 *               price:
 *                 type: number
 *                 example: 50000
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: 123 Main Street
 *                   city:
 *                     type: string
 *                     example: Accra
 *                   state:
 *                     type: string
 *                     example: Greater Accra
 *                   zipCode:
 *                     type: string
 *                     example: GA123
 *                   country:
 *                     type: string
 *                     example: Ghana
 *               features:
 *                 type: object
 *                 description: Property-specific features (varies by type)
 *                 example:
 *                   bedrooms: 3
 *                   bathrooms: 2
 *                   area: 2000
 *                   parking: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Property images (max 10, 5MB each)
 *     responses:
 *       201:
 *         description: Property created successfully
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
 *                         property:
 *                           $ref: '#/components/schemas/Property'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (must be property_owner or admin)
 */
router.post(
  '/',
  authorize('admin', 'property_owner'),
  upload.array('images', 10),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('type').isIn(['house', 'apartment', 'land', 'commercial', 'car', 'other']),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.zipCode').notEmpty().withMessage('Zip code is required'),
  ],
  validate,
  createProperty
);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [house, apartment, land, commercial, car, other]
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, pending, sold, rented]
 *               location:
 *                 type: object
 *               features:
 *                 type: object
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to add (max 10)
 *     responses:
 *       200:
 *         description: Property updated successfully
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
 *                         property:
 *                           $ref: '#/components/schemas/Property'
 *       403:
 *         description: Not authorized (must be owner or admin)
 *       404:
 *         description: Property not found
 */
router.put(
  '/:id',
  authorize('admin', 'property_owner'),
  upload.array('images', 10),
  updateProperty
);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not authorized (must be owner or admin)
 *       404:
 *         description: Property not found
 */
router.delete('/:id', authorize('admin', 'property_owner'), deleteProperty);

export default router;

