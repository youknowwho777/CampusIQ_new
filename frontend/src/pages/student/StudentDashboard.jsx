import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import {
  BookOpen,
  CalendarCheck,
  Award,
  User,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading your academic dashboard..." />;

  const attendancePct = data?.attendance?.percentage ?? 100;
  const academicsPct = data?.academics?.overallPercentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Portal</h1>
        <p className="text-sm text-slate-500">
          Personal attendance records, course marks, and curriculum performance
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Enrolled Courses"
          value={data?.enrolledCoursesCount || 0}
          subtitle="Active academic subjects"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Overall Attendance"
          value={`${attendancePct}%`}
          subtitle={`${data?.attendance?.present || 0} Present out of ${data?.attendance?.totalClasses || 0} sessions`}
          icon={CalendarCheck}
          color={attendancePct >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Cumulative Grade Average"
          value={`${academicsPct}%`}
          subtitle={`${data?.academics?.assessmentsCount || 0} evaluated assessments`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Academic Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <span>Attendance Health</span>
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  attendancePct >= 75
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {attendancePct >= 75 ? 'Good Standing (>= 75%)' : 'Attendance Warning (< 75%)'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    attendancePct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(attendancePct, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-semibold">Present</p>
                  <p className="text-xl font-bold text-emerald-800">{data?.attendance?.present || 0}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                  <p className="text-xs text-rose-700 font-semibold">Absent</p>
                  <p className="text-xl font-bold text-rose-800">{data?.attendance?.absent || 0}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 font-semibold">Late</p>
                  <p className="text-xl font-bold text-amber-800">{data?.attendance?.late || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/student/attendance"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
            >
              <span>View Course-Wise Breakdown & History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Your Enrolled Courses</span>
            </h3>

            {data?.recentCourses?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No course enrollments found.</p>
            ) : (
              <div className="space-y-2.5">
                {data?.recentCourses?.map((course) => (
                  <div
                    key={course.id}
                    className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {course.courseCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{course.courseName}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Faculty: {course.teachers.join(', ') || 'Staff'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/student/courses"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/student/marks"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center space-x-1"
            >
              <span>View Marks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
