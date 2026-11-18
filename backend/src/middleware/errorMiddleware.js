import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `A record with this ${target} already exists.`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'Requested record was not found.', 404);
  }

  // Fallback
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
  return errorResponse(res, message, 500);
};
