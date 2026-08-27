import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Building2,
  PlusCircle,
  Eye,
  QrCode,
  CheckCircle,
  XCircle,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrganizationsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizations', {
        params: {
          page,
          search: search || undefined,
          type: categoryFilter || undefined,
          status: statusFilter || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.organizations);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, categoryFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrganizations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (org) => {
    const newStatus = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/organizations/${org._id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Organization status changed to ${newStatus}`);
        fetchOrganizations();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Organization',
      render: (org) => (
        <div className="flex items-center gap-3">
          {org.logo ? (
            <img
              src={org.logo}
              alt=""
              className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
              {org.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-[#2F2E2D] hover:text-[#0086FF] transition-colors">
              <Link to={`/admin/organizations/${org._id}`}>
                {org.displayTitle || org.name}
              </Link>
            </p>
            <p className="text-[11px] text-[#5A5856]">{org.branch || 'Main Center'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category / Sector',
      accessor: 'organizationType',
      render: (org) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
          {org.organizationType}
        </span>
      ),
    },
    {
      header: 'Contact Details',
      render: (org) => (
        <div className="text-[11px] space-y-0.5">
          <p className="text-[#2F2E2D] font-medium">{org.phone || '—'}</p>
          <p className="text-[#5A5856]">{org.email || ''}</p>
        </div>
      ),
    },
    {
      header: 'Subscription Status',
      render: (org) => (
        <div>
          <StatusBadge status={org.subscriptionStatus || org.status} />
          <p className="text-[10px] text-[#5A5856] mt-1 font-medium">
            {org.daysRemaining > 0
              ? `${org.daysRemaining} days remaining`
              : 'Service Expired'}
          </p>
        </div>
      ),
    },
    {
      header: 'QR Link',
      render: (org) =>
        org.activeQrId ? (
          <Link
            to={`/admin/qr-center?org=${org._id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0086FF] hover:underline"
          >
            <QrCode className="w-3.5 h-3.5" />
            Manage QR
          </Link>
        ) : (
          <span className="text-[11px] text-slate-400">No QR</span>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (org) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/organizations/${org._id}`}
            title="View Details"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleToggleStatus(org)}
            title={org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            className={`p-1.5 rounded-lg transition-colors ${
              org.status === 'ACTIVE'
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {org.status === 'ACTIVE' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
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
            Organization Management
          </h1>
          <p className="text-xs text-[#5A5856]">
            Manage verified institutions, review active QR posters, and inspect service periods.
          </p>
        </div>
        <Link
          to="/admin/organizations/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#0086FF]" />
          Create Organization Wizard
        </Link>
      </div>

      {/* Filter Component */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
        >
          <option value="">All Categories</option>
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

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="EXPIRED">Expired</option>
          <option value="INACTIVE">Inactive</option>
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
        searchPlaceholder="Search organizations by name, title, or phone..."
        emptyTitle="No organizations found"
        emptyDescription="Get started by registering an institution with the wizard."
      />
    </div>
  );
};
