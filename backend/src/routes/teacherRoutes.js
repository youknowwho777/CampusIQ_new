import express from 'express';
import {
  getTeacherStats,
  getAssignedCourses,
  getCourseStudents,
  getCourseAttendance,
  markAttendance,
  getCourseMarks,
  submitMarks,
} from '../controllers/teacherController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  markAttendanceSchema,
  submitMarksSchema,
} from '../validators/academicValidators.js';

const router = express.Router();

router.use(authenticate, requireRoles('TEACHER'));

// Dashboard stats
router.get('/stats', getTeacherStats);

// Assigned courses
router.get('/courses', getAssignedCourses);

// Students in an assigned course
router.get('/courses/:courseId/students', getCourseStudents);

// Attendance routes
router.get('/courses/:courseId/attendance', getCourseAttendance);
router.post('/attendance', validate(markAttendanceSchema), markAttendance);

// Marks routes
router.get('/courses/:courseId/marks', getCourseMarks);
router.post('/marks', validate(submitMarksSchema), submitMarks);

export default router;
