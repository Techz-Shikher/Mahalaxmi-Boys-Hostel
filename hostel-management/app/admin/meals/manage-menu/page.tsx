// app/admin/meals/manage-menu/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface MenuData {
  [day: string]: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
}

export default function ManageMenuPage() {
  const [menu, setMenu] = useState<MenuData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const mealLabels = { breakfast: '🥐 Breakfast', lunch: '🍛 Lunch', snacks: '🍪 Snacks', dinner: '🍖 Dinner' };

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError('');
      const docRef = doc(db, 'weeklyMenu', 'week1');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setMenu(docSnap.data() as MenuData);
      } else {
        loadDefaultMenu();
      }
    } catch (err) {
      console.error('Firestore error:', err);
      // Load default menu on error
      loadDefaultMenu();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultMenu = () => {
    const defaultMenu: MenuData = {
      Sunday: {
        breakfast: 'ब्रेड जैम + चाय',
        lunch: 'छोले भटूरे + रायता चावल',
        snacks: 'बर्गर + चाय',
        dinner: 'चिकन/पनीर + रोटी + चावल + सलाद'
      },
      Monday: {
        breakfast: 'आलू पराठा + चाय + अचार',
        lunch: 'दाल सब्जी + पुलाव + चावल + रोटी + सलाद',
        snacks: 'समोसा + चाय + चटनी',
        dinner: 'दाल फ्राई + मिक्स वेज + चावल + रोटी + सलाद'
      },
      Tuesday: {
        breakfast: 'दलिया + चना फ्राई',
        lunch: 'राजमा मसाला + आलू शिमला + रोटी चावल सलाद',
        snacks: 'सैंडविच + चाय + सॉस',
        dinner: 'आलू टमाटर + पूरी सब्जी + खीर + सलाद'
      },
      Wednesday: {
        breakfast: 'प्लेन पराठा + आलू टमाटर सब्जी + चाय',
        lunch: 'छोले रायता जीरा चावल + रोटी सलाद',
        snacks: 'पेटीज + चाय',
        dinner: 'पनीर + चावल + रोटी + सलाद'
      },
      Thursday: {
        breakfast: 'इडली सांभर + चाय चटनी',
        lunch: 'कढ़ी + आलू गोभी + रोटी + चावल + सलाद',
        snacks: 'मैकरोनी + चाय',
        dinner: 'दाल मखनी + भिंडी सब्जी + रोटी + सलाद'
      },
      Friday: {
        breakfast: 'पूरी आलू सब्जी + चाय',
        lunch: 'दाल + सब्जी + रोटी + चावल + सलाद',
        snacks: 'पाव भाजी + चाय',
        dinner: 'अंडा करी / पनीर + चावल + रोटी + सलाद'
      },
      Saturday: {
        breakfast: 'मिक्स पराठा + चाय + अचार',
        lunch: 'बिरयानी + रायता + चटनी',
        snacks: 'चाउमिन + चाय',
        dinner: 'आलू भुजिया + दाल + रोटी + चावल'
      }
    };
    setMenu(defaultMenu);
  };

  const handleInputChange = (day: string, meal: string, value: string) => {
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setSaving(true);

      const docRef = doc(db, 'weeklyMenu', 'week1');
      await setDoc(docRef, menu);
      
      setSuccess('Weekly menu updated successfully!');
    } catch (err) {
      setError('Failed to save menu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated blob background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Manage Weekly Menu
            </h1>
            <p className="text-slate-400">Update the hostel&apos;s weekly meal menu</p>
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Menu Grid */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 overflow-x-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">📋 Weekly Meal Plan</h2>
              <p className="text-slate-400 text-sm mt-2">Fill in the meals for each day and time slot</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold w-24">Meal</th>
                    {days.map(day => (
                      <th key={day} className="text-center py-3 px-4 text-slate-300 font-semibold min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meals.map(meal => (
                    <tr key={meal} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-semibold">
                        {mealLabels[meal as keyof typeof mealLabels]}
                      </td>
                      {days.map(day => (
                        <td key={`${day}-${meal}`} className="py-3 px-4">
                          <input
                            type="text"
                            value={menu[day]?.[meal as keyof typeof menu.Sunday] || ''}
                            onChange={(e) => handleInputChange(day, meal, e.target.value)}
                            placeholder={`Enter ${meal}...`}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
              >
                {saving ? 'Saving...' : '✓ Save Menu'}
              </button>
              <button
                onClick={fetchMenu}
                disabled={saving}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all duration-300"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Example Format */}
          <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📝 Example Format</h3>
            <div className="text-slate-300 text-sm space-y-2">
              <p>• छोले भुन्ते + रायता चावल</p>
              <p>• आलु पराठा + चाय अचार</p>
              <p>• दाल सब्जी + पुलाव चावल</p>
              <p>• चिकन पनीर रोटी + चावल सलाद</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
