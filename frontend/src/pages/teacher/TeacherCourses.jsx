import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { BookMarked, Users, CalendarCheck, Award, GraduationCap } from 'lucide-react';

export const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/courses');
      if (res.success) {
        setCourses(res.data);
        if (res.data.length > 0) {
          handleSelectCourse(res.data[0]);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load courses.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      setRosterLoading(true);
      const res = await api.get(`/teacher/courses/${course.id}/students`);
      if (res.success) {
        setRoster(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load course roster.' });
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Assigned Courses</h1>
        <p className="text-sm text-slate-500">
          Courses allocated to your instruction portfolio and student enrollments
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Loading assigned courses..." />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          No courses are currently assigned to you.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Course ({courses.length})
            </h3>
            {courses.map((c) => {
              const isSelected = selectedCourse?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCourse(c)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {c.courseCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {c._count?.enrollments || 0} Students
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{c.courseName}</h4>
                  <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
                    <Link
                      to={`/teacher/attendance?courseId=${c.id}`}
                      className="text-blue-600 font-medium hover:underline inline-flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Attendance</span>
                    </Link>
                    <Link
                      to={`/teacher/marks?courseId=${c.id}`}
                      className="text-emerald-600 font-medium hover:underline inline-flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Marks</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrolled Students Roster */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedCourse?.courseCode} — Enrolled Student Roster
                </h3>
                <p className="text-xs text-slate-500">{selectedCourse?.courseName}</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-full">
                {roster.length} Enrolled
              </span>
            </div>

            {rosterLoading ? (
              <LoadingSpinner message="Loading course roster..." />
            ) : roster.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No students currently enrolled in this course.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-6">Roll Number</th>
                      <th className="py-3 px-6">Student Name</th>
                      <th className="py-3 px-6">Email Address</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-800">
                          {s.rollNumber || '—'}
                        </td>
                        <td className="py-3 px-6 font-semibold text-slate-900">{s.name}</td>
                        <td className="py-3 px-6 text-xs text-slate-500">{s.email}</td>
                        <td className="py-3 px-6 text-right">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
