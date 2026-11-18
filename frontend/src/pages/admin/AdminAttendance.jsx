import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Filter } from 'lucide-react';

export const AdminAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchFilters = async () => {
    try {
      const res = await api.get('/admin/courses');
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = [];
      if (selectedCourse) params.push(`courseId=${selectedCourse}`);
      if (selectedDate) params.push(`date=${selectedDate}`);
      const query = params.length ? `?${params.join('&')}` : '';

      const res = await api.get(`/admin/attendance${query}`);
      if (res.success) {
        setAttendance(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch attendance.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedCourse, selectedDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Attendance Records</h1>
        <p className="text-sm text-slate-500">
          Audit attendance across all courses, teachers, and dates
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters:</span>
        </div>

        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Academic Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(selectedCourse || selectedDate) && (
          <button
            onClick={() => {
              setSelectedCourse('');
              setSelectedDate('');
            }}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Attendance Log
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {attendance.length} Records Found
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying attendance logs..." />
        ) : attendance.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No attendance records found for the chosen filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-6">Roll Number</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6 text-right">Recorded Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-6 font-mono text-xs text-slate-600">
                      {new Date(rec.date).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3 px-6">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {rec.course.courseCode}
                      </span>
                      <span className="text-xs text-slate-600 ml-2">{rec.course.courseName}</span>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs font-medium text-slate-800">
                      {rec.student.rollNumber || '—'}
                    </td>
                    <td className="py-3 px-6 font-semibold text-slate-900">{rec.student.name}</td>
                    <td className="py-3 px-6 text-right">
                      <Badge variant={rec.status}>{rec.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
