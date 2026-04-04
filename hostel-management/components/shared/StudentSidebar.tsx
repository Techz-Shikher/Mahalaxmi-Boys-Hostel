// components/shared/StudentSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', href: '/student/dashboard' },
    { icon: '⚠️', label: 'File Complaint', href: '/student/complaints' },
    { icon: '📢', label: 'Announcements', href: '/student/announcements' },
    { icon: '🍴', label: 'View Meals', href: '/student/meals' },
    { icon: '🏫', label: 'Institute Lunch', href: '/student/meals/institute' },
    { icon: '🚌', label: 'Transport', href: '/student/transport' },
    { icon: '💬', label: 'Community Feed', href: '/student/community' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/20 backdrop-blur-xl transform transition-transform duration-300 ease-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Student Menu
          </h1>
          <p className="text-slate-400 text-sm mt-2">Quick Navigation</p>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              style={{
                animation: isOpen ? `slideInFromLeft 0.3s ease-out ${index * 0.05}s both` : 'none',
              }}
            >
              <span className="text-2xl group-hover:animate-bounce">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-gradient-to-t from-black/50">
          <p className="text-xs text-slate-500 text-center">© 2026 Mahalaxmi Hostel</p>
        </div>
      </nav>

      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
