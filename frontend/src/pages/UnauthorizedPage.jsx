import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  let homePath = '/login';
  if (user?.role === 'ADMIN') homePath = '/admin/dashboard';
  else if (user?.role === 'TEACHER') homePath = '/teacher/dashboard';
  else if (user?.role === 'STUDENT') homePath = '/student/dashboard';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Access Denied (403)</h1>
        <p className="text-sm text-slate-600">
          You do not have permission to access this page or resource. Your current role is{' '}
          <span className="font-semibold text-slate-900">{user?.role || 'Guest'}</span>.
        </p>
        <div className="pt-4">
          <Link
            to={homePath}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
