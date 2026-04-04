// app/admin/meals/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface FoodAnalytics {
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
  total: number;
}

export default function FoodAnalyticsPage() {
  const [analytics, setAnalytics] = useState<FoodAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFoodAnalytics();
  }, []);

  const fetchFoodAnalytics = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'foodBookings'));
      const querySnapshot = await getDocs(q);
      
      // Group bookings by date and meal type
      const analyticsMap = new Map<string, any>();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle date - convert Firestore timestamp or string
        let date = data.date;
        if (data.date && typeof data.date === 'object' && 'toDate' in data.date) {
          date = data.date.toDate().toISOString().split('T')[0];
        } else if (!date) {
          date = 'Unknown';
        }
        
        // Use mealType or fall back to meal
        const mealType = (data.mealType || data.meal || 'unknown').toLowerCase();
        
        if (!analyticsMap.has(date)) {
          analyticsMap.set(date, {
            date,
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            snacks: 0,
            total: 0,
          });
        }
        
        const entry = analyticsMap.get(date);
        
        if (entry[mealType] !== undefined) {
          entry[mealType]++;
        }
        entry.total++;
      });
      
      // Convert map to array and sort by date (newest first)
      const analyticsArray = Array.from(analyticsMap.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAnalytics(analyticsArray);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayAnalytics = () => {
    const today = new Date().toISOString().split('T')[0];
    return analytics.find(a => a.date === today);
  };

  if (loading) return <LoadingSpinner />;

  const todayData = getTodayAnalytics();
  const totalBookings = analytics.reduce((sum, a) => sum + a.total, 0);
  const avgPerDay = analytics.length > 0 ? (totalBookings / analytics.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Food Booking Analytics
            </h1>
            <p className="text-slate-400">Track meal bookings and student preferences</p>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} />}

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            {/* Total Bookings */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-blue-400">{totalBookings}</p>
                </div>
                <div className="text-4xl opacity-20">🍽️</div>
              </div>
            </div>

            {/* Average Per Day */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Avg Per Day</p>
                  <p className="text-3xl font-bold text-cyan-400">{avgPerDay}</p>
                </div>
                <div className="text-4xl opacity-20">📊</div>
              </div>
            </div>

            {/* Days Tracked */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Days Tracked</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.length}</p>
                </div>
                <div className="text-4xl opacity-20">📅</div>
              </div>
            </div>

            {/* Booking Rate */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Peak Day</p>
                  <p className="text-3xl font-bold text-green-400">
                    {analytics.length > 0 ? analytics[0].total : 0}
                  </p>
                </div>
                <div className="text-4xl opacity-20">📈</div>
              </div>
            </div>
          </div>

          {/* Date Selector and Today Summary */}
          {todayData && (
            <div className="mb-8 animate-slideInRight" style={{ animationDelay: '0.2s' }}>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">📋 {todayData.date} Summary</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Breakfast */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/30 rounded-xl p-4">
                    <p className="text-orange-400 text-sm mb-2">🥐 Breakfast</p>
                    <p className="text-3xl font-bold text-white">{todayData.breakfast}</p>
                    <p className="text-xs text-orange-300 mt-2">
                      {todayData.total > 0 ? ((todayData.breakfast / todayData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>

                  {/* Lunch */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-400 text-sm mb-2">🍛 Lunch</p>
                    <p className="text-3xl font-bold text-white">{todayData.lunch}</p>
                    <p className="text-xs text-green-300 mt-2">
                      {todayData.total > 0 ? ((todayData.lunch / todayData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>

                  {/* Dinner */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm mb-2">🍖 Dinner</p>
                    <p className="text-3xl font-bold text-white">{todayData.dinner}</p>
                    <p className="text-xs text-red-300 mt-2">
                      {todayData.total > 0 ? ((todayData.dinner / todayData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>

                  {/* Snacks */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm mb-2">🍪 Snacks</p>
                    <p className="text-3xl font-bold text-white">{todayData.snacks}</p>
                    <p className="text-xs text-yellow-300 mt-2">
                      {todayData.total > 0 ? ((todayData.snacks / todayData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-white font-semibold">
                    Total Bookings: <span className="text-cyan-400 text-2xl">{todayData.total}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Historical Data Table */}
          <div className="mb-8 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 overflow-x-auto">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Historical Data</h2>
              
              {analytics.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-slate-300">Date</th>
                      <th className="text-center py-3 px-4 text-slate-300">🥐 Breakfast</th>
                      <th className="text-center py-3 px-4 text-slate-300">🍛 Lunch</th>
                      <th className="text-center py-3 px-4 text-slate-300">🍖 Dinner</th>
                      <th className="text-center py-3 px-4 text-slate-300">🍪 Snacks</th>
                      <th className="text-center py-3 px-4 text-cyan-400 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.slice(0, 14).map((day, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white">{day.date}</td>
                        <td className="text-center py-3 px-4 text-orange-400">{day.breakfast}</td>
                        <td className="text-center py-3 px-4 text-green-400">{day.lunch}</td>
                        <td className="text-center py-3 px-4 text-red-400">{day.dinner}</td>
                        <td className="text-center py-3 px-4 text-yellow-400">{day.snacks}</td>
                        <td className="text-center py-3 px-4 text-cyan-400 font-semibold">{day.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 py-8 text-center">No booking data available yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
