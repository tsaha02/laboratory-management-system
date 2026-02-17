// src/routes/test.routes.ts
import express from 'express';
import { body } from 'express-validator';
import {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} from '../controllers/test.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = express.Router();

// Public routes — anyone can view tests
router.get('/', getAllTests);
router.get('/:id', getTestById);

// Admin-only routes — protected by both authentication and role check
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().not().isEmpty().withMessage('Test name is required.'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
  ],
  createTest
);

router.put('/:id', protect, authorize('admin'), updateTest);

router.delete('/:id', protect, authorize('admin'), deleteTest);

export default router;
