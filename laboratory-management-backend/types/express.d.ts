// src/types/express-request.d.ts
import { Request } from 'express';

// 1. Define the shape of our JWT payload
export interface JwtPayload {
  userId: number;
  email: string;
  role: 'patient' | 'technician' | 'admin';
}

// 2. Create a new CustomRequest type that extends the Express Request
export interface CustomRequest extends Request {
  user?: JwtPayload; // The user property is now explicitly defined
}
