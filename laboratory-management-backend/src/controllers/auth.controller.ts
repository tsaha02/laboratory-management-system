import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, phoneNumber, dateOfBirth, role } =
    req.body;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Only allow valid roles; default to 'patient' if not provided or invalid
    const validRoles = ['patient', 'technician', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'patient';

    const newUserData = {
      full_name: fullName,
      email,
      password: hashedPassword,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth,
      role: userRole,
    };
    const [createdUser] = await User.create(newUserData);

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: createdUser.id,
        fullName: createdUser.full_name,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare the submitted password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. If credentials are correct, create the tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role, // Include the role in the JWT payload
    };

    // Create the Access Token
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '15m',
    });

    // Create the Refresh Token
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });

    // 4. Send the tokens to the user
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Logged in successfully!',
      accessToken,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully!' });
};
