import React, { useState } from 'react';
import { User, MapPin, Briefcase, Sparkles, ShieldCheck, Check, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { completeProfileSetup } from '../../services/api';

const POPULAR_SKILLS = [
  'Tools & Repairs',
  'Pet Sitting & Walking',
  'Elderly Grocery Runs',
  'Wi-Fi & Tech Help',
  'Garden Care',
  'Scooter/Car Jumpstart',
  'Academic Tutoring',
  'Baking & Cooking',
  'Emergency Childcare',
  'Heavy Furniture Lifting',
];

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const { location, detectLocation, detecting } = useLocationContext();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood || location.neighborhood || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      const val = customSkill.trim();
      if (!skills.includes(val)) {
        setSkills([...skills, val]);
      }
      setCustomSkill('');
    }
  };

  const handleDetectGPS = async () => {
    try {
      await detectLocation();
      if (location.neighborhood) {
        setNeighborhood(location.neighborhood);
      }
    } catch (err) {
      console.warn('GPS detection notice:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedData = {
        name: name.trim(),
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        neighborhood: neighborhood.trim() || location.neighborhood || 'Local Community',
        profession: profession.trim() || 'Neighbor',
        bio: bio.trim(),
        skills,
        coordinates: [location.lng, location.lat],
        profileCompleted: true,
      };

      const res = await completeProfileSetup(updatedData);
      const updatedUser = res.user || res;

      // Update auth storage and state
      const token = localStorage.getItem('neighborly_token') || 'token';
      login(token, updatedUser);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-orange-100 relative">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black">Complete Your Neighbor Profile</h2>
          <p className="text-xs text-orange-100 mt-1 max-w-md mx-auto">
            Help your neighbors know how to connect with you and what skills you can share!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
              {error}
            </div>
          )}

          {/* Name & Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Age</label>
              <input
                type="number"
                min={13}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
              >
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Neighborhood & Location Auto-detect */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Neighborhood / Street</label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={detecting}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
              >
                <MapPin className="w-3 h-3" />
                <span>{detecting ? 'Detecting GPS...' : 'Use Current GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g. Indiranagar 100ft Rd / Sunset District"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Profession / Role */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Profession / Community Role</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Electrician & DIY Enthusiast / High School Teacher"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Tell neighbors a little about yourself, hobbies, or tools you can share..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden resize-none font-medium"
            />
          </div>

          {/* Skills Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Skills & Favors You Can Offer (Select any that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={handleAddCustomSkill}
              placeholder="Type custom skill and press Enter..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium mt-1"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save & Join Circles'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
