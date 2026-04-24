'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface HealthIncident {
  id: string;
  studentId: string;
  studentName: string;
  incidentType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Under Review' | 'Treatment' | 'Resolved';
  reportedAt: any;
}

export default function AdminHealthAnalyticsPage() {
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'healthIncidents'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HealthIncident[];
      setIncidents(data);
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredIncidents = () => {
    const now = Date.now();
    return incidents.filter((incident) => {
      const incidentTime = incident.reportedAt?.toMillis?.() || 0;
      if (period === 'week') return now - incidentTime < 7 * 24 * 60 * 60 * 1000;
      if (period === 'month') return now - incidentTime < 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  };

  const filtered = getFilteredIncidents();

  const stats = {
    totalIncidents: filtered.length,
    avgPerDay: (filtered.length / (period === 'week' ? 7 : period === 'month' ? 30 : 365)).toFixed(1),
    criticalCount: filtered.filter((i) => i.severity === 'Critical').length,
    resolvedRate: filtered.length > 0 ? ((filtered.filter((i) => i.status === 'Resolved').length / filtered.length) * 100).toFixed(1) : 0,
  };

  const incidentsByType = filtered.reduce((acc, incident) => {
    const type = incident.incidentType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityBreakdown = {
    Low: filtered.filter((i) => i.severity === 'Low').length,
    Medium: filtered.filter((i) => i.severity === 'Medium').length,
    High: filtered.filter((i) => i.severity === 'High').length,
    Critical: filtered.filter((i) => i.severity === 'Critical').length,
  };

  const statusBreakdown = {
    Reported: filtered.filter((i) => i.status === 'Reported').length,
    'Under Review': filtered.filter((i) => i.status === 'Under Review').length,
    Treatment: filtered.filter((i) => i.status === 'Treatment').length,
    Resolved: filtered.filter((i) => i.status === 'Resolved').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-red-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-pink-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 animate-fadeInUp">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  📊 Health Analytics Dashboard
                </h1>
                <p className="text-slate-400">Monitor hostel health & wellness trends (SDG 3)</p>
              </div>

              {error && <ErrorMessage message={error} />}

              {/* Period Selector */}
              <div className="mb-6 flex gap-3 animate-slideInLeft">
                {(['week', 'month', 'all'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      period === p
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800/50 border border-white/20 text-slate-300 hover:border-red-400/50'
                    }`}
                  >
                    {p === 'week' ? '📅 Week' : p === 'month' ? '📆 Month' : '📊 All Time'}
                  </button>
                ))}
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-red-400 mb-2">{stats.totalIncidents}</div>
                  <div className="text-slate-400">Total Incidents</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.avgPerDay}</div>
                  <div className="text-slate-400">Avg per Day</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{stats.criticalCount}</div>
                  <div className="text-slate-400">Critical Cases</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.resolvedRate}%</div>
                  <div className="text-slate-400">Resolution Rate</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Severity Breakdown */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-xl font-bold text-white mb-4">🎯 Severity Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Low', color: 'bg-green-500', value: severityBreakdown.Low },
                      { label: 'Medium', color: 'bg-yellow-500', value: severityBreakdown.Medium },
                      { label: 'High', color: 'bg-orange-500', value: severityBreakdown.High },
                      { label: 'Critical', color: 'bg-red-500', value: severityBreakdown.Critical },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{item.label}</span>
                          <span className="text-white font-semibold">{item.value}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${filtered.length > 0 ? (item.value / filtered.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
                  <h3 className="text-xl font-bold text-white mb-4">📋 Status Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Reported', color: 'bg-red-500', value: statusBreakdown.Reported },
                      { label: 'Under Review', color: 'bg-yellow-500', value: statusBreakdown['Under Review'] },
                      { label: 'Treatment', color: 'bg-blue-500', value: statusBreakdown.Treatment },
                      { label: 'Resolved', color: 'bg-green-500', value: statusBreakdown.Resolved },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{item.label}</span>
                          <span className="text-white font-semibold">{item.value}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${filtered.length > 0 ? (item.value / filtered.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Incident Types Chart */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-bold text-white mb-4">📈 Incidents by Type</h3>
                <div className="space-y-3">
                  {Object.entries(incidentsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300 capitalize">{type}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${filtered.length > 0 ? (count / filtered.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mt-6 animate-slideInLeft" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-bold text-white mb-4">📝 Recent Incidents</h3>
                <div className="space-y-3">
                  {filtered
                    .sort((a, b) => b.reportedAt?.toMillis?.() - a.reportedAt?.toMillis?.())
                    .slice(0, 10)
                    .map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10">
                        <div>
                          <div className="text-white font-medium">{incident.studentName}</div>
                          <div className="text-xs text-slate-400 capitalize">{incident.incidentType}</div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            incident.severity === 'Low' ? 'bg-green-500/20 text-green-400' :
                            incident.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            incident.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {incident.severity}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            incident.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                            incident.status === 'Treatment' ? 'bg-blue-500/20 text-blue-400' :
                            incident.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
