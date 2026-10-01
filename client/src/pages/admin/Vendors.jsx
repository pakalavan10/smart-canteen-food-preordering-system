import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineLockClosed, HiOutlineLockOpen } from 'react-icons/hi2';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchVendors = async () => {
    try {
      const { data } = await API.get('/admin/vendors');
      setVendors(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleApproveStatus = async (id, status) => {
    try {
      await API.patch(`/admin/vendors/${id}/status`, { status });
      toast.success(`Vendor status set to ${status}!`);
      fetchVendors();
    } catch (err) {
      toast.error('Failed to update approval status');
    }
  };

  const toggleActiveStatus = async (id, currentActive) => {
    try {
      await API.patch(`/admin/vendors/${id}/toggle`);
      toast.success(currentActive ? 'Vendor deactivated' : 'Vendor activated');
      fetchVendors();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = vendors.filter(v => 
    v.shopName?.toLowerCase().includes(search.toLowerCase()) || 
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'shopName', label: 'Shop Name', render: (v, row) => (
      <div>
        <p className="font-bold text-surface-900 dark:text-white">{v}</p>
        <p className="text-xs text-surface-500">Owner: {row.name}</p>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || 'N/A' },
    { key: 'isApproved', label: 'Approval Status', render: (v) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>
        {v ? '✅ Approved' : '⏳ Pending Approval'}
      </span>
    )},
    { key: 'isActive', label: 'Account Status', render: (v) => (
      <span className={`badge ${v ? 'badge-primary' : 'badge-danger'}`}>
        {v ? 'Active' : 'Deactivated'}
      </span>
    )},
    { key: '_id', label: 'Actions', sortable: false, render: (v, row) => (
      <div className="flex items-center gap-2">
        {!row.isApproved ? (
          <button
            onClick={() => handleApproveStatus(v, 'approved')}
            className="px-3 py-1.5 rounded-full bg-success-500 text-white font-semibold text-xs hover:bg-success-600 flex items-center gap-1 shadow"
            title="Approve Vendor"
          >
            <HiOutlineCheck className="w-4 h-4" /> Approve
          </button>
        ) : (
          <button
            onClick={() => handleApproveStatus(v, 'rejected')}
            className="px-3 py-1.5 rounded-full bg-warning-500 text-white font-semibold text-xs hover:bg-warning-600 flex items-center gap-1 shadow"
            title="Revoke Approval"
          >
            <HiOutlineXMark className="w-4 h-4" /> Revoke
          </button>
        )}

        <button
          onClick={() => toggleActiveStatus(v, row.isActive)}
          className={`p-2 rounded-lg ${row.isActive ? 'hover:bg-danger-500/10 dark:hover:bg-danger-900/20 text-danger-500' : 'hover:bg-success-500/10 dark:hover:bg-success-900/20 text-success-600'}`}
          title={row.isActive ? 'Deactivate Account' : 'Activate Account'}
        >
          {row.isActive ? <HiOutlineLockClosed className="w-5 h-5" /> : <HiOutlineLockOpen className="w-5 h-5" />}
        </button>
      </div>
    )},
  ];

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  const pendingCount = vendors.filter(v => !v.isApproved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">
            🏪 Vendor Approvals & Management ({vendors.length})
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm font-semibold text-warning-600 dark:text-warning-400 mt-1">
              ⚠️ {pendingCount} vendor registration{pendingCount > 1 ? 's' : ''} pending your approval!
            </p>
          )}
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search vendors by shop name, owner or email..." />
      <DataTable columns={columns} data={filtered} />
    </div>
  );
};

export default Vendors;
