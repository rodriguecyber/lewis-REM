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

// Public routes
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes
router.use(protect);

router.get('/my/properties', getMyProperties);

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

router.put(
  '/:id',
  authorize('admin', 'property_owner'),
  upload.array('images', 10),
  updateProperty
);

router.delete('/:id', authorize('admin', 'property_owner'), deleteProperty);

export default router;

