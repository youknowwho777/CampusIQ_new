import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/token.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Role and status verification
    if (user.status === 'PENDING') {
      return errorResponse(
        res,
        'Your registration is currently pending Admin approval.',
        403
      );
    }

    if (user.status === 'REJECTED') {
      return errorResponse(
        res,
        'Your registration application has been rejected by the administrator.',
        403
      );
    }

    if (user.status === 'INACTIVE') {
      return errorResponse(
        res,
        'Your account has been deactivated. Please contact administrator.',
        403
      );
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set HttpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('token', token, cookieOptions);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };

    return successResponse(
      res,
      { user: safeUser, token },
      'Logged in successfully.'
    );
  } catch (error) {
    next(error);
  }
};

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, rollNumber, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanRoll = rollNumber.trim().toUpperCase();

    // Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    // Check for duplicate roll number
    const existingRoll = await prisma.user.findUnique({
      where: { rollNumber: cleanRoll },
    });
    if (existingRoll) {
      return errorResponse(res, 'An account with this roll number already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStudent = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        rollNumber: cleanRoll,
        passwordHash,
        role: 'STUDENT',
        status: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Note: Do NOT issue token!
    return successResponse(
      res,
      newStudent,
      'Registration submitted. Please wait for Admin approval.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current user profile fetched.');
};

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
  });
  return successResponse(res, null, 'Logged out successfully.');
};
