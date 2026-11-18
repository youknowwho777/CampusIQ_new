import prisma from './src/config/db.js';

async function main() {
  try {
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.enrollment.count();
    const attendanceCount = await prisma.attendance.count();
    const marksCount = await prisma.marks.count();
    const sampleUsers = await prisma.user.findMany({
      select: { name: true, email: true, role: true },
      take: 8,
    });
    const sampleCourses = await prisma.course.findMany({
      select: { courseCode: true, courseName: true },
    });

    console.log('COUNTS:', {
      users: userCount,
      courses: courseCount,
      enrollments: enrollmentCount,
      attendances: attendanceCount,
      marks: marksCount,
    });
    console.log('SAMPLE_USERS:', sampleUsers);
    console.log('SAMPLE_COURSES:', sampleCourses);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
