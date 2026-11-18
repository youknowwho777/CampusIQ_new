import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Page Not Found (404)</h1>
        <p className="text-sm text-slate-600">
          The requested page does not exist in CampusIQ.
        </p>
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
