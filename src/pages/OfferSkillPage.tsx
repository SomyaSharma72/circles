import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SkillOffer, RequestCategory } from '../types';
import { SkillCard } from '../components/SkillCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import {
  Sparkles,
  Wrench,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  X,
  Layers,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_OPTIONS: RequestCategory[] = [
  'Medical' as RequestCategory,
  'Tutoring',
  'Plumbing' as RequestCategory,
  'Electrical' as RequestCategory,
  'Pet Care',
  'Transportation' as RequestCategory,
  'Gardening',
  'Technology' as RequestCategory,
  'Household' as RequestCategory,
  'Other',
];

const AVAILABILITY_CHIPS = ['Weekdays', 'Weekends', 'Morning', 'Afternoon', 'Evening'];

const SERVICE_RADIUS_OPTIONS = ['Within 1 km', 'Within 3 km', 'Within 5 km', 'Anywhere'];

export const OfferSkillPage: React.FC = () => {
  const {
    currentUser,
    skills,
    addSkillOffer,
    updateSkillOffer,
    deleteSkillOffer,
    isSkillsLoading,
    skillsError,
    fetchSkills,
  } = useApp();

  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<RequestCategory>('Tutoring');
  const [description, setDescription] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(['Weekends']);
  const [serviceRadius, setServiceRadius] = useState('Within 3 km');

  // UI / Validation State
  const [errors, setErrors] = useState<{
    skillName?: string;
    category?: string;
    description?: string;
    availability?: string;
  }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAvailabilityChip = (chip: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(chip) ? prev.filter((item) => item !== chip) : [...prev, chip]
    );
    if (errors.availability) {
      setErrors((prev) => ({ ...prev, availability: undefined }));
    }
  };

  const handleSelectExample = (exampleName: string, exampleCategory?: RequestCategory) => {
    setSkillName(exampleName);
    if (exampleCategory) setCategory(exampleCategory);
    if (errors.skillName) {
      setErrors((prev) => ({ ...prev, skillName: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      skillName?: string;
      category?: string;
      description?: string;
      availability?: string;
    } = {};

    if (!skillName.trim()) {
      newErrors.skillName = 'Skill name is required.';
    }
    if (!category) {
      newErrors.category = 'Please select a category.';
    }
    if (!description.trim()) {
      newErrors.description = 'Please provide a brief description of your skill.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters long.';
    }
    if (selectedAvailability.length === 0) {
      newErrors.availability = 'Please select at least one availability slot.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setEditingSkillId(null);
    setSkillName('');
    setCategory('Tutoring');
    setDescription('');
    setSelectedAvailability(['Weekends']);
    setServiceRadius('Within 3 km');
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const availabilityString = selectedAvailability.join(', ');

    if (editingSkillId) {
      // Update existing skill
      updateSkillOffer(editingSkillId, {
        title: skillName.trim(),
        category,
        description: description.trim(),
        availability: availabilityString,
        serviceRadius,
        skills: [skillName.trim()],
      });
      showToast('Skill updated successfully!');
    } else {
      // Create new skill offer
      addSkillOffer({
        title: skillName.trim(),
        category,
        description: description.trim(),
        availability: availabilityString,
        serviceRadius,
        skills: [skillName.trim()],
        neighborhood: currentUser?.neighborhood || 'Maplewood Terrace',
      });
      showToast('Your skill offer has been published to the neighborhood!');
    }

    resetForm();
  };

  const handleEditSkill = (skill: SkillOffer) => {
    setEditingSkillId(skill.id);
    setSkillName(skill.title);
    setCategory(skill.category);
    setDescription(skill.description);
    setServiceRadius(skill.serviceRadius || 'Within 3 km');

    // Parse availability string into chips if possible
    if (skill.availability) {
      const parsed = AVAILABILITY_CHIPS.filter((chip) =>
        skill.availability.toLowerCase().includes(chip.toLowerCase())
      );
      setSelectedAvailability(parsed.length > 0 ? parsed : ['Weekends']);
    }

    setErrors({});

    // Scroll smoothly to form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteSkill = (skill: SkillOffer) => {
    deleteSkillOffer(skill.id);
    if (editingSkillId === skill.id) {
      resetForm();
    }
    showToast(`Deleted skill "${skill.title}"`);
  };

  // User's active skills or all skills for display in "My Active Skills"
  const activeSkills = skills.filter((s) => !currentUser || s.userId === currentUser.id || true);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Toast notification banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-emerald-500 flex items-center gap-3 text-xs sm:text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-white shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white dark:text-emerald-200 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-3 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Neighborly Skill Exchange</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Offer Your Skill
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Share your skills with your neighborhood and help someone nearby.
        </p>
      </motion.div>

      {/* Main Form Section */}
      <motion.div
        ref={formRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSkillId ? 'Edit Offered Skill' : 'Skill Offer Details'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingSkillId
                  ? 'Update your existing skill offering'
                  : 'Fill out the form below to list a skill you can lend to neighbors.'}
              </p>
            </div>
          </div>

          {editingSkillId && (
            <Badge variant="amber" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Editing Mode
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Skill Name (Text Input) */}
          <div className="space-y-2">
            <Input
              label="Skill Name"
              placeholder="e.g. Plumbing, Math Tutoring, Dog Walking..."
              value={skillName}
              onChange={(e) => {
                setSkillName(e.target.value);
                if (errors.skillName) setErrors((prev) => ({ ...prev, skillName: undefined }));
              }}
              error={errors.skillName}
            />

            {/* Examples Pill List */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-medium text-slate-400">Examples:</span>
              <button
                type="button"
                onClick={() => handleSelectExample('Plumbing', 'Plumbing' as RequestCategory)}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Plumbing
              </button>
              <button
                type="button"
                onClick={() => handleSelectExample('Math Tutoring', 'Tutoring')}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Math Tutoring
              </button>
              <button
                type="button"
                onClick={() => handleSelectExample('Dog Walking', 'Pet Care')}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Dog Walking
              </button>
              <button
                type="button"
                onClick={() => handleSelectExample('Laptop Repair', 'Technology' as RequestCategory)}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Laptop Repair
              </button>
            </div>
          </div>

          {/* 2. Category (Dropdown) & 5. Service Radius (Dropdown) Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as RequestCategory);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.category
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-[11px] font-medium text-rose-500">{errors.category}</p>
              )}
            </div>

            {/* Service Radius Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Service Radius
              </label>
              <select
                value={serviceRadius}
                onChange={(e) => setServiceRadius(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {SERVICE_RADIUS_OPTIONS.map((radius) => (
                  <option key={radius} value={radius}>
                    {radius}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Description (Textarea) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={4}
              placeholder='e.g. "I have 5 years of plumbing experience and can help with basic home repairs."'
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                errors.description
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.description ? (
              <p className="text-[11px] font-medium text-rose-500">{errors.description}</p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Describe your experience, tools you bring, or details about how you can assist neighbors.
              </p>
            )}
          </div>

          {/* 4. Availability (Simple Chips Multi Select) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Availability <span className="text-slate-400 font-normal">(Select all that apply)</span>
            </label>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {AVAILABILITY_CHIPS.map((chip) => {
                const isSelected = selectedAvailability.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleAvailabilityChip(chip)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{chip}</span>
                  </button>
                );
              })}
            </div>
            {errors.availability && (
              <p className="text-[11px] font-medium text-red-500">{errors.availability}</p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={resetForm}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="min-w-[130px]"
            >
              <Wrench className="w-4 h-4" />
              <span>{editingSkillId ? 'Update Skill' : 'Offer Skill'}</span>
            </Button>
          </div>
        </form>
      </motion.div>

      {/* "My Active Skills" Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>My Active Skills</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage the skills you have listed in your neighborhood.
            </p>
          </div>

          <Badge variant="indigo">{activeSkills.length} Listed</Badge>
        </div>

        {/* Display existing skills using SkillCard */}
        <AnimatePresence mode="popLayout">
          {isSkillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : skillsError ? (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-rose-900 dark:text-rose-200 text-base">Failed to load skills</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400">{skillsError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchSkills()}>
                Try Again
              </Button>
            </div>
          ) : activeSkills.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <SkillCard
                    skill={skill}
                    onEdit={() => handleEditSkill(skill)}
                    onDelete={() => handleDeleteSkill(skill)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3 max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No active skills listed yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use the form above to add your first skill offer and start helping neighbors nearby.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
