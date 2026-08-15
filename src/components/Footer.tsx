import React from 'react';
import { ShieldCheck, Heart, MapPin } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

export const Footer: React.FC = () => {
  const { location } = useLocationContext();

  return (
    <footer className="bg-[#FBFAF7] text-[#2F2F2F]/80 text-sm border-t border-[#E6DFD3] mt-16 relative z-10 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#2F2F2F] font-extrabold text-xl font-heading">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#355E3B]"></div>
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#C96C4A] bg-[#C96C4A]/40"></div>
            </div>
            <span>Circles</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            People around you, not strangers online. Local neighborhood help, tool sharing, tutoring, and pet care with zero cash involved.
          </p>
        </div>

        <div>
          <h4 className="text-[#2F2F2F] text-xs font-extrabold uppercase tracking-wider mb-3">Popular Circles</h4>
          <ul className="space-y-2 text-xs text-slate-600 font-medium">
            <li className="flex items-center gap-1.5">• Borrow Drill & Step Ladder</li>
            <li className="flex items-center gap-1.5">• Scooter & Vehicle Jumpstart</li>
            <li className="flex items-center gap-1.5">• Pet Feeding & Dog Walking</li>
            <li className="flex items-center gap-1.5">• Physics & Math Tutoring</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#2F2F2F] text-xs font-extrabold uppercase tracking-wider mb-3">Active Circles</h4>
          <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
            {location.neighborhood && (
              <li className="text-[#355E3B] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#355E3B] animate-pulse"></span>
                <span>{location.neighborhood} (Your Circle)</span>
              </li>
            )}
            <li>• Indiranagar 100ft Rd, Bengaluru</li>
            <li>• Bandra West, Mumbai</li>
            <li>• Koramangala 5th Block</li>
            <li>• Hauz Khas & GK1, New Delhi</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#2F2F2F] text-xs font-extrabold uppercase tracking-wider mb-3">Circle Trust</h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3 font-medium">
            Verified neighbor profiles, mutual trust scores, and local circle proximity.
          </p>
          <span className="inline-block px-3 py-1 bg-[#355E3B]/10 text-[#355E3B] text-[11px] font-extrabold rounded-full border border-[#355E3B]/20">
            100% Free • Pure Neighbor Help
          </span>
        </div>
      </div>

      <div className="border-t border-[#E6DFD3] py-4 text-center text-xs font-semibold text-slate-400">
        © 2026 Circles • Local help, shared everyday
      </div>
    </footer>
  );
};
