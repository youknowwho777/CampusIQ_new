import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  GraduationCap,
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  // Modals
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', rollNumber: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', rollNumber: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = [];
      if (roleFilter !== 'ALL') params.push(`role=${roleFilter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length) query = `?${params.join('&')}`;

      const res = await api.get(`/admin/users${query}`);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      if (res.success) {
        setAlert({ type: 'success', message: `User status changed to ${newStatus}.` });
        fetchUsers();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  // Create Teacher
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/users/teacher', teacherForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'Teacher created successfully.' });
        setIsTeacherModalOpen(false);
        setTeacherForm({ name: '', email: '', password: '' });
        fetchUsers();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create teacher.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Create Student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/users/student', studentForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'Student created successfully.' });
        setIsStudentModalOpen(false);
        setStudentForm({ name: '', email: '', rollNumber: '', password: '' });
        fetchUsers();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create student.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber || '',
    });
    setIsEditModalOpen(true);
  };

  // Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/admin/users/${selectedUser.id}`, editForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'User updated successfully.' });
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update user.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-sm text-slate-500">
            Manage academic accounts, role assignments and active credentials
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsTeacherModalOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['ALL', 'TEACHER', 'STUDENT', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                roleFilter === role
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-72">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No users found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User / Name</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Roll Number</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Enrollments / Taught</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant={u.role}>{u.role}</Badge>
                    </td>
                    <td className="py-3.5 px-6">
                      {u.rollNumber ? (
                        <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {u.rollNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant={u.status}>{u.status}</Badge>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">
                      {u.role === 'STUDENT' && (
                        <span>{u._count?.enrollments || 0} Courses Enrolled</span>
                      )}
                      {u.role === 'TEACHER' && (
                        <span>{u._count?.taughtCourses || 0} Courses Assigned</span>
                      )}
                      {u.role === 'ADMIN' && <span className="text-slate-400">System Admin</span>}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit user details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Deactivate account' : 'Activate account'}
                        >
                          {u.status === 'ACTIVE' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Teacher */}
      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title="Add New Faculty Teacher"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Teacher Full Name
            </label>
            <input
              type="text"
              required
              value={teacherForm.name}
              onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
              placeholder="e.g. jsmith@campusiq.edu"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              required
              value={teacherForm.password}
              onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsTeacherModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Student */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Add New Student (Active)"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Student Name
            </label>
            <input
              type="text"
              required
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              placeholder="e.g. Robert Wilson"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              placeholder="e.g. rwilson@campusiq.edu"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Roll Number / ID
            </label>
            <input
              type="text"
              required
              value={studentForm.rollNumber}
              onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
              placeholder="e.g. CIQ-2026-050"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              required
              value={studentForm.password}
              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          {selectedUser?.role === 'STUDENT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={editForm.rollNumber}
                onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
              />
            </div>
          )}
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
