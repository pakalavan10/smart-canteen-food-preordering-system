import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice, formatDateTime, getImageUrl } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await API.get('/students/dashboard');
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="space-y-6"><LoadingSkeleton type="stat" count={3} /></div>;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-surface-500 mt-1">Ready to order something delicious?</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={data?.stats?.totalOrders || 0} icon="📦" color="primary" delay={0} />
        <StatCard title="Completed" value={data?.stats?.completedOrders || 0} icon="✅" color="accent" delay={1} />
        <StatCard title="Total Spent" value={formatPrice(data?.stats?.totalSpent || 0)} icon="💰" color="orange" delay={2} />
      </div>

      {/* Active Orders */}
      {data?.activeOrders?.length > 0 && (
        <div>
          <h2 className="section-header mb-4">🔥 Active Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeOrders.map(order => (
              <Link key={order._id} to={`/student/orders/${order._id}`} className="glass-hover p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-surface-900 dark:text-white">{order.orderNumber}</span>
                  <span className={`badge ${ORDER_STATUSES[order.status]?.color}`}>
                    {ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}
                  </span>
                </div>
                <p className="text-sm text-surface-500">{order.vendor?.shopName}</p>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">{formatPrice(order.totalAmount)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="section-header mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/student/menu', icon: '🍽️', label: 'Browse Menu' },
            { to: '/student/cart', icon: '🛒', label: 'My Cart' },
            { to: '/student/orders', icon: '📋', label: 'Order History' },
            { to: '/student/favorites', icon: '❤️', label: 'Favorites' },
          ].map((a, i) => (
            <motion.div key={a.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={a.to} className="glass-hover p-4 text-center block">
                <span className="text-3xl block mb-2">{a.icon}</span>
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{a.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      {data?.recommended?.length > 0 && (
        <div>
          <h2 className="section-header mb-4">🌟 Recommended for You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.recommended.map(food => (
              <Link key={food._id} to={`/student/menu/${food._id}`} className="glass-hover p-3 text-center">
                <img src={getImageUrl(food.image)} alt={food.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{food.name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-bold">{formatPrice(food.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
