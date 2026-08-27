import React, { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Key, User, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsersPage = () => {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        toast.success('Admin password updated successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
          Platform Administration Profile & Security
        </h1>
        <p className="text-xs text-[#5A5856]">
          Manage your root platform credentials and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2C3925] text-white flex items-center justify-center font-extrabold text-2xl mx-auto shadow-md">
            {user?.fullName?.charAt(0) || 'A'}
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-base text-[#2F2E2D]">{user?.fullName}</h3>
            <p className="text-xs font-mono text-[#0086FF]">@{user?.username}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              PLATFORM_ADMIN
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-[#5A5856]">
              <span>System Role:</span>
              <span className="font-bold text-[#2F2E2D]">Master Superadmin</span>
            </div>
            <div className="flex justify-between text-[#5A5856]">
              <span>Status:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-4 h-4 text-[#2C3925]" />
            <h3 className="text-sm font-extrabold text-[#2F2E2D]">
              Change Master Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 text-[#0086FF]" />
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
