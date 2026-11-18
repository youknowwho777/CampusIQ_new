import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogIn, Key, Mail, Sparkles } from 'lucide-react';
import { Alert } from '../../components/Alert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credential autofill helpers for quick presentation testing
  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@campusiq.edu');
      setPassword('Password123!');
    } else if (role === 'teacher') {
      setEmail('anil.kumar@campusiq.edu');
      setPassword('Password123!');
    } else if (role === 'student') {
      setEmail('naruto@campusiq.edu');
      setPassword('Password123!');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus<span className="text-blue-600">IQ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Smart Academic Management System</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campusiq.edu"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Fast-Fill Section */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Presentation Demo Fill:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="py-1.5 px-2 text-xs font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('teacher')}
              className="py-1.5 px-2 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
            >
              Demo Teacher
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('student')}
              className="py-1.5 px-2 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              Demo Student
            </button>
          </div>
        </div>

        {/* Student Register Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          New Student?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register for an Account
          </Link>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        CampusIQ &bull; Role-Based Smart Academic Management System
      </div>
    </div>
  );
};
