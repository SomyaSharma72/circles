import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { HeartHandshake, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { allUsers, loginAsUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    // Try finding user by email or default to first user
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (foundUser) {
      loginAsUser(foundUser.id);
    } else {
      // Demo log in as Sarah
      loginAsUser(allUsers[0]?.id || 'u1');
    }

    navigate('/home');
  };

  const handleDemoLogin = () => {
    const demoUser = allUsers[0] || { id: 'u1' };
    loginAsUser(demoUser.id);
    navigate('/home');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back to Neighborly
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to connect, request help, or offer skills in your community.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@neighborly.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-semibold text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Access
          </span>
        </div>

        {/* Explore Demo Button */}
        <div>
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full justify-center text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"
            onClick={handleDemoLogin}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Explore Demo</span>
          </Button>
        </div>

        {/* Footer link to Sign Up */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have a Neighborly account yet?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
