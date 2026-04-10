'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { getMeals, getFoodBookings, getInstituteBookings } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface MealMetrics {
  totalMeals: number;
  mealTypes: Record<string, number>;
  mealsByDate: Record<string, number>;
  popularMenus: Array<{ menu: string; count: number }>;
  adminMeals: number;
  studentBookings: number;
  instituteBookings: number;
}

export default function FoodAnalyticsPage() {
  const [metrics, setMetrics] = useState<MealMetrics>({
    totalMeals: 0,
    mealTypes: {},
    mealsByDate: {},
    popularMenus: [],
    adminMeals: 0,
    studentBookings: 0,
    instituteBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        // Fetch all data sources
        const adminMeals = await getMeals();
        const foodBookings = await getFoodBookings();
        const instituteBookings = await getInstituteBookings();
        
        // Calculate metrics
        const mealTypes: Record<string, number> = {};
        const mealsByDate: Record<string, number> = {};
        const menuCounts: Record<string, number> = {};
        let totalCount = 0;

        // Process admin meals
        adminMeals.forEach((meal) => {
          const mealType = meal.type || 'Unknown';
          mealTypes[mealType] = (mealTypes[mealType] || 0) + 1;
          mealsByDate[meal.date] = (mealsByDate[meal.date] || 0) + 1;
          
          if (meal.menu) {
            menuCounts[meal.menu] = (menuCounts[meal.menu] || 0) + 1;
          }
          totalCount++;
        });

        // Process student food bookings (weekly menu)
        foodBookings.forEach((booking) => {
          const mealType = booking.mealType || 'Unknown';
          mealTypes[mealType] = (mealTypes[mealType] || 0) + 1;
          mealsByDate[booking.date] = (mealsByDate[booking.date] || 0) + 1;
          
          if (booking.mealName) {
            menuCounts[booking.mealName] = (menuCounts[booking.mealName] || 0) + 1;
          }
          totalCount++;
        });

        // Process institute bookings
        instituteBookings.forEach((booking) => {
          const mealType = booking.mealType || 'Unknown';
          mealTypes[mealType] = (mealTypes[mealType] || 0) + 1;
          mealsByDate[booking.date] = (mealsByDate[booking.date] || 0) + 1;
          
          if (booking.university) {
            menuCounts[booking.university] = (menuCounts[booking.university] || 0) + 1;
          }
          totalCount++;
        });

        // Get top 5 popular menus
        const popularMenus = Object.entries(menuCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([menu, count]) => ({ menu, count }));

        setMetrics({
          totalMeals: totalCount,
          mealTypes,
          mealsByDate,
          popularMenus,
          adminMeals: adminMeals.length,
          studentBookings: foodBookings.length,
          instituteBookings: instituteBookings.length,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meal data:', error);
        setLoading(false);
      }
    };

    fetchMealData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <h1 className="text-4xl font-bold text-white mb-2">📊 Food Analytics</h1>
        <p className="text-slate-400 mb-8">Track meal patterns and menu popularity</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <p className="text-slate-400 text-sm mb-2">Total Bookings</p>
            <p className="text-4xl font-bold text-cyan-400">{metrics.totalMeals}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <p className="text-slate-400 text-sm mb-2">Admin Meals</p>
            <p className="text-4xl font-bold text-blue-400">{metrics.adminMeals}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <p className="text-slate-400 text-sm mb-2">Weekly Menu Bookings</p>
            <p className="text-4xl font-bold text-yellow-400">{metrics.studentBookings}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <p className="text-slate-400 text-sm mb-2">Institute Lunch</p>
            <p className="text-4xl font-bold text-orange-400">{metrics.instituteBookings}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <p className="text-slate-400 text-sm mb-2">Unique Dates</p>
            <p className="text-4xl font-bold text-green-400">{Object.keys(metrics.mealsByDate).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meal Type Distribution */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">🍽️ Meal Type Distribution</h2>
            <div className="space-y-4">
              {Object.entries(metrics.mealTypes).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">{type}</span>
                    <span className="font-bold text-cyan-400">{count}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      style={{
                        width: `${(count / metrics.totalMeals) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Menus */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">⭐ Top Menus</h2>
            <div className="space-y-4">
              {metrics.popularMenus.length > 0 ? (
                metrics.popularMenus.map((menu, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{menu.menu}</p>
                      <p className="text-slate-400 text-sm">Times served</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-400">{menu.count}</p>
                      <p className="text-slate-400 text-xs">
                        {((menu.count / metrics.totalMeals) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No menu data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mt-8 bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📈 Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-slate-400 mb-2">Avg Meals/Day</p>
              <p className="text-3xl font-bold text-green-400">
                {(metrics.totalMeals / Object.keys(metrics.mealsByDate).length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">Total Days</p>
              <p className="text-3xl font-bold text-blue-400">
                {Object.keys(metrics.mealsByDate).length}
              </p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">Unique Menus</p>
              <p className="text-3xl font-bold text-purple-400">
                {metrics.popularMenus.length}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
