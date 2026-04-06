'use client';

import AdminSidebar from '@/components/shared/AdminSidebar';

export default function FoodAnalyticsPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-slate-900 p-8">
        <h1 className="text-3xl font-bold text-white mb-4">📊 Food Analytics</h1>
        <div className="bg-white/10 rounded-lg p-6">
          <p className="text-slate-300">Analytics data will be displayed here</p>
        </div>
      </main>
    </div>
  );
}
