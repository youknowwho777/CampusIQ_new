import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

// 1. Dashboard Statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      pendingRegistrations,
      totalEnrollments,
      attendanceStats,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'TEACHER', status: 'ACTIVE' } }),
      prisma.course.count(),
      prisma.user.count({ where: { role: 'STUDENT', status: 'PENDING' } }),
      prisma.enrollment.count(),
      prisma.attendance.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    let present = 0;
    let absent = 0;
    let late = 0;
    let totalAttendance = 0;

    attendanceStats.forEach((stat) => {
      totalAttendance += stat._count.status;
      if (stat.status === 'PRESENT') present = stat._count.status;
      if (stat.status === 'ABSENT') absent = stat._count.status;
      if (stat.status === 'LATE') late = stat._count.status;
    });

    const overallPercentage =
      totalAttendance > 0
        ? Math.round(((present + late * 0.5) / totalAttendance) * 100 * 10) / 10
        : 100;

    return successResponse(res, {
      totalStudents,
      totalTeachers,
      totalCourses,
      pendingRegistrations,
      totalEnrollments,
      attendance: {
        totalRecords: totalAttendance,
        present,
        absent,
        late,
        overallPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. User Management
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            taughtCourses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, users);
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return errorResponse(res, 'A user with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const teacher = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'TEACHER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return successResponse(res, teacher, 'Teacher account created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { name, email, rollNumber, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanRoll = rollNumber.trim().toUpperCase();

    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      return errorResponse(res, 'A user with this email already exists.', 409);
    }

    const existingRoll = await prisma.user.findUnique({ where: { rollNumber: cleanRoll } });
    if (existingRoll) {
      return errorResponse(res, 'A student with this roll number already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const student = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        rollNumber: cleanRoll,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
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

    return successResponse(res, student, 'Student account created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, rollNumber, status } = req.body;

    const data = {};
    if (name) data.name = name.trim();
    if (email) data.email = email.toLowerCase().trim();
    if (rollNumber !== undefined) data.rollNumber = rollNumber ? rollNumber.trim().toUpperCase() : null;
    if (status) data.status = status;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return successResponse(res, updated, 'User updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return successResponse(res, updated, `User status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
};

// 3. Pending Registrations
export const getPendingRegistrations = async (req, res, next) => {
  try {
    const pending = await prisma.user.findMany({
      where: { role: 'STUDENT', status: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, pending);
  } catch (error) {
    next(error);
  }
};

export const approveRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'Registration application not found.', 404);
    }

    const approved = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        role: true,
        status: true,
      },
    });

    return successResponse(res, approved, 'Student registration approved successfully.');
  } catch (error) {
    next(error);
  }
};

export const rejectRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'Registration application not found.', 404);
    }

    const rejected = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        role: true,
        status: true,
      },
    });

    return successResponse(res, rejected, 'Student registration rejected.');
  } catch (error) {
    next(error);
  }
};

// 4. Course Management
export const getCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teachers: {
          include: {
            teacher: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, email: true, rollNumber: true, status: true },
            },
          },
        },
        _count: {
          select: {
            teachers: true,
            enrollments: true,
            attendances: true,
            marks: true,
          },
        },
      },
      orderBy: { courseCode: 'asc' },
    });

    return successResponse(res, courses);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, description } = req.body;
    const cleanCode = courseCode.toUpperCase().trim();

    const existing = await prisma.course.findUnique({ where: { courseCode: cleanCode } });
    if (existing) {
      return errorResponse(res, 'A course with this code already exists.', 409);
    }

    const course = await prisma.course.create({
      data: {
        courseCode: cleanCode,
        courseName: courseName.trim(),
        description: description ? description.trim() : null,
      },
    });

    return successResponse(res, course, 'Course created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseCode, courseName, description } = req.body;

    const data = {};
    if (courseCode) data.courseCode = courseCode.toUpperCase().trim();
    if (courseName) data.courseName = courseName.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;

    const course = await prisma.course.update({
      where: { id },
      data,
    });

    return successResponse(res, course, 'Course updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({ where: { id } });

    return successResponse(res, null, 'Course deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// 5. Teacher Assignment
export const assignTeacher = async (req, res, next) => {
  try {
    const { teacherId, courseId } = req.body;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || teacher.role !== 'TEACHER' || teacher.status !== 'ACTIVE') {
      return errorResponse(res, 'Invalid or inactive teacher specified.', 400);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    const assignment = await prisma.courseTeacher.create({
      data: { teacherId, courseId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, courseCode: true, courseName: true } },
      },
    });

    return successResponse(res, assignment, 'Teacher assigned to course successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const removeTeacher = async (req, res, next) => {
  try {
    const { teacherId, courseId } = req.body;

    await prisma.courseTeacher.deleteMany({
      where: { teacherId, courseId },
    });

    return successResponse(res, null, 'Teacher removed from course successfully.');
  } catch (error) {
    next(error);
  }
};

// 6. Student Enrollment
export const enrollStudent = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT' || student.status !== 'ACTIVE') {
      return errorResponse(res, 'Only active students can be enrolled in courses.', 400);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId },
      include: {
        student: { select: { id: true, name: true, email: true, rollNumber: true } },
        course: { select: { id: true, courseCode: true, courseName: true } },
      },
    });

    return successResponse(res, enrollment, 'Student enrolled successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const removeEnrollment = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;

    await prisma.enrollment.deleteMany({
      where: { studentId, courseId },
    });

    return successResponse(res, null, 'Student unenrolled from course successfully.');
  } catch (error) {
    next(error);
  }
};

// 7. Admin Attendance & Marks Overview
export const getAdminAttendance = async (req, res, next) => {
  try {
    const { courseId, date, studentId } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    if (date) {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, rollNumber: true, email: true } },
        course: { select: { id: true, courseCode: true, courseName: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { name: 'asc' } }],
    });

    return successResponse(res, attendances);
  } catch (error) {
    next(error);
  }
};

export const getAdminMarks = async (req, res, next) => {
  try {
    const { courseId, assessmentName, studentId } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (assessmentName) where.assessmentName = assessmentName;
    if (studentId) where.studentId = studentId;

    const marks = await prisma.marks.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, rollNumber: true, email: true } },
        course: { select: { id: true, courseCode: true, courseName: true } },
      },
      orderBy: [{ course: { courseCode: 'asc' } }, { assessmentName: 'asc' }],
    });

    return successResponse(res, marks);
  } catch (error) {
    next(error);
  }
};
