import { errorResponse } from '../utils/response.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return errorResponse(res, 'Validation failed', 400, validationErrors);
      }
      return errorResponse(res, 'Invalid request data', 400);
    }
  };
};
