import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { UserPlus, Trash2, BookOpen, Users } from 'lucide-react';

export const TeacherAssignment = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, teachersRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/users?role=TEACHER&status=ACTIVE'),
      ]);

      if (coursesRes.success) setCourses(coursesRes.data);
      if (teachersRes.success) setTeachers(teachersRes.data);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load assignment data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedTeacherId) {
      setAlert({ type: 'warning', message: 'Please select both a course and a teacher.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/assignments', {
        courseId: selectedCourseId,
        teacherId: selectedTeacherId,
      });
      if (res.success) {
        setAlert({ type: 'success', message: 'Teacher successfully assigned to course.' });
        setSelectedTeacherId('');
        loadData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Assignment failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (courseId, teacherId, teacherName, courseCode) => {
    if (!window.confirm(`Remove ${teacherName} from ${courseCode}?`)) return;

    try {
      const res = await api.delete('/admin/assignments', {
        data: { courseId, teacherId },
      });
      if (res.success) {
        setAlert({ type: 'success', message: 'Teacher removed from course.' });
        loadData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to remove assignment.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Course Assignments</h1>
        <p className="text-sm text-slate-500">
          Allocate qualified teachers to academic courses. Teachers can only manage attendance & marks for assigned courses.
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Assignment Control Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>New Faculty Assignment</span>
        </h3>

        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Faculty Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Assigning...' : 'Assign to Course'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Assignments Overview */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Current Course Instructors
          </h3>
          <span className="text-xs font-semibold text-slate-500">{courses.length} Courses Total</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading course assignments..." />
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div key={course.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                      {course.courseCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{course.courseName}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.enrollments?.length || 0} students enrolled
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {course.teachers?.length === 0 ? (
                    <span className="text-xs italic text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      No teacher assigned yet
                    </span>
                  ) : (
                    course.teachers?.map((ct) => (
                      <div
                        key={ct.teacher.id}
                        className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ct.teacher.name}</span>
                        <button
                          onClick={() =>
                            handleRemove(
                              course.id,
                              ct.teacher.id,
                              ct.teacher.name,
                              course.courseCode
                            )
                          }
                          className="text-slate-400 hover:text-rose-600 ml-1 transition"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
