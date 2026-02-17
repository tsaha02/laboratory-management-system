// src/routes/package.routes.ts
import express from 'express';
import { body } from 'express-validator';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/package.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllPackages);
router.get('/:id', getPackageById);

// Admin-only routes
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().not().isEmpty().withMessage('Package name is required.'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
  ],
  createPackage
);

router.put('/:id', protect, authorize('admin'), updatePackage);

router.delete('/:id', protect, authorize('admin'), deletePackage);

export default router;
