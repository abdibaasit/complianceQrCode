import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Lock, User, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);

    if (result.success) {
      if (result.user.role === 'PLATFORM_ADMIN') {
        navigate('/admin/overview');
      } else {
        if (result.user.mustChangePassword) {
          navigate('/organization/profile');
        } else {
          navigate('/organization/overview');
        }
      }
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('Admin@123456');
    } else if (type === 'hospital') {
      setUsername('abchospital');
      setPassword('Hospital@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#2C3925] flex items-center justify-center text-white shadow-md">
            <QrCode className="w-7 h-7 text-white" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F2E2D] tracking-tight">
          Sign in to Compliance QR
        </h2>
        <p className="text-xs text-[#5A5856]">
          Platform Super Admin & Organization Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Signing in...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4 text-[#0086FF]" />
            </button>
          </form>

          {/* Demo Quick Fill Helper */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-[#5A5856] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0086FF]" />
              Quick Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-[#2C3925] transition-colors text-left"
              >
                <span className="font-bold block">Platform Admin</span>
                <span className="text-[10px] text-[#5A5856]">admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('hospital')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-[#0086FF] transition-colors text-left"
              >
                <span className="font-bold block">ABC Hospital</span>
                <span className="text-[10px] text-[#5A5856]">abchospital</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs font-semibold text-[#5A5856] hover:text-[#2C3925] transition-colors"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
