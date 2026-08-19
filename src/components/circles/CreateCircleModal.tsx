import React, { useState } from 'react';
import { useLocationContext } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { createCircle } from '../../services/api';
import { CIRCLE_THEMES, CircleIconBadge } from '../CircleIcons';
import { X, Sparkles, ShieldCheck, MapPin, Globe, Lock, Check } from 'lucide-react';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCircleCreated?: (newCircle: any) => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCircleCreated,
}) => {
  const { location } = useLocationContext();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedThemeKey, setSelectedThemeKey] = useState('gardening');
  const [privacy, setPrivacy] = useState<'Public' | 'Approval Required'>('Public');
  const [neighborhood, setNeighborhood] = useState(location.neighborhood || 'Local Circle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentTheme = CIRCLE_THEMES[selectedThemeKey] || CIRCLE_THEMES.gardening;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a circle name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: currentTheme.name,
        icon: selectedThemeKey,
        privacy,
        neighborhood: neighborhood.trim() || location.neighborhood || 'Local Circle',
        coordinates: [location.lng, location.lat] as [number, number],
      };

      const newCircle = await createCircle(payload);
      if (onCircleCreated) {
        onCircleCreated(newCircle);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create community circle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-[#E6DFD3] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F1E8] hover:bg-[#EAE4D9] flex items-center justify-center text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#2F2F2F] font-heading">
              Create a Neighborhood Circle
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Start a local interest group, tool-sharing club, or activity ring
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Circle Name */}
          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1.5">
              Circle Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekend Balcony Gardeners, Tool Swap Ring..."
              className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E6DFD3] rounded-2xl text-sm font-semibold text-[#2F2F2F] focus:outline-none focus:ring-2 focus:ring-[#355E3B]"
            />
          </div>

          {/* Category & Illustrated Icon Selector */}
          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1.5">
              Select Category & Illustrated Theme
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(CIRCLE_THEMES).map(([key, theme]) => {
                const isSelected = selectedThemeKey === key;
                const Icon = theme.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedThemeKey(key)}
                    className={`p-2.5 rounded-2xl border transition text-left flex flex-col items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'bg-[#FDFBF7] hover:bg-[#F5F1E8] border-[#E6DFD3]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${theme.iconBg} text-white flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-center text-slate-700 truncate w-full">
                      {theme.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1.5">
              About This Circle
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will members share, organize, or do together?"
              className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E6DFD3] rounded-2xl text-sm font-normal text-[#2F2F2F] focus:outline-none focus:ring-2 focus:ring-[#355E3B]"
            />
          </div>

          {/* Neighborhood & Location */}
          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1.5">
              Neighborhood Area
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#C96C4A] absolute left-3.5 top-3" />
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g., Indiranagar & Domlur Circle"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E6DFD3] rounded-2xl text-sm font-semibold text-[#2F2F2F] focus:outline-none focus:ring-2 focus:ring-[#355E3B]"
              />
            </div>
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-1.5">
              Circle Privacy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrivacy('Public')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition ${
                  privacy === 'Public'
                    ? 'bg-emerald-50 border-[#355E3B] ring-2 ring-emerald-500/20'
                    : 'bg-[#FDFBF7] hover:bg-[#F5F1E8] border-[#E6DFD3]'
                }`}
              >
                <Globe className="w-4 h-4 text-[#355E3B] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2F2F2F]">Public Circle</div>
                  <div className="text-[11px] text-slate-500">Any verified neighbor can join instantly</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('Approval Required')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 cursor-pointer transition ${
                  privacy === 'Approval Required'
                    ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20'
                    : 'bg-[#FDFBF7] hover:bg-[#F5F1E8] border-[#E6DFD3]'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2F2F2F]">Approval Required</div>
                  <div className="text-[11px] text-slate-500">Creator approves join requests</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-[#F5F1E8] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#355E3B] hover:bg-[#2A4B2F] text-white text-xs font-bold rounded-2xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Creating Circle...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Create Circle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
