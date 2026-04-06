// app/admin/announcements/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, type Announcement } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.message) {
      setError('All fields are required');
      return;
    }

    try {
      await createAnnouncement({
        title: formData.title,
        message: formData.message,
      });
      setSuccess('Announcement posted successfully');
      setFormData({ title: '', message: '' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to post announcement');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        setSuccess('Announcement deleted');
        fetchAnnouncements();
      } catch (err) {
        setError('Failed to delete announcement');
        console.error(err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background - blue/indigo theme */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              📢 Manage Announcements
            </h1>
            <p className="text-slate-400">Create and distribute important announcements to all students</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Create Form Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>✍️</span> New Announcement
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                {showForm ? '✕ Cancel' : '📢 Post New'}
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
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                    placeholder="Announcement title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
                    placeholder="Write your announcement here..."
                    rows={5}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  🚀 Post Announcement
                </button>
              </form>
            )}
          </div>

          {/* Announcements List */}
          <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            {announcements.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
                <p className="text-slate-400 text-lg">📭 No announcements yet</p>
                <p className="text-slate-500 text-sm mt-2">Post an announcement to notify all students</p>
              </div>
            ) : (
              announcements.map((announcement, idx) => (
                <div
                  key={announcement.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${0.2 + (idx * 0.05)}s both`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        📅 {announcement.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Date not available'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition-all duration-300 border border-red-500/30 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 text-sm font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="mt-4 flex items-center justify-end">
                    <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30 text-blue-300 text-xs font-semibold">
                      ✨ Active
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats Footer */}
          {announcements.length > 0 && (
            <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <p className="text-slate-300">
                Total Announcements: <span className="text-blue-400 font-bold text-lg">{announcements.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
</div>
  );
}
