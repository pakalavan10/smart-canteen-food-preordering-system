import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import OrderCard from '../../components/vendor/OrderCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try { const { data: res } = await API.get('/vendors/dashboard'); setData(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleOrderAction = async (id, action) => {
    try {
      await API.patch(`/orders/${id}/${action}`);
      toast.success(`Order ${action}ed!`);
      fetchDashboard();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-4 gap-4"><LoadingSkeleton type="stat" count={4} /></div></div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🏪 Vendor Dashboard</h1>
        <p className="text-surface-500 mt-1">Welcome back! Here's your overview</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Orders" value={data?.stats?.todayOrders || 0} icon="📦" color="primary" delay={0} />
        <StatCard title="Pending" value={data?.stats?.pendingOrders || 0} icon="⏳" color="orange" delay={1} />
        <StatCard title="Completed Today" value={data?.stats?.completedToday || 0} icon="✅" color="accent" delay={2} />
        <StatCard title="Today's Revenue" value={formatPrice(data?.stats?.todayRevenue || 0)} icon="💰" color="purple" delay={3} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatPrice(data?.stats?.totalRevenue || 0)} icon="🏦" color="blue" delay={4} />
        <StatCard title="Menu Items" value={data?.stats?.totalMenuItems || 0} icon="🍽️" color="pink" delay={5} />
        <StatCard title="Avg Rating" value={data?.stats?.avgRating || '0.0'} icon="⭐" color="yellow" delay={6} />
        <StatCard title="Total Ratings" value={data?.stats?.totalRatings || 0} icon="📊" color="red" delay={7} />
      </div>

      {/* Active Orders */}
      {data?.activeOrders?.length > 0 && (
        <div>
          <h2 className="section-header mb-4">🔥 Active Orders ({data.activeOrders.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.activeOrders.map(order => (
              <OrderCard key={order._id} order={order}
                onAccept={(id) => handleOrderAction(id, 'accept')}
                onReject={(id) => handleOrderAction(id, 'reject')}
                onPrepare={(id) => handleOrderAction(id, 'preparing')}
                onReady={(id) => handleOrderAction(id, 'ready')}
                onComplete={(id) => handleOrderAction(id, 'complete')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Most Ordered */}
      {data?.mostOrdered?.length > 0 && (
        <div>
          <h2 className="section-header mb-4">🌟 Top Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.mostOrdered.map(food => (
              <div key={food._id} className="glass p-3 text-center">
                <p className="font-semibold text-surface-900 dark:text-white text-sm truncate">{food.name}</p>
                <p className="text-primary-600 dark:text-primary-400 font-bold">{formatPrice(food.price)}</p>
                <p className="text-xs text-surface-400">{food.totalOrders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
