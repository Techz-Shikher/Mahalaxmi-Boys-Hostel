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
      if (user?.uid) {
        const data = await getComplaints(user.uid);
        setComplaints(data || []);
      }
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
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
      // Create complaint
      await createComplaint({
        userId: user?.uid,
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

  const pendingComplaints = complaints.filter(c => c.status === 'Pending');
  const resolvedComplaints = complaints.filter(c => c.status !== 'Pending');

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background - red/slate theme for complaints */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-red-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-slate-600/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              ⚠️ File a Complaint
            </h1>
            <p className="text-slate-400">Report issues and track their resolution status</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Create Form Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🆕</span> Report New Issue
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                {showForm ? '✕ Cancel' : '📝 New Complaint'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
                    placeholder="Brief complaint title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300 resize-none"
                    placeholder="Provide detailed description..."
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/20"
                >
                  {submitting ? '⏳ Submitting...' : '🚀 Submit Complaint'}
                </button>
              </form>
            )}
          </div>

          {/* Complaints List */}
          <div className="space-y-8 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            {/* Pending Complaints */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>⏳</span> Pending ({pendingComplaints.length})
              </h2>
              {pendingComplaints.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
                  <p className="text-slate-400">No pending complaints</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingComplaints.map((complaint, idx) => (
                    <div
                      key={complaint.id}
                      className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 hover:bg-yellow-500/20 transition-all duration-300"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${0.2 + (idx * 0.05)}s both`
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{complaint.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">📅 {complaint.createdAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}</p>
                        </div>
                        <span className="bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-lg text-xs font-semibold border border-yellow-500/50">
                          Pending
                        </span>
                      </div>
                      <p className="text-slate-200">{complaint.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved Complaints */}
            {resolvedComplaints.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>✅</span> Resolved ({resolvedComplaints.length})
                </h2>
                <div className="space-y-4">
                  {resolvedComplaints.map((complaint, idx) => (
                    <div
                      key={complaint.id}
                      className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-2xl p-6 hover:bg-green-500/20 transition-all duration-300"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${0.3 + (idx * 0.05)}s both`
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{complaint.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">📅 {complaint.createdAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}</p>
                        </div>
                        <span className="bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-xs font-semibold border border-green-500/50">
                          Resolved
                        </span>
                      </div>
                      <p className="text-slate-200">{complaint.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complaints.length === 0 && (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
                <p className="text-slate-400 text-lg">📭 No complaints yet</p>
                <p className="text-slate-500 text-sm mt-2">File your first complaint using the form above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
