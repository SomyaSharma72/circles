import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { UserCircle, MapPin, Briefcase, Sparkles, Check, HeartHandshake, ArrowRight, Camera } from 'lucide-react';

const PROFESSIONS = [
  'Student',
  'Teacher',
  'Software Engineer',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Doctor',
  'Designer',
  'Freelancer',
  'Other',
];

const NEIGHBORHOODS = [
  'Maplewood Terrace',
  'Oak Heights',
  'Pine Crest',
  'Sunset Valley',
  'Riverdale South',
];

const SKILL_OPTIONS = [
  'Tutoring',
  'Cooking',
  'Gardening',
  'Pet Care',
  'Plumbing',
  'Electrical',
  'Home Repair',
  'Technology',
  'Delivery',
  'Cleaning',
];

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [profession, setProfession] = useState(currentUser?.profession || 'Software Engineer');
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || 'Maplewood Terrace');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentUser?.skills || ['Gardening', 'Technology']);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser?.avatar || AVATAR_OPTIONS[0]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setFullName(currentUser.name);
      if (currentUser.profession) setProfession(currentUser.profession);
      if (currentUser.neighborhood) setNeighborhood(currentUser.neighborhood);
      if (currentUser.bio) setBio(currentUser.bio);
      if (currentUser.skills && currentUser.skills.length > 0) setSelectedSkills(currentUser.skills);
      if (currentUser.avatar) setSelectedAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!profession.trim()) {
      setError('Please select or specify your profession.');
      return;
    }
    if (!neighborhood.trim()) {
      setError('Please select your neighborhood.');
      return;
    }
    if (!bio.trim()) {
      setError('Please write a short bio to introduce yourself to your neighbors.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: fullName.trim(),
        profession: profession.trim(),
        neighborhood: neighborhood.trim(),
        bio: bio.trim(),
        skills: selectedSkills,
        avatar: selectedAvatar,
        profileCompleted: true,
      });

      navigate('/home');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Please fill out your details so neighbors can recognize you and connect in your community.
          </p>
        </div>

        {/* Profile Avatar Selection */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Choose Your Profile Picture
          </label>
          <div className="flex items-center gap-3 pt-1">
            {AVATAR_OPTIONS.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAvatar(imgUrl)}
                className={`relative rounded-2xl overflow-hidden ring-2 transition-all ${
                  selectedAvatar === imgUrl
                    ? 'ring-emerald-600 ring-offset-2 dark:ring-offset-slate-900 scale-105'
                    : 'ring-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Avatar option ${idx + 1}`} className="w-12 h-12 object-cover" />
                {selectedAvatar === imgUrl && (
                  <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              type="text"
              placeholder="e.g. Maya Lin"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<UserCircle className="w-4 h-4 text-slate-400" />}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profession *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                >
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Neighborhood *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              >
                {NEIGHBORHOODS.map((nh) => (
                  <option key={nh} value={nh}>
                    {nh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Skills You Can Offer Neighbors (Optional)
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Short Bio *
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell neighbors a little about yourself, your background, or how you like to help..."
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile & Continue'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
