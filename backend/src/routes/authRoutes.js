import express from 'express';
import { login, registerStudent, getMe, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { loginSchema, studentRegisterSchema } from '../validators/authValidators.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(studentRegisterSchema), registerStudent);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
