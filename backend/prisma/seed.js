import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting CampusIQ Seed Script on Cloud Neon DB ---');

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Create Admin: Siddarth Reddy
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusiq.edu' },
    update: { name: 'Siddarth Reddy', passwordHash, status: 'ACTIVE' },
    create: {
      name: 'Siddarth Reddy',
      email: 'admin@campusiq.edu',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Admin seeded:', admin.name, `(${admin.email})`);

  // 2. Create Courses
  const courseData = [
    {
      courseCode: 'SE301',
      courseName: 'Software Engineering',
      description: 'Software development life cycles, agile methodologies, system design patterns, and RESTful architectures.',
    },
    {
      courseCode: 'IS301',
      courseName: 'Information Security',
      description: 'Network defense, encryption protocols, access controls, risk analysis, and vulnerability mitigation.',
    },
    {
      courseCode: 'IOT301',
      courseName: 'Internet of Things',
      description: 'Embedded microcontrollers, sensor telemetry, edge computing, and wireless IoT mesh communication.',
    },
    {
      courseCode: 'ML401',
      courseName: 'Machine Learning',
      description: 'Supervised and unsupervised models, neural networks, feature engineering, and statistical learning.',
    },
    {
      courseCode: 'ISE402',
      courseName: 'Communication Systems',
      description: 'Principles of analog and digital communication, modulation techniques, signal transmission, noise analysis, and wireless channels.',
    },
    {
      courseCode: 'WD201',
      courseName: 'Web Development',
      description: 'Modern full-stack web architectures, React frontend development, responsive UI, and Node.js REST APIs.',
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

  // 3. Create Teachers
  const teacherData = [
    { name: 'Sandeep', email: 'sandeep@campusiq.edu', courseIndex: 0 },
    { name: 'Narendra', email: 'narendra@campusiq.edu', courseIndex: 1 },
    { name: 'Karunya Sai', email: 'karunya.sai@campusiq.edu', courseIndex: 2 },
    { name: 'Sidhardhan Kanna', email: 'sidhardhan.kanna@campusiq.edu', courseIndex: 3 },
    { name: 'Vikram (Sidhardhan)', email: 'vikram@campusiq.edu', courseIndex: 4 },
    { name: 'Adharana Kumar', email: 'adharana.kumar@campusiq.edu', courseIndex: 5 },
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

    // Assign to designated course
    const course = courses[t.courseIndex];
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
  console.log(`✓ ${teachers.length} Faculty Teachers created and assigned to courses`);

  // 4. Create Students (User requested custom list)
  const studentNames = [
    'Naruto',
    'Sasuke',
    'Gojo',
    'Luffy',
    'Mikasa',
    'Hinata',
    'Levi',
    'Doraemon',
    'Shinchan',
    'Nobita',
    'Ben 10',
    'Tom',
    'Jerry',
    'Goku',
    'Tanjiro',
    'Saitama',
    'Zoro',
    'Itachi',
    'Ash Ketchum',
    'Peter Parker',
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const index = i + 1;
    const pad = index.toString().padStart(3, '0');
    const rollNumber = `CIQ-2026-${pad}`;
    const cleanName = studentNames[i].toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanName}@campusiq.edu`;

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
  console.log(`✓ ${students.length} Active Students seeded (${studentNames.slice(0, 5).join(', ')}, ...)`);

  // 5. Create 2 Pending Registrations for Admin Approval Demo
  const pendingData = [
    { name: 'Light Yagami', email: 'light@campusiq.edu', rollNumber: 'CIQ-2026-091' },
    { name: 'L Lawliet', email: 'lawliet@campusiq.edu', rollNumber: 'CIQ-2026-092' },
  ];

  for (const p of pendingData) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, rollNumber: p.rollNumber, status: 'PENDING' },
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
  console.log('✓ 2 Pending Student Registrations seeded for demo approval');

  // 6. Enroll Students into Courses (Batch insertion)
  const enrollmentList = [];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const studentCourses = [
      courses[i % courses.length],
      courses[(i + 1) % courses.length],
      courses[(i + 2) % courses.length],
      courses[(i + 3) % courses.length],
    ];

    for (const course of studentCourses) {
      enrollmentList.push({
        studentId: student.id,
        courseId: course.id,
      });
    }
  }

  await prisma.enrollment.createMany({
    data: enrollmentList,
    skipDuplicates: true,
  });
  console.log(`✓ Student enrollments confirmed (${enrollmentList.length} total enrollments)`);

  // 7. Seed Realistic Attendance Records (Batch insertion)
  const dates = [];
  for (let d = 14; d >= 1; d -= 2) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setUTCHours(0, 0, 0, 0);
    dates.push(date);
  }

  const allAttendance = [];
  for (const course of courses) {
    const enrolled = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: { studentId: true },
    });

    for (const date of dates) {
      for (let sIdx = 0; sIdx < enrolled.length; sIdx++) {
        const studentId = enrolled[sIdx].studentId;
        let status = 'PRESENT';
        const hash = (sIdx * 7 + date.getDate() * 11) % 20;
        if (hash === 0 || hash === 1) status = 'ABSENT';
        else if (hash === 2) status = 'LATE';

        allAttendance.push({
          studentId,
          courseId: course.id,
          date,
          status,
        });
      }
    }
  }

  await prisma.attendance.createMany({
    data: allAttendance,
    skipDuplicates: true,
  });
  console.log(`✓ ${allAttendance.length} Attendance records seeded across courses`);

  // 8. Seed Realistic Marks (Batch insertion)
  const assessments = [
    { name: 'Midterm Examination', max: 50 },
    { name: 'Quiz 1 - Fundamentals', max: 20 },
    { name: 'Practical Lab Assessment', max: 30 },
  ];

  const allMarks = [];
  for (const course of courses) {
    const enrolled = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: { studentId: true },
    });

    for (const assessment of assessments) {
      for (let sIdx = 0; sIdx < enrolled.length; sIdx++) {
        const studentId = enrolled[sIdx].studentId;
        const factor = 0.68 + (((sIdx * 9 + assessment.max) % 28) / 100);
        const obtainedMarks = Math.round(assessment.max * factor * 10) / 10;

        allMarks.push({
          studentId,
          courseId: course.id,
          assessmentName: assessment.name,
          maxMarks: assessment.max,
          obtainedMarks,
        });
      }
    }
  }

  await prisma.marks.createMany({
    data: allMarks,
    skipDuplicates: true,
  });
  console.log(`✓ ${allMarks.length} Academic Marks records seeded`);

  console.log('\n--- Cloud Neon DB Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
