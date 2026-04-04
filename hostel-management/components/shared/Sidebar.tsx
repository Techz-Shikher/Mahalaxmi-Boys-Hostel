// components/shared/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return (
      <aside className="w-64 bg-gray-800 text-white p-6 min-h-screen">
        <h2 className="text-xl font-bold mb-8">Admin Menu</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block p-3 rounded hover:bg-gray-700">
            📊 Dashboard
          </Link>
          <Link href="/admin/rooms" className="block p-3 rounded hover:bg-gray-700">
            🛏️ Manage Rooms
          </Link>
          <Link href="/admin/complaints" className="block p-3 rounded hover:bg-gray-700">
            ⚠️ View Complaints
          </Link>
          <Link href="/admin/announcements" className="block p-3 rounded hover:bg-gray-700">
            📢 Announcements
          </Link>
          <Link href="/admin/meals" className="block p-3 rounded hover:bg-gray-700">
            🍴 Manage Meals
          </Link>
          <Link href="/admin/transport" className="block p-3 rounded hover:bg-gray-700">
            🚗 Transport
          </Link>
          <Link href="/admin/community" className="block p-3 rounded hover:bg-gray-700">
            💬 Community Feed
          </Link>
        </nav>
      </aside>
    );
  }

  if (user?.role === 'Student') {
    return (
      <aside className="w-64 bg-gray-800 text-white p-6 min-h-screen">
        <h2 className="text-xl font-bold mb-8">Student Menu</h2>
        <nav className="space-y-2">
          <Link href="/student/dashboard" className="block p-3 rounded hover:bg-gray-700">
            📊 Dashboard
          </Link>
          <Link href="/student/complaints" className="block p-3 rounded hover:bg-gray-700">
            ⚠️ File Complaint
          </Link>
          <Link href="/student/announcements" className="block p-3 rounded hover:bg-gray-700">
            📢 Announcements
          </Link>
          <Link href="/student/meals" className="block p-3 rounded hover:bg-gray-700">
            🍴 Mess Menu
          </Link>
          <Link href="/student/transport" className="block p-3 rounded hover:bg-gray-700">
            🚗 Book Transport
          </Link>
          <Link href="/student/community" className="block p-3 rounded hover:bg-gray-700">
            💬 Community Hub
          </Link>
        </nav>
      </aside>
    );
  }

  return null;
}
