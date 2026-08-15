import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, RefreshCw, X, Check, Search, Sparkles } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_NEIGHBORHOODS = [
  { neighborhood: 'Indiranagar', fullAddress: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { neighborhood: 'Koramangala', fullAddress: 'Koramangala 4th Block, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { neighborhood: 'Bandra West', fullAddress: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { neighborhood: 'Hauz Khas', fullAddress: 'Hauz Khas, New Delhi', lat: 28.5494, lng: 77.2001 },
  { neighborhood: 'Sector 62', fullAddress: 'Sector 62, Noida', lat: 28.6280, lng: 77.3649 },
  { neighborhood: 'HSR Layout', fullAddress: 'HSR Layout Sector 2, Bengaluru', lat: 12.9121, lng: 77.6446 },
  { neighborhood: 'Greenwich Village', fullAddress: 'Greenwich Village, New York', lat: 40.7336, lng: -74.0027 },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { location, isDetecting, refreshLocation, setCustomLocation } = useLocationContext();
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (item: (typeof POPULAR_NEIGHBORHOODS)[0]) => {
    setCustomLocation(item.neighborhood, item.fullAddress, { lat: item.lat, lng: item.lng });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setCustomLocation(customInput.trim(), customInput.trim());
    setCustomInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FBFAF7] border border-[#E6DFD3] rounded-[2rem] max-w-md w-full p-6 shadow-xl space-y-5 text-[#2F2F2F] relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#355E3B]/10 text-[#355E3B] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2F2F2F] font-heading">
                Change Circle Location
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Browse neighbor circles in other neighborhoods
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#E6DFD3] rounded-full transition text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Highlight */}
        <div className="bg-[#F5F1E8] border border-[#E6DFD3] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Currently Selected Circle
            </span>
            <span className="text-xs font-extrabold text-[#2F2F2F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {location.fullAddress || location.neighborhood}
            </span>
          </div>

          <button
            onClick={async () => {
              await refreshLocation();
              onClose();
            }}
            disabled={isDetecting}
            className="px-3 py-1.5 bg-[#355E3B] hover:bg-[#2c4e31] text-white text-[11px] font-bold rounded-full transition flex items-center gap-1 shadow-2xs disabled:opacity-50"
          >
            {isDetecting ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3 h-3" />
                <span>Auto-GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Search or Input */}
        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="text-[11px] font-bold text-slate-600 block">
            Enter your neighborhood or landmark
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Indiranagar, Bandra West, Powell St..."
              className="w-full pl-10 pr-20 py-2.5 bg-white border border-[#E6DFD3] rounded-full text-xs font-semibold text-[#2F2F2F] placeholder:text-slate-400 focus:outline-hidden focus:border-[#355E3B]"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="absolute right-1.5 px-3 py-1.5 bg-[#C96C4A] hover:bg-[#b25b3a] disabled:opacity-40 text-white text-[11px] font-bold rounded-full transition shadow-2xs"
            >
              Set
            </button>
          </div>
        </form>

        {/* Popular Active Circles Presets */}
        <div className="space-y-2 pt-1 border-t border-[#E6DFD3]">
          <span className="text-[11px] font-bold text-slate-500 block">
            Popular Neighborhood Circles
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {POPULAR_NEIGHBORHOODS.map((item) => {
              const isSelected =
                location.neighborhood.toLowerCase() === item.neighborhood.toLowerCase();
              return (
                <button
                  key={item.neighborhood}
                  onClick={() => handleSelectPreset(item)}
                  className={`p-2.5 rounded-2xl text-left border transition flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-[#355E3B]/10 border-[#355E3B] text-[#355E3B] font-extrabold'
                      : 'bg-white hover:bg-[#F5F1E8] border-[#E6DFD3] text-[#2F2F2F] font-semibold'
                  }`}
                >
                  <span className="truncate">{item.neighborhood}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#355E3B] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
