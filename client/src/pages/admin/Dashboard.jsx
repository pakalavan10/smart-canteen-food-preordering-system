import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import RevenueChart from '../../components/vendor/RevenueChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';
import { useSocket } from '../../context/SocketContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await API.get('/admin/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ⚡ Listen for Real-Time Socket.IO events for Admin
  useEffect(() => {
    if (!socket) return;

    const handleAdminOrderUpdate = () => {
      fetchDashboard();
    };

    socket.on('admin_new_order', handleAdminOrderUpdate);
    socket.on('order_status_updated', handleAdminOrderUpdate);

    return () => {
      socket.off('admin_new_order', handleAdminOrderUpdate);
      socket.off('order_status_updated', handleAdminOrderUpdate);
    };
  }, [socket, fetchDashboard]);

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><LoadingSkeleton type="stat" count={8} /></div></div>;

  const s = data?.stats || {};

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">⚙️ Admin Control Panel</h1>
          <p className="text-surface-500 mt-1">Real-time system overview and live analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-success-500/12 text-success-700 dark:text-success-300 font-bold border border-success-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            Live Real-Time Multi-User Socket Sync
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={s.totalStudents} icon="🎓" color="primary" delay={0} />
        <StatCard title="Total Vendors" value={s.totalVendors} icon="🏪" color="accent" delay={1} />
        <StatCard title="Today's Orders" value={s.todayOrders} icon="📦" color="orange" delay={2} />
        <StatCard title="Today's Revenue" value={formatPrice(s.todayRevenue)} icon="💰" color="purple" delay={3} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatPrice(s.totalRevenue)} icon="🏦" color="blue" delay={4} />
        <StatCard title="Completed Orders" value={s.completedOrders} icon="✅" color="accent" delay={5} />
        <StatCard title="Cancelled Orders" value={s.cancelledOrders} icon="❌" color="red" delay={6} />
        <StatCard title="Pending Vendors" value={s.pendingVendors} icon="⏳" color="yellow" delay={7} />
      </div>

      {/* Revenue trend */}
      <RevenueChart data={data?.revenueTrend} title="Platform Revenue Trend (Last 7 Days)" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak hours */}
        {data?.peakHours?.length > 0 && (
          <div className="glass p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-surface-900 dark:text-white">📊 Peak Ordering Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.peakHours.map(h => ({ hour: `${h._id}:00`, orders: h.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0DDD3" opacity={0.7} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#B2958A' }} axisLine={{ stroke: '#F0DDD3' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#B2958A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFF8F2', border: '1px solid #F0DDD3', borderRadius: '14px', color: '#2B2927', boxShadow: '0 8px 24px rgba(43, 41, 39, 0.12)' }} />
                <Bar dataKey="orders" fill="#E85D5A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Popular foods */}
        {data?.popularFoods?.length > 0 && (
          <div className="glass p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-surface-900 dark:text-white">🌟 Popular Foods Leaderboard</h3>
            <div className="space-y-3">
              {data.popularFoods.map((food, i) => (
                <div key={food._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-surface-400 w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">{food.name}</p>
                    <p className="text-xs text-surface-500">{food.vendor?.shopName} • {food.totalOrders} orders</p>
                  </div>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{formatPrice(food.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent orders */}
      {data?.recentOrders?.length > 0 && (
        <div className="glass p-6">
          <h3 className="font-display font-bold text-lg mb-4 text-surface-900 dark:text-white">📋 Recent Orders Monitor</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 text-surface-500 font-semibold">Order</th>
                <th className="text-left py-3 px-4 text-surface-500 font-semibold">Student</th>
                <th className="text-left py-3 px-4 text-surface-500 font-semibold">Vendor</th>
                <th className="text-left py-3 px-4 text-surface-500 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-surface-500 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-surface-500 font-semibold">Date</th>
              </tr></thead>
              <tbody>
                {data.recentOrders.map(o => (
                  <tr key={o._id} className="border-b border-surface-100 dark:border-surface-800">
                    <td className="py-3 px-4 font-medium">{o.orderNumber}</td>
                    <td className="py-3 px-4">{o.student?.name}</td>
                    <td className="py-3 px-4">{o.vendor?.shopName}</td>
                    <td className="py-3 px-4 font-semibold">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3 px-4"><span className={`badge ${ORDER_STATUSES[o.status]?.color}`}>{ORDER_STATUSES[o.status]?.label}</span></td>
                    <td className="py-3 px-4 text-surface-500">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
