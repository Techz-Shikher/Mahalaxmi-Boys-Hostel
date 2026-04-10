'use client';

import { useEffect, useState } from 'react';
import { getComplaints, updateComplaint, type Complaint } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching all complaints...');
      const data = await getComplaints();
      console.log('Fetched complaints:', data);
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err?.message || 'Failed to fetch complaints. Please check Firestore permissions.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateComplaint(id, { status });
      setSuccess('Status updated');
      setTimeout(() => setSuccess(''), 3000);
      fetchComplaints();
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pending = complaints.filter(c => c.status === 'Pending');
  const resolved = complaints.filter(c => c.status === 'Resolved');

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">⚠️ Manage Complaints</h1>
            <p className="text-slate-400">View and resolve student complaints</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {complaints.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
              <p className="text-slate-400">No complaints found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Complaints */}
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <span>⏳ Pending</span>
                    <span className="text-lg bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                      {pending.length}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm">Complaints awaiting resolution</p>
                </div>
                <div className="space-y-4">
                  {pending.length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                      <p className="text-slate-400">No pending complaints</p>
                    </div>
                  ) : (
                    pending.map(complaint => (
                      <div key={complaint.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all">
                        <h3 className="font-bold text-white mb-2">{complaint.title}</h3>
                        <p className="text-slate-300 text-sm mb-4">{complaint.description}</p>
                        {complaint.studentId && (
                          <p className="text-slate-500 text-xs mb-4">ID: {complaint.studentId}</p>
                        )}
                        <button
                          onClick={() => handleStatusChange(complaint.id, 'Resolved')}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          ✓ Mark Resolved
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Resolved Complaints */}
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <span>✅ Resolved</span>
                    <span className="text-lg bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                      {resolved.length}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm">Completed complaint resolutions</p>
                </div>
                <div className="space-y-4">
                  {resolved.length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                      <p className="text-slate-400">No resolved complaints</p>
                    </div>
                  ) : (
                    resolved.map(complaint => (
                      <div key={complaint.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 opacity-70 hover:opacity-100 transition-all">
                        <h3 className="font-bold text-white mb-2">{complaint.title}</h3>
                        <p className="text-slate-300 text-sm mb-4">{complaint.description}</p>
                        {complaint.studentId && (
                          <p className="text-slate-500 text-xs">ID: {complaint.studentId}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
