import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Award, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';

export const StudentMarks = () => {
  const [courseWise, setCourseWise] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/marks');
      if (res.success) {
        setCourseWise(res.data.courseWise || []);
        setSummary(res.data.summary);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch marks.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Grades & Performance</h1>
        <p className="text-sm text-slate-500">
          Course-wise evaluation marks, test breakdowns, and cumulative performance rating
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Overall Cumulative Summary Card */}
      {summary && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Cumulative Institutional Performance</span>
            </div>
            <h2 className="text-xl font-bold">Academic Evaluation Summary</h2>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated across {summary.totalAssessments} official academic assessments
            </p>
          </div>

          <div className="flex items-center space-x-6 text-center">
            <div className="border-r border-slate-700/80 pr-6">
              <p className="text-xs text-slate-400 font-medium">Total Marks</p>
              <p className="text-2xl font-bold font-mono mt-1 text-slate-200">
                <span className="text-blue-400">{summary.totalObtainedMarks}</span> / {summary.totalMaxMarks}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Aggregate Average</p>
              <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {summary.overallPercentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Calculating your academic marks..." />
      ) : courseWise.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          No assessment marks recorded yet.
        </div>
      ) : (
        <div className="space-y-6">
          {courseWise.map((course) => (
            <div
              key={course.courseId}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
                    {course.courseCode}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{course.courseName}</h3>
                </div>

                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="text-slate-500">
                    Course Score: <span className="font-mono text-slate-800">{course.totalObtained}</span> / {course.totalMax}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    Avg: {course.averagePercentage}%
                  </span>
                </div>
              </div>

              {course.assessments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No assessments have been recorded for this course yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-6">Assessment Title</th>
                        <th className="py-3 px-6">Maximum Marks</th>
                        <th className="py-3 px-6">Marks Obtained</th>
                        <th className="py-3 px-6 text-right">Percentage Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {course.assessments.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-6 font-semibold text-slate-800">
                            {a.assessmentName}
                          </td>
                          <td className="py-3 px-6 font-mono text-xs text-slate-600">
                            {a.maxMarks}
                          </td>
                          <td className="py-3 px-6 font-mono text-xs font-bold text-slate-900">
                            {a.obtainedMarks}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                                a.percentage >= 85
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : a.percentage >= 70
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : a.percentage >= 50
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {a.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
