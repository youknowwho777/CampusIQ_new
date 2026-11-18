import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export const Alert = ({ type = 'info', message, details, onClose }) => {
  if (!message) return null;

  const typeConfig = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`p-4 rounded-lg border ${config.bg} flex items-start space-x-3 mb-4`}>
      {config.icon}
      <div className="flex-1">
        <p className="text-sm font-semibold">{message}</p>
        {details && <p className="text-xs mt-1 opacity-90">{details}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs font-bold opacity-60 hover:opacity-100 transition"
        >
          ✕
        </button>
      )}
    </div>
  );
};
