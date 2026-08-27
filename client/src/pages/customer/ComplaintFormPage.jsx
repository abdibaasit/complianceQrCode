import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { AlertCircle, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ComplaintFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [orgData, setOrgData] = useState(location.state?.orgData || null);
  const [loading, setLoading] = useState(!orgData);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (!orgData) {
      const fetchOrg = async () => {
        try {
          const res = await api.get(`/public/qr/${token}`);
          if (res.data.success) {
            setOrgData(res.data.data);
            if (res.data.data.organization?.complaintCategories?.length > 0) {
              setCategory(res.data.data.organization.complaintCategories[0]);
            }
          }
        } catch {
          navigate(`/c/${token}`);
        } finally {
          setLoading(false);
        }
      };
      fetchOrg();
    } else if (orgData.organization?.complaintCategories?.length > 0) {
      setCategory(orgData.organization.complaintCategories[0]);
    }
  }, [token, orgData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Fadlan qor cabashadaada.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/public/submissions', {
        qrToken: token,
        type: 'COMPLAINT',
        category,
        message,
        customerPhone,
        customerName: customerName || 'Anonymous',
      });

      if (res.data.success) {
        navigate(`/c/${token}/confirmation`, {
          state: {
            submission: res.data.data,
            organization: orgData?.organization,
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalad ayaa dhacay. Fadlan isku day markale.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Soo diyaarinaya foomka cabashada..." />;
  }

  const organization = orgData?.organization || {};

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Back Nav */}
      <button
        onClick={() => navigate(`/c/${token}`)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A5856] hover:text-[#2C3925] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dib ugu noqo (Back)
      </button>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#2F2E2D]">
              Gudbi Cabashadaada
            </h2>
            <p className="text-xs text-[#5A5856]">
              {organization.displayTitle || organization.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Nooca Cabashada (Category) *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            >
              {(organization.complaintCategories || ['General', 'Service', 'Staff', 'Cleanliness', 'Other']).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Cabashadaada (Describe the problem) *
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Faahfaahin ka bixi dhibaatada aad la kulantay..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Phone Number (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Telefoonkaaga (Optional - For resolution updates)
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. +252 61 XXX XXXX"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            />
          </div>

          {/* Customer Name (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Magacaaga (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Anonymous / Qarsoodi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Gudbinaya...' : 'GUDUBI CABASHADA'}
          </button>
        </form>

        {/* WhatsApp Direct Option */}
        {organization.whatsapp && (
          <div className="pt-2 border-t border-slate-100">
            <a
              href={`https://wa.me/${organization.whatsapp.replace(/[^0-9]/g, '')}?text=Cabasho%20ku%20saabsan%20${encodeURIComponent(organization.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Nagula soo xiriir WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
