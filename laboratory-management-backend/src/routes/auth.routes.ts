// src/routes/auth.routes.ts
import express, { Response } from 'express';
import { body } from 'express-validator';
import { register, login, logout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { CustomRequest } from '../../types/express';

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

// Accessible to any authenticated user
router.get('/profile', protect, (req: CustomRequest, res: Response) => {
  res.json({
    message: 'Welcome to your profile!',
    user: req.user,
  });
});

// Only accessible to users with the 'admin' role
router.get(
  '/admin-only',
  protect,
  authorize('admin'),
  (req: CustomRequest, res: Response) => {
    res.json({
      message: 'Welcome, Admin! You have access to this protected resource.',
      user: req.user,
    });
  }
);

router.post('/logout', logout);

export default router;
