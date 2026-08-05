import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/SearchBar';
import { RequestCard } from '../components/RequestCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { RequestCategory } from '../types';
import { HeartHandshake, FilterX, Sparkles, Compass, Search, PlusCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Medical',
  'Tutoring',
  'Plumbing',
  'Electrical',
  'Pet Care',
  'Transportation',
  'Gardening',
  'Technology',
];

export const BrowseHelpPage: React.FC = () => {
  const { currentUser, requests, addRequest, isRequestsLoading, requestsError, fetchRequests } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Household');
  const [newDescription, setNewDescription] = useState('');
  const [newUrgency, setNewUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newPoints, setNewPoints] = useState('Neighborly Gratitude');
  const [newDateNeeded, setNewDateNeeded] = useState('Tomorrow');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Filter requests based on search term and selected category
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' ||
        req.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Technology' && req.category.toLowerCase().includes('tech'));

      // Search match (title, description, category, neighborhood, requesterName)
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        req.title.toLowerCase().includes(term) ||
        req.description.toLowerCase().includes(term) ||
        req.category.toLowerCase().includes(term) ||
        req.neighborhood.toLowerCase().includes(term) ||
        req.requesterName.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [requests, selectedCategory, searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
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

      {/* 1. Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Local Community Favors</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Find ways to help your community
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Browse requests posted by neighbors nearby or post your own help request.
        </p>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Help Request</span>
          </Button>
        </div>
      </motion.div>

      {/* Search & Filter Bar Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 2. Search Bar */}
        <div className="relative">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search requests..."
            onClear={() => setSearchTerm('')}
            className="shadow-md shadow-slate-200/50 dark:shadow-none"
          />
        </div>

        {/* 3. Category Filters (Pill/Chip buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results summary header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredRequests.length}</span> help request{filteredRequests.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' && <span> in <span className="text-indigo-600 font-semibold">{selectedCategory}</span></span>}
        </div>
        {(searchTerm || selectedCategory !== 'All') && (
          <button
            onClick={handleClearFilters}
            className="text-indigo-600 hover:underline font-medium text-xs flex items-center gap-1"
          >
            <FilterX className="w-3.5 h-3.5" />
            Clear active filters
          </button>
        )}
      </div>

      {/* 4. Help Request Grid / 5. Empty State */}
      <AnimatePresence mode="wait">
        {isRequestsLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800/80 rounded-2xl animate-pulse" />
            ))}
          </motion.div>
        ) : requestsError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3 max-w-lg mx-auto"
          >
            <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
              Failed to load help requests
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-300">{requestsError}</p>
            <Button variant="outline" size="sm" onClick={() => fetchRequests()}>
              Try Again
            </Button>
          </motion.div>
        ) : filteredRequests.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </motion.div>
        ) : (
          /* 5. Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-8 shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                No requests found.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                We couldn't find any help requests matching your search or selected category filter.
              </p>
            </div>

            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="md"
              className="mt-2"
            >
              <FilterX className="w-4 h-4 mr-1.5" />
              Clear Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE REQUEST MODAL */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Post a New Help Request"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Input
            label="Request Title *"
            placeholder="e.g. Need help moving a couch this Saturday"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Urgency Level
              </label>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                <option value="low">Low Urgency</option>
                <option value="medium">Flexible / Medium</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date Needed"
              placeholder="e.g. Tomorrow or Saturday afternoon"
              value={newDateNeeded}
              onChange={(e) => setNewDateNeeded(e.target.value)}
            />

            <Input
              label="Community Gratitude / Offer"
              placeholder="e.g. 20 Points / Freshly baked pie"
              value={newPoints}
              onChange={(e) => setNewPoints(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe what you need help with in detail..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRequestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Post Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
