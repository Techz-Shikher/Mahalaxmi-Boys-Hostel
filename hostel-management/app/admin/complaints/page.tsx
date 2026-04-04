// app/admin/complaints/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getComplaints, updateComplaint, type Complaint } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';import AdminSidebar from '@/components/shared/AdminSidebar';
export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      setError('');
      setSuccess('');
      await updateComplaint(complaintId, { status: newStatus });
      setSuccess('Complaint status updated');
      fetchComplaints();
    } catch (err) {
      setError('Failed to update complaint');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const filteredComplaints =
    filterStatus === 'All'
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-2">
              Manage Complaints
            </h1>
            <p className="text-slate-300">Track and resolve student issues</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <p className="text-slate-300 text-sm font-medium mb-2">Total Complaints</p>
              <p className="text-4xl font-bold text-white">{complaints.length}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <p className="text-slate-300 text-sm font-medium mb-2">Pending</p>
              <p className="text-4xl font-bold text-yellow-400">{pendingCount}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <p className="text-slate-300 text-sm font-medium mb-2">Resolved</p>
              <p className="text-4xl font-bold text-green-400">{resolvedCount}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <label className="block text-white font-semibold mb-4">Filter by Status</label>
            <div className="flex flex-wrap gap-3">
              {['All', 'Pending', 'Resolved'].map((status, idx) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                  style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center animate-fadeInUp">
                <p className="text-slate-300 text-lg">No complaints found</p>
              </div>
            ) : (
              filteredComplaints.map((complaint, idx) => (
                <div
                  key={complaint.id}
                  className="group animate-fadeInUp"
                  style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                >
                  <div
                    className={`backdrop-blur-xl bg-white/5 border rounded-2xl p-6 border-l-4 transition-all transform hover:scale-102 hover:shadow-2xl cursor-pointer hover:bg-white/10 ${
                      complaint.status === 'Pending'
                        ? 'border-yellow-500 hover:border-yellow-400'
                        : 'border-green-500 hover:border-green-400'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{complaint.title}</h3>
                        <p className="text-slate-400 text-sm mb-3">
                          👤 {complaint.userId} · 📅 {complaint.createdAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}
                        </p>
                        <p className="text-slate-300">{complaint.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${
                            complaint.status === 'Pending'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                              : 'bg-green-500/20 text-green-300 border border-green-500/50'
                          }`}
                        >
                          {complaint.status === 'Pending' ? '⏳ Pending' : '✓ Resolved'}
                        </span>
                        {complaint.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusChange(complaint.id, 'Resolved')}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm"
                          >
                            ✓ Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .scale-102 { transform: scale(1.02); }
      `}</style>
    </div>
  );
}
