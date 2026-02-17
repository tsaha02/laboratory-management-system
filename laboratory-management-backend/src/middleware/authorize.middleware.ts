// src/middleware/authorize.middleware.ts
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../../types/express';

/**
 * Authorization middleware factory.
 * Takes an array of allowed roles and returns a middleware function
 * that checks if the authenticated user's role is in the allowed list.
 *
 * IMPORTANT: This must be used AFTER the `protect` middleware,
 * which attaches `req.user` with the decoded JWT payload.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler);
 *   router.get('/staff', protect, authorize('admin', 'technician'), handler);
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: insufficient role.' });
    }
    next();
  };
};
