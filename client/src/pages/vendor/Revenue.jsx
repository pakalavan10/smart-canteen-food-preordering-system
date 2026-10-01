import { useState, useEffect } from 'react';
import API from '../../api/axios';
import RevenueChart from '../../components/vendor/RevenueChart';
import StatCard from '../../components/common/StatCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../utils/helpers';

const Revenue = () => {
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [revRes, dashRes] = await Promise.all([
          API.get(`/vendors/revenue?period=${period}`),
          API.get('/vendors/dashboard'),
        ]);
        setData(revRes.data.data);
        setStats(dashRes.data.data.stats);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [period]);

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-3 gap-4"><LoadingSkeleton type="stat" count={3} /></div></div>;

  const totalRevenue = data?.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const totalOrders = data?.reduce((sum, d) => sum + d.orders, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">💰 Revenue</h1>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title={`${period} Revenue`} value={formatPrice(totalRevenue)} icon="💰" color="primary" />
        <StatCard title={`${period} Orders`} value={totalOrders} icon="📦" color="accent" />
        <StatCard title="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} icon="🏦" color="purple" />
      </div>

      <RevenueChart data={data} title={`${period.charAt(0).toUpperCase() + period.slice(1)} Revenue Trend`} />
    </div>
  );
};

export default Revenue;
