// app/admin/rooms/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom, getStudentByEmail, updateUser, type Room } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assigningStudent, setAssigningStudent] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: '',
  });
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(data || []);
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.roomNumber || !formData.capacity) {
      setError('All fields are required');
      return;
    }

    try {
      if (editingId) {
        await updateRoom(editingId, {
          roomNumber: formData.roomNumber,
          capacity: parseInt(formData.capacity),
        });
        setSuccess('Room updated successfully');
      } else {
        await createRoom({
          roomNumber: formData.roomNumber,
          capacity: parseInt(formData.capacity),
          occupants: [],
        });
        setSuccess('Room created successfully');
      }

      setFormData({ roomNumber: '', capacity: '' });
      setEditingId(null);
      setShowForm(false);
      fetchRooms();
    } catch (err) {
      setError('Failed to save room');
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id);
        setSuccess('Room deleted successfully');
        fetchRooms();
      } catch (err) {
        setError('Failed to delete room');
        console.error(err);
      }
    }
  };

  // Handle edit
  const handleEdit = (room: Room) => {
    setFormData({
      roomNumber: room.roomNumber,
      capacity: room.capacity.toString(),
    });
    setEditingId(room.id);
    setShowForm(true);
  };

  // Handle assign student
  const handleAssignStudent = async () => {
    if (!studentEmail || !selectedRoomId) {
      setError('Please select a room and enter student email');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setAssigningStudent(true);

      // Step 1: Find student by email
      console.log('Searching for student with email:', studentEmail);
      const student = await getStudentByEmail(studentEmail);
      console.log('Student found:', student);
      
      if (!student) {
        setError('Student with this email not found. Please check the email address.');
        setAssigningStudent(false);
        return;
      }

      // Step 2: Get the room and check capacity
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      if (!selectedRoom) {
        setError('Room not found');
        setAssigningStudent(false);
        return;
      }

      const currentOccupancy = selectedRoom.occupants?.length || 0;
      if (currentOccupancy >= selectedRoom.capacity) {
        setError(`Room ${selectedRoom.roomNumber} is already full (${currentOccupancy}/${selectedRoom.capacity})`);
        setAssigningStudent(false);
        return;
      }

      // Step 3: Check if student is already assigned to a room
      if (student.roomId && student.roomId !== selectedRoomId) {
        // Need to remove from old room first
        const oldRoom = rooms.find(r => r.id === student.roomId);
        if (oldRoom) {
          const oldOccupants = (oldRoom.occupants || []).filter(id => id !== student.uid);
          await updateRoom(student.roomId, {
            occupants: oldOccupants,
          });
        }
      }

      // Step 4: Update student's roomId
      console.log('Updating student roomId to:', selectedRoomId);
      await updateUser(student.uid, {
        roomId: selectedRoomId,
      });

      // Step 5: Update room's occupants array (avoid duplicates)
      const updatedOccupants = Array.from(new Set([...(selectedRoom.occupants || []), student.uid]));
      console.log('Updating room occupants:', updatedOccupants);
      await updateRoom(selectedRoomId, {
        occupants: updatedOccupants,
      });

      setSuccess(`Student ${student.name || student.email} assigned to Room ${selectedRoom.roomNumber} successfully!`);
      setStudentEmail('');
      setSelectedRoomId('');
      fetchRooms();
    } catch (err) {
      setError(`Failed to assign student: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Assignment error:', err);
    } finally {
      setAssigningStudent(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const stats = {
    totalRooms: rooms.length,
    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    totalOccupied: rooms.reduce((sum, r) => sum + (r.occupants?.length || 0), 0),
  };

  const occupancyPercentage = stats.totalCapacity > 0 
    ? ((stats.totalOccupied / stats.totalCapacity) * 100).toFixed(1) 
    : 0;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Manage Rooms
            </h1>
            <p className="text-slate-400">Assign students and manage room occupancy</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            {/* Total Rooms */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Rooms</p>
                  <p className="text-4xl font-bold text-blue-400">{stats.totalRooms}</p>
                </div>
                <div className="text-5xl opacity-20">🏠</div>
              </div>
            </div>

            {/* Total Capacity */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Capacity</p>
                  <p className="text-4xl font-bold text-cyan-400">{stats.totalCapacity}</p>
                </div>
                <div className="text-5xl opacity-20">👥</div>
              </div>
            </div>

            {/* Occupancy Rate */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Occupancy</p>
                  <p className="text-4xl font-bold text-purple-400">{occupancyPercentage}%</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.totalOccupied}/{stats.totalCapacity} occupied</p>
                </div>
                <div className="text-5xl opacity-20">📊</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${occupancyPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Assign Student Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🎓</span> Assign Student to Room
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              >
                <option value="">Select Room</option>
                {rooms.map((room) => {
                  const occupancy = room.occupants?.length || 0;
                  const isFull = occupancy >= room.capacity;
                  return (
                    <option 
                      key={room.id} 
                      value={room.id}
                      disabled={isFull}
                    >
                      Room {room.roomNumber} ({occupancy}/{room.capacity}) {isFull ? '❌ FULL' : '✓'}
                    </option>
                  );
                })}
              </select>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Student Email"
                className="px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              />
              <button
                onClick={handleAssignStudent}
                disabled={assigningStudent}
                className="md:col-span-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:shadow-none"
              >
                {assigningStudent ? '⏳ Assigning...' : '✨ Assign Student'}
              </button>
            </div>
          </div>

          {/* Add/Edit Room Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🏗️</span> {editingId ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setFormData({ roomNumber: '', capacity: '' });
                    setEditingId(null);
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                {showForm ? '✕ Cancel' : '➕ Add Room'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Room Number</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      placeholder="e.g., 101, 102"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      placeholder="e.g., 2, 4"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20"
                >
                  {editingId ? '💾 Update Room' : '✨ Create Room'}
                </button>
              </form>
            )}
          </div>

          {/* Rooms Table */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📋</span> All Rooms ({rooms.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left font-semibold text-cyan-400">Room</th>
                    <th className="px-6 py-4 text-left font-semibold text-cyan-400">Capacity</th>
                    <th className="px-6 py-4 text-left font-semibold text-cyan-400">Occupancy</th>
                    <th className="px-6 py-4 text-left font-semibold text-cyan-400">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-cyan-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room, idx) => {
                    const occupancy = room.occupants?.length || 0;
                    const isFull = occupancy >= room.capacity;
                    const occupancyRate = room.capacity > 0 ? ((occupancy / room.capacity) * 100) : 0;

                    return (
                      <tr 
                        key={room.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${0.1 + (idx * 0.05)}s both`
                        }}
                      >
                        <td className="px-6 py-4 text-white font-semibold">
                          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Room {room.roomNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{room.capacity} beds</td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-white font-semibold">{occupancy}/{room.capacity}</p>
                            <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  occupancyRate <= 50 ? 'bg-green-400' :
                                  occupancyRate <= 75 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${occupancyRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isFull 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {isFull ? '🔴 Full' : '🟢 Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-blue-200 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 border border-blue-500/30"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 border border-red-500/30"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rooms.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-slate-400">No rooms created yet. Add one to get started!</p>
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
