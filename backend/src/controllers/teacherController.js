import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Helper: Check if teacher is assigned to a course
export const verifyTeacherCourse = async (teacherId, courseId) => {
  const assignment = await prisma.courseTeacher.findUnique({
    where: {
      teacherId_courseId: {
        teacherId,
        courseId,
      },
    },
  });
  return !!assignment;
};

// 1. Teacher Dashboard Statistics
export const getTeacherStats = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    // Get assigned course IDs
    const assignments = await prisma.courseTeacher.findMany({
      where: { teacherId },
      include: {
        course: {
          include: {
            enrollments: { select: { studentId: true } },
          },
        },
      },
    });

    const assignedCourseCount = assignments.length;
    const courseIds = assignments.map((a) => a.courseId);

    // Distinct enrolled students across teacher's courses
    const studentIdSet = new Set();
    assignments.forEach((a) => {
      a.course.enrollments.forEach((e) => studentIdSet.add(e.studentId));
    });
    const totalEnrolledStudents = studentIdSet.size;

    // Today's attendance summary for assigned courses
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        courseId: { in: courseIds },
        date: { gte: today, lt: tomorrow },
      },
      _count: { status: true },
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let totalToday = 0;

    todayAttendance.forEach((stat) => {
      totalToday += stat._count.status;
      if (stat.status === 'PRESENT') present = stat._count.status;
      if (stat.status === 'ABSENT') absent = stat._count.status;
      if (stat.status === 'LATE') late = stat._count.status;
    });

    return successResponse(res, {
      assignedCourses: assignedCourseCount,
      totalEnrolledStudents,
      todayAttendance: {
        totalMarked: totalToday,
        present,
        absent,
        late,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. View Assigned Courses
export const getAssignedCourses = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const assignments = await prisma.courseTeacher.findMany({
      where: { teacherId },
      include: {
        course: {
          include: {
            _count: {
              select: {
                enrollments: true,
                attendances: true,
                marks: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const courses = assignments.map((a) => ({
      ...a.course,
      assignedAt: a.assignedAt,
    }));

    return successResponse(res, courses);
  } catch (error) {
    next(error);
  }
};

// 3. View Students Enrolled in an Assigned Course
export const getCourseStudents = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;

    const isAssigned = await verifyTeacherCourse(teacherId, courseId);
    if (!isAssigned) {
      return errorResponse(
        res,
        'Access denied. You are not assigned to instruct this course.',
        403
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            status: true,
          },
        },
      },
      orderBy: { student: { rollNumber: 'asc' } },
    });

    const students = enrollments.map((e) => ({
      ...e.student,
      enrollmentDate: e.enrollmentDate,
    }));

    return successResponse(res, students);
  } catch (error) {
    next(error);
  }
};

// 4. View Attendance for a Course (optionally by Date)
export const getCourseAttendance = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { date } = req.query;

    const isAssigned = await verifyTeacherCourse(teacherId, courseId);
    if (!isAssigned) {
      return errorResponse(res, 'Access denied. You are not assigned to this course.', 403);
    }

    const where = { courseId };
    if (date) {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: targetDate, lt: nextDay };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, rollNumber: true },
        },
      },
      orderBy: [{ date: 'desc' }, { student: { rollNumber: 'asc' } }],
    });

    return successResponse(res, records);
  } catch (error) {
    next(error);
  }
};

// 5. Mark / Update Attendance
export const markAttendance = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, date, records } = req.body;

    // Security check 1: Teacher assigned to course?
    const isAssigned = await verifyTeacherCourse(teacherId, courseId);
    if (!isAssigned) {
      return errorResponse(
        res,
        'Access denied. You are not assigned to instruct this course.',
        403
      );
    }

    // Security check 2: All students enrolled in course?
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });
    const enrolledSet = new Set(enrolledStudents.map((e) => e.studentId));

    for (const record of records) {
      if (!enrolledSet.has(record.studentId)) {
        return errorResponse(
          res,
          `Cannot record attendance. Student (${record.studentId}) is not enrolled in this course.`,
          400
        );
      }
    }

    // Normalize date to UTC midnight
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Upsert attendance for each student in a transaction
    const upsertOperations = records.map((record) =>
      prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: record.studentId,
            courseId,
            date: attendanceDate,
          },
        },
        update: {
          status: record.status,
        },
        create: {
          studentId: record.studentId,
          courseId,
          date: attendanceDate,
          status: record.status,
        },
      })
    );

    const savedRecords = await prisma.$transaction(upsertOperations);

    return successResponse(
      res,
      { count: savedRecords.length, date: attendanceDate },
      'Attendance successfully recorded.'
    );
  } catch (error) {
    next(error);
  }
};

// 6. View Marks for a Course
export const getCourseMarks = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { assessmentName } = req.query;

    const isAssigned = await verifyTeacherCourse(teacherId, courseId);
    if (!isAssigned) {
      return errorResponse(res, 'Access denied. You are not assigned to this course.', 403);
    }

    const where = { courseId };
    if (assessmentName) {
      where.assessmentName = assessmentName;
    }

    const marks = await prisma.marks.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, rollNumber: true },
        },
      },
      orderBy: [{ assessmentName: 'asc' }, { student: { rollNumber: 'asc' } }],
    });

    return successResponse(res, marks);
  } catch (error) {
    next(error);
  }
};

// 7. Enter / Update Student Marks
export const submitMarks = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, assessmentName, maxMarks, records } = req.body;

    // Security check 1: Teacher assigned to course?
    const isAssigned = await verifyTeacherCourse(teacherId, courseId);
    if (!isAssigned) {
      return errorResponse(
        res,
        'Access denied. You are not assigned to instruct this course.',
        403
      );
    }

    // Security check 2: All students enrolled in course?
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });
    const enrolledSet = new Set(enrolledStudents.map((e) => e.studentId));

    for (const record of records) {
      if (!enrolledSet.has(record.studentId)) {
        return errorResponse(
          res,
          `Cannot enter marks. Student (${record.studentId}) is not enrolled in this course.`,
          400
        );
      }
      if (record.obtainedMarks > maxMarks) {
        return errorResponse(
          res,
          `Obtained marks (${record.obtainedMarks}) cannot exceed maximum marks (${maxMarks}).`,
          400
        );
      }
    }

    const cleanAssessment = assessmentName.trim();

    // Upsert marks in transaction
    const upsertOperations = records.map((record) =>
      prisma.marks.upsert({
        where: {
          studentId_courseId_assessmentName: {
            studentId: record.studentId,
            courseId,
            assessmentName: cleanAssessment,
          },
        },
        update: {
          maxMarks,
          obtainedMarks: record.obtainedMarks,
        },
        create: {
          studentId: record.studentId,
          courseId,
          assessmentName: cleanAssessment,
          maxMarks,
          obtainedMarks: record.obtainedMarks,
        },
      })
    );

    const savedMarks = await prisma.$transaction(upsertOperations);

    return successResponse(
      res,
      { count: savedMarks.length, assessmentName: cleanAssessment },
      'Marks successfully saved.'
    );
  } catch (error) {
    next(error);
  }
};
