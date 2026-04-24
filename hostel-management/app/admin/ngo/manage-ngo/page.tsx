'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import ErrorMessage from '@/components/shared/ErrorMessage';
import SuccessMessage from '@/components/shared/SuccessMessage';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface NGO {
  id: string;
  name: string;
  phone: string;
  address: string;
  description: string;
  category: string;
  createdAt?: Date;
}

const CATEGORIES = ['Food & Nutrition', 'Health & Medical', 'Education', 'Shelter', 'Clothing', 'Other'];

export default function ManageNGOPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    category: 'Food & Nutrition'
  });

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'ngos'));
      const ngoList: NGO[] = [];
      querySnapshot.forEach((doc) => {
        ngoList.push({ id: doc.id, ...doc.data() } as NGO);
      });
      setNgos(ngoList);
      setError('');
    } catch (err) {
      console.error('Error fetching NGOs:', err);
      setError('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNGO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      if (editingId) {
        // Update existing NGO
        const ngoRef = doc(db, 'ngos', editingId);
        await updateDoc(ngoRef, formData);
        setSuccess('NGO updated successfully!');
        setEditingId(null);
      } else {
        // Add new NGO
        await addDoc(collection(db, 'ngos'), {
          ...formData,
          createdAt: new Date()
        });
        setSuccess('NGO added successfully!');
      }

      setFormData({
        name: '',
        phone: '',
        address: '',
        description: '',
        category: 'Food & Nutrition'
      });

      await fetchNGOs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving NGO:', err);
      setError('Failed to save NGO');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ngo: NGO) => {
    setFormData({
      name: ngo.name,
      phone: ngo.phone,
      address: ngo.address,
      description: ngo.description,
      category: ngo.category
    });
    setEditingId(ngo.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this NGO?')) return;

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'ngos', id));
      setSuccess('NGO deleted successfully!');
      await fetchNGOs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting NGO:', err);
      setError('Failed to delete NGO');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      description: '',
      category: 'Food & Nutrition'
    });
  };

  const seedDefaultNGOs = async () => {
    const defaultNGOs = [
      { name: 'Khushi Foundation', phone: '08105753963', address: 'The Haven, Vaishalhi Sector 4, Ghaziabad', category: 'Education', description: 'Helping underprivileged children with education and care' },
      { name: 'Deep Blind Welfare Association', phone: '07418571498', address: 'Khyala-vishnu Garden, Delhi', category: 'Health & Medical', description: 'Providing support and rehabilitation to blind individuals' },
      { name: 'Heal The Globe Foundation', phone: '07405377753', address: '33 Feet Road Mehrauli, Delhi', category: 'Health & Medical', description: 'Global health and community welfare initiatives' },
      { name: 'Blind Girls Hostel Run By Health Drive Foundation', phone: '08480536507', address: 'Gali Number 1 Ganesh Nagar 2, Delhi', category: 'Health & Medical', description: 'Shelter and support for visually impaired girls' },
      { name: 'NILAYAM JAN SEVA FOUNDATION', phone: '09036651838', address: 'Bhoja Market, Atta Noida Sector 27, Noida', category: 'Education', description: 'Educational and social welfare programs' },
      { name: 'Sai Baba Educational & Children Care Society', phone: '07043828863', address: 'Tagore Garden Extn, Delhi', category: 'Education', description: 'Children education and healthcare services' },
      { name: 'Bal Sahyog', phone: '07411967375', address: 'L Block Market Connaught Place, Delhi', category: 'Education', description: 'Support and care for orphaned children' },
      { name: 'Muskan Ek Pahal Sangh', phone: '08125518537', address: 'Sikandarpur, Gurgaon', category: 'Education', description: 'Community development and child welfare' },
      { name: 'All India Youth Foundation', phone: '09739343163', address: 'Pocket 10 Dwarka Sector 23b, Delhi', category: 'Education', description: 'Youth empowerment and social development' },
      { name: 'Akhil Bhartiya Viklang Vidhwa Vidhwa Sewa Samiti', phone: '08123185567', address: 'Old Seemapuri, Delhi', category: 'Health & Medical', description: 'Welfare and support for disabled and widow individuals' },
      { name: 'EK Koshish Special School', phone: '07947155215', address: 'Surya Nagar, Ghaziabad', category: 'Education', description: 'Special education services for children with disabilities' },
      { name: 'Parivartan Special School', phone: '08923097427', address: 'Bhawani Kunj Vasant Kunj, Delhi', category: 'Education', description: 'Special needs education and rehabilitation' },
      { name: 'Shiv Ashray Senior Citizen And Old Age Home', phone: '08105397858', address: 'Rohini Sector 9, Delhi', category: 'Health & Medical', description: 'Care and welfare for elderly citizens' }
    ];

    try {
      setSaving(true);
      setError('');
      
      for (const ngo of defaultNGOs) {
        await addDoc(collection(db, 'ngos'), {
          ...ngo,
          createdAt: new Date()
        });
      }

      setSuccess(`✅ Seeded ${defaultNGOs.length} default NGOs successfully!`);
      await fetchNGOs();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error seeding NGOs:', err);
      setError('Failed to seed default NGOs');
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              🤝 Manage NGOs
            </h1>
            <p className="text-slate-400">Add, edit, or remove NGOs for student donations</p>
          </div>

          {/* Seed Button */}
          {ngos.length === 0 && (
            <button
              onClick={seedDefaultNGOs}
              disabled={saving}
              className="mb-8 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <span>🌱</span>
              <span>{saving ? 'Seeding...' : 'Load Default NGOs'}</span>
            </button>
          )}

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Form Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? '✏️ Edit NGO' : '➕ Add New NGO'}</h2>

            <form onSubmit={handleAddNGO} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">NGO Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Hope Foundation"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91-XXXXXXXXXX"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Street, Near Bus Stand, City"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell us about this NGO's mission and work..."
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving...' : editingId ? 'Update NGO' : 'Add NGO'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* NGO List */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">📋 NGO List ({ngos.length})</h2>
            </div>

            {ngos.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No NGOs added yet. Add one above to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-white/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Address</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngos.map(ngo => (
                      <tr key={ngo.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{ngo.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                            {ngo.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{ngo.phone}</td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{ngo.address}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(ngo)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(ngo.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
