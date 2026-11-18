import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Modal } from '../../components/Modal';
import { BookOpen, Plus, Edit2, Trash2, Users, GraduationCap } from 'lucide-react';

export const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Forms
  const [courseForm, setCourseForm] = useState({ courseCode: '', courseName: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/courses');
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch courses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/courses', courseForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'Course created successfully.' });
        setIsCreateModalOpen(false);
        setCourseForm({ courseCode: '', courseName: '', description: '' });
        fetchCourses();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create course.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/admin/courses/${selectedCourse.id}`, courseForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'Course updated successfully.' });
        setIsEditModalOpen(false);
        fetchCourses();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update course.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseCode) => {
    if (!window.confirm(`Are you sure you want to delete course ${courseCode}? This will remove all associated enrollments, assignments, marks, and attendance.`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/courses/${courseId}`);
      if (res.success) {
        setAlert({ type: 'success', message: `Course ${courseCode} deleted.` });
        fetchCourses();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete course.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Management</h1>
          <p className="text-sm text-slate-500">
            Define curriculum offerings, academic course codes, and catalog descriptions
          </p>
        </div>
        <button
          onClick={() => {
            setCourseForm({ courseCode: '', courseName: '', description: '' });
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Courses Grid */}
      {loading ? (
        <LoadingSpinner message="Loading academic courses..." />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          No courses created yet. Click "Add New Course" to begin.
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
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.courseCode)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 leading-snug">
                  {course.courseName}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description || 'No detailed course description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1.5" title="Assigned Teachers">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>
                    {course.teachers?.length || 0} Teacher{course.teachers?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5" title="Enrolled Students">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-700">
                    {course.enrollments?.length || 0} Enrolled
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Course */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Academic Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Code
            </label>
            <input
              type="text"
              required
              value={courseForm.courseCode}
              onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
              placeholder="e.g. CS302"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Name / Title
            </label>
            <input
              type="text"
              required
              value={courseForm.courseName}
              onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
              placeholder="e.g. Operating Systems & Distributed Architecture"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Syllabus / Description
            </label>
            <textarea
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Summary of course concepts, topics and outcomes..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Course */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Academic Course"
      >
        <form onSubmit={handleUpdateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Code
            </label>
            <input
              type="text"
              required
              value={courseForm.courseCode}
              onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Name
            </label>
            <input
              type="text"
              required
              value={courseForm.courseName}
              onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
