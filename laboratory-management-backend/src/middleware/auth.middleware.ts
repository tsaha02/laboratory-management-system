// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest, JwtPayload } from '../../types/express';
export const protect = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // 1. Check for the token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token is valid
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as JwtPayload;

      // We'll attach the user info to the request for other routes to use
      // (We will fix the typescript error for this in the next step)
      req.user = decoded;

      // 4. If valid, pass control to the next middleware/controller
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
