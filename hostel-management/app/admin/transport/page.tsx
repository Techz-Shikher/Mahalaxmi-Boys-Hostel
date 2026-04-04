// app/admin/transport/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getTransportBookings, updateTransportBooking, createTransportBooking, type TransportBooking } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function TransportAdminPage() {
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getTransportBookings();
      setBookings(data || []);
    } catch (err) {
      setError('Failed to fetch transport bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.destination || !formData.date) {
      setError('All fields are required');
      return;
    }

    try {
      await createTransportBooking({
        ...formData,
        userId: 'admin',
        userName: 'Admin Transport',
      });
      setSuccess('Transport route created successfully');
      setFormData({ destination: '', date: '' });
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      setError('Failed to create transport route');
      console.error(err);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setError('');
      setSuccess('');
      await updateTransportBooking(bookingId, { status: newStatus });
      setSuccess('Booking status updated');
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const approvedBookings = bookings.filter((b) => b.status === 'Approved');
  const stats = {
    total: bookings.length,
    pending: pendingBookings.length,
    approved: approvedBookings.length,
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background - orange theme */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-amber-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-red-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-red-400 bg-clip-text text-transparent mb-2">
              🚗 Transport Management
            </h1>
            <p className="text-slate-400">Manage transportation requests and routes</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            {/* Total Bookings */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Bookings</p>
                  <p className="text-4xl font-bold text-orange-400">{stats.total}</p>
                </div>
                <div className="text-5xl opacity-20">📊</div>
              </div>
            </div>

            {/* Pending */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pending</p>
                  <p className="text-4xl font-bold text-amber-400">{stats.pending}</p>
                </div>
                <div className="text-5xl opacity-20">⏳</div>
              </div>
            </div>

            {/* Approved */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Approved</p>
                  <p className="text-4xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <div className="text-5xl opacity-20">✅</div>
              </div>
            </div>
          </div>

          {/* Create Route Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🛣️</span> Create Transport Route
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                {showForm ? '✕ Cancel' : '➕ Add Route'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Destination</label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
                      placeholder="e.g., Railway Station, Airport"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20"
                >
                  🚗 Create Route
                </button>
              </form>
            )}
          </div>

          {/* Pending Bookings */}
          <div className="mb-8 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>⏳</span> Pending Bookings ({pendingBookings.length})
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {pendingBookings.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No pending bookings</p>
                ) : (
                  pendingBookings.map((booking, idx) => (
                    <div 
                      key={booking.id} 
                      className="backdrop-blur-sm bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 hover:bg-amber-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${0.35 + (idx * 0.05)}s both`
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">🚗 {booking.destination}</h3>
                          <p className="text-sm text-slate-300 mt-1">👤 {booking.userName}</p>
                          <p className="text-sm text-slate-300">📅 {booking.date}</p>
                          {booking.time && (
                            <p className="text-sm text-orange-300 mt-1">⏰ {booking.time}</p>
                          )}
                        </div>
                        <span className="bg-amber-500/30 text-amber-300 px-3 py-1 rounded-lg text-xs font-semibold border border-amber-500/50 whitespace-nowrap ml-4">
                          Pending
                        </span>
                      </div>
                      <button
                        onClick={() => handleStatusChange(booking.id, 'Approved')}
                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-4 py-2 rounded-lg transition-all duration-300 font-semibold"
                      >
                        ✓ Approve
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Approved Bookings - Table View */}
          <div className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-green-500/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>✅</span> Approved Bookings ({approvedBookings.length})
                  </h2>
                  <span className="text-sm text-green-300 bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
                    Ready for Transport
                  </span>
                </div>
              </div>
              
              {approvedBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">No approved bookings yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left px-6 py-4 font-semibold text-slate-300 text-sm">👤 Student Name</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-300 text-sm">📍 Destination</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-300 text-sm">🚀 Arrival Time</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-300 text-sm">🚗 Departure Time</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-300 text-sm">📅 Date</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-300 text-sm">Status</th>
                      </tr>
                    </thead>
                    
                    {/* Table Body */}
                    <tbody>
                      {approvedBookings.map((booking, idx) => {
                        // Parse arrival and departure times
                        let arrivalTime = 'N/A';
                        let departureTime = 'N/A';
                        
                        if (booking.time && booking.time.includes('Arrival')) {
                          const timeParts = booking.time.split('|');
                          arrivalTime = timeParts[0]?.replace('Arrival:', '').trim() || 'N/A';
                          departureTime = timeParts[1]?.replace('Departure:', '').trim() || 'N/A';
                        }
                        
                        return (
                          <tr 
                            key={booking.id}
                            className="border-b border-white/5 hover:bg-green-500/10 transition-colors duration-200"
                            style={{
                              animation: `fadeInUp 0.5s ease-out ${0.45 + (idx * 0.05)}s both`
                            }}
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">👤</span>
                                {booking.userName}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <div className="flex items-center gap-2">
                                <span>📍</span>
                                {booking.destination}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap">
                                🚀 {arrivalTime}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-orange-500/20 border border-orange-500/30 text-orange-300 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap">
                                🚗 {departureTime}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {booking.date}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/50 inline-block">
                                ✓ APPROVED
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Table Footer Stats */}
              {approvedBookings.length > 0 && (
                <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-slate-300">
                      <span className="text-xs text-slate-400">Total Approved</span>
                      <p className="text-lg font-bold text-green-300">{approvedBookings.length} bookings</p>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-xs text-slate-400">Ready for Queue</span>
                      <p className="text-lg font-bold text-blue-300">✓ All Set</p>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-xs text-slate-400">Last Updated</span>
                      <p className="text-lg font-bold text-orange-300">Just now</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
