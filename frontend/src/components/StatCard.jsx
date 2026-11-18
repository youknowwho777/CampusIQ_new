import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorSchemes = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200',
      accent: 'border-l-blue-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      accent: 'border-l-emerald-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      accent: 'border-l-amber-600',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200',
      accent: 'border-l-purple-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
      accent: 'border-l-rose-600',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow border-l-4 ${scheme.accent} flex items-start justify-between`}
    >
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
