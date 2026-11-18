import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { CalendarCheck, History, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const StudentAttendance = () => {
  const [courseWise, setCourseWise] = useState([]);
  const [fullHistory, setFullHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/attendance');
      if (res.success) {
        setCourseWise(res.data.courseWise || []);
        setFullHistory(res.data.fullHistory || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch attendance.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Attendance Records</h1>
        <p className="text-sm text-slate-500">
          Official attendance percentage and session-by-session history for all enrolled subjects
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Calculating your attendance logs..." />
      ) : courseWise.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          No attendance records found.
        </div>
      ) : (
        <>
          {/* Course-wise Attendance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courseWise.map((c) => {
              const isEligible = c.percentage >= 75;

              return (
                <div
                  key={c.courseId}
                  className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                        {c.courseCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{c.courseName}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-900 font-mono">
                        {c.percentage}%
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEligible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isEligible ? 'Eligible (>= 75%)' : 'Shortage (< 75%)'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(c.percentage, 100)}%` }}
                    />
                  </div>

                  {/* Stats Breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-slate-100">
                    <div className="p-2 rounded bg-slate-50">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Total</p>
                      <p className="text-sm font-bold text-slate-800">{c.totalClasses}</p>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-semibold uppercase">Present</p>
                      <p className="text-sm font-bold text-emerald-800">{c.presentCount}</p>
                    </div>
                    <div className="p-2 rounded bg-rose-50 border border-rose-100">
                      <p className="text-[10px] text-rose-700 font-semibold uppercase">Absent</p>
                      <p className="text-sm font-bold text-rose-800">{c.absentCount}</p>
                    </div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-100">
                      <p className="text-[10px] text-amber-700 font-semibold uppercase">Late</p>
                      <p className="text-sm font-bold text-amber-800">{c.lateCount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Chronological History Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Attendance Log Timeline</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {fullHistory.length} Recorded Sessions
              </span>
            </div>

            {fullHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No session history recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-6">Class Date</th>
                      <th className="py-3 px-6">Course Code</th>
                      <th className="py-3 px-6">Course Name</th>
                      <th className="py-3 px-6 text-right">Recorded Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fullHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-6 font-mono text-xs text-slate-700">
                          {new Date(item.date).toISOString().split('T')[0]}
                        </td>
                        <td className="py-3 px-6">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {item.courseCode}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-semibold text-slate-900">{item.courseName}</td>
                        <td className="py-3 px-6 text-right">
                          <Badge variant={item.status}>{item.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
