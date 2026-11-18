import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    // Status presets
    ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border border-slate-200',
    // Role presets
    ADMIN: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    TEACHER: 'bg-blue-50 text-blue-700 border border-blue-200',
    STUDENT: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    // Attendance presets
    PRESENT: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
    ABSENT: 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold',
    LATE: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
  };

  const appliedClass = variantClasses[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${sizeClasses[size]} ${appliedClass}`}
    >
      {children || variant}
    </span>
  );
};
