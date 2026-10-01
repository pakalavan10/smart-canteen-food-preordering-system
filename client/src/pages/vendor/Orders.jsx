import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import OrderCard from '../../components/vendor/OrderCard';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [todayOnly, setTodayOnly] = useState(false);

  const { socket } = useSocket();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (todayOnly) params.today = true;
      const { data } = await API.get('/orders/vendor-orders', { params });
      setOrders(data.data);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, statusFilter, todayOnly]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ⚡ Listen for Real-Time Socket.IO events
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder) => {
      toast.success(`🎉 New Order #${newOrder.orderNumber} received!`, { duration: 6000 });
      fetchOrders();
    };

    const handleStatusUpdated = (updatedData) => {
      fetchOrders();
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdated);
    };
  }, [socket, fetchOrders]);

  const handleAction = async (id, action, pickupToken) => {
    try {
      const payload = action === 'complete' ? { pickupToken } : {};
      await API.patch(`/orders/${id}/${action}`, payload);
      toast.success(`Order status updated: ${action}`);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update order'); }
  };

  const filters = ['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
  const filterLabels = { '': 'All', pending: '⏳ Pending', accepted: '✅ Accepted', preparing: '🍳 Preparing', ready: '🎉 Ready', completed: '✨ Completed', cancelled: '❌ Cancelled' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 dark:text-white">📋 Orders Management</h1>
          <p className="text-xs text-success-600 font-bold flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            Live Real-Time Socket Sync Enabled
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer glass px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700">
          <input type="checkbox" checked={todayOnly} onChange={e => { setTodayOnly(e.target.checked); setPage(1); }} className="w-4 h-4 text-primary-500 rounded" />
          <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Today only</span>
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === s
                ? 'bg-primary-600 text-white border-primary-500 shadow-md'
                : 'bg-white/70 dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:bg-surface-200/50'
            }`}>
            {filterLabels[s]}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton type="card" count={3} /> : orders.length === 0 ? (
        <div className="text-center py-20 glass"><p className="text-5xl mb-4">📭</p><p className="text-xl font-bold text-surface-500">No orders found</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {orders.map(order => (
            <OrderCard key={order._id} order={order}
              onAccept={(id) => handleAction(id, 'accept')}
              onReject={(id) => handleAction(id, 'reject')}
              onPrepare={(id) => handleAction(id, 'preparing')}
              onReady={(id) => handleAction(id, 'ready')}
              onComplete={(id, token) => handleAction(id, 'complete', token)}
            />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default VendorOrders;
