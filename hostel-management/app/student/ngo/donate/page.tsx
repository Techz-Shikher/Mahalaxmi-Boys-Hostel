'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface NGO {
  id: string;
  name: string;
  phone: string;
  address: string;
  description: string;
  category: string;
}

const CATEGORIES = ['All', 'Food & Nutrition', 'Health & Medical', 'Education', 'Shelter', 'Clothing', 'Other'];

export default function StudentNGOPage() {
  const { user } = useAuth();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (user) {
      fetchNGOs();
    }
  }, [user]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const constraints: QueryConstraint[] = [];
      if (selectedCategory !== 'All') {
        constraints.push(where('category', '==', selectedCategory));
      }

      const q = query(collection(db, 'ngos'), ...constraints);
      const querySnapshot = await getDocs(q);
      const ngoList: NGO[] = [];
      
      querySnapshot.forEach((doc) => {
        ngoList.push({ id: doc.id, ...doc.data() } as NGO);
      });

      setNgos(ngoList);
    } catch (err) {
      console.error('Error fetching NGOs:', err);
      setError('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNGOs();
    }
  }, [selectedCategory, user]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              🤝 Donate to NGOs
            </h1>
            <p className="text-slate-400">Support local organizations making a difference in our community</p>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} />}

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* NGO Grid */}
          {ngos.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-lg">No NGOs found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngos.map(ngo => (
                <div
                  key={ngo.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium mb-3">
                      {ngo.category}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{ngo.name}</h3>
                  </div>

                  {/* Description */}
                  {ngo.description && (
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {ngo.description}
                    </p>
                  )}

                  {/* Address */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">📍 Location</p>
                    <p className="text-slate-300 text-sm mt-1">{ngo.address}</p>
                  </div>

                  {/* Phone */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">📞 Contact</p>
                    <p className="text-cyan-400 font-mono text-sm mt-1">{ngo.phone}</p>
                  </div>

                  {/* Call Button */}
                  <button
                    onClick={() => handleCall(ngo.phone)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>📞</span>
                    <span>Call to Donate</span>
                  </button>

                  {/* Copy Phone */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ngo.phone);
                      alert('Phone number copied!');
                    }}
                    className="w-full mt-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium rounded-lg transition-all"
                  >
                    Copy Number
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info Card */}
          <div className="mt-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">💡 How to Help</h3>
            <ul className="text-slate-300 space-y-2">
              <li>✓ Click "Call to Donate" to directly contact the NGO</li>
              <li>✓ Copy the phone number to save for later</li>
              <li>✓ Discuss donation methods with the NGO representative</li>
              <li>✓ Your contribution helps the community - Thank you!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
