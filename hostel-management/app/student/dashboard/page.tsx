// app/student/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRoom, setStudentStatus, getStudentStatus } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import StudentSidebar from '@/components/shared/StudentSidebar';

interface RoomDetails {
  id: string;
  roomNumber: string;
  capacity: number;
  occupants?: string[];
  [key: string]: any;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [studentStatus, setStudentStatusState] = useState<'inHostel' | 'atHome'>('inHostel');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        if (user?.roomId) {
          const roomData = await getRoom(user.roomId);
          setRoom(roomData);
        } else {
          setRoom(null);
        }

        // Load student status
        if (user?.uid) {
          const statusData = await getStudentStatus(user.uid);
          if (statusData) {
            setStudentStatusState(statusData.status);
          } else {
            // Set default status to 'inHostel' if not found
            await setStudentStatus(user.uid, user.name || 'Student', 'inHostel');
            setStudentStatusState('inHostel');
          }
        }
      } catch (err) {
        setError('Failed to fetch details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRoomDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const occupancyPercentage = room ? Math.round(((room.occupants?.length || 0) / room.capacity) * 100) : 0;
  const isRoomFull = room && (room.occupants?.length || 0) >= room.capacity;

  const handleStatusToggle = async () => {
    if (!user?.uid) return;
    
    setStatusLoading(true);
    try {
      const newStatus = studentStatus === 'inHostel' ? 'atHome' : 'inHostel';
      await setStudentStatus(user.uid, user.name || 'Student', newStatus);
      setStudentStatusState(newStatus);
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      <StudentSidebar />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fadeInUp">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 mb-3">
              Welcome, {user?.name}! 👋
            </h1>
            <p className="text-slate-300 text-lg">Your hostel dashboard at a glance</p>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Location Status Toggle Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <span className="text-3xl mr-3">{studentStatus === 'inHostel' ? '🏠' : '🏫'}</span>
                  {studentStatus === 'inHostel' ? 'In Hostel' : 'At Home'}
                </h3>
                <p className="text-slate-300">Let the admin know where you are right now</p>
              </div>
              <button
                onClick={handleStatusToggle}
                disabled={statusLoading}
                className={`relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                  studentStatus === 'inHostel'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className={`transition-all ${statusLoading ? 'opacity-0' : 'opacity-100'}`}>
                  {studentStatus === 'inHostel' ? '🏠 In Hostel' : '🏫 At Home'}
                </span>
                {statusLoading && (
                  <span className="absolute">
                    <span className="animate-spin inline-block">⏳</span>
                  </span>
                )}
              </button>
            </div>
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-slate-400">
                💡 <span className="text-slate-300">Tip:</span> Update your location status so the admin can see real-time attendance in the hostel.
              </p>
            </div>
          </div>

          {/* Room Details Card */}
          {room ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">🛏️</span>
                <div>
                  <h2 className="text-3xl font-bold text-white">Your Room Details</h2>
                  <p className="text-slate-300">Room {room.roomNumber}</p>
                </div>
              </div>

              {/* Room Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Room Number */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 p-6 hover:border-blue-300 transition-smooth">
                  <div className="relative z-10">
                    <p className="text-slate-300 text-sm font-medium mb-2">Room Number</p>
                    <p className="text-3xl font-bold text-blue-300 group-hover:animate-float">{room.roomNumber}</p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 p-6 hover:border-green-300 transition-smooth">
                  <div className="relative z-10">
                    <p className="text-slate-300 text-sm font-medium mb-2">Capacity</p>
                    <p className="text-3xl font-bold text-green-300 group-hover:animate-float">{room.capacity}</p>
                  </div>
                </div>

                {/* Current Occupants */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-400/30 p-6 hover:border-pink-300 transition-smooth">
                  <div className="relative z-10">
                    <p className="text-slate-300 text-sm font-medium mb-2">Your Room Mates</p>
                    <p className="text-3xl font-bold text-pink-300 group-hover:animate-float">{room.occupants?.length || 0}</p>
                  </div>
                </div>

                {/* Status */}
                <div className={`group relative overflow-hidden rounded-xl border p-6 transition-smooth ${isRoomFull ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30 hover:border-red-300' : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-400/30 hover:border-emerald-300'}`}>
                  <div className="relative z-10">
                    <p className="text-slate-300 text-sm font-medium mb-2">Status</p>
                    <p className={`text-lg font-bold ${isRoomFull ? 'text-red-300' : 'text-emerald-300'}`}>
                      {isRoomFull ? '🔴 Full' : '🟢 Available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-purple-300">{occupancyPercentage}%</p>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      occupancyPercentage <= 50
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : occupancyPercentage <= 75
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 animate-fadeInUp border-2 border-orange-400/50">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-4">📌</span>
                <h2 className="text-2xl font-bold text-orange-300">Room Not Assigned Yet</h2>
              </div>
              <p className="text-slate-300 mb-4">You haven't been assigned a room yet. Contact the admin for room assignment.</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <p className="text-orange-300 text-sm">Waiting for admin assignment...</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">⚡</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* File Complaint */}
              <a
                href="/student/complaints"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredAction('complaint')}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className={`text-4xl mb-2 transition-transform ${hoveredAction === 'complaint' ? 'animate-float' : ''}`}>⚠️</p>
                  <p className="font-bold text-lg">File Complaint</p>
                  <p className="text-xs text-blue-100 mt-2">Report any issues</p>
                </div>
              </a>

              {/* View Announcements */}
              <a
                href="/student/announcements"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredAction('announcements')}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className={`text-4xl mb-2 transition-transform ${hoveredAction === 'announcements' ? 'animate-float' : ''}`}>📢</p>
                  <p className="font-bold text-lg">Announcements</p>
                  <p className="text-xs text-purple-100 mt-2">Latest updates</p>
                </div>
              </a>

              {/* View Meals */}
              <a
                href="/student/meals"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredAction('meals')}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className={`text-4xl mb-2 transition-transform ${hoveredAction === 'meals' ? 'animate-float' : ''}`}>🍴</p>
                  <p className="font-bold text-lg">View Meals</p>
                  <p className="text-xs text-green-100 mt-2">Daily menu</p>
                </div>
              </a>

              {/* Institute Lunch Booking */}
              <a
                href="/student/meals/institute"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-6 text-white transform transition-smooth hover:scale-105 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredAction('institute')}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className={`text-4xl mb-2 transition-transform ${hoveredAction === 'institute' ? 'animate-float' : ''}`}>🏫</p>
                  <p className="font-bold text-lg">Institute Lunch</p>
                  <p className="text-xs text-teal-100 mt-2">Book lunch at college</p>
                </div>
              </a>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {/* Transport Section */}
            <div className="glass-card rounded-2xl p-6 group hover:shadow-2xl transition-smooth">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3 group-hover:animate-float">🚗</span>
                <h3 className="text-xl font-bold text-white">Transport</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">Book your transport for trips and travels</p>
              <a
                href="/student/transport"
                className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-smooth"
              >
                Book Now →
              </a>
            </div>

            {/* Community Section */}
            <div className="glass-card rounded-2xl p-6 group hover:shadow-2xl transition-smooth">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3 group-hover:animate-float">💬</span>
                <h3 className="text-xl font-bold text-white">Community</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">Connect with other students and share your thoughts</p>
              <a
                href="/student/community"
                className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-smooth"
              >
                Explore →
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
