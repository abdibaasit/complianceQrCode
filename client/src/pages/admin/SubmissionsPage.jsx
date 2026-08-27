import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  MessageSquare,
  AlertCircle,
  MessageSquareShare,
  Eye,
  Filter,
  Download,
  Building2,
  Calendar,
  Phone,
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SubmissionsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Selected Submission Modal state
  const [selectedSub, setSelectedSub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/submissions', {
        params: {
          page,
          search: search || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.submissions);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, typeFilter, statusFilter, priorityFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSubmissions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDetail = (sub) => {
    setSelectedSub(sub);
    setUpdateStatus(sub.status);
    setUpdateNotes(sub.internalNotes || '');
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/submissions/${selectedSub._id}/status`, {
        status: updateStatus,
        notes: updateNotes,
      });
      if (res.data.success) {
        toast.success('Submission status updated successfully');
        setIsModalOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update submission status');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      window.open('/api/admin/reports/export/csv', '_blank');
      toast.success('Exporting all submissions to CSV...');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'type',
      render: (sub) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
            sub.type === 'CABASHO'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {sub.type === 'CABASHO' ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <MessageSquareShare className="w-3.5 h-3.5" />
          )}
          {sub.type === 'CABASHO' ? 'Cabasho (Complaint)' : 'Talo (Feedback)'}
        </span>
      ),
    },
    {
      header: 'Institution',
      render: (sub) => (
        <div>
          <p className="font-bold text-[#2F2E2D]">
            {sub.organizationId?.displayTitle || sub.organizationId?.name || '—'}
          </p>
          <p className="text-[11px] text-[#5A5856]">
            {sub.organizationId?.organizationType || 'Institution'}
          </p>
        </div>
      ),
    },
    {
      header: 'Category & Snippet',
      render: (sub) => (
        <div className="max-w-xs">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {sub.category || 'General'}
          </span>
          <p className="text-xs text-[#2F2E2D] font-medium mt-1 line-clamp-1">
            {sub.content}
          </p>
        </div>
      ),
    },
    {
      header: 'Citizen Phone',
      render: (sub) => (
        <span className="text-xs font-mono text-[#2F2E2D]">
          {sub.customerPhone ? sub.customerPhone : <em className="text-slate-400">Anonymous</em>}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (sub) => <StatusBadge status={sub.status} />,
    },
    {
      header: 'Date',
      render: (sub) => (
        <span className="text-[11px] text-[#5A5856]">
          {new Date(sub.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (sub) => (
        <button
          onClick={() => handleOpenDetail(sub)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600 inline-flex items-center gap-1 text-xs font-semibold px-2.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Citizen Complaints & Feedback Console
          </h1>
          <p className="text-xs text-[#5A5856]">
            Review all anonymous submissions received through institutional QR codes.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#2F2E2D] text-xs font-bold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Export All CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
        >
          <option value="">All Types (Cabasho & Talo)</option>
          <option value="CABASHO">Cabasho (Complaint)</option>
          <option value="TALO">Talo (Feedback / Suggestion)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
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
        searchPlaceholder="Search by citizen phone or feedback text..."
        emptyTitle="No submissions found"
        emptyDescription="Submissions submitted by customers via QR scans will be displayed here."
      />

      {/* Submission Detail & Status Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedSub?.type === 'CABASHO'
            ? 'Review Complaint (Cabasho)'
            : 'Review Citizen Feedback (Talo)'
        }
      >
        {selectedSub && (
          <div className="space-y-5">
            {/* Meta Header */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    selectedSub.type === 'CABASHO'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedSub.type === 'CABASHO' ? 'CABASHO' : 'TALO'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {new Date(selectedSub.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Target Organization</p>
                  <p className="font-bold text-[#2F2E2D]">
                    {selectedSub.organizationId?.displayTitle || selectedSub.organizationId?.name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Category</p>
                  <p className="font-bold text-[#0086FF]">{selectedSub.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Citizen Phone</p>
                  <p className="font-mono font-bold text-[#2F2E2D]">
                    {selectedSub.customerPhone || 'Anonymous (Not provided)'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Current Status</p>
                  <StatusBadge status={selectedSub.status} />
                </div>
              </div>
            </div>

            {/* Submission Content Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2F2E2D]">Full Message Content:</label>
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-medium leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {selectedSub.content}
              </div>
            </div>

            {/* Update Status & Resolution Form */}
            <form onSubmit={handleStatusUpdate} className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                    Update Workflow Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-bold focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                    Internal Resolution Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Forwarded to management / Resolved with customer"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-[#2C3925] text-white text-xs font-bold hover:bg-[#212B1C] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Status
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
