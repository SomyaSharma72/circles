import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { UserCircle, MapPin, Briefcase, Sparkles, Check, HeartHandshake, ArrowRight } from 'lucide-react';

const PREDEFINED_SKILLS = [
  'Gardening & Plant Care',
  'Handyman & Repairs',
  'Tech & Wi-Fi Support',
  'Pet Care & Dog Walking',
  'Tutoring & Math',
  'Tool Sharing',
  'Baking & Cooking',
  'Moving & Heavy Lifting',
  'Errands & Grocery',
  'Elderly Support',
];

const PREDEFINED_NEIGHBORHOODS = [
  'Maplewood Terrace',
  'Oak Heights',
  'Pine Crest',
  'Sunset Valley',
  'Riverdale South',
];

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [profession, setProfession] = useState('Neighbor & Volunteer');
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || 'Maplewood Terrace');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentUser?.skills || ['Gardening & Plant Care']);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setFullName(currentUser.name);
      if (currentUser.neighborhood) setNeighborhood(currentUser.neighborhood);
      if (currentUser.bio) setBio(currentUser.bio);
      if (currentUser.skills && currentUser.skills.length > 0) setSelectedSkills(currentUser.skills);
    }
  }, [currentUser]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile({
      name: fullName.trim() || 'Friendly Neighbor',
      neighborhood: neighborhood,
      bio: bio.trim() || `Local neighbor in ${neighborhood}. Happy to help around!`,
      skills: selectedSkills,
    });

    navigate('/home');
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
            Complete Your Neighbor Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Personalize your profile so neighbors nearby can get to know you and ask for or offer help.
          </p>
        </div>

        {/* Profile Avatar Banner */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="Default Neighbor Avatar"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Default Verified Neighbor Icon</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your profile avatar is automatically assigned for trust and privacy protection.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<UserCircle className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Profession or Headline"
              type="text"
              placeholder="e.g. Teacher, Woodworker, Nurse"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              icon={<Briefcase className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Your Neighborhood
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {PREDEFINED_NEIGHBORHOODS.map((nh) => (
                  <option key={nh} value={nh}>
                    {nh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Skills You Can Offer Neighbors
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              {PREDEFINED_SKILLS.map((skill) => {
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
              Short Bio (Optional)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell neighbors a little about yourself, your hobbies, or what kind of help you enjoy giving..."
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            <span>Save Profile & Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
