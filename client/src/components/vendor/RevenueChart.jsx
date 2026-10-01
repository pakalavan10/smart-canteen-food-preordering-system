import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data, title = 'Revenue Overview' }) => {
  const chartData = data?.map(d => ({
    date: d._id,
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  return (
    <div className="glass p-6">
      <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-center text-surface-400 py-8">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E85D5A" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#E85D5A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F4A340" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F4A340" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0DDD3" opacity={0.7} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#B2958A' }} axisLine={{ stroke: '#F0DDD3' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#B2958A' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF8F2',
                border: '1px solid #F0DDD3',
                borderRadius: '14px',
                color: '#2B2927',
                boxShadow: '0 8px 24px rgba(43, 41, 39, 0.12)',
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#E85D5A" fill="url(#colorRevenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="orders" stroke="#F4A340" fill="url(#colorOrders)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
