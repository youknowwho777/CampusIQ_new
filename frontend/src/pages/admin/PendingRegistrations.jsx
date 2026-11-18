import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Check, X, UserCheck, Clock } from 'lucide-react';

export const PendingRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/registrations/pending');
      if (res.success) {
        setRegistrations(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load pending registrations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    setActionInProgress(id);
    try {
      const res = await api.patch(`/admin/registrations/${id}/approve`);
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Application approved for ${name}. Student can now sign in!`,
        });
        fetchPending();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Approval failed.' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject registration application for ${name}?`)) return;

    setActionInProgress(id);
    try {
      const res = await api.patch(`/admin/registrations/${id}/reject`);
      if (res.success) {
        setAlert({
          type: 'warning',
          message: `Application rejected for ${name}. Account blocked.`,
        });
        fetchPending();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Rejection failed.' });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Registrations</h1>
          <p className="text-sm text-slate-500">
            Review self-registered student accounts and verify eligibility for portal access
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="PENDING" size="lg">
            {registrations.length} Applications Pending
          </Badge>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading pending registrations..." />
        ) : registrations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Pending Applications</h3>
            <p className="text-xs text-slate-500 mt-1">
              All student registration requests have been reviewed and processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Applicant Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Roll Number</th>
                  <th className="py-3.5 px-6">Submitted Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{app.name}</td>
                    <td className="py-3.5 px-6 text-xs text-slate-600 font-mono">{app.email}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                        {app.rollNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant="PENDING">PENDING REVIEW</Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(app.id, app.name)}
                        disabled={actionInProgress === app.id}
                        className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                        title="Approve applicant"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(app.id, app.name)}
                        disabled={actionInProgress === app.id}
                        className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                        title="Reject applicant"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
