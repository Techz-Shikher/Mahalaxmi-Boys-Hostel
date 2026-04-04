// app/student/community/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentSidebar from '@/components/shared/StudentSidebar';
import { getCommunityPosts, createCommunityPost, deleteCommunityPost, type CommunityPost } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';

export default function StudentCommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    try {
      await createCommunityPost({
        title: formData.title,
        content: formData.content,
        userId: user?.uid,
        userName: user?.name,
      });
      setSuccess('Post created successfully!');
      setFormData({ title: '', content: '' });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      setError('Failed to create post');
      console.error(err);
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
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-pink-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              💬 Community Hub
            </h1>
            <p className="text-slate-400">Share updates, tips, and connect with fellow residents</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Post</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white px-6 py-2 rounded-xl transition-all"
              >
                {showForm ? '✕ Cancel' : '✍️ Create'}
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
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all"
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all resize-none"
                    placeholder="Share your thoughts..."
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-pink-500/20"
                >
                  🚀 Post
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            {posts.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
                <p className="text-slate-400">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post, idx) => (
                <div 
                  key={post.id} 
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all group"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${0.2 + (idx * 0.05)}s both`
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{post.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">👤 {post.userName}</p>
                    </div>
                    {post.userId === user?.uid && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold border border-red-500/30 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-slate-200 whitespace-pre-wrap mb-3">{post.content}</p>
                  <p className="text-xs text-slate-500">
                    {post.createdAt?.toDate?.()?.toLocaleString?.() || 'N/A'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
