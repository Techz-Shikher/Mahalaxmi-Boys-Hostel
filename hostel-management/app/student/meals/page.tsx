// app/student/meals/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentSidebar from '@/components/shared/StudentSidebar';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';

interface MenuData {
  [day: string]: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
}

interface FoodBooking {
  id: string;
  mealType: string;
  mealName: string;
  date: string;
  status: string;
}

export default function StudentMealsPage() {
  const { user } = useAuth();
  const [weeklyMenu, setWeeklyMenu] = useState<MenuData>({});
  const [bookings, setBookings] = useState<FoodBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [booking, setBooking] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealEmojis = { breakfast: '🥐', lunch: '🍛', snacks: '🍪', dinner: '🍖' };

  useEffect(() => {
    if (user) {
      loadWeeklyMenu();
      loadUserBookings();
    }
  }, [user]);

  const loadWeeklyMenu = async () => {
    try {
      const docRef = doc(db, 'weeklyMenu', 'week1');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setWeeklyMenu(docSnap.data() as MenuData);
      } else {
        loadDefaultMenu();
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      loadDefaultMenu();
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
    setWeeklyMenu(defaultMenu);
    setLoading(false);
  };

  const loadUserBookings = async () => {
    try {
      const q = query(collection(db, 'foodBookings'), where('userId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      const bookingsList: FoodBooking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsList.push({ id: doc.id, ...doc.data() } as FoodBooking);
      });
      setBookings(bookingsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setLoading(false);
    }
  };

  const getNextDayMenu = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayIndex = tomorrow.getDay() === 0 ? 6 : tomorrow.getDay() - 1;
    const dayName = days[dayIndex];
    return { day: dayName, date: tomorrow.toISOString().split('T')[0], menu: weeklyMenu[dayName] };
  };

  const handleBookMeal = async (mealType: string, mealName: string) => {
    try {
      setBooking(true);
      setError('');
      const nextDay = getNextDayMenu();

      await addDoc(collection(db, 'foodBookings'), {
        userId: user?.uid,
        email: user?.email,
        mealType,
        mealName,
        date: nextDay.date,
        status: 'confirmed',
        bookedAt: new Date()
      });

      setSuccess(`Booked: ${mealName}`);
      setSelectedMeal(`${mealType}-${nextDay.date}`);
      await loadUserBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to book meal');
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const nextDay = getNextDayMenu();
  const nextDayMeals = nextDay.menu || {};

  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1">
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-amber-500/20 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
              🍴 Food Booking
            </h1>
            <p className="text-slate-400">Book your meals from our weekly menu</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Book Next Day's Meals */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                📅 Book for {nextDay.day} ({new Date(nextDay.date).toLocaleDateString()})
              </h2>
              <p className="text-slate-300 mb-6">Select your meal for tomorrow</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => {
                  const mealName = nextDayMeals[mealType as keyof typeof nextDayMeals] || 'N/A';
                  const isBooked = selectedMeal === `${mealType}-${nextDay.date}`;
                  
                  return (
                    <button
                      key={mealType}
                      onClick={() => handleBookMeal(mealType, mealName)}
                      disabled={booking || isBooked}
                      className={`relative overflow-hidden rounded-xl p-6 text-white transform transition-smooth hover:scale-105 ${
                        isBooked 
                          ? 'bg-green-600 cursor-default' 
                          : 'bg-gradient-to-br from-orange-500 to-amber-600 hover:shadow-2xl'
                      }`}
                    >
                      <div className="text-4xl mb-2">{mealEmojis[mealType as keyof typeof mealEmojis]}</div>
                      <h3 className="font-bold text-lg mb-2 capitalize">{mealType}</h3>
                      <p className="text-sm text-white/90 mb-4">{mealName}</p>
                      {isBooked && <p className="text-xs font-bold">✓ Booked</p>}
                      {!isBooked && <p className="text-xs">Tap to book</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* My Bookings */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              📋 My Bookings
            </h2>

            {bookings.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No bookings yet. Book your first meal!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-slate-800/30 border border-white/10 rounded-xl p-4 hover:bg-slate-800/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{mealEmojis[booking.mealType as keyof typeof mealEmojis]}</span>
                        <div>
                          <h3 className="text-white font-bold capitalize">{booking.mealType}</h3>
                          <p className="text-slate-300">{booking.mealName}</p>
                          <p className="text-xs text-slate-400">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
