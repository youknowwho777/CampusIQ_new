import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CalendarCheck,
  ArrowRight,
  PlusCircle,
  UserPlus,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading Admin Dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin System Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time institutional metrics and management portal
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/courses"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Course</span>
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled in system"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Active Teachers"
          value={stats?.totalTeachers || 0}
          subtitle="Faculty members"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Academic Courses"
          value={stats?.totalCourses || 0}
          subtitle={`${stats?.totalEnrollments || 0} total enrollments`}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Pending Registrations"
          value={stats?.pendingRegistrations || 0}
          subtitle="Awaiting approval"
          icon={UserCheck}
          color={stats?.pendingRegistrations > 0 ? 'amber' : 'blue'}
        />
      </div>

      {/* Attendance & System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <span>Overall Attendance</span>
            </h3>
            <Badge variant="primary">Campus Average</Badge>
          </div>

          <div className="text-center py-4">
            <div className="text-4xl font-extrabold text-slate-900">
              {stats?.attendance?.overallPercentage || 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Average institutional attendance rate</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-semibold">Present</p>
              <p className="text-lg font-bold text-emerald-800">{stats?.attendance?.present || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
              <p className="text-xs text-rose-700 font-semibold">Absent</p>
              <p className="text-lg font-bold text-rose-800">{stats?.attendance?.absent || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700 font-semibold">Late</p>
              <p className="text-lg font-bold text-amber-800">{stats?.attendance?.late || 0}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/admin/attendance"
              className="w-full inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              <span>View Course-Wise Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 mb-4">Quick Operations</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/registrations"
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-amber-800">
                  Pending Applications ({stats?.pendingRegistrations || 0})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review, approve, or reject student applicants
                </p>
              </div>
            </Link>

            <Link
              to="/admin/assignments"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 group-hover:scale-105 transition">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-800">
                  Assign Teachers
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate faculty instructors to courses
                </p>
              </div>
            </Link>

            <Link
              to="/admin/enrollments"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-800">
                  Enroll Students
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register active students into academic courses
                </p>
              </div>
            </Link>

            <Link
              to="/admin/marks"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition group flex items-start space-x-3"
            >
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 group-hover:scale-105 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-purple-800">
                  Institutional Marks
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect recorded test, quiz and exam scores
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
