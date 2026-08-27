import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Copy, MessageCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();

  const submission = location.state?.submission || {
    referenceNumber: 'CAB-20260827-SAMPLE',
    type: 'COMPLAINT',
    organizationName: 'Hay’adda / Xarunta',
  };
  const organization = location.state?.organization || {};

  const handleCopyRef = () => {
    navigator.clipboard.writeText(submission.referenceNumber);
    toast.success('Number-ka tixraaca waa la koobiyeeyay!');
  };

  const isComplaint = submission.type === 'COMPLAINT';

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[#2F2E2D]">
            {isComplaint ? 'Cabashadaada waa la gudbiyay!' : 'Waad ku mahadsan tahay taladaada!'}
          </h2>
          <p className="text-xs text-[#5A5856] mt-1">
            Fariintaada waxay si toos ah u gaartay maamulka sare ee{' '}
            <span className="font-bold text-[#2C3925]">
              {submission.organizationName || organization.name}
            </span>.
          </p>
        </div>

        {/* Reference Number Box */}
        <div className="p-4 rounded-2xl bg-[#EEF2EC] border border-[#2C3925]/15 space-y-1.5">
          <p className="text-[11px] font-bold text-[#5A5856] uppercase tracking-wider">
            Number-ka Tixraaca (Reference Code)
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-extrabold text-[#2C3925] tracking-wider font-mono">
              {submission.referenceNumber}
            </span>
            <button
              onClick={handleCopyRef}
              className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-[#0086FF] transition-colors"
              title="Koobiyee"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#5A5856]">
            Fadlan keydso lambarkan si aad ula socoto cabashadaada haddii loo baahdo.
          </p>
        </div>

        {/* Direct WhatsApp Contact Button */}
        {organization.whatsapp && (
          <div className="pt-2">
            <a
              href={`https://wa.me/${organization.whatsapp.replace(
                /[^0-9]/g,
                ''
              )}?text=Tixraaca%20Cabashada:%20${submission.referenceNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Nagala xiriir WhatsApp adigoo wata Reference-ka
            </a>
          </div>
        )}

        <button
          onClick={() => navigate(`/c/${token}`)}
          className="text-xs font-bold text-[#5A5856] hover:text-[#2C3925] transition-colors pt-2 block mx-auto"
        >
          ← Ku noqo bogga hore ee xarunta
        </button>
      </div>
    </div>
  );
};
