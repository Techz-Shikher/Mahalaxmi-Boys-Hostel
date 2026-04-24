'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { useAuth } from '@/context/AuthContext';

interface EnergyLog {
  id: string;
  buildingName: string;
  energyConsumed: number;
  type: string;
  source: string;
  loggedAt: Timestamp;
  loggedBy: string;
}

export default function LogEnergyPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    buildingName: '',
    energyConsumed: '',
    type: 'electricity',
    source: 'grid',
  });
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const buildings = ['Main Building', 'Hostel A', 'Hostel B', 'Hostel C', 'Hostel D', 'Kitchen', 'Gym', 'Library'];
  const energyTypes = ['electricity', 'gas', 'water'];
  const energySources = ['grid', 'solar', 'generator', 'hybrid'];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const q = query(
        collection(db, 'energyLogs'),
        where('loggedAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EnergyLog[];
      setLogs(data.sort((a, b) => b.loggedAt.toDate().getTime() - a.loggedAt.toDate().getTime()));
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buildingName || !formData.energyConsumed) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'energyLogs'), {
        buildingName: formData.buildingName,
        energyConsumed: parseFloat(formData.energyConsumed),
        type: formData.type,
        source: formData.source,
        loggedAt: Timestamp.now(),
        loggedBy: user?.email || 'Unknown',
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({ buildingName: '', energyConsumed: '', type: 'electricity', source: 'grid' });
      fetchLogs();
    } catch (error) {
      console.error('Error logging energy:', error);
      alert('Failed to log energy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this log?')) {
      try {
        await deleteDoc(doc(db, 'energyLogs', id));
        fetchLogs();
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <AdminSidebar />

      <main className="ml-0 md:ml-64 p-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
              📊 Log Energy Consumption
            </h1>
            <p className="text-slate-400">Record energy usage from different buildings and sources</p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 animate-pulse">
              ✅ Energy log recorded successfully!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl h-fit">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Building */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Building
                  </label>
                  <select
                    value={formData.buildingName}
                    onChange={(e) =>
                      setFormData({ ...formData, buildingName: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="">Select Building</option>
                    {buildings.map((building) => (
                      <option key={building} value={building}>
                        {building}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Energy Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Energy Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    {energyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Energy Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    {energySources.map((source) => (
                      <option key={source} value={source}>
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consumption */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Consumption (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.energyConsumed}
                    onChange={(e) =>
                      setFormData({ ...formData, energyConsumed: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="e.g., 150.5"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
                >
                  {loading ? 'Logging...' : '📝 Log Energy'}
                </button>
              </form>
            </div>

            {/* Recent Logs */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-4">Recent Logs (Last 30 Days)</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {logs.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No energy logs yet</p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{log.buildingName}</div>
                          <div className="text-sm text-slate-400 mt-1">
                            <span className="inline-block mr-3">
                              {log.type === 'electricity' ? '⚡' : log.type === 'gas' ? '🔥' : '💧'}{' '}
                              {log.type}
                            </span>
                            <span className="inline-block">
                              Source: <span className="font-semibold text-green-400">{log.source}</span>
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            {log.loggedAt.toDate().toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">{log.energyConsumed}</div>
                          <div className="text-xs text-slate-400">kWh</div>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="mt-2 px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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
