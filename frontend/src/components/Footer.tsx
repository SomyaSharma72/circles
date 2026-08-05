import React from 'react';
import { HeartHandshake, Shield, Heart, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">Neighborly</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strengthening local communities through mutual help, trusted favors, and shared skills.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Browse Requests</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Offer Your Skills</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Trust & Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Neighbor Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-3">Support</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Neighborhood Verification</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Community Standards</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-3">Trust Promise</h4>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>100% Neighbor Verified</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All members are address-verified neighbors with visible trust scores and reviews.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for local neighborhoods.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
