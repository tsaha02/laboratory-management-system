// src/routes/auth.routes.ts
import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller'; // Corrected import

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Full name is required.'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password').not().isEmpty().withMessage('Password is required.'),
  ],
  login
);

export default router;
