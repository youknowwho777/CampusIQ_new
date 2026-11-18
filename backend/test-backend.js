import app from './src/server.js';
import prisma from './src/config/db.js';

const PORT = 5002;
let server;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const config = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('=== RUNNING CAMPUSIQ BACKEND INTEGRATION & SECURITY TESTS ===\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      failed++;
    }
  };

  try {
    server = app.listen(PORT);
    await new Promise((r) => setTimeout(r, 600));

    // Test 1: Health Check
    const healthRes = await request('/health');
    assert(healthRes.status === 200 && healthRes.data?.status === 'healthy', 'Health check returns 200');

    // Test 2: Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@campusiq.edu', password: 'Password123!' },
    });
    assert(
      adminLogin.status === 200 &&
      adminLogin.data?.data?.user?.role === 'ADMIN' &&
      !!adminLogin.data?.data?.token,
      'Admin login returns 200 with JWT token and role ADMIN'
    );
    const adminToken = adminLogin.data?.data?.token;

    // Test 3: Wrong Password
    const wrongLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@campusiq.edu', password: 'WrongPassword!' },
    });
    assert(wrongLogin.status === 401, 'Wrong password rejected with 401 Unauthorized');

    // Test 4: Pending Student cannot log in
    const pendingLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'sarah.connor@campusiq.edu', password: 'Password123!' },
    });
    assert(
      pendingLogin.status === 403 && pendingLogin.data?.message?.includes('pending'),
      'Pending student login blocked with 403 Forbidden'
    );

    // Test 5: Student Registration creates PENDING account without login token
    const newStudentRoll = `TEST-${Date.now().toString().slice(-4)}`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Candidate',
        email: `candidate-${Date.now()}@campusiq.edu`,
        rollNumber: newStudentRoll,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    });
    assert(
      regRes.status === 201 &&
      regRes.data?.data?.status === 'PENDING' &&
      !regRes.data?.data?.token,
      'Student registration creates PENDING account and does not issue login token'
    );
    const registeredStudentId = regRes.data?.data?.id;

    // Test 6: Teacher Login
    const teacherLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'turing@campusiq.edu', password: 'Password123!' },
    });
    assert(
      teacherLogin.status === 200 && teacherLogin.data?.data?.user?.role === 'TEACHER',
      'Teacher login returns 200 with role TEACHER'
    );
    const teacherToken = teacherLogin.data?.data?.token;

    // Test 7: Student Login
    const studentLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'student1@campusiq.edu', password: 'Password123!' },
    });
    assert(
      studentLogin.status === 200 && studentLogin.data?.data?.user?.role === 'STUDENT',
      'Student login returns 200 with role STUDENT'
    );
    const studentToken = studentLogin.data?.data?.token;

    // Test 8: RBAC - Student cannot access Admin routes
    const studentAccessAdmin = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessAdmin.status === 403, 'Student blocked from admin routes with 403 Forbidden');

    // Test 9: RBAC - Teacher cannot access Admin routes
    const teacherAccessAdmin = await request('/admin/users', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(teacherAccessAdmin.status === 403, 'Teacher blocked from admin routes with 403 Forbidden');

    // Test 10: Teacher Courses and Access Boundary
    const teacherCoursesRes = await request('/teacher/courses', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert(
      teacherCoursesRes.status === 200 && Array.isArray(teacherCoursesRes.data?.data),
      'Teacher can retrieve assigned courses'
    );
    const assignedCourseId = teacherCoursesRes.data?.data?.[0]?.id;

    // Teacher cannot access unassigned course
    const allCourses = await prisma.course.findMany();
    const unassignedCourse = allCourses.find((c) => c.id !== assignedCourseId);
    if (unassignedCourse) {
      const unassignedRes = await request(`/teacher/courses/${unassignedCourse.id}/students`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });
      assert(
        unassignedRes.status === 403,
        'Teacher blocked from unassigned course with 403 Forbidden'
      );
    }

    // Test 11: Teacher marks attendance on assigned course
    const courseStudentsRes = await request(`/teacher/courses/${assignedCourseId}/students`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const enrolledStudents = courseStudentsRes.data?.data || [];
    assert(enrolledStudents.length > 0, 'Assigned course has enrolled students');

    const markRes = await request('/teacher/attendance', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        courseId: assignedCourseId,
        date: '2026-11-18',
        records: [
          { studentId: enrolledStudents[0].id, status: 'PRESENT' },
          { studentId: enrolledStudents[1].id, status: 'ABSENT' },
        ],
      },
    });
    assert(markRes.status === 200, 'Teacher successfully marks attendance for assigned course');

    // Test 12: Teacher submits marks for assigned course
    const marksRes = await request('/teacher/marks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        courseId: assignedCourseId,
        assessmentName: 'Unit Test 1',
        maxMarks: 25,
        records: [
          { studentId: enrolledStudents[0].id, obtainedMarks: 22 },
          { studentId: enrolledStudents[1].id, obtainedMarks: 19 },
        ],
      },
    });
    assert(marksRes.status === 200, 'Teacher successfully enters student marks');

    // Test 13: Student views attendance & marks
    const studentAttendanceRes = await request('/student/attendance', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      studentAttendanceRes.status === 200 && Array.isArray(studentAttendanceRes.data?.data?.courseWise),
      'Student retrieves course-wise attendance breakdown with percentage'
    );

    const studentMarksRes = await request('/student/marks', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      studentMarksRes.status === 200 && Array.isArray(studentMarksRes.data?.data?.courseWise),
      'Student retrieves course-wise marks and overall summary'
    );

    // Test 14: Admin Approves Pending Registration
    const approveRes = await request(`/admin/registrations/${registeredStudentId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      approveRes.status === 200 && approveRes.data?.data?.status === 'ACTIVE',
      'Admin approves pending registration successfully'
    );

    // Test 15: Newly approved student can now log in
    const newlyApprovedLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: regRes.data?.data?.email,
        password: 'Password123!',
      },
    });
    assert(
      newlyApprovedLogin.status === 200 && newlyApprovedLogin.data?.data?.user?.status === 'ACTIVE',
      'Approved student can now log in successfully'
    );

    // Test 16: Admin dashboard statistics
    const statsRes = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      statsRes.status === 200 &&
      statsRes.data?.data?.totalStudents >= 20 &&
      statsRes.data?.data?.totalTeachers >= 5 &&
      statsRes.data?.data?.totalCourses >= 5,
      'Admin dashboard stats returns accurate metrics'
    );

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();
