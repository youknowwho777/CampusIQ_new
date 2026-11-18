import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { GraduationCap, Trash2, BookOpen, Search, UserCheck } from 'lucide-react';

export const StudentEnrollment = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, studentsRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/users?role=STUDENT&status=ACTIVE'),
      ]);

      if (coursesRes.success) {
        setCourses(coursesRes.data);
        if (!selectedCourseId && coursesRes.data.length > 0) {
          setSelectedCourseId(coursesRes.data[0].id);
        }
      }
      if (studentsRes.success) {
        setStudents(studentsRes.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load enrollment data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledStudentIds = new Set(activeCourse?.enrollments?.map((e) => e.student.id) || []);
  const eligibleStudents = students.filter((s) => !enrolledStudentIds.has(s.id));

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedStudentId) {
      setAlert({ type: 'warning', message: 'Please select both a course and a student.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/enrollments', {
        courseId: selectedCourseId,
        studentId: selectedStudentId,
      });
      if (res.success) {
        setAlert({ type: 'success', message: 'Student enrolled successfully.' });
        setSelectedStudentId('');
        loadData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Enrollment failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (studentId, studentName) => {
    if (!window.confirm(`Unenroll ${studentName} from ${activeCourse?.courseCode}?`)) return;

    try {
      const res = await api.delete('/admin/enrollments', {
        data: { courseId: selectedCourseId, studentId },
      });
      if (res.success) {
        setAlert({ type: 'success', message: 'Student unenrolled from course.' });
        loadData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to unenroll student.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Course Enrollments</h1>
        <p className="text-sm text-slate-500">
          Register students into academic courses. Only enrolled students appear in attendance and marks registers.
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Select Course & Enroll New Student Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Selector Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Course to View & Enroll
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>

          {activeCourse && (
            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Course Code:</span>{' '}
                <span className="font-mono text-blue-700">{activeCourse.courseCode}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-800">Instructors:</span>{' '}
                {activeCourse.teachers?.map((t) => t.teacher.name).join(', ') || 'None assigned'}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Total Enrolled:</span>{' '}
                <span className="font-bold text-slate-900">{activeCourse.enrollments?.length || 0} students</span>
              </p>
            </div>
          )}
        </div>

        {/* Enroll Student Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Enroll Eligible Student into {activeCourse?.courseCode}</span>
          </h3>

          <form onSubmit={handleEnroll} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Student to Enroll ({eligibleStudents.length} available) --</option>
                {eligibleStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} [{s.rollNumber || 'NO ROLL'}] — {s.email}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || eligibleStudents.length === 0}
              className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              {submitting ? 'Enrolling...' : 'Enroll in Course'}
            </button>
          </form>
        </div>
      </div>

      {/* Enrolled Students Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Roster: {activeCourse?.courseCode} — {activeCourse?.courseName}
          </h3>
          <span className="text-xs font-semibold text-slate-600">
            {activeCourse?.enrollments?.length || 0} Students Enrolled
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading course roster..." />
        ) : !activeCourse?.enrollments || activeCourse.enrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students currently enrolled in this course. Select a student above to enroll them.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Roll Number</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeCourse.enrollments.map((enr) => (
                  <tr key={enr.student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-800">
                      {enr.student.rollNumber || '—'}
                    </td>
                    <td className="py-3 px-6 font-semibold text-slate-900">{enr.student.name}</td>
                    <td className="py-3 px-6 text-xs text-slate-500">{enr.student.email}</td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {enr.student.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleRemove(enr.student.id, enr.student.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Unenroll student from this course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
