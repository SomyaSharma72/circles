import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ReviewCard } from '../components/ReviewCard';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Review } from '../types';
import { getReputationTier } from '../utils/reputation';

import initialSkillsData from '../data/skills.json';
import initialReviewsData from '../data/reviews.json';

import {
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  HeartHandshake,
  Star,
  Award,
  MapPin,
  Calendar,
  Settings,
  Edit3,
  Sparkles,
  Phone,
  MessageSquare,
  Moon,
  Sun,
  Check,
  Activity,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    skills,
    isSkillsLoading,
    skillsError,
    fetchSkills,
    reviews,
    updateProfile,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  // Active user data with fallback
  const user = currentUser || {
    id: 'u1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    avatar: '',
    neighborhood: 'Maplewood Terrace',
    address: '742 Evergreen Terrace',
    bio: 'Avid gardener, dog lover, and high school math teacher. Always happy to lend a hand or a lawnmower to neighbors!',
    trustScore: 99,
    verifiedNeighbor: true,
    joinedDate: 'March 2023',
    skills: ['Gardening', 'Pet Sitting', 'Math Tutoring', 'Baking', 'Plumbing', 'Dog Walking', 'Laptop Repair'],
    completedFavors: 24,
    reviewsCount: 18,
    phone: '(555) 234-5678',
    preferredContact: 'chat' as 'chat' | 'phone' | 'email',
  };

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Edit Profile Form state
  const [editName, setEditName] = useState(user.name);
  const [editProfession, setEditProfession] = useState(user.profession || 'Neighbor & Volunteer');
  const [editNeighborhood, setEditNeighborhood] = useState(user.neighborhood);
  const [editBio, setEditBio] = useState(user.bio);
  const [editPhone, setEditPhone] = useState(user.phone || '(555) 234-5678');

  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditProfession(currentUser.profession || 'Neighbor & Volunteer');
      setEditNeighborhood(currentUser.neighborhood || '');
      setEditBio(currentUser.bio || '');
      setEditPhone(currentUser.phone || '(555) 234-5678');
    }
  }, [currentUser]);

  // Settings State
  const [preferredContact, setPreferredContact] = useState<'chat' | 'phone' | 'email'>(
    user.preferredContact || 'chat'
  );
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Combine user skills with skills from backend API
  const userSkillsList = React.useMemo(() => {
    const rawSkills = [...(user.skills || [])];

    // Pull skill names from backend skills matching this user
    skills.forEach((item) => {
      if (item.userId === user.id || item.userName === user.name) {
        if (item.title && !rawSkills.includes(item.title)) {
          rawSkills.push(item.title);
        }
        if (item.skills && Array.isArray(item.skills)) {
          item.skills.forEach((s) => {
            if (!rawSkills.includes(s)) rawSkills.push(s);
          });
        }
      }
    });

    return rawSkills;
  }, [user, skills]);

  // Combine reviews for user
  const userReviews = React.useMemo<Review[]>(() => {
    const contextReviews = reviews.filter((r) => r.targetUserId === user.id);
    const jsonReviews = initialReviewsData.filter(
      (r) => r.targetUserId === user.id || !r.targetUserId
    );

    const merged: Review[] = [...contextReviews];
    jsonReviews.forEach((jr) => {
      if (!merged.some((mr) => mr.id === jr.id)) {
        merged.push({
          id: jr.id,
          targetUserId: jr.targetUserId,
          authorId: jr.authorId,
          authorName: jr.authorName,
          authorAvatar: jr.authorAvatar,
          requestId: jr.requestId,
          requestTitle: jr.requestTitle,
          rating: jr.rating,
          comment: jr.comment,
          date: jr.date,
          role: (jr.role === 'Requester' ? 'Requester' : 'Helper') as 'Requester' | 'Helper',
        });
      }
    });

    return merged.length > 0 ? merged : (initialReviewsData as Review[]);
  }, [reviews, user.id]);

  // Mock Recent Activity Timeline items
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Helped Rahul fix a leaking sink',
      time: '2 days ago',
      category: 'Plumbing',
    },
    {
      id: 'act-2',
      title: 'Completed Math Tutoring session',
      time: '5 days ago',
      category: 'Tutoring',
    },
    {
      id: 'act-3',
      title: 'Received a 5-star review from David Miller',
      time: '1 week ago',
      category: 'Review',
    },
    {
      id: 'act-4',
      title: 'Offered new skill: Bicycle Tune-ups',
      time: '2 weeks ago',
      category: 'Skill',
    },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: editName.trim(),
      profession: editProfession.trim(),
      neighborhood: editNeighborhood.trim(),
      bio: editBio.trim(),
      phone: editPhone.trim(),
    });
    setIsEditProfileOpen(false);
    showToast('Profile updated successfully!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      preferredContact,
    });
    setIsSettingsOpen(false);
    showToast('Settings saved!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-emerald-500 flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-6"
      >
        {/* Subtle decorative background gradient pill */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-indigo-500/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar / Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {user.name}
                </h1>
                <Badge variant="emerald" className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified Neighbor
                </Badge>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                {user.profession || editProfession || 'Community Neighbor'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.neighborhood}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {user.joinedDate || 'March 2023'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 sm:flex-initial"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 sm:flex-initial"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
            "{user.bio}"
          </p>
        )}
      </motion.div>

      {/* 2. Trust Score Section */}
      {(() => {
        const tier = getReputationTier(user.trustScore);
        const avgRatingStr = (user.averageRating !== undefined ? user.averageRating : 5.0).toFixed(1);
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-emerald-800/40"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 text-center md:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Reputation Status</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-center md:justify-start gap-2">
                  <span>Community Trust Score</span>
                  <span className="text-lg font-extrabold text-amber-300">({tier.badge})</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Automatically recalculated based on completed favors and community ratings.
                </p>

                <div className="flex items-center justify-center md:justify-start gap-2 pt-1 flex-wrap">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${tier.colorClass}`}>
                    {tier.badge}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⭐ {avgRatingStr} Rating
                  </div>
                </div>
              </div>

              {/* Prominent Trust Score Badge Display */}
              <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center space-y-2 min-w-[200px] shrink-0">
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                  {user.trustScore}
                  <span className="text-lg text-slate-400 font-normal"> / 100</span>
                </div>

                <div className="flex justify-center">
                  <TrustScoreBadge score={user.trustScore} size="md" />
                </div>

                <p className="text-xs font-bold text-amber-300">
                  {tier.badge}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* 3. Community Contributions Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Reputation & Contributions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Average Rating Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Average Rating
              </p>
              <h3 className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-1 flex items-center gap-1">
                ⭐ {(user.averageRating !== undefined ? user.averageRating : 5.0).toFixed(1)}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </motion.div>

          {/* Trust Score Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Trust Score
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {user.trustScore}%
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Favors Completed Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Completed Favors
              </p>
              <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {user.completedFavors || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Total Reviews Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Reviews
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {user.reviewsCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Skills Offered
            </h2>
          </div>
          <Badge variant="indigo">{userSkillsList.length} Skills</Badge>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Services and expertise offered to neighbors in {user.neighborhood}:
        </p>

        {/* Skills Chips */}
        {isSkillsLoading ? (
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-8 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : skillsError ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-2">
            <p className="text-xs text-rose-600 dark:text-rose-400">{skillsError}</p>
            <Button variant="outline" size="sm" onClick={() => fetchSkills()}>
              Retry
            </Button>
          </div>
        ) : userSkillsList.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-2">
            {userSkillsList.map((skill) => (
              <motion.div
                key={skill}
                whileHover={{ scale: 1.03 }}
                className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{skill}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic pt-1">No skills listed yet.</p>
        )}
      </motion.div>

      {/* Grid container for Reviews & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 5. Reviews Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Neighbor Reviews
              </h2>
            </div>
            <Badge variant="amber">{userReviews.length} Reviews</Badge>
          </div>

          <div className="space-y-3">
            {userReviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>

        {/* 6. Recent Activity Section (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {recentActivities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Timeline Check Icon */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-slate-900">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {act.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile Information"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label="Profession / Title"
            value={editProfession}
            onChange={(e) => setEditProfession(e.target.value)}
            required
          />

          <Input
            label="Neighborhood"
            value={editNeighborhood}
            onChange={(e) => setEditNeighborhood(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Account & App Settings"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Appearance
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isDarkMode ? 'Dark theme active' : 'Light theme active'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
            >
              Toggle Mode
            </Button>
          </div>

          {/* Preferred Contact Method */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredContact('chat')}
                className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  preferredContact === 'chat'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                In-App Chat
              </button>

              <button
                type="button"
                onClick={() => setPreferredContact('phone')}
                className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  preferredContact === 'phone'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone / SMS
              </button>
            </div>
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Email Notifications
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive email alerts when neighbors accept your requests
              </p>
            </div>

            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
