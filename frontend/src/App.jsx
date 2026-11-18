import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { TeacherAssignment } from './pages/admin/TeacherAssignment';
import { StudentEnrollment } from './pages/admin/StudentEnrollment';
import { PendingRegistrations } from './pages/admin/PendingRegistrations';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminMarks } from './pages/admin/AdminMarks';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { MarkAttendance } from './pages/teacher/MarkAttendance';
import { EnterMarks } from './pages/teacher/EnterMarks';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentProfile } from './pages/student/StudentProfile';

// Common Pages
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Root Role-Based Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="assignments" element={<TeacherAssignment />} />
            <Route path="enrollments" element={<StudentEnrollment />} />
            <Route path="registrations" element={<PendingRegistrations />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="marks" element={<AdminMarks />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="marks" element={<EnterMarks />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
