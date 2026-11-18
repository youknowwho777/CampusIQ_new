import express from 'express';
import {
  getStudentDashboard,
  getStudentCourses,
  getStudentAttendance,
  getStudentMarks,
  getStudentProfile,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticate, requireRoles('STUDENT'));

// Dashboard stats
router.get('/dashboard', getStudentDashboard);

// Enrolled courses
router.get('/courses', getStudentCourses);

// Attendance details
router.get('/attendance', getStudentAttendance);

// Marks details
router.get('/marks', getStudentMarks);

// Profile
router.get('/profile', getStudentProfile);

export default router;
