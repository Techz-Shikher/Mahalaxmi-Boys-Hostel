// app/admin/meals/institute-bookings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AdminSidebar from '@/components/shared/AdminSidebar';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface InstituteBooking {
  id: string;
  studentName: string;
  email: string;
  university: string;
  mealType: string;
  date: string;
  status: string;
  bookedAt: string;
  userId: string;
}

interface UniversityGroup {
  university: string;
  bookings: InstituteBooking[];
  totalBookings: number;
}

export default function InstituteBookingsPage() {
  const [allBookings, setAllBookings] = useState<InstituteBooking[]>([]);
  const [groupedBookings, setGroupedBookings] = useState<UniversityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [universities, setUniversities] = useState<string[]>([]);

  useEffect(() => {
    fetchInstituteBookings();
  }, []);

  useEffect(() => {
    groupBookingsByUniversity();
  }, [allBookings, selectedUniversity]);

  const fetchInstituteBookings = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'instituteBookings'));
      const querySnapshot = await getDocs(q);

      const bookings: InstituteBooking[] = [];
      const uniqueUniversities = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          studentName: data.studentName || 'Unknown',
          email: data.email || '',
          university: data.university || 'Not Specified',
          mealType: data.mealType || 'Unknown',
          date: formatDate(data.date),
          status: data.status || 'pending',
          bookedAt: formatDateTime(data.bookedAt),
          userId: data.userId || '',
        });
        uniqueUniversities.add(data.university || 'Not Specified');
      });

      setAllBookings(bookings);
      setUniversities(Array.from(uniqueUniversities).sort());
    } catch (err) {
      setError('Failed to fetch institute bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return 'Unknown';
    if (typeof date === 'string') return date;
    if (date.toDate) return date.toDate().toISOString().split('T')[0];
    return 'Unknown';
  };

  const formatDateTime = (date: any): string => {
    if (!date) return 'Unknown';
    if (typeof date === 'string') return date;
    if (date.toDate) {
      const d = date.toDate();
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
    return 'Unknown';
  };

  const groupBookingsByUniversity = () => {
    let bookingsToGroup = allBookings;

    if (selectedUniversity !== 'all') {
      bookingsToGroup = allBookings.filter((b) => b.university === selectedUniversity);
    }

    // Group by university
    const groupMap = new Map<string, InstituteBooking[]>();
    bookingsToGroup.forEach((booking) => {
      if (!groupMap.has(booking.university)) {
        groupMap.set(booking.university, []);
      }
      groupMap.get(booking.university)!.push(booking);
    });

    // Convert to array and sort by university name
    const grouped: UniversityGroup[] = Array.from(groupMap.entries())
      .map(([university, bookings]) => ({
        university,
        bookings: bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        totalBookings: bookings.length,
      }))
      .sort((a, b) => a.university.localeCompare(b.university));

    setGroupedBookings(grouped);
  };

  const getMealEmoji = (mealType: string): string => {
    const type = mealType.toLowerCase();
    if (type.includes('break')) return '🥐';
    if (type.includes('lunch')) return '🍛';
    if (type.includes('snack')) return '🍪';
    if (type.includes('dinner')) return '🍖';
    return '🍽️';
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalBookings = allBookings.length;
  const confirmedBookings = allBookings.filter((b) => b.status.toLowerCase() === 'confirmed').length;
  const pendingBookings = allBookings.filter((b) => b.status.toLowerCase() === 'pending').length;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-teal-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              🏫 Institute Lunch Bookings
            </h1>
            <p className="text-slate-400">View student meal bookings organized by university</p>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} />}

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            {/* Total Bookings */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-teal-400">{totalBookings}</p>
                </div>
                <div className="text-4xl opacity-20">📦</div>
              </div>
            </div>

            {/* Confirmed */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Confirmed</p>
                  <p className="text-3xl font-bold text-green-400">{confirmedBookings}</p>
                </div>
                <div className="text-4xl opacity-20">✓</div>
              </div>
            </div>

            {/* Pending */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">{pendingBookings}</p>
                </div>
                <div className="text-4xl opacity-20">⏳</div>
              </div>
            </div>

            {/* Universities */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Universities</p>
                  <p className="text-3xl font-bold text-cyan-400">{universities.length}</p>
                </div>
                <div className="text-4xl opacity-20">🎓</div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-8 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
              <label className="text-slate-300 text-sm font-medium mb-3 block">
                Filter by University:
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full md:w-64 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-slate-100 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              >
                <option value="all" className="bg-slate-900">All Universities</option>
                {universities.map((uni) => (
                  <option key={uni} value={uni} className="bg-slate-900">
                    {uni}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookings by University */}
          <div className="space-y-6">
            {groupedBookings.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
                <p className="text-slate-400">No bookings found</p>
              </div>
            ) : (
              groupedBookings.map((group, idx) => (
                <div
                  key={group.university}
                  className="animate-slideInLeft"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
                    {/* University Header */}
                    <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-b border-white/20 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-teal-400 mb-1">
                            🏫 {group.university}
                          </h2>
                          <p className="text-slate-400 text-sm">
                            {group.totalBookings} booking{group.totalBookings !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Meal</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Booked At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {group.bookings.map((booking) => (
                            <tr
                              key={booking.id}
                              className="hover:bg-white/5 transition-colors duration-200"
                            >
                              <td className="px-6 py-4 text-sm text-slate-100 font-medium">
                                {booking.studentName}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                {booking.email}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-100">
                                <span className="text-lg">{getMealEmoji(booking.mealType)}</span>{' '}
                                {booking.mealType}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">
                                {booking.date}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                {booking.bookedAt}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
