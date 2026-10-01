import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/common/AuthLayout';

const VendorLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('vendor', form);
      toast.success('Welcome back!');
      navigate('/vendor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      role="vendor"
      title="Manage Your Canteen Shop!"
      subtitle="Fulfill pre-orders, update your menu, and track revenue — all in real time."
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">🏪</p>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">Vendor Login</h1>
        <p className="text-surface-500 mt-1">Manage your canteen shop</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="vendor@canteen.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="input-field" placeholder="••••••••" />
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password?role=vendor" className="text-sm text-primary-500 hover:text-primary-600">Forgot Password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-center mt-6 text-sm text-surface-500">
        Don't have a vendor account? <Link to="/vendor/register" className="text-primary-500 font-semibold hover:underline">Register your shop</Link>
      </p>
    </AuthLayout>
  );
};

export default VendorLogin;