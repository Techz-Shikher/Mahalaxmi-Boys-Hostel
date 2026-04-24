'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EnergyLog {
  id: string;
  buildingName: string;
  energyConsumed: number; // kWh
  type: string; // electricity, gas, solar
  source: string; // grid, solar, generator
  loggedAt: Timestamp;
}

export default function EnergyDashboard() {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnergyLogs();
  }, [period]);

  const fetchEnergyLogs = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate = new Date();

      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(0); // All time
      }

      const q = query(
        collection(db, 'energyLogs'),
        where('loggedAt', '>=', Timestamp.fromDate(startDate))
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EnergyLog[];

      setLogs(data);
    } catch (error) {
      console.error('Error fetching energy logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalConsumption = () => {
    return logs.reduce((sum, log) => sum + log.energyConsumed, 0).toFixed(2);
  };

  const getAveragePerDay = () => {
    if (logs.length === 0) return '0';
    const uniqueDays = new Set(
      logs.map((log) => log.loggedAt.toDate().toDateString())
    );
    return (
      (logs.reduce((sum, log) => sum + log.energyConsumed, 0) / uniqueDays.size).toFixed(2)
    );
  };

  const getConsumptionByBuilding = () => {
    const buildingMap = new Map<string, number>();
    logs.forEach((log) => {
      buildingMap.set(
        log.buildingName,
        (buildingMap.get(log.buildingName) || 0) + log.energyConsumed
      );
    });
    return Array.from(buildingMap, ([name, value]) => ({ name, value }));
  };

  const getConsumptionBySource = () => {
    const sourceMap = new Map<string, number>();
    logs.forEach((log) => {
      sourceMap.set(
        log.source,
        (sourceMap.get(log.source) || 0) + log.energyConsumed
      );
    });
    return Array.from(sourceMap, ([name, value]) => ({ name, value }));
  };

  const getDailyTrend = () => {
    const dateMap = new Map<string, number>();
    logs.forEach((log) => {
      const date = log.loggedAt.toDate().toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + log.energyConsumed);
    });
    return Array.from(dateMap, ([date, consumption]) => ({ date, consumption }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const sourceColors = { grid: '#ef4444', solar: '#fbbf24', generator: '#6b7280' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <AdminSidebar />

      <main className="ml-0 md:ml-64 p-6 transition-all duration-300">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ⚡ Energy Monitoring Dashboard
          </h1>
          <p className="text-slate-400">SDG 7: Affordable & Clean Energy</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-4 mb-8">
          {(['week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                period === p
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'week' ? 'Last 7 Days' : 'Last Month'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-300 text-sm">Total Consumption</p>
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-3xl font-bold">{getTotalConsumption()} kWh</p>
                <p className="text-xs text-slate-400 mt-2">Period: {period}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-300 text-sm">Avg per Day</p>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold">{getAveragePerDay()} kWh</p>
                <p className="text-xs text-slate-400 mt-2">Daily average</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-300 text-sm">Total Logs</p>
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-3xl font-bold">{logs.length}</p>
                <p className="text-xs text-slate-400 mt-2">Energy entries recorded</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Daily Trend */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4">Daily Consumption Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getDailyTrend()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #10b981',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consumption"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Consumption by Source */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4">Energy Source Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getConsumptionBySource()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name}: ${props.value.toFixed(1)} kWh`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['grid', 'solar', 'generator'].map((source, idx) => (
                        <Cell key={`cell-${idx}`} fill={sourceColors[source as keyof typeof sourceColors]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #10b981',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Consumption by Building */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">Consumption by Building</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getConsumptionByBuilding()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #10b981',
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-4">Recent Energy Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Building
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Consumption (kWh)
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 10).map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">{log.buildingName}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: sourceColors[log.source as keyof typeof sourceColors],
                              opacity: 0.2,
                              color: sourceColors[log.source as keyof typeof sourceColors],
                            }}
                          >
                            {log.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">{log.energyConsumed}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {log.loggedAt.toDate().toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
