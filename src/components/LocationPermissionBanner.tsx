import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Navigation, RefreshCw } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

export const LocationPermissionBanner: React.FC = () => {
  const { permissionStatus, showPermissionBanner, dismissBanner, refreshLocation, isDetecting } =
    useLocationContext();

  // Only show if user has denied or is in prompt state and banner hasn't been dismissed
  if (permissionStatus === 'granted' || !showPermissionBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-[#F5F1E8] border-b border-[#E6DFD3] px-4 py-2.5 text-xs text-[#2F2F2F] relative z-30"
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-6 h-6 rounded-full bg-[#C96C4A]/15 text-[#C96C4A] flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong className="font-bold">Enable location</strong> for accurate neighborhood recommendations and nearby circles.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshLocation()}
              disabled={isDetecting}
              className="px-3 py-1 bg-[#355E3B] hover:bg-[#2c4e31] text-white font-bold rounded-full transition text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  <span>Enable Live Location</span>
                </>
              )}
            </button>

            <button
              onClick={dismissBanner}
              className="p-1 hover:bg-[#E6DFD3] text-slate-500 hover:text-[#2F2F2F] rounded-full transition cursor-pointer"
              title="Dismiss"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
