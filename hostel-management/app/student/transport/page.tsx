// app/student/transport/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTransportBookings, createTransportBooking, type TransportBooking } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import StudentSidebar from '@/components/shared/StudentSidebar';

const DESTINATIONS = [
  {
    id: 'galgotias',
    name: 'Galgotias University',
    emoji: '🏫',
    goingTimes: ['8:00 AM', '9:00 AM', '11:30 AM'],
    departureTimes: ['1:30 PM', '3:50 PM', '5:20 PM'],
  },
  {
    id: 'local',
    name: 'Local',
    emoji: '🏘️',
    goingTimes: ['7:00 AM', '9:00 AM'],
    departureTimes: ['5:00 PM', '6:30 PM'],
  },
];

export default function StudentTransportPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    destination: '',
    arrivalTime: '',
    departureTime: '',
    date: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getTransportBookings(user?.uid);
      setBookings(data || []);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.destination || !formData.arrivalTime || !formData.departureTime || !formData.date) {
      setError('Please select destination, arrival time, departure time, and date');
      return;
    }

    try {
      await createTransportBooking({
        destination: formData.destination,
        time: `Arrival: ${formData.arrivalTime} | Departure: ${formData.departureTime}`,
        date: formData.date,
        userId: user?.uid,
        userName: user?.name,
      });
      setSuccess(`✅ Transport booked! Arrival: ${formData.arrivalTime} | Departure: ${formData.departureTime}`);
      setFormData({ destination: '', arrivalTime: '', departureTime: '', date: '' });
      setSelectedDestination(null);
      fetchBookings();
    } catch (err) {
      setError('Failed to create booking');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const approvedBookings = bookings.filter((b) => b.status === 'Approved');
  
  const selectedDestinationData = selectedDestination 
    ? DESTINATIONS.find((d) => d.id === selectedDestination)
    : null;

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-amber-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
              🚗 Transport Bookings
            </h1>
            <p className="text-slate-400">Choose your destination and time</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-white mb-6">Book Transport</h2>

            {/* Destination Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-4">Select Destination</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DESTINATIONS.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      setSelectedDestination(dest.id);
                      setFormData({ 
                        destination: dest.name, 
                        arrivalTime: '', 
                        departureTime: '', 
                        date: formData.date 
                      });
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedDestination === dest.id
                        ? 'border-orange-400 bg-orange-500/20'
                        : 'border-white/20 bg-slate-800/50 hover:border-orange-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dest.emoji}</span>
                      <div>
                        <div className="font-semibold text-white">{dest.name}</div>
                        <div className="text-xs text-slate-400">Fixed schedule</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection for Going/Departure */}
            {selectedDestinationData && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">🚀 Arrival Time (Going)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedDestinationData.goingTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, arrivalTime: time })}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.arrivalTime === time
                            ? 'border-green-400 bg-green-500/20 text-white'
                            : 'border-white/20 bg-slate-800/50 text-slate-300 hover:border-green-400/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">🚗 Departure Time (Return)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedDestinationData.departureTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, departureTime: time })}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.departureTime === time
                            ? 'border-orange-400 bg-orange-500/20 text-white'
                            : 'border-white/20 bg-slate-800/50 text-slate-300 hover:border-orange-400/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">📅 Travel Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                    required
                  />
                </div>

                {formData.arrivalTime && formData.departureTime && (
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-orange-500/10 border border-green-500/30 rounded-xl">
                    <div className="text-slate-300 space-y-2">
                      <p className="font-semibold text-white">✅ Your Trip Summary</p>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">🚀 Arrival:</span>
                        <span className="font-medium">{formData.arrivalTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">🚗 Departure:</span>
                        <span className="font-medium">{formData.departureTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/10">
                        <span className="text-blue-400">📅 Date:</span>
                        <span>{new Date(formData.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!formData.arrivalTime || !formData.departureTime || !formData.date}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Request Booking
                </button>
              </form>
            )}
          </div>

          <div className="space-y-8 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            {/* Pending Bookings */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>⏳</span> Pending ({pendingBookings.length})
              </h2>
              {pendingBookings.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
                  <p className="text-slate-400">No pending bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking, idx) => (
                    <div 
                      key={booking.id} 
                      className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 hover:bg-yellow-500/20 transition-all"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${0.2 + (idx * 0.05)}s both`
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">🚗 {booking.destination}</h3>
                          {booking.time && (
                            <div className="mt-3 space-y-2">
                              {booking.time.includes('Arrival') ? (
                                <>
                                  <p className="text-sm text-green-300">🚀 {booking.time.split('|')[0].trim()}</p>
                                  <p className="text-sm text-orange-300">🚗 {booking.time.split('|')[1]?.trim() || 'TBD'}</p>
                                </>
                              ) : (
                                <p className="text-sm text-slate-300">⏰ {booking.time}</p>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-slate-400 mt-2">📆 {new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                        <span className="inline-block bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-4">Awaiting approval</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Bookings */}
            {approvedBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>✅</span> Approved ({approvedBookings.length})
                </h2>
                <div className="space-y-4">
                  {approvedBookings.map((booking, idx) => (
                    <div 
                      key={booking.id} 
                      className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-2xl p-6 hover:bg-green-500/20 transition-all"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${0.3 + (idx * 0.05)}s both`
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">🚗 {booking.destination}</h3>
                          {booking.time && (
                            <div className="mt-3 space-y-2">
                              {booking.time.includes('Arrival') ? (
                                <>
                                  <p className="text-sm text-green-300">🚀 {booking.time.split('|')[0].trim()}</p>
                                  <p className="text-sm text-orange-300">🚗 {booking.time.split('|')[1]?.trim() || 'TBD'}</p>
                                </>
                              ) : (
                                <p className="text-sm text-slate-300">⏰ {booking.time}</p>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-slate-400 mt-2">📆 {new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                        <span className="inline-block bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-4">✓ Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
