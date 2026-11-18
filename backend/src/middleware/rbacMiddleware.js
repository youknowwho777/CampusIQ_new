import { errorResponse } from '../utils/response.js';

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        403
      );
    }

    next();
  };
};
