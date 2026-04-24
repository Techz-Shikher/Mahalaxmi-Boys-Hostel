'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import StudentSidebar from '@/components/shared/StudentSidebar';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EnergyLog {
  id: string;
  buildingName: string;
  energyConsumed: number;
  type: string;
  source: string;
  loggedAt: Timestamp;
}

const energySavingTips = [
  {
    icon: '💡',
    title: 'Use LED Bulbs',
    description: 'LED bulbs use 75% less energy than traditional bulbs',
  },
  {
    icon: '🌞',
    title: 'Natural Light',
    description: 'Open curtains during the day to reduce artificial lighting',
  },
  {
    icon: '❄️',
    title: 'Regulate AC',
    description: 'Set thermostat to 25°C, each degree can save 6% energy',
  },
  {
    icon: '🔌',
    title: 'Unplug Devices',
    description: 'Disconnect devices when not in use to avoid phantom loads',
  },
  {
    icon: '⏰',
    title: 'Turn Off Equipment',
    description: 'Always turn off fans and lights when leaving the room',
  },
  {
    icon: '🚿',
    title: 'Short Showers',
    description: 'Hot water heaters consume significant energy',
  },
];

export default function StudentEnergyPage() {
  const [energyData, setEnergyData] = useState<EnergyLog[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnergyData();
  }, [period]);

  const fetchEnergyData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate = new Date();

      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(0);
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

      setEnergyData(data);
    } catch (error) {
      console.error('Error fetching energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalConsumption = () => {
    return energyData.reduce((sum, log) => sum + log.energyConsumed, 0).toFixed(2);
  };

  const getConsumptionByType = () => {
    const typeMap = new Map<string, number>();
    energyData.forEach((log) => {
      typeMap.set(
        log.type,
        (typeMap.get(log.type) || 0) + log.energyConsumed
      );
    });
    return Array.from(typeMap, ([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value,
    }));
  };

  const getDailyConsumption = () => {
    const dateMap = new Map<string, number>();
    energyData.forEach((log) => {
      const date = log.loggedAt.toDate().toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + log.energyConsumed);
    });
    return Array.from(dateMap, ([date, consumption]) => ({ date, consumption }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getConsumptionByBuilding = () => {
    const buildingMap = new Map<string, number>();
    energyData.forEach((log) => {
      buildingMap.set(
        log.buildingName,
        (buildingMap.get(log.buildingName) || 0) + log.energyConsumed
      );
    });
    return Array.from(buildingMap, ([name, value]) => ({ name, value }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <StudentSidebar />

      <main className="ml-0 md:ml-64 p-6 transition-all duration-300">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
              ⚡ Energy Consumption Overview
            </h1>
            <p className="text-slate-400">Track hostel energy usage and learn how to save energy</p>
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
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-300 text-sm">Total Energy Used</p>
                    <span className="text-3xl">⚡</span>
                  </div>
                  <p className="text-4xl font-bold">{getTotalConsumption()} kWh</p>
                  <p className="text-xs text-slate-400 mt-2">Across all buildings</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-300 text-sm">Energy Entries</p>
                    <span className="text-3xl">📊</span>
                  </div>
                  <p className="text-4xl font-bold">{energyData.length}</p>
                  <p className="text-xs text-slate-400 mt-2">Recorded measurements</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Daily Consumption */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4">Daily Consumption Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={getDailyConsumption()}>
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
                        dot={{ fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Energy Type Distribution */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4">Energy Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getConsumptionByType()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name}: ${props.value.toFixed(1)} kWh`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getConsumptionByType().map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
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

                {/* Building Consumption */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl lg:col-span-2">
                  <h3 className="text-xl font-bold mb-4">Energy by Building</h3>
                  <ResponsiveContainer width="100%" height={250}>
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

              {/* Energy Saving Tips */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                <h3 className="text-2xl font-bold mb-4">💡 Energy Saving Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {energySavingTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg p-4 hover:border-green-500/60 transition-colors"
                    >
                      <div className="text-3xl mb-2">{tip.icon}</div>
                      <h4 className="font-semibold text-lg mb-2">{tip.title}</h4>
                      <p className="text-sm text-slate-400">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
