// src/routes/auth.routes.ts
import express, { Response } from 'express';
import { body } from 'express-validator';
import { register, login, logout } from '../controllers/auth.controller'; // Corrected import
import { protect } from '../middleware/auth.middleware';
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

router.get('/profile', protect, (req: CustomRequest, res: Response) => {
  // Because the 'protect' middleware ran first, we are guaranteed
  // to have the user's info attached to the request object.
  res.json({
    message: 'Welcome to your profile!',
    user: req.user,
  });
});

router.post('/logout', logout);

export default router;
