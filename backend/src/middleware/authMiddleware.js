import prisma from '../config/db.js';
import { verifyToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Try to get token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Or from Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired token.', 401);
    }

    // 4. Retrieve fresh user from database (never trust cached roles or statuses)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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

    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    // 5. Account status verification
    if (user.status === 'PENDING') {
      return errorResponse(res, 'Your registration is pending approval by an administrator.', 403);
    }
    if (user.status === 'REJECTED') {
      return errorResponse(res, 'Your registration application was rejected.', 403);
    }
    if (user.status === 'INACTIVE') {
      return errorResponse(res, 'Your account is deactivated. Please contact admin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Authentication failed.', 500);
  }
};
