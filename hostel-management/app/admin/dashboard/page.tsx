// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRooms, getComplaints, subscribeToAllStatuses } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface DashboardStats {
  totalRooms: number;
  totalStudents: number;
  totalComplaints: number;
  pendingComplaints: number;
  inHostel: number;
  atHome: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    totalStudents: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    inHostel: 0,
    atHome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const rooms = await getRooms();
        const complaints = await getComplaints();

        const totalStudents = rooms.reduce((sum, room) => sum + (room.occupants?.length || 0), 0);
        const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;

        setStats((prevStats) => ({
          ...prevStats,
          totalRooms: rooms.length,
          totalStudents,
          totalComplaints: complaints.length,
          pendingComplaints,
        }));

        // Subscribe to real-time status updates
        const unsubscribe = subscribeToAllStatuses((statuses) => {
          const inHostelCount = statuses.filter((s) => s.status === 'inHostel').length;
          const atHomeCount = statuses.filter((s) => s.status === 'atHome').length;

          setStats((prevStats) => ({
            ...prevStats,
            inHostel: inHostelCount,
            atHome: atHomeCount,
          }));
        });

        setLoading(false);
        return unsubscribe;
      } catch (err) {
        setError('Failed to fetch statistics');
        console.error(err);
        setLoading(false);
      }
    };

    let unsubscribe: any;
    fetchStats().then((unsub) => {
      unsubscribe = unsub;
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.totalStudents / (stats.totalRooms * 4)) * 100) : 0;
  const resolutionRate = stats.totalComplaints > 0 ? Math.round(((stats.totalComplaints - stats.pendingComplaints) / stats.totalComplaints) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fadeInUp">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-300 text-lg">Welcome back, <span className="font-semibold text-purple-300">{user?.name}</span>! 👋</p>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
            {/* Total Rooms Card */}
            <div
              className="animate-fadeInUp group lg:col-span-3 md:col-span-2"
              style={{ animationDelay: '0.1s' }}
              onMouseEnter={() => setHoveredCard('rooms')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="glass-card rounded-2xl p-8 transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl group-hover:animate-float">🛏️</span>
                    {hoveredCard === 'rooms' && <div className="animate-pulse-glow w-12 h-12 rounded-full bg-blue-400/30"></div>}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Total Rooms</p>
                  <p className="text-4xl font-bold text-blue-300 mt-2">{stats.totalRooms}</p>
                  <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Students Card */}
            <div
              className="animate-fadeInUp group lg:col-span-3 md:col-span-2"
              style={{ animationDelay: '0.2s' }}
              onMouseEnter={() => setHoveredCard('students')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="glass-card rounded-2xl p-8 transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl group-hover:animate-float">👥</span>
                    {hoveredCard === 'students' && <div className="animate-pulse-glow w-12 h-12 rounded-full bg-green-400/30"></div>}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Total Students</p>
                  <p className="text-4xl font-bold text-green-300 mt-2">{stats.totalStudents}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Occupancy</p>
                    <p className="text-sm font-semibold text-green-300">{occupancyRate}%</p>
                  </div>
                  <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* In Hostel Status Card - NEW */}
            <div
              className="animate-fadeInUp group"
              style={{ animationDelay: '0.3s' }}
              onMouseEnter={() => setHoveredCard('inHostel')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="glass-card rounded-2xl p-8 transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:animate-float">🏠</span>
                    {hoveredCard === 'inHostel' && <div className="animate-pulse-glow w-10 h-10 rounded-full bg-emerald-400/30"></div>}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">In Hostel</p>
                  <p className="text-3xl font-bold text-emerald-300 mt-2">{stats.inHostel}</p>
                  <div className="mt-3 text-xs text-slate-400">
                    <p>Real-time status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* At Home Status Card - NEW */}
            <div
              className="animate-fadeInUp group"
              style={{ animationDelay: '0.4s' }}
              onMouseEnter={() => setHoveredCard('atHome')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="glass-card rounded-2xl p-8 transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:animate-float">🏫</span>
                    {hoveredCard === 'atHome' && <div className="animate-pulse-glow w-10 h-10 rounded-full bg-blue-400/30"></div>}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">At Home</p>
                  <p className="text-3xl font-bold text-blue-300 mt-2">{stats.atHome}</p>
                  <div className="mt-3 text-xs text-slate-400">
                    <p>Real-time status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Complaints Card */}
            <div
              className="animate-fadeInUp group"
              style={{ animationDelay: '0.5s' }}
              onMouseEnter={() => setHoveredCard('complaints')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="glass-card rounded-2xl p-8 transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:animate-float">⚠️</span>
                    {hoveredCard === 'complaints' && <div className="animate-pulse-glow w-10 h-10 rounded-full bg-orange-400/30"></div>}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Total Complaints</p>
                  <p className="text-3xl font-bold text-orange-300 mt-2">{stats.totalComplaints}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Resolution</p>
                    <p className="text-xs font-semibold text-orange-300">{resolutionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Complaints Card */}
            <div
              className="animate-fadeInUp group"
              style={{ animationDelay: '0.6s' }}
              onMouseEnter={() => setHoveredCard('pending')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="glass-card rounded-2xl p-8 transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:animate-float">📌</span>
                    {hoveredCard === 'pending' && <div className="animate-pulse-glow w-10 h-10 rounded-full bg-red-400/30"></div>}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-red-300 mt-2">{stats.pendingComplaints}</p>
                  <div className="mt-3">
                    <p className={`text-xs font-semibold ${stats.pendingComplaints > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {stats.pendingComplaints > 0 ? '⚡ Attention' : '✓ Clear'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">⚡</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/admin/rooms"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">➕</p>
                  <p className="font-bold text-lg text-white">Add Room</p>
                  <p className="text-sm text-white/80 mt-2">Create new room</p>
                </div>
              </a>
              <a
                href="/admin/rooms"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">👤</p>
                  <p className="font-bold text-lg text-white">Assign Student</p>
                  <p className="text-sm text-white/80 mt-2">Allocate room</p>
                </div>
              </a>
              <a
                href="/admin/complaints"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">⚠️</p>
                  <p className="font-bold text-lg text-white">View Complaints</p>
                  <p className="text-sm text-white/80 mt-2">Manage issues</p>
                </div>
              </a>
              <a
                href="/admin/announcements"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">📢</p>
                  <p className="font-bold text-lg text-white">Post Notice</p>
                  <p className="text-sm text-white/80 mt-2">Send announcement</p>
                </div>
              </a>
              <a
                href="/admin/meals/analytics"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">📊</p>
                  <p className="font-bold text-lg text-white">Food Analytics</p>
                  <p className="text-sm text-white/80 mt-2">Booking insights</p>
                </div>
              </a>
              <a
                href="/admin/meals/manage-menu"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">📋</p>
                  <p className="font-bold text-lg text-white">Manage Menu</p>
                  <p className="text-sm text-white/80 mt-2">Weekly meal plan</p>
                </div>
              </a>
              <a
                href="/admin/meals/institute-bookings"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-3xl mb-2 group-hover:animate-float">🏫</p>
                  <p className="font-bold text-lg text-white">Institute Bookings</p>
                  <p className="text-sm text-white/80 mt-2">Lunch deliveries by university</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
