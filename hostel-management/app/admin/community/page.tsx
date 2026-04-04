// app/admin/community/page.tsx
'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { getCommunityPosts, deleteCommunityPost, type CommunityPost } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';

export default function CommunityAdminPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getCommunityPosts();
      setPosts(data || []);
    } catch (err) {
      setError('Failed to fetch community posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteCommunityPost(postId);
        setSuccess('Post deleted successfully');
        fetchPosts();
      } catch (err) {
        setError('Failed to delete post');
        console.error(err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background - pink/purple theme */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-pink-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-fuchsia-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              💬 Community Feed
            </h1>
            <p className="text-slate-400">Moderate community posts and manage discussions</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Posts Container */}
          <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            {posts.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
                <p className="text-slate-400 text-lg">✨ No community posts yet</p>
                <p className="text-slate-500 text-sm mt-2">Students can create posts from their community feed</p>
              </div>
            ) : (
              posts.map((post, idx) => (
                <div 
                  key={post.id} 
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 group"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${0.1 + (idx * 0.05)}s both`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <span>👤</span>
                        <span className="text-slate-200 font-medium">{post.userName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition-all duration-300 border border-red-500/30 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-xl p-4 mb-4 border border-white/5">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      📅 {post.createdAt?.toDate?.()?.toLocaleString?.() || 'Date not available'}
                    </span>
                    <div className="px-2 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30 text-purple-300">
                      📌 Posted
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats Footer */}
          {posts.length > 0 && (
            <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <p className="text-slate-300">
                Total Posts: <span className="text-pink-400 font-bold text-lg">{posts.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
