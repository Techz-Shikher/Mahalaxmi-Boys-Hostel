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
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateComplaint(id, { status });
      setSuccess('Status updated');
      fetchComplaints();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  const pending = complaints.filter(c => c.status === 'Pending');
  const resolved = complaints.filter(c => c.status === 'Resolved');

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-slate-900 p-8">
        <h1 className="text-3xl font-bold text-white mb-4">⚠️ Manage Complaints</h1>
        
        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">⏳ Pending ({pending.length})</h2>
            <div className="space-y-3">
              {pending.length === 0 ? (
                <p className="text-slate-400">No pending complaints</p>
              ) : (
                pending.map(complaint => (
                  <div key={complaint.id} className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-bold text-white">{complaint.title}</h3>
                    <p className="text-slate-300 text-sm mt-2">{complaint.description}</p>
                    <button
                      onClick={() => handleStatusChange(complaint.id, 'Resolved')}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">✅ Resolved ({resolved.length})</h2>
            <div className="space-y-3">
              {resolved.length === 0 ? (
                <p className="text-slate-400">No resolved complaints</p>
              ) : (
                resolved.map(complaint => (
                  <div key={complaint.id} className="bg-white/10 rounded-lg p-4 opacity-60">
                    <h3 className="font-bold text-white">{complaint.title}</h3>
                    <p className="text-slate-300 text-sm mt-2">{complaint.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
