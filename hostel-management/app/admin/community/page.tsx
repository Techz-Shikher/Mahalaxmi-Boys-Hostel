'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { getCommunityPosts, deleteCommunityPost, type CommunityPost } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function CommunityAdminPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getCommunityPosts();
      setPosts(data || []);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this post?')) {
      try {
        await deleteCommunityPost(id);
        fetchPosts();
      } catch (err) {
        setError('Failed to delete');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-slate-900 p-8">
        <h1 className="text-3xl font-bold text-white mb-4">💬 Community Feed</h1>
        
        {error && <ErrorMessage message={error} />}

        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-slate-400">No posts yet</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-white">{post.userName || 'Anonymous'}</p>
                    <p className="text-slate-300 mt-2">{post.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
