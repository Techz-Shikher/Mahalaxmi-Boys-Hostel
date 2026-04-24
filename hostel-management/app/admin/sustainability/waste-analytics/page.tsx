'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface WasteLog {
  id: string;
  date: string;
  mealType: string;
  wasteCategory: 'vegetables' | 'grains' | 'protein' | 'dairy' | 'oil' | 'other';
  quantityKg: number;
  reason: string;
  loggedBy: string;
  timestamp: Date;
}

interface WasteStats {
  totalWaste: number;
  byMealType: { [key: string]: number };
  byCategory: { [key: string]: number };
  weeklyTrend: { [key: string]: number };
  averagePerMeal: number;
}

export default function WasteAnalyticsPage() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [stats, setStats] = useState<WasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchWasteLogs();
  }, [selectedPeriod]);

  const fetchWasteLogs = async () => {
    try {
      setLoading(true);
      setError('');

      const now = new Date();
      let startDate = new Date();

      if (selectedPeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(2020, 0, 1);
      }

      const q = query(
        collection(db, 'wasteTracker'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const wasteLogsData: WasteLog[] = [];

      querySnapshot.forEach((doc) => {
        wasteLogsData.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        } as WasteLog);
      });

      setLogs(wasteLogsData);
      calculateStats(wasteLogsData);
    } catch (err) {
      console.error('Error fetching waste logs:', err);
      setError('Failed to load waste data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (wasteData: WasteLog[]) => {
    const stats: WasteStats = {
      totalWaste: 0,
      byMealType: {},
      byCategory: {},
      weeklyTrend: {},
      averagePerMeal: 0,
    };

    wasteData.forEach((log) => {
      stats.totalWaste += log.quantityKg;

      stats.byMealType[log.mealType] = (stats.byMealType[log.mealType] || 0) + log.quantityKg;
      stats.byCategory[log.wasteCategory] = (stats.byCategory[log.wasteCategory] || 0) + log.quantityKg;

      const dateKey = new Date(log.timestamp).toLocaleDateString();
      stats.weeklyTrend[dateKey] = (stats.weeklyTrend[dateKey] || 0) + log.quantityKg;
    });

    stats.averagePerMeal = wasteData.length > 0 ? stats.totalWaste / wasteData.length : 0;
    setStats(stats);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  ♻️ Food Waste Analytics
                </h1>
                <p className="text-slate-400">SDG 2: Track and reduce food waste • Build sustainable practices</p>
              </div>

              {error && <ErrorMessage message={error} />}

              {/* Period Selector */}
              <div className="mb-8 flex gap-4">
                {(['week', 'month', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      selectedPeriod === period
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    {period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'All Time'}
                  </button>
                ))}
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Waste */}
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">📊 Total Waste</p>
                    <p className="text-4xl font-bold text-green-400">{stats.totalWaste.toFixed(1)}</p>
                    <p className="text-xs text-slate-500 mt-1">kg accumulated</p>
                  </div>

                  {/* Average Per Meal */}
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">🍱 Avg Per Meal</p>
                    <p className="text-4xl font-bold text-emerald-400">{stats.averagePerMeal.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">kg per logging</p>
                  </div>

                  {/* Meal Logs Count */}
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">📝 Logs Recorded</p>
                    <p className="text-4xl font-bold text-blue-400">{logs.length}</p>
                    <p className="text-xs text-slate-500 mt-1">waste entries</p>
                  </div>

                  {/* Top Category */}
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm mb-2">🥘 Top Waste Category</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)[0]?.[1]?.toFixed(1)}kg
                    </p>
                  </div>
                </div>
              )}

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Waste by Meal Type */}
                {stats && (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Waste by Meal Type</h2>
                    <div className="space-y-3">
                      {Object.entries(stats.byMealType)
                        .sort(([, a], [, b]) => b - a)
                        .map(([meal, quantity]) => (
                          <div key={meal}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-slate-300">{meal}</span>
                              <span className="text-sm font-semibold text-green-400">{quantity.toFixed(1)} kg</span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(quantity / Math.max(...Object.values(stats.byMealType))) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Waste by Category */}
                {stats && (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Waste by Category</h2>
                    <div className="space-y-3">
                      {Object.entries(stats.byCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, quantity]) => {
                          const icons: { [key: string]: string } = {
                            vegetables: '🥬',
                            grains: '🌾',
                            protein: '🍗',
                            dairy: '🥛',
                            oil: '🛢️',
                            other: '📦',
                          };
                          return (
                            <div key={category}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-300">
                                  {icons[category] || '📦'} {category.charAt(0).toUpperCase() + category.slice(1)}
                                </span>
                                <span className="text-sm font-semibold text-emerald-400">{quantity.toFixed(1)} kg</span>
                              </div>
                              <div className="w-full bg-slate-700/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(quantity / Math.max(...Object.values(stats.byCategory))) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Logs Table */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white">📋 Recent Waste Logs</h2>
                </div>

                {logs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p>No waste logs recorded yet. Kitchen staff will start logging waste here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50 border-b border-white/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Meal Type</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Category</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Quantity</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Reason</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Logged By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.slice(0, 20).map((log) => (
                          <tr key={log.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-slate-300 text-sm">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-white font-medium">{log.mealType}</td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                {log.wasteCategory}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white font-semibold">{log.quantityKg} kg</td>
                            <td className="px-6 py-4 text-slate-300 text-sm">{log.reason}</td>
                            <td className="px-6 py-4 text-slate-400 text-sm">{log.loggedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">🌱 SDG 2 Impact</h3>
                <ul className="text-slate-300 space-y-2">
                  <li>✅ Tracking helps identify waste patterns and root causes</li>
                  <li>✅ Data-driven decisions reduce food waste by up to 30%</li>
                  <li>✅ Cost savings reinvested in better nutrition for students</li>
                  <li>✅ Raises awareness about food security and sustainability</li>
                  <li>✅ Contributes to Zero Hunger initiatives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
