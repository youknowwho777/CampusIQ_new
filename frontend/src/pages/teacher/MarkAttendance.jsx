import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { CalendarCheck, Save, CheckCircle2, UserCheck, Calendar } from 'lucide-react';

export const MarkAttendance = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [existingRecordsCount, setExistingRecordsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // 1. Fetch Teacher's assigned courses
  const fetchAssignedCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/courses');
      if (res.success) {
        setCourses(res.data);
        if (!selectedCourseId && res.data.length > 0) {
          setSelectedCourseId(res.data[0].id);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load courses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  // 2. Fetch students and existing attendance when course or date changes
  const fetchCourseAttendanceData = async () => {
    if (!selectedCourseId) return;

    try {
      setLoading(true);
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get(`/teacher/courses/${selectedCourseId}/students`),
        api.get(`/teacher/courses/${selectedCourseId}/attendance?date=${date}`),
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data);

        // Build status map: check if existing records exist for this date
        const existingMap = {};
        if (attendanceRes.success && attendanceRes.data.length > 0) {
          setExistingRecordsCount(attendanceRes.data.length);
          attendanceRes.data.forEach((rec) => {
            existingMap[rec.studentId] = rec.status;
          });
        } else {
          setExistingRecordsCount(0);
        }

        // Initialize every student to existing status or default 'PRESENT'
        const initialStatus = {};
        studentsRes.data.forEach((s) => {
          initialStatus[s.id] = existingMap[s.id] || 'PRESENT';
        });
        setAttendanceMap(initialStatus);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load attendance sheet.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAttendanceData();
  }, [selectedCourseId, date]);

  // Update a single student's status
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Bulk actions
  const setAllStatus = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  // Submit attendance to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSubmitting(true);
    setAlert(null);

    const records = students.map((s) => ({
      studentId: s.id,
      status: attendanceMap[s.id] || 'PRESENT',
    }));

    try {
      const res = await api.post('/teacher/attendance', {
        courseId: selectedCourseId,
        date,
        records,
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `Attendance recorded successfully for ${records.length} students on ${date}!`,
        });
        setExistingRecordsCount(records.length);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to save attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Record Course Attendance</h1>
          <p className="text-sm text-slate-500">
            Mark daily attendance registers for students enrolled in your assigned courses
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Course & Date Selector Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Assigned Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} — {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Attendance Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="w-full md:w-auto pt-4 md:pt-5">
          {existingRecordsCount > 0 ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Editing existing records ({existingRecordsCount})</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>New register for this date</span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Register */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Bulk Actions */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {activeCourse?.courseCode} — Student Register ({students.length} Enrolled)
            </h3>
            <p className="text-xs text-slate-500">Date: {date}</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold mr-1">Quick Fill:</span>
            <button
              type="button"
              onClick={() => setAllStatus('PRESENT')}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => setAllStatus('ABSENT')}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
            >
              All Absent
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading attendance register..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students are currently enrolled in this course. Please request student enrollments from the administrator.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Roll Number</th>
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Current Selection</th>
                    <th className="py-3 px-6 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const currentStatus = attendanceMap[student.id] || 'PRESENT';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-slate-800">
                          {student.rollNumber || '—'}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">
                          {student.name}
                        </td>
                        <td className="py-3.5 px-6">
                          <Badge variant={currentStatus}>{currentStatus}</Badge>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 space-x-0.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'PRESENT')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'LATE')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'ABSENT')}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Submit Button */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Changes will immediately update student dashboards upon submission.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Register...' : 'Save & Submit Attendance'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
