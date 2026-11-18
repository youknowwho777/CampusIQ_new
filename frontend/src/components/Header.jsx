import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-slate-800">
          CampusIQ Academic System
        </h2>
        <p className="text-xs text-slate-500">
          Logged in as <span className="font-semibold text-slate-700">{user?.email}</span>
          {user?.rollNumber && <span className="ml-2 font-mono text-slate-600">[{user.rollNumber}]</span>}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-slate-700 font-medium text-sm">
          <UserCircle className="w-5 h-5 text-slate-400" />
          <span>{user?.name}</span>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
          title="Sign out of CampusIQ"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};
