import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Shield,
  Briefcase,
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background aesthetic glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
          <GraduationCap className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Place<span className="text-blue-400">Track</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          College Training & Placement Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tpo@placetrack.edu"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In to Portal <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Academic Demo Credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@placetrack.edu', 'Password@123')}
                className="flex items-center p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Admin</p>
                  <p className="text-[10px] text-slate-400">Full System</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('tpo@placetrack.edu', 'Password@123')}
                className="flex items-center p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">TPO Officer</p>
                  <p className="text-[10px] text-slate-400">Drives & Results</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemo('rahul.sharma@student.edu', 'Password@123')
                }
                className="flex items-center p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Rahul (Student)</p>
                  <p className="text-[10px] text-slate-400">Placed: Google</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemo('ananya.iyer@student.edu', 'Password@123')
                }
                className="flex items-center p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Ananya (Student)</p>
                  <p className="text-[10px] text-slate-400">CGPA 5.85 (Check)</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
