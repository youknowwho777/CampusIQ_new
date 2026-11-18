import prisma from '../config/db.js';
import { successResponse } from '../utils/response.js';

// 1. Student Dashboard Overview
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teachers: {
              include: {
                teacher: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { enrollmentDate: 'desc' },
    });

    const enrolledCoursesCount = enrollments.length;
    const courseIds = enrollments.map((e) => e.courseId);

    // Attendance stats
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        courseId: { in: courseIds },
      },
    });

    const totalAttendanceClasses = attendanceRecords.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    attendanceRecords.forEach((rec) => {
      if (rec.status === 'PRESENT') presentCount++;
      else if (rec.status === 'ABSENT') absentCount++;
      else if (rec.status === 'LATE') lateCount++;
    });

    // Formula: Present classes / Total recorded classes * 100
    const attendancePercentage =
      totalAttendanceClasses > 0
        ? Math.round((presentCount / totalAttendanceClasses) * 100 * 10) / 10
        : 100;

    // Marks stats
    const marksRecords = await prisma.marks.findMany({
      where: {
        studentId,
        courseId: { in: courseIds },
      },
    });

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;

    marksRecords.forEach((m) => {
      totalMaxMarks += m.maxMarks;
      totalObtainedMarks += m.obtainedMarks;
    });

    const overallMarksPercentage =
      totalMaxMarks > 0
        ? Math.round((totalObtainedMarks / totalMaxMarks) * 100 * 10) / 10
        : 0;

    return successResponse(res, {
      enrolledCoursesCount,
      attendance: {
        totalClasses: totalAttendanceClasses,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: attendancePercentage,
      },
      academics: {
        assessmentsCount: marksRecords.length,
        totalObtainedMarks,
        totalMaxMarks,
        overallPercentage: overallMarksPercentage,
      },
      recentCourses: enrollments.slice(0, 5).map((e) => ({
        id: e.course.id,
        courseCode: e.course.courseCode,
        courseName: e.course.courseName,
        teachers: e.course.teachers.map((t) => t.teacher.name),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// 2. View Enrolled Courses
export const getStudentCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teachers: {
              include: {
                teacher: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { course: { courseCode: 'asc' } },
    });

    const courses = enrollments.map((e) => ({
      id: e.course.id,
      courseCode: e.course.courseCode,
      courseName: e.course.courseName,
      description: e.course.description,
      enrollmentDate: e.enrollmentDate,
      teachers: e.course.teachers.map((t) => ({
        id: t.teacher.id,
        name: t.teacher.name,
        email: t.teacher.email,
      })),
    }));

    return successResponse(res, courses);
  } catch (error) {
    next(error);
  }
};

// 3. View Course-wise Attendance & History
export const getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch student's enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: true,
      },
      orderBy: { course: { courseCode: 'asc' } },
    });

    // Fetch all attendance for this student
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, courseCode: true, courseName: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Group by course
    const courseAttendanceMap = {};
    enrollments.forEach((e) => {
      courseAttendanceMap[e.course.id] = {
        courseId: e.course.id,
        courseCode: e.course.courseCode,
        courseName: e.course.courseName,
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        percentage: 100,
        history: [],
      };
    });

    attendanceRecords.forEach((rec) => {
      if (!courseAttendanceMap[rec.courseId]) {
        courseAttendanceMap[rec.courseId] = {
          courseId: rec.courseId,
          courseCode: rec.course.courseCode,
          courseName: rec.course.courseName,
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          percentage: 100,
          history: [],
        };
      }

      const entry = courseAttendanceMap[rec.courseId];
      entry.totalClasses++;
      if (rec.status === 'PRESENT') entry.presentCount++;
      else if (rec.status === 'ABSENT') entry.absentCount++;
      else if (rec.status === 'LATE') entry.lateCount++;

      entry.history.push({
        id: rec.id,
        date: rec.date,
        status: rec.status,
      });
    });

    // Calculate percentages
    const courseAttendanceList = Object.values(courseAttendanceMap).map((item) => {
      const percentage =
        item.totalClasses > 0
          ? Math.round((item.presentCount / item.totalClasses) * 100 * 10) / 10
          : 100;
      return {
        ...item,
        percentage,
      };
    });

    return successResponse(res, {
      courseWise: courseAttendanceList,
      fullHistory: attendanceRecords.map((r) => ({
        id: r.id,
        courseId: r.courseId,
        courseCode: r.course.courseCode,
        courseName: r.course.courseName,
        date: r.date,
        status: r.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// 4. View Course-wise Marks
export const getStudentMarks = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: { course: true },
      orderBy: { course: { courseCode: 'asc' } },
    });

    // Fetch all marks for this student
    const marksRecords = await prisma.marks.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, courseCode: true, courseName: true } },
      },
      orderBy: [{ course: { courseCode: 'asc' } }, { createdAt: 'desc' }],
    });

    // Group by course
    const courseMarksMap = {};
    enrollments.forEach((e) => {
      courseMarksMap[e.course.id] = {
        courseId: e.course.id,
        courseCode: e.course.courseCode,
        courseName: e.course.courseName,
        assessments: [],
        totalMax: 0,
        totalObtained: 0,
        averagePercentage: 0,
      };
    });

    marksRecords.forEach((m) => {
      if (!courseMarksMap[m.courseId]) {
        courseMarksMap[m.courseId] = {
          courseId: m.courseId,
          courseCode: m.course.courseCode,
          courseName: m.course.courseName,
          assessments: [],
          totalMax: 0,
          totalObtained: 0,
          averagePercentage: 0,
        };
      }

      const item = courseMarksMap[m.courseId];
      const percentage =
        m.maxMarks > 0 ? Math.round((m.obtainedMarks / m.maxMarks) * 100 * 10) / 10 : 0;

      item.totalMax += m.maxMarks;
      item.totalObtained += m.obtainedMarks;
      item.assessments.push({
        id: m.id,
        assessmentName: m.assessmentName,
        maxMarks: m.maxMarks,
        obtainedMarks: m.obtainedMarks,
        percentage,
        recordedAt: m.createdAt,
      });
    });

    let overallMax = 0;
    let overallObtained = 0;

    const courseMarksList = Object.values(courseMarksMap).map((item) => {
      overallMax += item.totalMax;
      overallObtained += item.totalObtained;
      const averagePercentage =
        item.totalMax > 0
          ? Math.round((item.totalObtained / item.totalMax) * 100 * 10) / 10
          : 0;
      return {
        ...item,
        averagePercentage,
      };
    });

    const overallPercentage =
      overallMax > 0 ? Math.round((overallObtained / overallMax) * 100 * 10) / 10 : 0;

    return successResponse(res, {
      courseWise: courseMarksList,
      summary: {
        totalAssessments: marksRecords.length,
        totalMaxMarks: overallMax,
        totalObtainedMarks: overallObtained,
        overallPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Student Profile
export const getStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: studentId },
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
            attendances: true,
            marks: true,
          },
        },
      },
    });

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};
