import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  UserPlus,
  GraduationCap,
  CalendarCheck,
  Award,
  BookMarked,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from './Badge';

export const Sidebar = () => {
  const { user } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Directory', to: '/admin/users', icon: Users },
    { name: 'Pending Registrations', to: '/admin/registrations', icon: UserCheck },
    { name: 'Courses', to: '/admin/courses', icon: BookOpen },
    { name: 'Assign Teachers', to: '/admin/assignments', icon: UserPlus },
    { name: 'Enroll Students', to: '/admin/enrollments', icon: GraduationCap },
    { name: 'Overall Attendance', to: '/admin/attendance', icon: CalendarCheck },
    { name: 'All Marks', to: '/admin/marks', icon: Award },
  ];

  const teacherLinks = [
    { name: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Courses', to: '/teacher/courses', icon: BookMarked },
    { name: 'Mark Attendance', to: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Enter Marks', to: '/teacher/marks', icon: Award },
  ];

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Enrolled Courses', to: '/student/courses', icon: BookOpen },
    { name: 'My Attendance', to: '/student/attendance', icon: CalendarCheck },
    { name: 'Academic Marks', to: '/student/marks', icon: Award },
    { name: 'My Profile', to: '/student/profile', icon: User },
  ];

  let currentLinks = [];
  if (user?.role === 'ADMIN') currentLinks = adminLinks;
  else if (user?.role === 'TEACHER') currentLinks = teacherLinks;
  else if (user?.role === 'STUDENT') currentLinks = studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 mr-3">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">Campus<span className="text-blue-500">IQ</span></span>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Academic Portal</p>
        </div>
      </div>

      {/* Role Indicator Card */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <div className="mt-1">
              <Badge variant={user?.role} size="sm">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {user?.role} Navigation
        </p>
        {currentLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
        CampusIQ v1.0 MVP &bull; Ready
      </div>
    </aside>
  );
};
