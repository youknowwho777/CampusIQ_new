import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Award, Save, CheckCircle2, History } from 'lucide-react';

export const EnterMarks = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [students, setStudents] = useState([]);
  const [existingMarks, setExistingMarks] = useState([]);

  // Form states
  const [assessmentName, setAssessmentName] = useState('Midterm Examination');
  const [maxMarks, setMaxMarks] = useState(50);
  const [marksMap, setMarksMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // 1. Fetch assigned courses
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

  // 2. Fetch students and existing marks for selected course
  const fetchCourseData = async () => {
    if (!selectedCourseId) return;

    try {
      setLoading(true);
      const [studentsRes, marksRes] = await Promise.all([
        api.get(`/teacher/courses/${selectedCourseId}/students`),
        api.get(`/teacher/courses/${selectedCourseId}/marks`),
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data);
      }
      if (marksRes.success) {
        setExistingMarks(marksRes.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load marks data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [selectedCourseId]);

  // 3. Whenever assessmentName or existingMarks change, prefill existing marks if found
  useEffect(() => {
    const matchingMarks = existingMarks.filter(
      (m) => m.assessmentName.toLowerCase() === assessmentName.trim().toLowerCase()
    );

    const initialMarks = {};
    if (matchingMarks.length > 0) {
      setMaxMarks(matchingMarks[0].maxMarks);
      matchingMarks.forEach((m) => {
        initialMarks[m.studentId] = m.obtainedMarks;
      });
    } else {
      students.forEach((s) => {
        initialMarks[s.id] = '';
      });
    }
    setMarksMap(initialMarks);
  }, [assessmentName, existingMarks, students]);

  const handleMarkChange = (studentId, value) => {
    const num = parseFloat(value);
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: isNaN(num) ? '' : num,
    }));
  };

  // Submit marks
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    if (!assessmentName.trim()) {
      setAlert({ type: 'error', message: 'Please provide an assessment name.' });
      return;
    }

    if (maxMarks <= 0) {
      setAlert({ type: 'error', message: 'Maximum marks must be greater than 0.' });
      return;
    }

    // Validate each student mark
    const records = [];
    for (const s of students) {
      const val = marksMap[s.id];
      if (val === '' || val === undefined || isNaN(val)) {
        setAlert({
          type: 'error',
          message: `Please enter marks for ${s.name} (${s.rollNumber || 'ID'}).`,
        });
        return;
      }
      if (val < 0) {
        setAlert({
          type: 'error',
          message: `Marks for ${s.name} cannot be negative.`,
        });
        return;
      }
      if (val > maxMarks) {
        setAlert({
          type: 'error',
          message: `Marks for ${s.name} (${val}) cannot exceed maximum marks (${maxMarks}).`,
        });
        return;
      }
      records.push({ studentId: s.id, obtainedMarks: val });
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await api.post('/teacher/marks', {
        courseId: selectedCourseId,
        assessmentName: assessmentName.trim(),
        maxMarks: parseFloat(maxMarks),
        records,
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `Marks for '${assessmentName}' saved successfully for ${records.length} students!`,
        });
        fetchCourseData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to submit marks.' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Record Academic Marks</h1>
        <p className="text-sm text-slate-500">
          Enter and update student performance scores for quizzes, assignments, and examinations
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Course & Assessment Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Course
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assessment Name / Type
            </label>
            <input
              type="text"
              required
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              placeholder="e.g. Midterm Examination"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Maximum Marks
            </label>
            <input
              type="number"
              min="1"
              required
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseFloat(e.target.value) || '')}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Quick assessment preset pills */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Presets:</span>
          {[
            'Midterm Examination',
            'Quiz 1 - Fundamentals',
            'Practical Lab Assignment',
            'Final Course Project',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAssessmentName(preset)}
              className={`px-2.5 py-1 text-xs rounded-full border transition cursor-pointer ${
                assessmentName === preset
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Marks Entry Sheet */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {activeCourse?.courseCode} — Marks Sheet ({students.length} Enrolled)
            </h3>
            <p className="text-xs text-slate-500">
              Assessment: <span className="font-semibold text-slate-800">{assessmentName}</span> (Max: {maxMarks})
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading course students..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students currently enrolled in this course.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Roll Number</th>
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Maximum Marks</th>
                    <th className="py-3 px-6">Marks Obtained</th>
                    <th className="py-3 px-6 text-right">Computed Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const obtained = marksMap[student.id];
                    const numObtained = parseFloat(obtained);
                    const pct =
                      !isNaN(numObtained) && maxMarks > 0
                        ? Math.round((numObtained / maxMarks) * 100 * 10) / 10
                        : null;

                    const isInvalid = !isNaN(numObtained) && (numObtained < 0 || numObtained > maxMarks);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-slate-800">
                          {student.rollNumber || '—'}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">{student.name}</td>
                        <td className="py-3.5 px-6 font-mono text-xs font-medium text-slate-600">
                          {maxMarks}
                        </td>
                        <td className="py-3.5 px-6">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={maxMarks}
                            value={obtained !== undefined ? obtained : ''}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            placeholder="0.0"
                            className={`w-28 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-hidden focus:ring-2 ${
                              isInvalid
                                ? 'border-rose-400 bg-rose-50 text-rose-800 focus:ring-rose-500'
                                : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500'
                            }`}
                          />
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-xs font-bold">
                          {pct !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded-full ${
                                pct >= 80
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : pct >= 50
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
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
                Grades are validated and updated in PostgreSQL. Students can immediately review their scores.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Marks...' : 'Save & Submit Marks'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
