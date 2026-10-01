import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (statusFilter) params.status = statusFilter;
        const { data } = await API.get('/orders/my-orders', { params });
        setOrders(data.data);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">📋 Order History</h1>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
            }`}>
            {s ? ORDER_STATUSES[s]?.icon + ' ' + ORDER_STATUSES[s]?.label : '🍽️ All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton type="table-row" count={5} /> : orders.length === 0 ? (
        <div className="text-center py-20"><p className="text-5xl mb-4">📭</p><p className="text-xl text-surface-500">No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order._id} to={`/student/orders/${order._id}`} className="glass-hover p-4 flex items-center gap-4 block">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-surface-900 dark:text-white">{order.orderNumber}</span>
                  <span className={`badge ${ORDER_STATUSES[order.status]?.color}`}>{ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}</span>
                </div>
                <p className="text-sm text-surface-500">{order.vendor?.shopName} • {formatDateTime(order.createdAt)}</p>
                <p className="text-sm text-surface-400 mt-1">{order.items?.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
              </div>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 shrink-0">{formatPrice(order.totalAmount)}</span>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default OrderHistory;
