// app/admin/meals/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMeals, createMeal, updateMeal, deleteMeal, type Meal } from '@/lib/firestore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    type: 'Breakfast',
    menu: '',
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const data = await getMeals();
      setMeals(data || []);
    } catch (err) {
      setError('Failed to fetch meals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.date || !formData.menu) {
      setError('All fields are required');
      return;
    }

    try {
      if (editingId) {
        await updateMeal(editingId, formData);
        setSuccess('Meal updated successfully');
      } else {
        await createMeal(formData);
        setSuccess('Meal created successfully');
      }
      setFormData({ date: '', type: 'Breakfast', menu: '' });
      setEditingId(null);
      setShowForm(false);
      fetchMeals();
    } catch (err) {
      setError('Failed to save meal');
      console.error(err);
    }
  };

  const handleEdit = (meal: Meal) => {
    setFormData({
      date: meal.date,
      type: meal.type,
      menu: meal.menu,
    });
    setEditingId(meal.id);
    setShowForm(true);
  };

  const handleDelete = async (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(mealId);
        setSuccess('Meal deleted successfully');
        fetchMeals();
      } catch (err) {
        setError('Failed to delete meal');
        console.error(err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Manage Meals</h1>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ date: '', type: 'Breakfast', menu: '' });
          }}
          className="mb-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '🍴 Add New Meal'}
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Meal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Evening Snacks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Menu</label>
                <textarea
                  value={formData.menu}
                  onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List the items in the meal..."
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                {editingId ? 'Update Meal' : 'Create Meal'}
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {meals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No meals scheduled yet</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🍴</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{meal.type}</h3>
                        <p className="text-sm text-gray-500">📅 {meal.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3 whitespace-pre-wrap">{meal.menu}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(meal)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
