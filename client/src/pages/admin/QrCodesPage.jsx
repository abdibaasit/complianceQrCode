import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  QrCode,
  Download,
  ExternalLink,
  RefreshCw,
  Share2,
  Building2,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const QrCodesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // QR Preview Modal
  const [previewOrg, setPreviewOrg] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchQrList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizations', {
        params: {
          page,
          search: search || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.organizations);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load QR code registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrList();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchQrList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenPreview = async (org) => {
    setPreviewOrg(org);
    setPreviewLoading(true);
    try {
      const res = await api.get(`/admin/organizations/${org._id}/qr`);
      if (res.data.success) {
        setPreviewData(res.data.data);
      }
    } catch (err) {
      toast.error('Could not load QR code details');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRegenerate = async (orgId) => {
    if (!window.confirm('Regenerating will revoke the current QR Code immediately. Continue?')) {
      return;
    }
    try {
      const res = await api.post(`/admin/organizations/${orgId}/qr/regenerate`);
      if (res.data.success) {
        toast.success('QR Code regenerated');
        setPreviewData(res.data.data);
        fetchQrList();
      }
    } catch (err) {
      toast.error('Failed to regenerate QR code');
    }
  };

  const columns = [
    {
      header: 'Institution',
      render: (org) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
            {org.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#2F2E2D]">
              <Link to={`/admin/organizations/${org._id}`} className="hover:text-[#0086FF]">
                {org.displayTitle || org.name}
              </Link>
            </p>
            <p className="text-[11px] text-[#5A5856]">{org.organizationType}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'QR Token Ref',
      render: (org) => (
        <span className="font-mono text-xs text-[#0086FF] font-semibold bg-blue-50 px-2 py-0.5 rounded">
          {org.activeQrId?.publicToken || 'TOKEN-GEN'}
        </span>
      ),
    },
    {
      header: 'Service Status',
      render: (org) => <StatusBadge status={org.subscriptionStatus || org.status} />,
    },
    {
      header: 'Quick Actions',
      align: 'right',
      render: (org) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenPreview(org)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600 inline-flex items-center gap-1 text-xs font-semibold px-2.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Poster
          </button>
          <a
            href={`/api/admin/organizations/${org._id}/qr/download`}
            download
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 inline-flex items-center gap-1 text-xs font-semibold px-2.5"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Institutional QR Code Registry
          </h1>
          <p className="text-xs text-[#5A5856]">
            Preview posters, download high-res vectors and print-ready PDFs, or regenerate secure tokens.
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by organization name..."
        emptyTitle="No QR codes found"
        emptyDescription="Organizations will automatically receive a QR code upon creation."
      />

      {/* Poster Preview Modal */}
      <Modal
        isOpen={!!previewOrg}
        onClose={() => {
          setPreviewOrg(null);
          setPreviewData(null);
        }}
        title={`QR Poster: ${previewOrg?.displayTitle || previewOrg?.name}`}
      >
        {previewOrg && (
          <div className="space-y-5">
            {/* Poster Card */}
            <div className="border-2 border-[#2C3925] rounded-2xl p-6 bg-white text-center space-y-4 shadow-sm max-w-sm mx-auto">
              {previewOrg.logo ? (
                <img
                  src={previewOrg.logo}
                  alt=""
                  className="h-12 mx-auto object-contain"
                />
              ) : (
                <h3 className="text-base font-extrabold text-[#2C3925] uppercase tracking-tight">
                  {previewOrg.displayTitle || previewOrg.name}
                </h3>
              )}

              <p className="text-[11px] font-bold text-[#5A5856] uppercase tracking-wider">
                CABASHO & TALO — COMPLAINT & FEEDBACK
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-inner">
                {previewData?.dataUrl ? (
                  <img
                    src={previewData.dataUrl}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    {previewLoading ? 'Loading QR...' : 'No QR available'}
                  </div>
                )}
              </div>

              <div className="text-xs font-extrabold text-[#2C3925]">
                KUSKANKEE QR-KA
              </div>
              <p className="text-[11px] text-slate-500">
                Scan with phone camera to send anonymous feedback directly to administration.
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`/api/admin/organizations/${previewOrg._id}/qr/download`}
                download
                className="py-2.5 rounded-xl bg-[#2C3925] text-white text-xs font-bold hover:bg-[#212B1C] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#0086FF]" />
                Print PDF Poster
              </a>

              {previewData?.dataUrl && (
                <a
                  href={previewData.dataUrl}
                  download={`QR-${previewOrg.name.replace(/\s+/g, '_')}.png`}
                  className="py-2.5 rounded-xl bg-white border border-slate-200 text-[#2F2E2D] text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Save PNG
                </a>
              )}
            </div>

            {previewData?.publicUrl && (
              <div className="pt-2 text-center">
                <a
                  href={previewData.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#0086FF] hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Customer Mobile Landing Page
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => handleRegenerate(previewOrg._id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Token
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewOrg(null);
                  setPreviewData(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
