'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface HealthIncident {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  incidentType: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  symptoms: string[];
  reportedAt: any;
  status: 'Reported' | 'Under Review' | 'Treatment' | 'Resolved';
  adminNotes: string;
  followUpDate?: string;
}

const INCIDENT_TYPES = [
  { id: 'fever', label: 'Fever/Cold', emoji: '🤒' },
  { id: 'injury', label: 'Injury', emoji: '🩹' },
  { id: 'allergy', label: 'Allergy', emoji: '🤧' },
  { id: 'nutrition', label: 'Nutrition Issue', emoji: '🍎' },
  { id: 'mental', label: 'Mental Health', emoji: '🧠' },
  { id: 'other', label: 'Other', emoji: '⚕️' },
];

const SEVERITY_COLORS = {
  Low: 'border-green-500 bg-green-500/10',
  Medium: 'border-yellow-500 bg-yellow-500/10',
  High: 'border-orange-500 bg-orange-500/10',
  Critical: 'border-red-500 bg-red-500/10',
};

export default function AdminHealthIncidentsPage() {
  useAuth();
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'Reported' | 'Under Review' | 'Treatment' | 'Resolved'>('all');
  const [selectedIncident, setSelectedIncident] = useState<HealthIncident | null>(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'Reported' | 'Under Review' | 'Treatment' | 'Resolved'>('Reported');

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
      setIncidents(data.sort((a, b) => b.reportedAt?.toMillis?.() - a.reportedAt?.toMillis?.()));
    } catch (err) {
      setError('Failed to fetch health incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedIncident) return;
    try {
      setError('');
      setSuccess('');
      await updateDoc(doc(db, 'healthIncidents', selectedIncident.id), {
        status: newStatus,
        adminNotes: notes,
        lastUpdated: Timestamp.now(),
      });
      setSuccess('✅ Incident updated successfully');
      setSelectedIncident(null);
      setNotes('');
      fetchIncidents();
    } catch (err) {
      setError('Failed to update incident');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const filteredIncidents = filter === 'all' ? incidents : incidents.filter((i) => i.status === filter);

  const stats = {
    total: incidents.length,
    reported: incidents.filter((i) => i.status === 'Reported').length,
    critical: incidents.filter((i) => i.severity === 'Critical').length,
    resolved: incidents.filter((i) => i.status === 'Resolved').length,
  };

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
                  🏥 Health Incidents Dashboard
                </h1>
                <p className="text-slate-400">Monitor and manage student health reports (SDG 3)</p>
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slideInLeft">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-red-400 mb-2">{stats.total}</div>
                  <div className="text-slate-400">Total Incidents</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.reported}</div>
                  <div className="text-slate-400">Pending Review</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{stats.critical}</div>
                  <div className="text-slate-400">Critical</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.resolved}</div>
                  <div className="text-slate-400">Resolved</div>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6 flex gap-2 flex-wrap animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                {(['all', 'Reported', 'Under Review', 'Treatment', 'Resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === s
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800/50 border border-white/20 text-slate-300 hover:border-red-400/50'
                    }`}
                  >
                    {s === 'all' ? '📋 All' : s}
                  </button>
                ))}
              </div>

              {/* Incidents Table */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20 bg-slate-800/50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Student</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Severity</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Reported</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIncidents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                            No incidents found
                          </td>
                        </tr>
                      ) : (
                        filteredIncidents.map((incident) => (
                          <tr key={incident.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-white">{incident.studentName}</div>
                                <div className="text-xs text-slate-400">{incident.studentEmail}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-300">
                                {INCIDENT_TYPES.find((t) => t.id === incident.incidentType)?.emoji}{' '}
                                {incident.incidentType}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${SEVERITY_COLORS[incident.severity]}`}>
                                {incident.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                incident.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                                incident.status === 'Treatment' ? 'bg-blue-500/20 text-blue-400' :
                                incident.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {incident.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {incident.reportedAt?.toDate?.()?.toLocaleDateString?.()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedIncident(incident);
                                  setNewStatus(incident.status);
                                  setNotes(incident.adminNotes || '');
                                }}
                                className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Review Modal */}
              {selectedIncident && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-white mb-4">📋 Review Incident</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Student</label>
                        <div className="bg-slate-800/50 border border-white/20 rounded-lg p-3 text-white">
                          {selectedIncident.studentName} ({selectedIncident.studentEmail})
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <div className="bg-slate-800/50 border border-white/20 rounded-lg p-3 text-slate-300">
                          {selectedIncident.description}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Symptoms</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedIncident.symptoms?.map((symptom) => (
                            <span key={symptom} className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-xs">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as any)}
                          className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Treatment">Treatment</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Admin Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add your notes here..."
                          className="w-full bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-400 min-h-32"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleUpdateStatus}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                          ✅ Update
                        </button>
                        <button
                          onClick={() => {
                            setSelectedIncident(null);
                            setNotes('');
                          }}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
