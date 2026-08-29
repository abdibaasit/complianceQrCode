import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { MessageSquareShare, ArrowLeft, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const MAX_CHARS = 250;

export const FeedbackFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [orgData, setOrgData] = useState(location.state?.orgData || null);
  const [loading, setLoading] = useState(!orgData);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const [message, setMessage] = useState('');

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
        message: message.trim(),
        customerName: 'Anonymous',
      });

      if (res.data.success) {
        setSubmittedResult({
          submission: res.data.data,
          organization: orgData?.organization,
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
  const whatsAppNumber = (organization.whatsapp || organization.phone || '').replace(/[^0-9]/g, '');

  // IF ALREADY SUBMITTED: Show warm thank you message + Done button only
  if (submittedResult) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-6">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#2F2E2D]">
              Waad ku mahadsan tahay taladaada! 🙏
            </h2>
            <p className="text-xs text-[#5A5856] mt-2 max-w-sm mx-auto leading-relaxed">
              Aragtidaada qaaliga ah waxay si toos ah u gaartay maamulka xarunta{' '}
              <span className="font-bold text-[#2C3925]">
                {organization.displayTitle || organization.name}
              </span>.
            </p>
          </div>

          {/* WhatsApp — show only when number exists */}
          {whatsAppNumber && (
            <a
              href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
                `Salaam! Waxaan soo gudbiyay talo ku saabsan ${organization.displayTitle || organization.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Nagala xiriir WhatsApp Xarunta
            </a>
          )}

          {/* Done button */}
          <button
            onClick={() => navigate(`/c/${token}`)}
            className="mt-1 px-6 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            Dhammaystir ✓
          </button>
        </div>
      </div>
    );
  }

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ONLY 1 INPUT: Suggestion Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2F2E2D]">
                Taladaada ama Aragtiyadaada (Your Feedback / Suggestion) *
              </label>
              <span className={`text-[11px] font-bold tabular-nums ${
                message.length >= MAX_CHARS ? 'text-rose-600' : message.length > MAX_CHARS * 0.8 ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {message.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              rows={6}
              required
              maxLength={MAX_CHARS}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Fadlan halkan ku qor taladaada ama aragtidaada si xaruntu wax uga qabato..."
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 outline-none resize-none transition-all ${
                message.length >= MAX_CHARS
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-[#0086FF]/20 focus:border-[#0086FF]'
              }`}
            />
            {message.length >= MAX_CHARS && (
              <p className="text-[10px] text-rose-500 mt-1 font-semibold">Xaddiga ugu badan 250 xaraf ayaad gaadhay.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="w-full py-3.5 rounded-2xl bg-[#0086FF] hover:bg-[#006ED6] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Gudbinaya...' : 'GUDUBI TALADA'}
          </button>
        </form>
      </div>
    </div>
  );
};
