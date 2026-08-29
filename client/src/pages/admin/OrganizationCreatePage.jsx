import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Modal } from '../../components/Modal';
import {
  Building2,
  UserPlus,
  QrCode,
  CheckCircle2,
  Copy,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  ORGANIZATION_TYPES,
  CATEGORY_COMPLAINTS_MAP,
} from '../../constants/categories';

export const OrganizationCreatePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Org Data
  const [orgData, setOrgData] = useState({
    name: '',
    displayTitle: '',
    email: '',
    phone: '',
    whatsapp: '',
    organizationType: 'Hospital',
    branch: 'Main Center',
    address: '',
    description: '',
    complaintCategories: [...CATEGORY_COMPLAINTS_MAP['Hospital']],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Step 2: Org User Data
  const [userData, setUserData] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
  });

  // Step 4: Final Success Result
  const [createdResult, setCreatedResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleTypeChange = (newType) => {
    const defaultCats = CATEGORY_COMPLAINTS_MAP[newType] || [];
    setOrgData({
      ...orgData,
      organizationType: newType,
      complaintCategories: [...defaultCats],
    });
  };

  const handleToggleCategory = (cat) => {
    const current = orgData.complaintCategories;
    if (current.includes(cat)) {
      if (current.length === 1) {
        toast.error('At least 1 category must remain selected');
        return;
      }
      setOrgData({
        ...orgData,
        complaintCategories: current.filter((c) => c !== cat),
      });
    } else {
      setOrgData({
        ...orgData,
        complaintCategories: [...current, cat],
      });
    }
  };

  const handleSelectAllCategories = () => {
    const all = CATEGORY_COMPLAINTS_MAP[orgData.organizationType] || [];
    setOrgData({
      ...orgData,
      complaintCategories: [...all],
    });
  };

  // Step 1 validation & proceed to Step 2
  const handleNextToUser = (e) => {
    e.preventDefault();
    if (!orgData.name.trim()) {
      toast.error('Organization Name is required');
      return;
    }
    if (!orgData.complaintCategories || orgData.complaintCategories.length === 0) {
      toast.error('Please select at least 1 complaint category');
      return;
    }
    // Auto-fill user phone with org phone if empty
    if (!userData.phone && orgData.phone) {
      setUserData((prev) => ({ ...prev, phone: orgData.phone }));
    }
    setCurrentStep(2);
  };

  // Step 2 submit -> Execute full creation wizard (Org + User + QR + 30-Day Period)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!userData.fullName.trim() || !userData.username.trim() || !userData.phone.trim()) {
      toast.error('Please fill in all required user fields');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orgData', JSON.stringify(orgData));
      formData.append('userData', JSON.stringify(userData));
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await api.post('/admin/organizations/complete-wizard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setCreatedResult(res.data.data);
        setShowSuccessModal(true);
        setCurrentStep(3);
        toast.success('Organization registered, QR generated, and 30-day service active!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration wizard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const credText = `Platform Login Credentials:\nOrganization: ${createdResult.organization.name}\nUsername: ${createdResult.user.username}\nTemporary Password: ${createdResult.temporaryPassword}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(credText);
    toast.success('Credentials copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
          Register Organization Wizard
        </h1>
        <p className="text-xs text-[#5A5856]">
          Step-by-step guided workflow: Organization Information → User Creation → QR Generation → 30-Day Service Start.
        </p>
      </div>

      {/* Wizard Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            currentStep === 1
              ? 'bg-[#2C3925] text-white border-[#2C3925] shadow-sm'
              : currentStep > 1
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentStep === 1 ? 'bg-[#0086FF] text-white' : 'bg-white/20'
            }`}
          >
            1
          </div>
          <span className="text-xs font-bold truncate">Organization Info</span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            currentStep === 2
              ? 'bg-[#2C3925] text-white border-[#2C3925] shadow-sm'
              : currentStep > 2
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentStep === 2 ? 'bg-[#0086FF] text-white' : 'bg-white/20'
            }`}
          >
            2
          </div>
          <span className="text-xs font-bold truncate">Manager User</span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            currentStep === 3
              ? 'bg-[#2C3925] text-white border-[#2C3925] shadow-sm'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentStep === 3 ? 'bg-[#0086FF] text-white' : 'bg-white/20'
            }`}
          >
            3
          </div>
          <span className="text-xs font-bold truncate">QR & Credentials</span>
        </div>
      </div>

      {/* STEP 1: ORGANIZATION INFORMATION */}
      {currentStep === 1 && (
        <form onSubmit={handleNextToUser} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0086FF]" />
            <h3 className="text-base font-bold text-[#2F2E2D]">
              Step 1: Official Organization Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="e.g. ABC General Hospital"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Display Title (Customer Header)
              </label>
              <input
                type="text"
                value={orgData.displayTitle}
                onChange={(e) => setOrgData({ ...orgData, displayTitle: e.target.value })}
                placeholder="e.g. Isbitaalka Guud ee ABC"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Organization Category / Sector *
              </label>
              <select
                value={orgData.organizationType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-bold focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              >
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Branch / Location Name
              </label>
              <input
                type="text"
                value={orgData.branch}
                onChange={(e) => setOrgData({ ...orgData, branch: e.target.value })}
                placeholder="e.g. Main Branch"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official Phone (Receives SMS Alerts)
              </label>
              <input
                type="tel"
                value={orgData.phone}
                onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                placeholder="e.g. +252 61 700 1122"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official WhatsApp (Customer Chat Button)
              </label>
              <input
                type="tel"
                value={orgData.whatsapp}
                onChange={(e) => setOrgData({ ...orgData, whatsapp: e.target.value })}
                placeholder="e.g. +252 61 700 1122"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={orgData.email}
                onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                placeholder="e.g. info@hospital.so"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={orgData.address}
                onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                placeholder="e.g. Maka Al-Mukarama St, Mogadishu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Organization Logo (Displayed on QR Poster & Customer Page)
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50">
                  <Upload className="w-6 h-6" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2C3925] file:text-white hover:file:bg-[#212B1C]"
              />
            </div>
          </div>

          {/* 10 Specialized Complaint Categories for this Sector */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D]">
                  Specialized Complaint Categories ({orgData.organizationType}) *
                </label>
                <p className="text-[11px] text-[#5A5856]">
                  Dooro noocyada cabashooyinka 10-ka ah ee gaarka u ah xaruntaada ({orgData.complaintCategories.length} la doortay)
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-[11px] font-bold text-[#0086FF] hover:underline"
              >
                Select All (10)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(CATEGORY_COMPLAINTS_MAP[orgData.organizationType] || []).map((cat, idx) => {
                const isSelected = orgData.complaintCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 text-[#2F2E2D] font-bold shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2C3925] text-white'
                          : 'border border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                    <span className="truncate flex-1">
                      <span className="text-[10px] text-[#0086FF] mr-1">#{idx + 1}</span>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              Continue to Step 2: Manager User
              <ArrowRight className="w-4 h-4 text-[#0086FF]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: USER CREATION & GENERATION */}
      {currentStep === 2 && (
        <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6 animate-in fade-in">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-[#0086FF]" />
            <h3 className="text-base font-bold text-[#2F2E2D]">
              Step 2: Organization Dashboard User Credentials
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-[#EEF2EC] border border-[#2C3925]/10 text-xs text-[#2C3925]">
            <p className="font-bold">Automatic QR & 30-Day Service Generation:</p>
            <p className="mt-0.5 text-[11px] text-[#5A5856]">
              Submitting this step will create the manager user, automatically generate a cryptographic QR code, and activate the 30-day service period.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={userData.fullName}
                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                placeholder="e.g. Dr. Ali Hassan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Username (for Login) *
              </label>
              <input
                type="text"
                required
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value.toLowerCase() })}
                placeholder="e.g. abchospital"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="e.g. +252 61 700 1122"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Temporary Password (Leave blank for auto-generate)
              </label>
              <input
                type="text"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                placeholder="Auto-generated secure password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#5A5856] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
            >
              {submitting ? 'Generating QR & Activating...' : 'Finish & Generate QR Code'}
              <CheckCircle2 className="w-4 h-4 text-[#0086FF]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 & SUCCESS MODAL */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/admin/organizations');
        }}
        title="Organization Successfully Activated!"
        subtitle="Credentials generated and 30-day service period initialized."
      >
        {createdResult && (
          <div className="space-y-5">
            {/* Credentials Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Organization:</span>
                <span className="font-semibold text-[#2F2E2D]">
                  {createdResult.organization.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Username:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {createdResult.user.username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Temporary Password:</span>
                <span className="font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {createdResult.temporaryPassword}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Service Period:</span>
                <span className="text-emerald-700 font-bold">30 Days Active</span>
              </div>
            </div>

            {/* Public QR Link */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
              <p className="font-bold text-[#0086FF] mb-1">Public QR Code URL:</p>
              <p className="font-mono text-[11px] text-slate-700 break-all">
                {window.location.origin}/c/{createdResult.qrCode.publicToken}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-[#0086FF]" />
                Copy Credentials
              </button>

              <button
                onClick={() => navigate(`/admin/organizations/${createdResult.organization._id}`)}
                className="flex-1 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold transition-colors text-center"
              >
                View Organization
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
