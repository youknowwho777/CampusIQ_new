import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting CampusIQ Seed Script ---');

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Create or update Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusiq.edu' },
    update: { passwordHash, status: 'ACTIVE' },
    create: {
      name: 'System Administrator',
      email: 'admin@campusiq.edu',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Admin seeded:', admin.email);

  // 2. Create or update 5 Teachers
  const teacherData = [
    { name: 'Dr. Alan Turing', email: 'turing@campusiq.edu' },
    { name: 'Dr. Grace Hopper', email: 'hopper@campusiq.edu' },
    { name: 'Dr. Donald Knuth', email: 'knuth@campusiq.edu' },
    { name: 'Dr. Ada Lovelace', email: 'lovelace@campusiq.edu' },
    { name: 'Dr. Claude Shannon', email: 'shannon@campusiq.edu' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: { name: t.name, passwordHash, status: 'ACTIVE' },
      create: {
        name: t.name,
        email: t.email,
        passwordHash,
        role: 'TEACHER',
        status: 'ACTIVE',
      },
    });
    teachers.push(teacher);
  }
  console.log(`✓ ${teachers.length} Teachers seeded`);

  // 3. Create or update 5 Courses
  const courseData = [
    {
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      description: 'Foundations of computation, problem-solving, and algorithmic thinking.',
    },
    {
      courseCode: 'CS201',
      courseName: 'Data Structures & Algorithms',
      description: 'Linear & non-linear data structures, trees, graphs, sorting, and complexity analysis.',
    },
    {
      courseCode: 'CS301',
      courseName: 'Database Management Systems',
      description: 'Relational data modeling, SQL queries, transactions, normalization, and indexing.',
    },
    {
      courseCode: 'CS401',
      courseName: 'Software Engineering & Architecture',
      description: 'Software development life cycles, agile methodology, design patterns, and RESTful APIs.',
    },
    {
      courseCode: 'CS501',
      courseName: 'Computer Networks & Security',
      description: 'TCP/IP architecture, socket programming, routing, encryption, and secure communications.',
    },
  ];

  const courses = [];
  for (const c of courseData) {
    const course = await prisma.course.upsert({
      where: { courseCode: c.courseCode },
      update: { courseName: c.courseName, description: c.description },
      create: c,
    });
    courses.push(course);
  }
  console.log(`✓ ${courses.length} Courses seeded`);

  // 4. Assign one Teacher to each Course
  for (let i = 0; i < courses.length; i++) {
    const teacher = teachers[i];
    const course = courses[i];
    await prisma.courseTeacher.upsert({
      where: {
        teacherId_courseId: {
          teacherId: teacher.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        teacherId: teacher.id,
        courseId: course.id,
      },
    });
  }
  console.log('✓ Course-Teacher assignments seeded');

  // 5. Create 20 Active Students
  const studentNames = [
    'Alexander Smith', 'Emma Watson', 'James Anderson', 'Sophia Martinez',
    'Benjamin Clark', 'Olivia Taylor', 'William Thomas', 'Isabella White',
    'Lucas Harris', 'Mia Martin', 'Henry Jackson', 'Charlotte Thompson',
    'Ethan Garcia', 'Amelia Robinson', 'Daniel Lewis', 'Harper Walker',
    'Matthew Hall', 'Evelyn Allen', 'David Young', 'Abigail King',
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const index = i + 1;
    const pad = index.toString().padStart(3, '0');
    const rollNumber = `CIQ-2026-${pad}`;
    const email = `student${index}@campusiq.edu`;

    const student = await prisma.user.upsert({
      where: { email },
      update: { name: studentNames[i], rollNumber, passwordHash, status: 'ACTIVE' },
      create: {
        name: studentNames[i],
        email,
        rollNumber,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });
    students.push(student);
  }
  console.log(`✓ ${students.length} Active Students seeded`);

  // 6. Create 2 Pending Students for Admin approval demo
  const pendingData = [
    { name: 'Sarah Connor', email: 'sarah.connor@campusiq.edu', rollNumber: 'CIQ-2026-091' },
    { name: 'John Doe', email: 'john.doe@campusiq.edu', rollNumber: 'CIQ-2026-092' },
  ];

  for (const p of pendingData) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: { status: 'PENDING' },
      create: {
        name: p.name,
        email: p.email,
        rollNumber: p.rollNumber,
        passwordHash,
        role: 'STUDENT',
        status: 'PENDING',
      },
    });
  }
  console.log('✓ 2 Pending Registrations seeded for demo approval');

  // 7. Enroll Students into Courses
  // Student 1 to 10 in CS101, CS201, CS301
  // Student 6 to 15 in CS201, CS301, CS401
  // Student 11 to 20 in CS301, CS401, CS501
  // Student 1 to 5 in CS501
  const enrollmentsCount = { total: 0 };
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    // Each student enrolled in at least 3 courses
    const studentCourses = [
      courses[i % courses.length],
      courses[(i + 1) % courses.length],
      courses[(i + 2) % courses.length],
    ];

    for (const course of studentCourses) {
      await prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          courseId: course.id,
        },
      });
      enrollmentsCount.total++;
    }
  }
  console.log(`✓ Student course enrollments verified (${enrollmentsCount.total} enrollments)`);

  // 8. Seed Realistic Attendance
  // Generate 7 distinct past class dates
  const dates = [];
  for (let d = 14; d >= 1; d -= 2) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setUTCHours(0, 0, 0, 0);
    dates.push(date);
  }

  let attendanceCount = 0;
  for (const course of courses) {
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: { studentId: true },
    });

    for (const date of dates) {
      for (let sIdx = 0; sIdx < enrolledStudents.length; sIdx++) {
        const studentId = enrolledStudents[sIdx].studentId;
        // Deterministic realistic status pattern (approx 85% present, 10% absent, 5% late)
        let status = 'PRESENT';
        const hash = (sIdx * 7 + date.getDate() * 13) % 20;
        if (hash === 0 || hash === 1) status = 'ABSENT';
        else if (hash === 2) status = 'LATE';

        await prisma.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId,
              courseId: course.id,
              date,
            },
          },
          update: { status },
          create: {
            studentId,
            courseId: course.id,
            date,
            status,
          },
        });
        attendanceCount++;
      }
    }
  }
  console.log(`✓ ${attendanceCount} Attendance records seeded across all courses`);

  // 9. Seed Realistic Marks
  const assessments = [
    { name: 'Midterm Examination', max: 50 },
    { name: 'Quiz 1 - Fundamentals', max: 20 },
    { name: 'Practical Lab Assignment', max: 30 },
  ];

  let marksCount = 0;
  for (const course of courses) {
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: { studentId: true },
    });

    for (const assessment of assessments) {
      for (let sIdx = 0; sIdx < enrolledStudents.length; sIdx++) {
        const studentId = enrolledStudents[sIdx].studentId;
        // Realistic obtained marks (between 65% and 95% of max)
        const factor = 0.65 + (((sIdx * 11 + assessment.max) % 30) / 100);
        const obtainedMarks = Math.round(assessment.max * factor * 10) / 10;

        await prisma.marks.upsert({
          where: {
            studentId_courseId_assessmentName: {
              studentId,
              courseId: course.id,
              assessmentName: assessment.name,
            },
          },
          update: {
            maxMarks: assessment.max,
            obtainedMarks,
          },
          create: {
            studentId,
            courseId: course.id,
            assessmentName: assessment.name,
            maxMarks: assessment.max,
            obtainedMarks,
          },
        });
        marksCount++;
      }
    }
  }
  console.log(`✓ ${marksCount} Assessment Marks records seeded`);

  console.log('--- Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
