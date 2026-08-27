import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { MessageSquareShare, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const FeedbackFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [orgData, setOrgData] = useState(location.state?.orgData || null);
  const [loading, setLoading] = useState(!orgData);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (!orgData) {
      const fetchOrg = async () => {
        try {
          const res = await api.get(`/public/qr/${token}`);
          if (res.data.success) {
            setOrgData(res.data.data);
          }
        } catch {
          navigate(`/c/${token}`);
        } finally {
          setLoading(false);
        }
      };
      fetchOrg();
    }
  }, [token, orgData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Fadlan qor taladaada ama aragtidaada.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/public/submissions', {
        qrToken: token,
        type: 'FEEDBACK',
        category: 'Feedback / Suggestion',
        message,
        suggestedSolution,
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
    return <LoadingSpinner message="Soo diyaarinaya foomka talada..." />;
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0086FF] flex items-center justify-center">
            <MessageSquareShare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#2F2E2D]">
              Gudbi Taladaada
            </h2>
            <p className="text-xs text-[#5A5856]">
              {organization.displayTitle || organization.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Suggestion Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Taladaada ama Aragtiyadaada *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Maxaad jeclaan lahayd inaad nala wadaagto si adeegga loo horumariyo?..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none resize-none transition-all"
            />
          </div>

          {/* Suggested Solution Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Xalka aad soo jeedinayso (Suggested Solution)
            </label>
            <textarea
              rows={3}
              value={suggestedSolution}
              onChange={(e) => setSuggestedSolution(e.target.value)}
              placeholder="Sidee kula tahay in dhibaatada ama adeegga loo xallin karaa?..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none resize-none transition-all"
            />
          </div>

          {/* Customer Phone (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Telefoonkaaga (Optional)
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. +252 61 XXX XXXX"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Gudbinaya...' : 'GUDUBI TALADA'}
          </button>
        </form>
      </div>
    </div>
  );
};
