import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import Patient from '../models/patient.model';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, phoneNumber } = req.body;

  try {
    const existingPatient = await Patient.findByEmail(email);
    if (existingPatient) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newPatientData = {
      full_name: fullName,
      email,
      password: hashedPassword,
      phone_number: phoneNumber,
    };
    const [createdPatient] = await Patient.create(newPatientData);

    res.status(201).json({
      message: 'Patient registered successfully!',
      patient: {
        id: createdPatient.id,
        fullName: createdPatient.full_name,
        email: createdPatient.email,
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
    const patient = await Patient.findByEmail(email);
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // 401 Unauthorized
    }

    // 2. Compare the submitted password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, patient.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. If credentials are correct, create the tokens
    const payload = {
      userId: patient.id,
      email: patient.email,
    };

    // Create the Access Token (the "Hotel Keycard")
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '15m',
    });

    // Create the Refresh Token (the "Paper Receipt")
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });

    // 4. Send the tokens to the user
    // Send the Refresh Token in a secure, httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send the Access Token in the response body
    res.status(200).json({
      message: 'Logged in successfully!',
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
