# CampusIQ — Project Status

## 1. Project Overview
CampusIQ is a complete, functional, presentation-ready Smart Academic Management System built with React, Vite, Tailwind CSS, Node.js, Express, PostgreSQL, and Prisma ORM.

## 2. Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router v6, Axios, Lucide React icons, React Context API.
- **Backend**: Node.js, Express.js (ES Modules), REST APIs, Prisma ORM, PostgreSQL.
- **Security & Auth**: JWT authentication (HttpOnly cookies + Bearer token header support), bcryptjs password hashing, Role-Based Access Control (RBAC), Zod request validation.

## 3. Current Folder Structure
```
c:\SE Project\
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20261118131841_init/
│   │   │       └── migration.sql
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/ (db.js, jwt.js)
│   │   ├── controllers/ (authController.js, adminController.js, teacherController.js, studentController.js)
│   │   ├── middleware/ (authMiddleware.js, rbacMiddleware.js, validateMiddleware.js, errorMiddleware.js)
│   │   ├── routes/ (authRoutes.js, adminRoutes.js, teacherRoutes.js, studentRoutes.js, index.js)
│   │   ├── utils/ (token.js, response.js)
│   │   ├── validators/ (authValidators.js, academicValidators.js)
│   │   └── server.js
│   ├── test-backend.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Sidebar, Header, StatCard, Badge, Modal, Alert, LoadingSpinner, ProtectedRoute)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── layouts/ (DashboardLayout.jsx)
│   │   ├── pages/
│   │   │   ├── auth/ (LoginPage.jsx, RegisterPage.jsx)
│   │   │   ├── admin/ (AdminDashboard.jsx, UserManagement.jsx, CourseManagement.jsx, TeacherAssignment.jsx, StudentEnrollment.jsx, PendingRegistrations.jsx, AdminAttendance.jsx, AdminMarks.jsx)
│   │   │   ├── teacher/ (TeacherDashboard.jsx, TeacherCourses.jsx, MarkAttendance.jsx, EnterMarks.jsx)
│   │   │   ├── student/ (StudentDashboard.jsx, StudentCourses.jsx, StudentAttendance.jsx, StudentMarks.jsx, StudentProfile.jsx)
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/ (api.js)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── PROJECT_STATUS.md
├── AI_HANDOFF.md
└── README.md
```

## 4. Database Schema & Relationships
- **User**: id (UUID), name, email (unique), passwordHash, role (ADMIN, TEACHER, STUDENT), status (ACTIVE, PENDING, REJECTED, INACTIVE), rollNumber (optional, unique for students), createdAt, updatedAt.
- **Course**: id (UUID), courseCode (unique), courseName, description, createdAt, updatedAt.
- **CourseTeacher**: id (UUID), teacherId (User), courseId (Course). Unique `[teacherId, courseId]`.
- **Enrollment**: id (UUID), studentId (User), courseId (Course), enrollmentDate. Unique `[studentId, courseId]`.
- **Attendance**: id (UUID), studentId (User), courseId (Course), date (Date), status (PRESENT, ABSENT, LATE), createdAt, updatedAt. Unique `[studentId, courseId, date]`.
- **Marks**: id (UUID), studentId (User), courseId (Course), assessmentName, maxMarks (Float), obtainedMarks (Float), createdAt, updatedAt. Unique `[studentId, courseId, assessmentName]`.

## 5. Environment Variables
### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusiq?schema=public"
JWT_SECRET="campusiq_super_secret_jwt_key_2026_academic_production_grade"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```
### Frontend (`frontend/.env`):
```env
VITE_API_URL="/api"
```

## 6. Commands to Run
- Backend:
  ```bash
  cd backend
  npm run dev
  # Run automated test suite:
  node test-backend.js
  ```
- Frontend:
  ```bash
  cd frontend
  npm run dev
  ```

## 7. Completed Features
- **Phase 1**: Database schema & Prisma setup, migrations applied to PostgreSQL `campusiq`.
- **Phase 2**: Full backend authentication, JWT HttpOnly + Bearer, bcryptjs password hashing, RBAC middleware, Zod validators.
- **Phase 3**: Admin, Teacher, and Student controllers & REST APIs.
- **Phase 4**: Attendance (upsert, date-based, enrollment check) & Marks (validation `obtained <= max`, upsert per assessment) modules.
- **Phase 5**: Database seeded with 1 Admin, 5 Teachers, 20 Active Students, 2 Pending Students, 5 Courses, 60 Enrollments, 420 Attendance records, 180 Marks records.
- **Frontend Complete**:
  - AuthContext & Axios service client with automatic interceptor.
  - Dark navy/charcoal responsive layout with role-aware navigation.
  - Login page with demo autofill buttons for Admin, Teacher, Student.
  - Student registration page with pending approval feedback.
  - Admin: Dashboard, User Directory (CRUD, Activate/Deactivate), Courses (CRUD), Teacher Assignments, Student Enrollments, Pending Registration Approvals, System Attendance, System Marks.
  - Teacher: Dashboard, Assigned Courses, Mark/Update Attendance with date picker and bulk actions, Enter/Update Marks with validation and presets.
  - Student: Dashboard, Enrolled Courses, Attendance breakdown & percentage, Marks breakdown & cumulative score, Profile card.
  - Production build tested and verified (`vite build` succeeded with 0 errors).

## 8. Features Currently Being Implemented
None — all MVP modules implemented and verified.

## 9. Pending Features
None for the MVP. Future iterations can introduce features listed in Section 10 (study materials, assignments, notifications).

## 10. Known Bugs and Errors
None.

## 11. Tests Already Completed
- Integration test suite: 19/19 passed (`backend/test-backend.js`).
- Frontend production build verification: `npm run build` succeeded cleanly in 4.62s.

## 12. Tests Still Pending
None.
