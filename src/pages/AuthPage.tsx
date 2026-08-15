import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { MapPin, AlertCircle, Zap, UserCheck, Crosshair } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, user } = useAuth();
  const { location, refreshLocation, isDetecting } = useLocationContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState(location.neighborhood || '');
  const [profession, setProfession] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number]>([location.lng, location.lat]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!neighborhood && location.neighborhood) {
      setNeighborhood(location.neighborhood);
      setCoordinates([location.lng, location.lat]);
    }
  }, [location]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto redirect if already logged in
  if (user) {
    navigate('/profile');
    return null;
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates([pos.coords.longitude, pos.coords.latitude]);
        setLocating(false);
      },
      (err) => {
        console.warn('Geo detection error:', err);
        setLocating(false);
        setError('Location access denied. Defaulting to Sector 62 coordinates.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const skillsArray = skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        await signup({
          name,
          email,
          password,
          neighborhood: neighborhood || 'Sector 62',
          profession: profession || 'Neighbor',
          skills: skillsArray,
          coordinates,
        });
      } else {
        await login(email, password);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#FBFAF7] border border-[#E6DFD3] rounded-[2.5rem] shadow-2xs overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#355E3B] p-6 text-white text-center space-y-2">
          {/* Logo rings icon */}
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-1 border border-white/30 relative">
            <div className="w-6 h-6 rounded-full border-2 border-white"></div>
            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full border border-white bg-[#C96C4A]"></div>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-heading">
            {isSignup ? 'Join Circles' : 'Welcome Back'}
          </h2>
          <p className="text-[#FBFAF7]/80 text-xs font-medium">
            {isSignup
              ? 'People around you, not strangers online.'
              : 'Sign in to access your local neighborhood circle'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E6DFD3] bg-[#F5F1E8] p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignup(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-full transition ${
              !isSignup ? 'bg-[#FBFAF7] text-[#355E3B] shadow-2xs' : 'text-slate-500 hover:text-[#2F2F2F]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignup(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-full transition ${
              isSignup ? 'bg-[#FBFAF7] text-[#355E3B] shadow-2xs' : 'text-slate-500 hover:text-[#2F2F2F]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Demo Login Banner */}
          <div className="bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#2F2F2F] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#C96C4A] fill-[#C96C4A]" /> Instant Demo Login (1-Click)
              </span>
              <span className="text-[10px] font-extrabold bg-[#355E3B]/10 text-[#355E3B] px-2 py-0.5 rounded-full">
                Unlocked
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight font-medium">
              Select a demo neighbor profile to test asking for help, chatting, and browsing the live map:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('priya@neighborly.app')}
                disabled={loading}
                className="w-full bg-[#FBFAF7] hover:bg-white border border-[#E6DFD3] p-2.5 rounded-2xl flex items-center justify-between text-left transition group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#355E3B] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2F2F2F] group-hover:text-[#C96C4A]">Priya Singh</p>
                    <p className="text-[10px] text-slate-500 font-medium">Sector 62 • Childcare, Math Tutoring</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#355E3B] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('aarav@neighborly.app')}
                disabled={loading}
                className="w-full bg-[#FBFAF7] hover:bg-white border border-[#E6DFD3] p-2.5 rounded-2xl flex items-center justify-between text-left transition group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C96C4A] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2F2F2F] group-hover:text-[#C96C4A]">Aarav Patel</p>
                    <p className="text-[10px] text-slate-500 font-medium">Sector 62 • Drill Machine, Scooter Repair</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#C96C4A] shrink-0" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-3 flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSignup && (
            <div>
              <label className="block text-xs font-extrabold text-[#2F2F2F] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Singh"
                className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#C96C4A]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@neighborly.app"
              className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#C96C4A]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2F2F2F] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#C96C4A]"
            />
          </div>

          {isSignup && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#2F2F2F] mb-1">Neighborhood</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru or Bandra West"
                    className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#C96C4A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#2F2F2F] mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Teacher, Engineer"
                    className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#C96C4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2F2F2F] mb-1">
                  Skills or Tools You Can Offer
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Bosch Drill, Step Ladder, Pet Sitting"
                  className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E6DFD3] rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#C96C4A]"
                />
              </div>

              {/* Geo Location Setup */}
              <div className="bg-[#F5F1E8] p-3 rounded-2xl border border-[#E6DFD3]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="font-bold text-[#2F2F2F] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" /> Circle Location
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="text-[11px] font-bold text-[#C96C4A] hover:underline"
                  >
                    {locating ? 'Detecting...' : 'Detect Coordinates'}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#C96C4A] hover:bg-[#b25b3a] text-white font-extrabold text-xs rounded-full shadow-2xs transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isSignup ? 'Join Circle Network' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
