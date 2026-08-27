import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, QrCode, Shield, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ variant = 'dashboard', title }) => {
  const { user, logout, isPlatformAdmin, isOrgUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (variant === 'public') {
    return (
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2C3925] flex items-center justify-center text-white shadow-md">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#2C3925]">
                COMPLIANCE <span className="text-[#0086FF]">QR</span>
              </span>
              <p className="text-[10px] font-medium text-[#5A5856] -mt-1 tracking-wider uppercase">
                Feedback & Complaint Platform
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#5A5856]">
            <Link to="/" className="hover:text-[#2C3925] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[#2C3925] transition-colors">About System</Link>
            <Link to="/contact" className="hover:text-[#2C3925] transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={isPlatformAdmin ? '/admin/overview' : '/organization/overview'}
                className="px-4 py-2 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#0086FF]" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Dashboard Navbar
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-[#2F2E2D]">{title}</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Org or Admin Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EEF2EC] border border-[#2C3925]/10 text-xs">
          {isPlatformAdmin ? (
            <>
              <Shield className="w-3.5 h-3.5 text-[#2C3925]" />
              <span className="font-bold text-[#2C3925]">Platform Super Admin</span>
            </>
          ) : (
            <>
              <Building2 className="w-3.5 h-3.5 text-[#0086FF]" />
              <span className="font-bold text-[#2C3925]">
                {user?.organization?.name || user?.fullName}
              </span>
            </>
          )}
        </div>

        {/* User profile dropdown info */}
        <div className="flex items-center gap-2.5 pl-2 sm:border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-[#2F2E2D] leading-none">{user?.fullName}</p>
            <p className="text-[10px] text-[#5A5856] mt-0.5 font-medium">@{user?.username}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
