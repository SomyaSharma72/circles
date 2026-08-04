import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import {
  Moon,
  Sun,
  User,
  Lock,
  Eye,
  HelpCircle,
  Mail,
  FileText,
  LogOut,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  MapPin,
  Sliders,
  Bell,
  HeartHandshake
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isDarkMode, toggleDarkMode, updateProfile, logout } = useApp();

  // Privacy toggles
  const [showNeighborhood, setShowNeighborhood] = useState(true);
  const [showSkillsPublicly, setShowSkillsPublicly] = useState(true);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [activeSupportModal, setActiveSupportModal] = useState<'faq' | 'contact' | 'guidelines' | null>(null);

  // Edit Profile Form state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editNeighborhood, setEditNeighborhood] = useState(currentUser?.neighborhood || 'Maplewood Terrace');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');

  // Change Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle Edit Profile Submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateProfile({
      name: editName.trim(),
      neighborhood: editNeighborhood.trim(),
      phone: editPhone.trim(),
      bio: editBio.trim(),
    });

    setIsEditProfileOpen(false);
    showToast('Profile preferences updated successfully.');
  };

  // Handle Password Change Submission
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill out all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setIsChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Your password has been changed successfully.');
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-emerald-500 flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5 border-b border-slate-200/80 dark:border-slate-800 pb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Preferences & Control</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Manage your account preferences.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* ==================== 1. APPEARANCE ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize how Neighborly looks on your device
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Dark Mode
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between light and dark visual themes for comfortable viewing.
              </p>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* ==================== 2. ACCOUNT ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Account Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your personal information and security credentials
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentUser.email} • {currentUser.neighborhood}
                  </p>
                </div>
              </div>
              <Badge variant="emerald" className="hidden sm:inline-flex text-[11px]">
                Verified Neighbor
              </Badge>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 sm:flex-initial justify-center"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Edit Profile</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex-1 sm:flex-initial justify-center"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Change Password</span>
            </Button>
          </div>
        </motion.div>

        {/* ==================== 3. PRIVACY ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy Controls
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control who can see your neighborhood location and listed skills
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Toggle 1: Show Neighborhood */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Show Neighborhood
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Display your neighborhood name on public help requests and responses.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowNeighborhood(!showNeighborhood);
                  showToast(!showNeighborhood ? 'Neighborhood visibility enabled' : 'Neighborhood hidden from public view');
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  showNeighborhood ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showNeighborhood ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Show Skills Publicly */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Show Skills Publicly
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow neighbors searching for expertise to discover your offered skills.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowSkillsPublicly(!showSkillsPublicly);
                  showToast(!showSkillsPublicly ? 'Skills are now public' : 'Skills hidden from public helper directory');
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  showSkillsPublicly ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showSkillsPublicly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ==================== 4. HELP & SUPPORT ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Help & Support
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Frequently asked questions, community guidelines, and support
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* FAQ Card */}
            <button
              onClick={() => setActiveSupportModal('faq')}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  FAQ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Common questions regarding Trust Scores, favors, and rewards.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>View FAQs</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Contact Support Card */}
            <button
              onClick={() => setActiveSupportModal('contact')}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Contact Support
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Get in touch with our local neighborhood team for help.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Get Help</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Community Guidelines Card */}
            <button
              onClick={() => setActiveSupportModal('guidelines')}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Community Guidelines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Review our safety standards and community principles.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Read Rules</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </motion.div>

        {/* ==================== 5. LOGOUT ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Session & Sign Out
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.email || 'Demo User'}</span>
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            className="w-full sm:w-auto shrink-0 justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        </motion.div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* 1. EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label="Neighborhood"
            value={editNeighborhood}
            onChange={(e) => setEditNeighborhood(e.target.value)}
            required
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="(555) 000-0000"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Short Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell your neighbors a little bit about yourself..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Password"
        maxWidth="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {passwordError}
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. SUPPORT / HELP MODALS */}
      <Modal
        isOpen={activeSupportModal === 'faq'}
        onClose={() => setActiveSupportModal(null)}
        title="Frequently Asked Questions"
        maxWidth="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              How do Trust Scores work?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trust Scores increase as you complete verified neighborhood favors, receive 5-star reviews, and verify your location credentials.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              Are favors free or paid?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Neighborly is built around community goodwill. Requesters can offer Trust Points, homemade baked goods, or reciprocal favors!
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              How do I verify my neighborhood status?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verification happens through community endorsement or matching your home ZIP code during account setup.
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setActiveSupportModal(null)}>
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={activeSupportModal === 'contact'}
        onClose={() => setActiveSupportModal(null)}
        title="Contact Community Support"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Need assistance or have a safety concern? Our neighborhood support team is here to help.
          </p>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Email Support</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              support@neighborly.community
            </p>
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Typical response time: under 2 hours
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setActiveSupportModal(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeSupportModal === 'guidelines'}
        onClose={() => setActiveSupportModal(null)}
        title="Neighborly Community Guidelines"
        maxWidth="md"
      >
        <div className="space-y-3">
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Mutual Respect:</strong> Treat all neighbors with kindness, integrity, and warmth.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Safety First:</strong> Meet in public spaces or introduce yourself clearly before entering homes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>No Spam or Commercial Sales:</strong> Neighborly is strictly for community favors and mutual assistance.</span>
            </li>
          </ul>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setActiveSupportModal(null)}>
              I Understand
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
