import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { User, Mail, GraduationCap, Calendar, ShieldCheck, BookOpen } from 'lucide-react';

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner message="Loading personal profile..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Identity Profile</h1>
        <p className="text-sm text-slate-500">
          Personal student credentials, roll number, and enrollment status
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
          {/* Top Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-800 p-6 flex items-end">
            <div className="flex items-center space-x-2 text-white/80 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Institutional Scholar</span>
            </div>
          </div>

          {/* Profile Card Body */}
          <div className="px-8 pb-8 pt-0 relative">
            {/* Avatar */}
            <div className="-mt-14 mb-4 flex items-end justify-between">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center font-bold text-3xl text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100">
                {profile.name?.charAt(0) || 'S'}
              </div>
              <div>
                <Badge variant={profile.status} size="lg">
                  {profile.status} ACCOUNT
                </Badge>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.email}</p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student Roll Number</span>
                </div>
                <p className="font-mono text-base font-bold text-slate-900">
                  {profile.rollNumber || 'Not Assigned'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Official University Email</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {profile.email}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Account Established</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Curriculum Enrollments</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {profile._count?.enrollments || 0} Registered Courses
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>CampusIQ Student Identity Services</span>
              <span>Unique System ID: {profile.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
