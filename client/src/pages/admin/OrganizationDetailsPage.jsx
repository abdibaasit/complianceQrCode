import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Calendar,
  CreditCard,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
  Edit,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowLeft,
  CheckCircle,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [user, setUser] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    displayTitle: '',
    organizationType: '',
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    branch: '',
  });

  // Manual payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 50,
    paymentMethod: 'EVC_PLUS',
    transactionReference: '',
    periodDays: 30,
    notes: 'Platform Admin manual service extension',
  });

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/organizations/${id}`);
      if (res.data.success) {
        setOrg(res.data.data.organization);
        setUser(res.data.data.user);
        setEditForm({
          name: res.data.data.organization.name || '',
          displayTitle: res.data.data.organization.displayTitle || '',
          organizationType: res.data.data.organization.organizationType || '',
          phone: res.data.data.organization.phone || '',
          email: res.data.data.organization.email || '',
          whatsapp: res.data.data.organization.whatsapp || '',
          address: res.data.data.organization.address || '',
          branch: res.data.data.organization.branch || '',
        });
      }

      // Fetch QR details
      try {
        const qrRes = await api.get(`/admin/organizations/${id}/qr`);
        if (qrRes.data.success) {
          setQrData(qrRes.data.data);
        }
      } catch {
        // QR might not exist yet
      }
    } catch (err) {
      toast.error('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/organizations/${id}`, editForm);
      if (res.data.success) {
        toast.success('Organization updated successfully');
        setIsEditOpen(false);
        fetchOrganizationDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update organization');
    }
  };

  const handleRegenerateQr = async () => {
    if (!window.confirm('Are you sure you want to regenerate this QR Code? The previous QR code will immediately be invalidated.')) {
      return;
    }
    try {
      setIsRegenerating(true);
      const res = await api.post(`/admin/organizations/${id}/qr/regenerate`);
      if (res.data.success) {
        setQrData(res.data.data);
        toast.success('QR Code regenerated successfully');
      }
    } catch (err) {
      toast.error('Failed to regenerate QR code');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/payments', {
        organizationId: id,
        ...paymentForm,
      });
      if (res.data.success) {
        toast.success('Payment recorded and 30-day service period extended!');
        setIsPayModalOpen(false);
        fetchOrganizationDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const res = await api.post(`/admin/organizations/${id}/qr/send-whatsapp`);
      if (res.data.success) {
        toast.success('QR link dispatched via WhatsApp');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp message');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading institution profile..." />;
  }

  if (!org) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500 font-medium">Organization not found</p>
        <Link
          to="/admin/organizations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2C3925] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organizations
        </Link>
      </div>
    );
  }

  const daysLeft = org.daysRemaining || 0;
  const isExpiring = daysLeft <= 3 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/organizations"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
                {org.displayTitle || org.name}
              </h1>
              <StatusBadge status={org.subscriptionStatus || org.status} />
            </div>
            <p className="text-xs text-[#5A5856]">
              {org.organizationType} • Branch: {org.branch || 'Main Center'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#2F2E2D] text-xs font-bold shadow-sm transition-all"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            Edit Info
          </button>
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-sm transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Record Payment / Extend
          </button>
        </div>
      </div>

      {/* Subscription Service Life Banner */}
      <div
        className={`rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isExpired
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : isExpiring
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isExpired
                ? 'bg-rose-600 text-white'
                : isExpiring
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">
              {isExpired
                ? '30-Day Service Period Expired'
                : isExpiring
                ? `Subscription Expiring Soon: ${daysLeft} Day${daysLeft > 1 ? 's' : ''} Remaining`
                : `Active Service Period: ${daysLeft} Days Remaining`}
            </h3>
            <p className="text-xs opacity-80">
              {org.serviceEndDate
                ? `Expires on ${new Date(org.serviceEndDate).toLocaleDateString()} at ${new Date(
                    org.serviceEndDate
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Service timeframe calculating'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPayModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isExpired
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-white border border-slate-200 text-[#2F2E2D] hover:bg-slate-50'
            }`}
          >
            Renew 30-Day Cycle
          </button>
        </div>
      </div>

      {/* Grid: Left Org Info & User, Right Branded QR Poster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & User */}
        <div className="lg:col-span-2 space-y-6">
          {/* Institutional Details Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2C3925]" />
                Institutional Profile
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                ID: {org._id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400 font-medium">Official Legal Name</p>
                <p className="font-bold text-[#2F2E2D]">{org.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-medium">Public Display Title</p>
                <p className="font-bold text-[#2F2E2D]">{org.displayTitle || org.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-medium">Primary Phone</p>
                <p className="font-semibold text-[#2F2E2D] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {org.phone || '—'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-medium">WhatsApp Dispatch</p>
                <p className="font-semibold text-[#2F2E2D] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  {org.whatsapp || '—'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-medium">Email Address</p>
                <p className="font-semibold text-[#2F2E2D] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {org.email || '—'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-medium">Sector / Category</p>
                <p className="font-bold text-[#0086FF]">{org.organizationType}</p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <p className="text-slate-400 font-medium">Physical Location & Address</p>
                <p className="font-semibold text-[#2F2E2D] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {org.address || '—'}
                </p>
              </div>
            </div>

            {/* Custom Complaint Categories */}
            {org.complaintCategories && org.complaintCategories.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-[#5A5856]">
                  Active Feedback & Complaint Categories:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {org.complaintCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Organization User Account */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0086FF]" />
                Assigned Organization Account
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                Active Tenant Login
              </span>
            </div>

            {user ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Full Name</p>
                  <p className="font-bold text-[#2F2E2D]">{user.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Username (Login ID)</p>
                  <p className="font-mono font-bold text-[#0086FF]">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Contact Phone</p>
                  <p className="font-medium text-[#2F2E2D]">{user.phone || '—'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No user assigned yet.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Branded QR Poster Preview & Downloads */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#2C3925]" />
                Branded QR Poster
              </h3>
              {qrData?.qr?.status && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {qrData.qr.status}
                </span>
              )}
            </div>

            {/* Poster Card Container */}
            <div className="border-2 border-[#2C3925] rounded-2xl p-5 bg-white text-center space-y-3 shadow-sm">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-10 mx-auto object-contain"
                />
              ) : (
                <h4 className="text-sm font-black text-[#2C3925] tracking-tight uppercase">
                  {org.displayTitle || org.name}
                </h4>
              )}

              <p className="text-[10px] font-bold text-[#5A5856] uppercase tracking-wider">
                CABASHO & TALO — COMPLAINT & FEEDBACK
              </p>

              {/* QR Code Image */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-inner">
                {qrData?.dataUrl ? (
                  <img
                    src={qrData.dataUrl}
                    alt="QR Code"
                    className="w-44 h-44 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="text-[11px] font-extrabold text-[#2C3925]">
                KUSKANKEE QR-KA
              </div>
              <p className="text-[10px] text-slate-500">
                Scan with phone camera to send anonymous feedback directly to administration.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <a
                href={`/api/admin/organizations/${id}/qr/download`}
                download
                className="w-full py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#0086FF]" />
                Download Print-Ready PDF
              </a>

              {qrData?.dataUrl && (
                <a
                  href={qrData.dataUrl}
                  download={`QR-${org.name.replace(/\s+/g, '_')}.png`}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#2F2E2D] text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Download PNG
                </a>
              )}

              {qrData?.publicUrl && (
                <a
                  href={qrData.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0086FF] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Public Customer Portal
                </a>
              )}

              {org.whatsapp && (
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dispatch via WhatsApp
                </button>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleRegenerateQr}
                  disabled={isRegenerating}
                  className="w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate Secure QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Organization Profile"
      >
        <form onSubmit={handleUpdateOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Official Legal Name
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Display Title (Shown on QR and Customer Page)
            </label>
            <input
              type="text"
              value={editForm.displayTitle}
              onChange={(e) => setEditForm({ ...editForm, displayTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Sector / Type
              </label>
              <select
                value={editForm.organizationType}
                onChange={(e) =>
                  setEditForm({ ...editForm, organizationType: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              >
                <option value="Hospital">Hospital</option>
                <option value="Hotel">Hotel</option>
                <option value="Restaurant">Restaurant</option>
                <option value="University">University</option>
                <option value="School">School</option>
                <option value="Company">Company</option>
                <option value="NGO">NGO</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Branch / Unit
              </label>
              <input
                type="text"
                value={editForm.branch}
                onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Primary Phone
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                WhatsApp Phone
              </label>
              <input
                type="text"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Physical Address
            </label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2C3925] text-white text-xs font-bold hover:bg-[#212B1C] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Payment / Service Extension Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Manual Payment & Extend Service"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            Recording this manual payment will instantly extend <strong>{org.name}</strong>'s active service period by <strong>{paymentForm.periodDays} days</strong> and activate the QR code.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Extension Days
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={paymentForm.periodDays}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, periodDays: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Payment Method
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
            >
              <option value="EVC_PLUS">EVC Plus (Hormuud)</option>
              <option value="ZAAD">ZAAD (Telesom)</option>
              <option value="SAHAL">Sahal (Golis)</option>
              <option value="CASH">Cash / Physical</option>
              <option value="BANK_TRANSFER">Bank Wire / Premier / IBS</option>
              <option value="OTHER">Other Provider</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Transaction Reference / Slip #
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-893847291 / Receipt #0482"
              value={paymentForm.transactionReference}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, transactionReference: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Notes
            </label>
            <input
              type="text"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] text-white text-xs font-bold hover:bg-[#006ED6] transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Extend Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
