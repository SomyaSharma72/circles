import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Review } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useLocationContext } from '../context/LocationContext';
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  ArrowLeft,
  Award,
  MapPin,
  Crosshair,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { location } = useLocationContext();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood || location.neighborhood || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || ['Pet Sitting', 'Tutoring', 'Repairs']);
  const [newSkill, setNewSkill] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number]>(
    user?.location?.coordinates || [location.lng, location.lat]
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock static reviews for rich display
  const defaultMockReviews = [
    {
      _id: 'rev_mock_1',
      reviewer: { name: 'Sunita M.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
      rating: 5,
      comment: 'Priya was amazing with our dog, fully recommended!',
      date: 'Jun 7, 2023',
    },
    {
      _id: 'rev_mock_2',
      reviewer: { name: 'Rohan Gupta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
      rating: 5,
      comment: 'Great tutoring session! Very patient and helpful.',
      date: 'Jun 18, 2023',
    },
    {
      _id: 'rev_mock_3',
      reviewer: { name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
      rating: 4,
      comment: 'Helped mount curtain rods in 20 mins. Super trustworthy neighbor.',
      date: 'Jul 2, 2023',
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setNeighborhood(user.neighborhood || '');
      setProfession(user.profession || '');
      setSkills(user.skills && user.skills.length > 0 ? user.skills : ['Pet Sitting', 'Tutoring', 'Repairs']);
      if (user.location?.coordinates) {
        setCoordinates(user.location.coordinates);
      }
    }
  }, [user]);

  const fetchUserReviews = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/reviews/user/${user.id}`);
      if (res.data && res.data.length > 0) {
        setReviews(res.data);
      }
    } catch (err) {
      console.warn('Reviews fetch error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user?.id]);

  if (authLoading) {
    return <LoadingSpinner label="Verifying circle session..." />;
  }

  if (!user) {
    return null;
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name,
        bio,
        neighborhood,
        profession,
        skills,
        coordinates,
      });
      setSavedSuccess(true);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Forest Green Circles Profile Header */}
      <div className="bg-[#355E3B] text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6 text-center">
        {/* Top bar with back arrow */}
        <div className="flex items-center justify-between">
          <Link to="/" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FBFAF7]/80">Circle Neighbor Profile</span>
          <div className="w-9"></div>
        </div>

        {/* Avatar Portrait */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-2xs"
            />
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#C96C4A] text-white rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">{name || 'Priya Singh'}</h1>
            <p className="text-xs text-[#FBFAF7]/80 font-semibold">{neighborhood || location.neighborhood || 'Local Circle'}</p>
          </div>

          {/* Skill Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {skills.map((sk) => (
              <span
                key={sk}
                className="px-3.5 py-1 bg-white/15 backdrop-blur-md text-[#FBFAF7] text-xs font-bold rounded-full border border-white/20"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Prominent Star Rating Card on Top */}
        <div className="bg-[#FBFAF7] text-[#2F2F2F] rounded-2xl p-4 shadow-2xs flex items-center justify-center gap-3 max-w-sm mx-auto">
          <div className="flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-extrabold text-xl text-[#2F2F2F]">4.8</span>
          <span className="text-xs text-slate-500 font-bold">• 23 Reviews</span>
        </div>
      </div>

      {/* Completed Favors Counter */}
      <div className="bg-[#FBFAF7] rounded-3xl p-4 border border-[#E6DFD3] shadow-2xs flex items-center justify-between">
        <span className="font-extrabold text-sm text-[#2F2F2F]">Completed Circle Favors</span>
        <span className="font-extrabold text-sm text-[#355E3B] bg-[#355E3B]/10 px-4 py-1 rounded-full border border-[#355E3B]/20">19 favors</span>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-[#2F2F2F] tracking-tight font-heading">Neighborhood Reviews</h3>

        <div className="space-y-3">
          {(reviews.length > 0 ? reviews : defaultMockReviews).map((rev: any) => (
            <div
              key={rev._id}
              className="bg-[#FBFAF7] rounded-3xl p-5 border border-[#E6DFD3] shadow-2xs space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.reviewer?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                    alt="Reviewer"
                    className="w-10 h-10 rounded-full object-cover border border-[#E6DFD3]"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2F2F2F]">{rev.reviewer?.name || 'Neighbor'}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{rev.date || 'Jun 7, 2023'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed pl-1">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Editor Form */}
      <div className="bg-[#FBFAF7] border border-[#E6DFD3] rounded-3xl p-6 shadow-2xs space-y-5">
        <h3 className="text-base font-extrabold text-[#2F2F2F] font-heading">Edit Profile & Offered Skills</h3>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-3 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-3 flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#C96C4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1">Profession</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Mechanic, Teacher, Software Dev"
                className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#C96C4A]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider">Neighborhood Area</label>
              {location.neighborhood && location.neighborhood !== neighborhood && (
                <button
                  type="button"
                  onClick={() => {
                    setNeighborhood(location.neighborhood);
                    setCoordinates([location.lng, location.lat]);
                  }}
                  className="text-[11px] font-bold text-[#C96C4A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Use detected location ({location.neighborhood})</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g. Indiranagar, Bengaluru or Bandra West, Mumbai"
              className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#C96C4A]"
            />
          </div>

          {/* Skills Catalog */}
          <div className="space-y-2 pt-2 border-t border-[#E6DFD3]">
            <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider">
              Offered Skills & Tools
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Childcare, Tutoring, Bosch Drill)"
                className="flex-1 px-3.5 py-2 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#C96C4A]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[#C96C4A] hover:bg-[#b25b3a] text-white rounded-full text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#355E3B]/10 text-[#355E3B] border border-[#355E3B]/20 text-xs font-extrabold rounded-full"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-[#355E3B] hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#355E3B] hover:bg-[#2c4e31] text-white font-extrabold text-xs rounded-full shadow-2xs transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
