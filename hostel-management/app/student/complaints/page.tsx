// app/student/complaints/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentSidebar from '@/components/shared/StudentSidebar';
import { getComplaints, createComplaint, type Complaint } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      if (user?.uid) {
        const data = await getComplaints(user.uid);
        setComplaints(Array.isArray(data) ? data : []);
      } else {
        setError('User not authenticated');
      }
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err?.message || 'Failed to fetch complaints. Please check Firestore permissions.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);

    try {
      await createComplaint({
        studentId: user?.uid,
        title: formData.title,
        description: formData.description,
      });

      setSuccess('Complaint submitted successfully');
      setFormData({ title: '', description: '' });
      setShowForm(false);
      fetchComplaints();
    } catch (err) {
      setError('Failed to submit complaint');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pendingComplaints = complaints.filter((c) => c.status === 'Pending');
  const resolvedComplaints = complaints.filter((c) => c.status !== 'Pending');

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">⚠️ File a Complaint</h1>
              <p className="text-slate-400">Report issues and track their resolution status</p>
            </div>

            {/* Messages */}
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            {/* Form Section */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">📝 New Complaint</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  {showForm ? 'Cancel' : 'Add'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                      placeholder="Complaint title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Describe the issue..."
                      rows={5}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              )}
            </div>

            {/* Complaints List */}
            <div className="space-y-6">
              {/* Pending */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">⏳ Pending ({pendingComplaints.length})</h3>
                <div className="space-y-3">
                  {pendingComplaints.length === 0 ? (
                    <p className="text-slate-400">No pending complaints</p>
                  ) : (
                    pendingComplaints.map((complaint) => (
                      <div key={complaint.id} className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="font-bold text-white">{complaint.title}</h4>
                        <p className="text-slate-300 text-sm mt-2">{complaint.description}</p>
                        <span className="inline-block bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded mt-2">Pending</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Resolved */}
              {resolvedComplaints.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">✅ Resolved ({resolvedComplaints.length})</h3>
                  <div className="space-y-3">
                    {resolvedComplaints.map((complaint) => (
                      <div key={complaint.id} className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-bold text-white">{complaint.title}</h4>
                        <p className="text-slate-300 text-sm mt-2">{complaint.description}</p>
                        <span className="inline-block bg-green-600 text-green-100 text-xs px-2 py-1 rounded mt-2">Resolved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaints.length === 0 && (
                <div className="text-center py-8 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-slate-400">📭 No complaints yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
