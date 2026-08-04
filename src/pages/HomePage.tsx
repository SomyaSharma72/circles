import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { RequestCard } from '../components/RequestCard';
import { ProfileCard } from '../components/ProfileCard';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { SearchBar } from '../components/SearchBar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { HelpRequest, User, RequestCategory } from '../types';

import {
  HeartHandshake,
  Wrench,
  Users,
  Star,
  Check,
  Activity,
  ArrowRight,
  Sparkles,
  MapPin,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Gift,
} from 'lucide-react';

const CATEGORIES = [
  'Medical',
  'Tutoring',
  'Plumbing',
  'Electrical',
  'Pet Care',
  'Transportation',
  'Gardening',
  'Technology',
  'Household',
];

const USER_PROFESSIONS: Record<string, string> = {
  u1: 'High School Math Teacher',
  u2: 'Software Engineer & Woodworker',
  u3: 'Retired Nurse & Plant Specialist',
  u4: 'Handyman & DIY Enthusiast',
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, requests, allUsers, addRequest } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Household');
  const [newDescription, setNewDescription] = useState('');
  const [newUrgency, setNewUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newPoints, setNewPoints] = useState('20 Points / Home baked cookies');
  const [newDateNeeded, setNewDateNeeded] = useState('Tomorrow');

  // Selected Helper Modal state
  const [selectedHelper, setSelectedHelper] = useState<User | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Nearby Help Requests (Latest 3-4 active requests)
  const nearbyRequests = useMemo(() => {
    return requests.slice(0, 4);
  }, [requests]);

  // 2. Top Community Helpers (Top 3 users sorted by trust score / completed favors)
  const topHelpers = useMemo(() => {
    return [...allUsers]
      .sort((a, b) => b.trustScore - a.trustScore || (b.completedFavors || 0) - (a.completedFavors || 0))
      .slice(0, 3);
  }, [allUsers]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse-help?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle Category Click
  const handleCategoryClick = (category: string) => {
    navigate(`/browse-help?category=${encodeURIComponent(category)}`);
  };

  // Handle Post Help Request from Modal
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    addRequest({
      title: newTitle.trim(),
      category: newCategory as RequestCategory,
      description: newDescription.trim(),
      urgency: newUrgency,
      distance: '0.2 miles away',
      pointsOrOffer: newPoints.trim() || undefined,
      dateNeeded: newDateNeeded,
      neighborhood: currentUser?.neighborhood || 'Maplewood Terrace',
    });

    setIsRequestModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    showToast('Help request posted successfully to your neighborhood!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10">
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

      {/* ==================== 1. TOP SECTION ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Neighborhood Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {currentUser?.name || 'Sarah'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Let's make your neighborhood a little better today.
          </p>
        </div>

        {/* Current Trust Score Badge */}
        <div className="z-10 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Your Reputation
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.neighborhood || 'Maplewood Terrace'}
            </p>
          </div>
          <TrustScoreBadge score={currentUser?.trustScore || 99} size="md" />
        </div>

        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 via-indigo-500/5 to-transparent rounded-r-3xl pointer-events-none" />
      </motion.div>

      {/* ==================== COMMUNITY IMPACT CARD ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.03 }}
        className="bg-indigo-600 dark:bg-indigo-950 rounded-2xl p-5 text-white shadow-md space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/40 pb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-200" />
            <h2 className="text-base font-extrabold tracking-tight">Community Impact</h2>
          </div>
          <p className="text-xs text-indigo-100 font-medium">
            Helping neighbors build stronger communities.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center pt-1">
          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-lg font-black sm:text-xl">128</div>
            <div className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">Completed Favors</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-lg font-black sm:text-xl">98%</div>
            <div className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">Trust Score</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-lg font-black sm:text-xl">84</div>
            <div className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">Skills Shared</div>
          </div>
        </div>
      </motion.div>

      {/* ==================== 2. SEARCH ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search neighbors, skills or help requests..."
            className="shadow-sm hover:shadow-md transition-shadow"
          />
        </form>
      </motion.div>

      {/* ==================== 3. QUICK ACTIONS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 🆘 Request Help Card */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsRequestModalOpen(true)}
          className="cursor-pointer bg-gradient-to-br from-rose-50 via-white to-rose-50/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-rose-200/80 dark:border-rose-900/40 shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-2 max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
              🆘
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Request Help</span>
                <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Need a hand with plumbing, pet sitting, or yard work? Ask verified neighbors nearby.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" className="hidden sm:inline-flex shrink-0">
            Post Request
          </Button>
        </motion.div>

        {/* 🛠 Offer Skill Card */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('/offer-skill')}
          className="cursor-pointer bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-2 max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
              🛠
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Offer Skill</span>
                <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Share your time or expertise in tutoring, repairs, or gardening to earn Trust Points.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" className="hidden sm:inline-flex shrink-0">
            Offer Skill
          </Button>
        </motion.div>
      </div>

      {/* ==================== 4. CATEGORIES ==================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Browse Categories
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            Scroll to discover
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-all shadow-xs hover:shadow-sm shrink-0"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== 5. NEARBY HELP REQUESTS ==================== */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Nearby Help Requests
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Favors needed right now in {currentUser?.neighborhood || 'Maplewood Terrace'}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/browse-help')}
            className="shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {nearbyRequests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      </div>

      {/* ==================== 6. TOP COMMUNITY HELPERS ==================== */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Top Community Helpers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trusted neighbors with the highest reliability scores and completed favors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topHelpers.map((helper) => (
            <div
              key={helper.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Profile Card Header & Details */}
              <div className="space-y-3">
                <ProfileCard user={helper} compact={false} />

                {/* Profession Tag */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  💼 {USER_PROFESSIONS[helper.id] || 'Community Volunteer'}
                </div>

                {/* Skills Chips */}
                {helper.skills && helper.skills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {helper.skills.slice(0, 3).map((sk) => (
                        <Badge key={sk} variant="indigo" className="text-[10px]">
                          {sk}
                        </Badge>
                      ))}
                      {helper.skills.length > 3 && (
                        <Badge variant="slate" className="text-[10px]">
                          +{helper.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Profile Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHelper(helper)}
                className="w-full justify-center"
              >
                View Profile
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 7. COMMUNITY STATS ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl shrink-0">
            ❤️
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              128
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Favors Completed
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            👥
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              52
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Neighbors
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
            🛠
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              84
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Skills Shared
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            ⭐
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              4.9
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Community Rating
            </p>
          </div>
        </motion.div>
      </div>

      {/* ==================== 8. RECENT ACTIVITY ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recent Community Activity
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {/* Timeline Item 1 */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Rahul completed a tutoring session.
              </p>
              <p className="text-[10px] font-medium text-slate-400">2 hours ago</p>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Aman offered Plumbing assistance.
              </p>
              <p className="text-[10px] font-medium text-slate-400">5 hours ago</p>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-slate-900">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Priya received a new 5-star review.
              </p>
              <p className="text-[10px] font-medium text-slate-400">Yesterday</p>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE HELP REQUEST MODAL */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Post a Help Request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Input
            label="What do you need help with?"
            placeholder="e.g. Need help carrying couch or watering plants"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Details & Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Describe the favor, tools required, or timing details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Urgency Level
              </label>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="low">Flexible / Low</option>
                <option value="medium">Medium</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <Input
              label="When needed?"
              value={newDateNeeded}
              onChange={(e) => setNewDateNeeded(e.target.value)}
            />
          </div>

          <Input
            label="Gratitude Offer (Optional)"
            placeholder="e.g. Fresh baked pie, 20 Trust Points, or coffee"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRequestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Post Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* HELPER DETAIL PROFILE MODAL */}
      <Modal
        isOpen={!!selectedHelper}
        onClose={() => setSelectedHelper(null)}
        title="Community Helper Profile"
        maxWidth="md"
      >
        {selectedHelper && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <img
                src={selectedHelper.avatar}
                alt={selectedHelper.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedHelper.name}
                  </h3>
                  {selectedHelper.verifiedNeighbor && (
                    <Badge variant="emerald" className="text-[10px]">
                      Verified Neighbor
                    </Badge>
                  )}
                </div>

                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {USER_PROFESSIONS[selectedHelper.id] || 'Community Volunteer'}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedHelper.neighborhood}
                  </span>
                  <TrustScoreBadge score={selectedHelper.trustScore} size="sm" />
                </div>
              </div>
            </div>

            {selectedHelper.bio && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  About
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{selectedHelper.bio}"
                </p>
              </div>
            )}

            {selectedHelper.skills && selectedHelper.skills.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Skills Offered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHelper.skills.map((s) => (
                    <Badge key={s} variant="indigo">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedHelper(null);
                  navigate('/browse-help');
                }}
              >
                Ask for Help
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHelper(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
