import express from 'express';
import {
  getAdminStats,
  getUsers,
  createTeacher,
  createStudent,
  updateUser,
  updateUserStatus,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacher,
  removeTeacher,
  enrollStudent,
  removeEnrollment,
  getAdminAttendance,
  getAdminMarks,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createTeacherSchema,
  createStudentSchema,
  updateUserStatusSchema,
} from '../validators/authValidators.js';
import {
  createCourseSchema,
  updateCourseSchema,
  assignTeacherSchema,
  enrollStudentSchema,
} from '../validators/academicValidators.js';

const router = express.Router();

// Apply auth and admin role check to all admin routes
router.use(authenticate, requireRoles('ADMIN'));

// Dashboard stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getUsers);
router.post('/users/teacher', validate(createTeacherSchema), createTeacher);
router.post('/users/student', validate(createStudentSchema), createStudent);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', validate(updateUserStatusSchema), updateUserStatus);

// Pending registrations
router.get('/registrations/pending', getPendingRegistrations);
router.patch('/registrations/:id/approve', approveRegistration);
router.patch('/registrations/:id/reject', rejectRegistration);

// Course management
router.get('/courses', getCourses);
router.post('/courses', validate(createCourseSchema), createCourse);
router.put('/courses/:id', validate(updateCourseSchema), updateCourse);
router.delete('/courses/:id', deleteCourse);

// Teacher assignment
router.post('/assignments', validate(assignTeacherSchema), assignTeacher);
router.delete('/assignments', removeTeacher);

// Student enrollment
router.post('/enrollments', validate(enrollStudentSchema), enrollStudent);
router.delete('/enrollments', removeEnrollment);

// System-wide Attendance and Marks overview
router.get('/attendance', getAdminAttendance);
router.get('/marks', getAdminMarks);

export default router;
