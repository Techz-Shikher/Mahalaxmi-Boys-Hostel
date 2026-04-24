'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';

interface WasteFormData {
  date: string;
  mealType: string;
  wasteCategory: 'vegetables' | 'grains' | 'protein' | 'dairy' | 'oil' | 'other';
  quantityKg: number;
  reason: string;
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const WASTE_CATEGORIES = [
  { id: 'vegetables', label: '🥬 Vegetables' },
  { id: 'grains', label: '🌾 Grains & Rice' },
  { id: 'protein', label: '🍗 Protein (Meat/Dal)' },
  { id: 'dairy', label: '🥛 Dairy' },
  { id: 'oil', label: '🛢️ Cooking Oil' },
  { id: 'other', label: '📦 Other' },
];

export default function LogWastePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<WasteFormData>({
    date: new Date().toISOString().split('T')[0],
    mealType: 'Breakfast',
    wasteCategory: 'vegetables',
    quantityKg: 0,
    reason: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantityKg' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantityKg || formData.quantityKg <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for the waste');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await addDoc(collection(db, 'wasteTracker'), {
        date: formData.date,
        mealType: formData.mealType,
        wasteCategory: formData.wasteCategory,
        quantityKg: formData.quantityKg,
        reason: formData.reason,
        loggedBy: user?.email || 'Unknown',
        timestamp: Timestamp.now(),
        userId: user?.uid,
      });

      setSuccess('✅ Waste logged successfully! Thank you for tracking.');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mealType: 'Breakfast',
        wasteCategory: 'vegetables',
        quantityKg: 0,
        reason: '',
      });

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Error logging waste:', err);
      setError('Failed to log waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              ♻️ Log Food Waste
            </h1>
            <p className="text-slate-400">Help us track and reduce waste • Every entry matters!</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">📝 Waste Information</h2>
              <p className="text-slate-400 text-sm">Record waste from today's meal preparations</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">📅 Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">🍽️ Meal Type</label>
                <select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {MEAL_TYPES.map((meal) => (
                    <option key={meal} value={meal}>
                      {meal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Waste Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">🗑️ Waste Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {WASTE_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, wasteCategory: category.id as any }))
                      }
                      className={`p-3 rounded-lg font-medium transition-all border-2 ${
                        formData.wasteCategory === category.id
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-green-500/50'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">⚖️ Quantity (kg)</label>
                <input
                  type="number"
                  name="quantityKg"
                  value={formData.quantityKg || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5"
                  step="0.1"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter approximate weight in kilograms</p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">📝 Reason for Waste</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g., Over-prepared vegetables, spoiled ingredients, plate waste from students..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Help us understand waste causes for better planning</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all"
              >
                {loading ? '⏳ Logging...' : '✅ Log Waste Entry'}
              </button>
            </form>
          </div>

          {/* Tips Card */}
          <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">💡 Tips for Accurate Logging</h3>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li>✓ Weigh waste immediately after meal preparation</li>
              <li>✓ Be specific about reasons (helps identify patterns)</li>
              <li>✓ Include both preparation waste and plate waste</li>
              <li>✓ Log consistently for reliable data</li>
              <li>✓ Your data helps reduce waste by up to 30%!</li>
            </ul>
          </div>

          {/* Impact Card */}
          <div className="mt-6 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-300 mb-3">🌱 Your Impact</h3>
            <p className="text-slate-300">Every waste log contributes to SDG 2 (Zero Hunger). By tracking and reducing food waste, we:</p>
            <ul className="text-slate-300 space-y-1 text-sm mt-3 ml-4">
              <li>• Combat food insecurity</li>
              <li>• Reduce environmental impact</li>
              <li>• Save costs for the hostel</li>
              <li>• Educate students about sustainability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
