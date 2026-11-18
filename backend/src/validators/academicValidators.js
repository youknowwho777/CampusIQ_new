import { z } from 'zod';

export const createCourseSchema = z.object({
  courseCode: z.string().min(2, 'Course code is required (e.g. CS101)').toUpperCase(),
  courseName: z.string().min(3, 'Course name must be at least 3 characters'),
  description: z.string().optional().nullable(),
});

export const updateCourseSchema = z.object({
  courseCode: z.string().min(2).toUpperCase().optional(),
  courseName: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().uuid('Valid teacher ID is required'),
  courseId: z.string().uuid('Valid course ID is required'),
});

export const enrollStudentSchema = z.object({
  studentId: z.string().uuid('Valid student ID is required'),
  courseId: z.string().uuid('Valid course ID is required'),
});

export const markAttendanceSchema = z.object({
  courseId: z.string().uuid('Valid course ID is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date is required (YYYY-MM-DD)',
  }),
  records: z.array(
    z.object({
      studentId: z.string().uuid('Valid student ID is required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
    })
  ).min(1, 'At least one student record is required'),
});

export const submitMarksSchema = z.object({
  courseId: z.string().uuid('Valid course ID is required'),
  assessmentName: z.string().min(1, 'Assessment name is required (e.g. Midterm, Quiz 1, Final)'),
  maxMarks: z.number().positive('Max marks must be greater than 0'),
  records: z.array(
    z.object({
      studentId: z.string().uuid('Valid student ID is required'),
      obtainedMarks: z.number().min(0, 'Obtained marks cannot be negative'),
    })
  ).min(1, 'At least one student mark record is required'),
});
