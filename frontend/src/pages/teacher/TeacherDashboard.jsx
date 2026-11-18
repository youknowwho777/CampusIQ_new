import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import {
  BookMarked,
  Users,
  CalendarCheck,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        api.get('/teacher/stats'),
        api.get('/teacher/courses'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load teacher dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading Teacher Dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Dashboard</h1>
          <p className="text-sm text-slate-500">
            Instructional course management, student registers, and grading
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/teacher/attendance"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
          <Link
            to="/teacher/marks"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Award className="w-4 h-4" />
            <span>Enter Marks</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Assigned Courses"
          value={stats?.assignedCourses || 0}
          subtitle="Courses in curriculum"
          icon={BookMarked}
          color="blue"
        />
        <StatCard
          title="Enrolled Students"
          value={stats?.totalEnrolledStudents || 0}
          subtitle="Across your classes"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Today's Recorded Attendance"
          value={stats?.todayAttendance?.totalMarked || 0}
          subtitle={`${stats?.todayAttendance?.present || 0} Present, ${stats?.todayAttendance?.absent || 0} Absent`}
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Assigned Courses Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Your Assigned Courses</h3>
          <Link
            to="/teacher/courses"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
          >
            <span>View All Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            You are not currently assigned to any courses. Please contact the administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {course.courseCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {course._count?.enrollments || 0} Students
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{course.courseName}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {course.description || 'No course description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <Link
                    to={`/teacher/attendance?courseId=${course.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center space-x-1"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Attendance</span>
                  </Link>
                  <Link
                    to={`/teacher/marks?courseId=${course.id}`}
                    className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center space-x-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Marks</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
