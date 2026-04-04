// app/student/meals/institute/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SuccessMessage from '@/components/shared/SuccessMessage';
import ErrorMessage from '@/components/shared/ErrorMessage';
import StudentSidebar from '@/components/shared/StudentSidebar';

interface InstituteBooking {
  id: string;
  university: string;
  mealType: string;
  date: string;
  status: string;
  bookedAt: string;
}

const MEAL_TYPES = [
  { label: 'Breakfast', emoji: '🥐', value: 'Breakfast' },
  { label: 'Lunch', emoji: '🍛', value: 'Lunch' },
  { label: 'Snacks', emoji: '🍪', value: 'Snacks' },
  { label: 'Dinner', emoji: '🍖', value: 'Dinner' },
];

const UNIVERSITIES = [
  'Galgotias University',
  'GCET',
  'United',
  'NIET',
  'Innovative',
  'lloyd',
  'G.L Bajaj',
  'DTC',
  'IIMT',
  'KCC',
];

export default function InstituteBookingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookings, setBookings] = useState<InstituteBooking[]>([]);

  const [formData, setFormData] = useState({
    university: '',
    mealType: 'Lunch',
  });

  useEffect(() => {
    if (user) {
      fetchInstituteBookings();
    } else {
      setFetching(false);
    }
  }, [user]);

  const fetchInstituteBookings = async () => {
    try {
      setFetching(true);
      const q = query(
        collection(db, 'instituteBookings'),
        where('userId', '==', user?.uid || '')
      );
      const querySnapshot = await getDocs(q);
      const bookingsList: InstituteBooking[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookingsList.push({
          id: doc.id,
          university: data.university,
          mealType: data.mealType,
          date: typeof data.date === 'string' ? data.date : data.date?.toDate?.()?.toISOString?.()?.split('T')[0] || 'Unknown',
          status: data.status,
          bookedAt: typeof data.bookedAt === 'string' 
            ? data.bookedAt 
            : data.bookedAt?.toDate?.()?.toLocaleString() || 'Unknown',
        });
      });

      setBookings(bookingsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch your bookings');
    } finally {
      setFetching(false);
    }
  };

  const getNextDayDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.university.trim()) {
      setError('Please select your university/institute');
      return;
    }

    try {
      setLoading(true);

      const nextDay = getNextDayDate();

      await addDoc(collection(db, 'instituteBookings'), {
        userId: user?.uid,
        email: user?.email,
        studentName: user?.name,
        university: formData.university.trim(),
        mealType: 'Lunch',
        date: nextDay,
        status: 'confirmed',
        bookedAt: serverTimestamp(),
      });

      setSuccess(`✓ Lunch booked at ${formData.university} for tomorrow!`);
      setFormData({ university: '', mealType: 'Lunch' });
      
      // Refresh bookings list
      setTimeout(() => {
        fetchInstituteBookings();
      }, 1000);
    } catch (err) {
      console.error('Error booking:', err);
      setError('Failed to book lunch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMealEmoji = (mealType: string): string => {
    const meal = MEAL_TYPES.find((m) => m.value === mealType);
    return meal?.emoji || '🍽️';
  };

  if (fetching) return <LoadingSpinner />;

  const nextDay = getNextDayDate();
  const tomorrow = new Date(nextDay);
  const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-teal-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              🏫 Institute Lunch Booking
            </h1>
            <p className="text-slate-400">Book your lunch to be delivered at your college/university</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Booking Form */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 animate-slideInLeft">
            <h2 className="text-2xl font-bold text-white mb-6">📍 Book Your Lunch</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* University/Institute Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-3">
                  Select Your University/Institute
                </label>
                <select
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-slate-100 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                  required
                >
                  <option value="" className="bg-slate-900">-- Select University --</option>
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni} className="bg-slate-900">
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Date Info */}
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-cyan-300 text-sm mb-1">📅 Booking for:</p>
                <p className="text-cyan-100 font-semibold text-lg">
                  {dayName}, {tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-cyan-300 text-sm mt-2">🍛 Lunch</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  loading
                    ? 'bg-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? 'Booking...' : '✓ Confirm Booking'}
              </button>
            </form>
          </div>

          {/* My Bookings Section */}
          <div className="animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-white mb-6">📋 Your Institute Bookings</h2>

            {bookings.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
                <p className="text-slate-400 mb-2">No bookings yet</p>
                <p className="text-slate-500 text-sm">Book your first institute lunch above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{getMealEmoji(booking.mealType)}</span>
                          <div>
                            <h3 className="text-lg font-bold text-white">{booking.university}</h3>
                            <p className="text-sm text-slate-400">
                              {booking.mealType} • {booking.date}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : booking.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}
                        >
                          {booking.status === 'confirmed' ? '✓' : booking.status === 'pending' ? '⏳' : '○'} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Booked: {booking.bookedAt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }
      `}</style>
    </div>
      </main>
    </div>
  );
}
