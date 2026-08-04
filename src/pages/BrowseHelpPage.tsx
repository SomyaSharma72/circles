import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/SearchBar';
import { RequestCard } from '../components/RequestCard';
import { Button } from '../components/Button';
import { HeartHandshake, FilterX, Sparkles, Compass, Search } from 'lucide-react';

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
  const { requests } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
      {/* 1. Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-3 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Local Community Favors</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Find ways to help your community
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Browse requests posted by neighbors nearby and offer your help.
        </p>
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
        {filteredRequests.length > 0 ? (
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
    </div>
  );
};
