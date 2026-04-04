// app/student/announcements/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAnnouncements, type Announcement } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import StudentSidebar from '@/components/shared/StudentSidebar';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background - blue theme */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              📢 Announcements
            </h1>
            <p className="text-slate-400">Important notices and hostel updates</p>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Announcements List */}
          <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            {announcements.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
                <p className="text-slate-400 text-lg">📭 No announcements yet</p>
                <p className="text-slate-500 text-sm mt-2">Check back later for important updates</p>
              </div>
            ) : (
              announcements.map((announcement, idx) => (
                <div
                  key={announcement.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${0.1 + (idx * 0.05)}s both`
                  }}
                >
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      📅 {announcement.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Date not available'}
                    </p>
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>

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
