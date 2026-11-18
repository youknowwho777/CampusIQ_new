import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Filter, Award } from 'lucide-react';

export const AdminMarks = () => {
  const [courses, setCourses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [assessmentFilter, setAssessmentFilter] = useState('');

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

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const params = [];
      if (selectedCourse) params.push(`courseId=${selectedCourse}`);
      if (assessmentFilter) params.push(`assessmentName=${encodeURIComponent(assessmentFilter)}`);
      const query = params.length ? `?${params.join('&')}` : '';

      const res = await api.get(`/admin/marks${query}`);
      if (res.success) {
        setMarks(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch marks.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMarks();
  }, [selectedCourse, assessmentFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Marks & Grades</h1>
        <p className="text-sm text-slate-500">
          Inspect examination, assignment, and quiz scores across all academic courses
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

        <div className="w-56">
          <input
            type="text"
            value={assessmentFilter}
            onChange={(e) => setAssessmentFilter(e.target.value)}
            placeholder="Filter by assessment name..."
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(selectedCourse || assessmentFilter) && (
          <button
            onClick={() => {
              setSelectedCourse('');
              setAssessmentFilter('');
            }}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Assessment Records
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {marks.length} Score Entries
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying marks..." />
        ) : marks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No marks records found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-6">Assessment</th>
                  <th className="py-3 px-6">Roll Number</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6 text-center">Score / Max</th>
                  <th className="py-3 px-6 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marks.map((m) => {
                  const pct =
                    m.maxMarks > 0
                      ? Math.round((m.obtainedMarks / m.maxMarks) * 100 * 10) / 10
                      : 0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-6">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {m.course.courseCode}
                        </span>
                      </td>
                      <td className="py-3 px-6 font-semibold text-slate-800">
                        {m.assessmentName}
                      </td>
                      <td className="py-3 px-6 font-mono text-xs font-medium text-slate-800">
                        {m.student.rollNumber || '—'}
                      </td>
                      <td className="py-3 px-6 font-semibold text-slate-900">{m.student.name}</td>
                      <td className="py-3 px-6 text-center font-mono text-xs font-bold text-slate-800">
                        <span className="text-blue-700">{m.obtainedMarks}</span> / {m.maxMarks}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-xs font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            pct >= 85
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pct >= 70
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : pct >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
