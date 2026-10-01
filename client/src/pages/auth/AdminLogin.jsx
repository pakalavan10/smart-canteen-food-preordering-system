import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/common/AuthLayout';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('admin', form);
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      role="admin"
      title="System Control Portal"
      subtitle="Approve vendors, manage the platform, and keep the campus canteen running smoothly."
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">⚙️</p>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">Admin Login</h1>
        <p className="text-surface-500 mt-1">System administration</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="admin@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="input-field" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login as Admin'}</button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;