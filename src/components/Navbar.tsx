import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  PlusCircle,
  MapPin,
  ChevronDown,
  Zap,
  Home,
  User,
  LogOut,
  ShieldCheck,
  Compass,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

export const Navbar: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { isReconnecting } = useSocketContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleQuickDemo = async () => {
    try {
      await login('priya@neighborly.app', 'password123');
      navigate('/profile');
    } catch (err) {
      console.error('Quick demo login error:', err);
      navigate('/auth');
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FBFAF7]/90 backdrop-blur-md border-b border-[#E6DFD3] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        {/* Reconnecting Alert */}
        {isReconnecting && (
          <div className="absolute top-full left-0 right-0 bg-[#C96C4A] text-white text-xs py-1 px-4 text-center font-bold flex items-center justify-center gap-2 z-50">
            <span>Reconnecting to neighborhood circle...</span>
          </div>
        )}

        {/* Brand & Interconnected Rings Logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Interconnected Rings Logo */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#355E3B] opacity-90 group-hover:scale-105 transition"></div>
              <div className="absolute top-1 left-1 w-5 h-5 rounded-full border-2 border-[#FBFAF7]"></div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#C96C4A] bg-[#C96C4A]/30"></div>
            </div>

            <div>
              <span className="font-extrabold text-2xl text-[#2F2F2F] tracking-tight block leading-none font-heading">
                Circles
              </span>
              <span className="text-[10px] font-semibold text-[#6E8B5B] block mt-0.5 tracking-tight">
                People around you, not strangers online.
              </span>
            </div>
          </Link>

          {/* Location Picker Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#F5F1E8] hover:bg-[#E6DFD3] rounded-full text-xs font-bold text-[#2F2F2F] cursor-pointer transition border border-[#E6DFD3] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#355E3B] animate-pulse"></span>
            <MapPin className="w-3.5 h-3.5 text-[#C96C4A] shrink-0" />
            <span className="truncate max-w-[140px]">Sector 62, Noida</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask for Help Button */}
          <Link
            to="/create-request"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#C96C4A] hover:bg-[#b25b3a] text-white text-xs font-bold rounded-full shadow-xs transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ask for Help</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/chats"
                className={`p-2 rounded-full border transition flex items-center gap-1.5 text-xs font-bold ${
                  isActive('/chats')
                    ? 'bg-[#355E3B] text-white border-[#355E3B]'
                    : 'bg-[#F5F1E8] hover:bg-[#E6DFD3] text-[#355E3B] border-[#E6DFD3]'
                }`}
                title="Neighborhood Chats"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden md:inline">Chats</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#F5F1E8] hover:bg-[#E6DFD3] border border-[#E6DFD3] transition group shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#355E3B] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-extrabold text-[#2F2F2F] block leading-none group-hover:text-[#C96C4A]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#355E3B] font-bold flex items-center gap-0.5 mt-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {user.trustScore} Trust
                  </span>
                </div>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickDemo}
                className="px-3.5 py-1.5 bg-[#C96C4A]/10 hover:bg-[#C96C4A]/20 text-[#C96C4A] border border-[#C96C4A]/30 text-xs font-bold rounded-full transition flex items-center gap-1.5"
                title="Instant 1-Click Demo Login"
              >
                <Zap className="w-3.5 h-3.5 fill-[#C96C4A] text-[#C96C4A]" />
                <span className="hidden sm:inline">1-Click Demo</span>
              </button>
              <Link
                to="/auth"
                className="px-4 py-1.5 bg-[#355E3B] hover:bg-[#2c4e31] text-white text-xs font-bold rounded-full transition shadow-2xs"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Fixed Circular Active Bottom Navigation Bar */}
      <nav className="fixed bottom-3 left-0 right-0 z-50 px-4 max-w-md mx-auto sm:max-w-xl">
        <div className="bg-[#FBFAF7]/95 backdrop-blur-md border border-[#E6DFD3] py-2 px-4 shadow-xl rounded-full flex items-center justify-around">
          {/* Tab 1: Home */}
          <Link
            to="/"
            className="relative flex flex-col items-center justify-center p-2 text-xs font-bold transition group"
          >
            {isActive('/') && (
              <motion.div
                layoutId="activeCircleTab"
                className="absolute inset-0 bg-[#355E3B]/15 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Home
              className={`w-5 h-5 relative z-10 ${
                isActive('/') ? 'text-[#355E3B] stroke-[2.5]' : 'text-slate-500 group-hover:text-[#2F2F2F]'
              }`}
            />
            <span
              className={`text-[11px] relative z-10 mt-0.5 ${
                isActive('/') ? 'text-[#355E3B] font-extrabold' : 'text-slate-500'
              }`}
            >
              Home
            </span>
          </Link>

          {/* Tab 2: Map */}
          <Link
            to="/area-scan"
            className="relative flex flex-col items-center justify-center p-2 text-xs font-bold transition group"
          >
            {isActive('/area-scan') && (
              <motion.div
                layoutId="activeCircleTab"
                className="absolute inset-0 bg-[#C96C4A]/15 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Compass
              className={`w-5 h-5 relative z-10 ${
                isActive('/area-scan') ? 'text-[#C96C4A] stroke-[2.5]' : 'text-slate-500 group-hover:text-[#2F2F2F]'
              }`}
            />
            <span
              className={`text-[11px] relative z-10 mt-0.5 ${
                isActive('/area-scan') ? 'text-[#C96C4A] font-extrabold' : 'text-slate-500'
              }`}
            >
              Circles Map
            </span>
          </Link>

          {/* Tab 3: Chats */}
          <Link
            to={user ? "/chats" : "/auth"}
            className="relative flex flex-col items-center justify-center p-2 text-xs font-bold transition group"
          >
            {isActive('/chats') && (
              <motion.div
                layoutId="activeCircleTab"
                className="absolute inset-0 bg-[#355E3B]/15 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <MessageSquare
              className={`w-5 h-5 relative z-10 ${
                isActive('/chats') ? 'text-[#355E3B] stroke-[2.5]' : 'text-slate-500 group-hover:text-[#2F2F2F]'
              }`}
            />
            <span
              className={`text-[11px] relative z-10 mt-0.5 ${
                isActive('/chats') ? 'text-[#355E3B] font-extrabold' : 'text-slate-500'
              }`}
            >
              Chats
            </span>
          </Link>

          {/* Tab 4: Request */}
          <Link
            to="/create-request"
            className="relative flex flex-col items-center justify-center p-2 text-xs font-bold transition group"
          >
            {isActive('/create-request') && (
              <motion.div
                layoutId="activeCircleTab"
                className="absolute inset-0 bg-[#C96C4A]/15 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <PlusCircle
              className={`w-5 h-5 relative z-10 ${
                isActive('/create-request') ? 'text-[#C96C4A] stroke-[2.5]' : 'text-[#C96C4A]'
              }`}
            />
            <span
              className={`text-[11px] relative z-10 mt-0.5 ${
                isActive('/create-request') ? 'text-[#C96C4A] font-extrabold' : 'text-slate-500'
              }`}
            >
              Request
            </span>
          </Link>

          {/* Tab 5: Profile */}
          <Link
            to={user ? "/profile" : "/auth"}
            className="relative flex flex-col items-center justify-center p-2 text-xs font-bold transition group"
          >
            {(isActive('/profile') || isActive('/dashboard')) && (
              <motion.div
                layoutId="activeCircleTab"
                className="absolute inset-0 bg-[#355E3B]/15 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <User
              className={`w-5 h-5 relative z-10 ${
                (isActive('/profile') || isActive('/dashboard'))
                  ? 'text-[#355E3B] stroke-[2.5]'
                  : 'text-slate-500 group-hover:text-[#2F2F2F]'
              }`}
            />
            <span
              className={`text-[11px] relative z-10 mt-0.5 ${
                (isActive('/profile') || isActive('/dashboard')) ? 'text-[#355E3B] font-extrabold' : 'text-slate-500'
              }`}
            >
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};
