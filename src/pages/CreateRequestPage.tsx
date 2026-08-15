import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFavorRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Heart,
  MapPin,
  Crosshair,
} from 'lucide-react';

export const CreateRequestPage: React.FC = () => {
  const { user } = useAuth();
  const { location } = useLocationContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(
    user?.neighborhood || location.fullAddress || location.neighborhood || 'Local Circle'
  );
  const [coordinates, setCoordinates] = useState<[number, number]>(
    user?.location?.coordinates || [location.lng, location.lat]
  );

  useEffect(() => {
    if (!user?.neighborhood && location.neighborhood && locationName === 'Local Circle') {
      setLocationName(location.fullAddress || location.neighborhood);
      setCoordinates([location.lng, location.lat]);
    }
  }, [location, user, locationName]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and description for your request.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const created = await createFavorRequest({
        title,
        description,
        locationName,
        coordinates,
      });

      navigate(`/request/${created._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-[#E6DFD3] rounded-3xl shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-[#E6DFD3] space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#355E3B]/10 border border-[#355E3B]/20 text-[#355E3B] text-xs font-bold rounded-full">
            <Heart className="w-3.5 h-3.5 text-[#355E3B] fill-[#355E3B]" />
            <span>Circles Neighborhood Aid</span>
          </div>
          <h1 className="font-extrabold text-3xl text-[#2F2F2F] font-heading">Ask your neighbors for help</h1>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Describe what you need. Nearby verified neighbors in your circle will be notified instantly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2F2F2F] uppercase tracking-wider mb-2">
              What do you need help with?
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Borrow Bosch Drill Machine" or "Need scooter jumpstart"'
              className="w-full px-4 py-3.5 bg-[#F5F1E8]/60 border border-[#E6DFD3] rounded-2xl text-sm text-[#2F2F2F] placeholder:text-slate-400 focus:outline-hidden focus:border-[#C96C4A] focus:bg-white transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2F2F] uppercase tracking-wider mb-2">
              Description & Details
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about timing, tools, or location specifics..."
              className="w-full px-4 py-3.5 bg-[#F5F1E8]/60 border border-[#E6DFD3] rounded-2xl text-sm text-[#2F2F2F] placeholder:text-slate-400 focus:outline-hidden focus:border-[#C96C4A] focus:bg-white transition font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#2F2F2F] uppercase tracking-wider">
                  Neighborhood / Area
                </label>
                {location.neighborhood && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationName(location.fullAddress || location.neighborhood);
                      setCoordinates([location.lng, location.lat]);
                    }}
                    className="text-[11px] font-bold text-[#C96C4A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Use live GPS</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Indiranagar, Bengaluru or Bandra West"
                className="w-full px-4 py-3 bg-[#F5F1E8]/60 border border-[#E6DFD3] rounded-2xl text-sm text-[#2F2F2F] focus:outline-hidden focus:border-[#C96C4A] focus:bg-white transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2F2F] uppercase tracking-wider mb-2">
                Coordinates
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  value={`${coordinates[1].toFixed(4)}° N, ${coordinates[0].toFixed(4)}° E`}
                  className="w-full px-4 py-3 bg-[#F5F1E8]/40 border border-[#E6DFD3] rounded-2xl text-xs text-slate-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Smart Neighbor Matching info */}
          <div className="bg-[#355E3B]/10 border border-[#355E3B]/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#355E3B]">
            <Sparkles className="w-5 h-5 text-[#355E3B] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#355E3B] mb-0.5 font-heading">Circle Match Engine</h4>
              <p className="text-slate-700 leading-relaxed font-medium">
                Your request will be matched automatically with nearby verified neighbors who hold matching skill circles.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#C96C4A] hover:bg-[#b05a3b] text-white font-extrabold text-sm rounded-full transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xs active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing request...</span>
              </>
            ) : (
              <>
                <span>Publish Help Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
