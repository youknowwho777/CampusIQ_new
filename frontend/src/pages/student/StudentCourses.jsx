import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/courses');
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch enrolled courses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enrolled Courses</h1>
        <p className="text-sm text-slate-500">
          Your active academic subjects and course faculty instructors
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Loading course subjects..." />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          You are not currently enrolled in any courses. Please contact the administrator.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                    {course.courseCode}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Enrolled {new Date(course.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {course.courseName}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description || 'No detailed course description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-1">Instructors:</span>
                  {course.teachers.length === 0 ? (
                    <span className="italic text-slate-400">TBD</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {course.teachers.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs"
                        >
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{t.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <Link
                    to="/student/attendance"
                    className="text-blue-600 font-semibold hover:underline inline-flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Attendance</span>
                  </Link>
                  <Link
                    to="/student/marks"
                    className="text-emerald-600 font-semibold hover:underline inline-flex items-center space-x-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Marks</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
