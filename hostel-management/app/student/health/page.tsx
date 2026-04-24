'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import StudentSidebar from '@/components/shared/StudentSidebar';

interface HealthIncident {
  id: string;
  incidentType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Under Review' | 'Treatment' | 'Resolved';
  description: string;
  reportedAt: any;
  adminNotes?: string;
}

const INCIDENT_TYPES = [
  { id: 'fever', label: 'Fever/Cold', emoji: '🤒' },
  { id: 'injury', label: 'Injury', emoji: '🩹' },
  { id: 'allergy', label: 'Allergy', emoji: '🤧' },
  { id: 'nutrition', label: 'Nutrition Issue', emoji: '🍎' },
  { id: 'mental', label: 'Mental Health', emoji: '🧠' },
  { id: 'other', label: 'Other', emoji: '⚕️' },
];

const SYMPTOMS = [
  'Fever', 'Cough', 'Sore Throat', 'Headache', 'Body Ache',
  'Fatigue', 'Nausea', 'Diarrhea', 'Rash', 'Shortness of Breath'
];

export default function StudentHealthProfilePage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  const [formData, setFormData] = useState({
    incidentType: '',
    severity: 'Medium' as const,
    symptoms: [] as string[],
    description: '',
  });

  useEffect(() => {
    fetchIncidents();
  }, [user?.uid]);

  const fetchIncidents = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'healthIncidents'), where('studentId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HealthIncident[];
      setIncidents(data.sort((a, b) => b.reportedAt?.toMillis?.() - a.reportedAt?.toMillis?.()));
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.incidentType || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'healthIncidents'), {
        studentId: user?.uid,
        studentName: user?.name,
        studentEmail: user?.email,
        incidentType: formData.incidentType,
        severity: formData.severity,
        symptoms: formData.symptoms,
        description: formData.description,
        status: 'Reported',
        reportedAt: Timestamp.now(),
        adminNotes: '',
      });
      setSuccess('✅ Health incident reported successfully! Admin will review shortly.');
      setFormData({
        incidentType: '',
        severity: 'Medium',
        symptoms: [],
        description: '',
      });
      setShowReportForm(false);
      fetchIncidents();
    } catch (err) {
      setError('Failed to report incident');
      console.error(err);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  if (loading) return <LoadingSpinner />;

  const stats = {
    total: incidents.length,
    resolved: incidents.filter((i) => i.status === 'Resolved').length,
    pending: incidents.filter((i) => i.status === 'Reported').length,
    critical: incidents.filter((i) => i.severity === 'Critical').length,
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-red-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-pink-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10 p-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8 animate-fadeInUp">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  🏥 My Health Profile
                </h1>
                <p className="text-slate-400">Track your health and wellness</p>
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slideInLeft">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-red-400 mb-2">{stats.total}</div>
                  <div className="text-slate-400">Total Reports</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
                  <div className="text-slate-400">Pending Review</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{stats.critical}</div>
                  <div className="text-slate-400">Critical Cases</div>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.resolved}</div>
                  <div className="text-slate-400">Resolved</div>
                </div>
              </div>

              {/* Report Button */}
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="mb-8 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 animate-slideInLeft"
              >
                📋 {showReportForm ? 'Cancel' : 'Report Health Issue'}
              </button>

              {/* Report Form */}
              {showReportForm && (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft">
                  <h2 className="text-2xl font-bold text-white mb-6">Report Health Issue</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Incident Type *</label>
                      <select
                        value={formData.incidentType}
                        onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                        className="w-full bg-slate-800/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                        required
                      >
                        <option value="">Select incident type...</option>
                        {INCIDENT_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.emoji} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Severity Level</label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                        className="w-full bg-slate-800/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🟠 High</option>
                        <option value="Critical">🔴 Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Symptoms (Select all that apply)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SYMPTOMS.map((symptom) => (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                              formData.symptoms.includes(symptom)
                                ? 'border-red-400 bg-red-500/20 text-white'
                                : 'border-white/20 bg-slate-800/50 text-slate-300 hover:border-red-400/50'
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your health issue in detail..."
                        className="w-full bg-slate-800/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 min-h-24"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                    >
                      ✅ Submit Report
                    </button>
                  </form>
                </div>
              )}

              {/* Incidents List */}
              <div className="space-y-4 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold text-white mb-4">📋 Your Health Reports</h2>
                {incidents.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
                    <p className="text-slate-400">No health reports yet</p>
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <div key={incident.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-red-400/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <div className="text-lg font-semibold text-white mb-1">
                            {INCIDENT_TYPES.find((t) => t.id === incident.incidentType)?.emoji} {incident.incidentType}
                          </div>
                          <div className="text-sm text-slate-400">
                            {incident.reportedAt?.toDate?.()?.toLocaleDateString?.()}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            incident.severity === 'Low' ? 'border-green-500 bg-green-500/10 text-green-400' :
                            incident.severity === 'Medium' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' :
                            incident.severity === 'High' ? 'border-orange-500 bg-orange-500/10 text-orange-400' :
                            'border-red-500 bg-red-500/10 text-red-400'
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
                      <p className="text-slate-300 mb-3">{incident.description}</p>
                      {incident.adminNotes && (
                        <div className="bg-slate-800/50 border-l-4 border-red-500 p-4 rounded">
                          <div className="text-sm font-semibold text-slate-300 mb-1">Admin Notes:</div>
                          <p className="text-slate-400 text-sm">{incident.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Wellness Tips */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mt-8 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-bold text-white mb-4">💡 Wellness Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">🛏️</span>
                    <div>
                      <div className="font-semibold text-white">Get enough sleep</div>
                      <div className="text-sm text-slate-400">Aim for 7-8 hours daily</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🏃</span>
                    <div>
                      <div className="font-semibold text-white">Exercise regularly</div>
                      <div className="text-sm text-slate-400">30 mins of activity daily</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🥗</span>
                    <div>
                      <div className="font-semibold text-white">Eat balanced meals</div>
                      <div className="text-sm text-slate-400">Include fruits & vegetables</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">💧</span>
                    <div>
                      <div className="font-semibold text-white">Stay hydrated</div>
                      <div className="text-sm text-slate-400">Drink 2-3 liters daily</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
