import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/orders/all', { params });
      setOrders(data.data);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v) => <span className="font-bold text-surface-900 dark:text-white">{v}</span> },
    { key: 'student', label: 'Student', render: (v) => v?.name || 'N/A' },
    { key: 'vendor', label: 'Vendor', render: (v) => v?.shopName || 'N/A' },
    { key: 'totalAmount', label: 'Amount', render: (v) => <span className="font-bold text-primary-600 dark:text-primary-400">{formatPrice(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => (
      <span className={`badge ${ORDER_STATUSES[v]?.color}`}>
        {ORDER_STATUSES[v]?.icon} {ORDER_STATUSES[v]?.label}
      </span>
    )},
    { key: 'pickupTime', label: 'Pickup Time' },
    { key: 'createdAt', label: 'Placed At', render: (v) => formatDateTime(v) },
  ];

  const filters = ['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">📦 System Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
            {s ? ORDER_STATUSES[s]?.icon + ' ' + ORDER_STATUSES[s]?.label : '🍽️ All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton type="table-row" count={5} /> : (
        <>
          <DataTable columns={columns} data={orders} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
