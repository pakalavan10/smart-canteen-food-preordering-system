import { useState, useEffect } from 'react';
import API from '../../api/axios';
import RevenueChart from '../../components/vendor/RevenueChart';
import StatCard from '../../components/common/StatCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../utils/helpers';

const AdminRevenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/admin').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-3 gap-4"><LoadingSkeleton type="stat" count={3} /></div></div>;

  const totalRev = data?.totalRevenue || 0;
  const todayRev = data?.todayRevenue || 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">💰 Financial Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Platform Revenue" value={formatPrice(totalRev)} icon="💰" color="primary" />
        <StatCard title="Today's Revenue" value={formatPrice(todayRev)} icon="⚡" color="accent" />
        <StatCard title="Total Orders Handled" value={data?.totalOrders || 0} icon="📦" color="purple" />
      </div>

      <RevenueChart data={data?.dailyRevenue || []} title="Overall Daily Platform Revenue" />
    </div>
  );
};

export default AdminRevenue;
