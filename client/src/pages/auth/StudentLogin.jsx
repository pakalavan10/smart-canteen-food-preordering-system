import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/common/AuthLayout';

const StudentLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('student', form);
      toast.success('Welcome back!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role="student"
      title="Welcome Back!"
      subtitle="Order your favorite food from the campus canteen. Pre-order, track live, and grab your meal in seconds."
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">🎓</p>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">Student Login</h1>
        <p className="text-surface-500 mt-1">Welcome back to Campus Canteen</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="student@university.edu" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="input-field" placeholder="••••••••" />
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password?role=student" className="text-sm text-primary-500 hover:text-primary-600">Forgot Password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-center mt-6 text-sm text-surface-500">
        Don't have an account? <Link to="/student/register" className="text-primary-500 font-semibold hover:text-primary-600">Register</Link>
      </p>
    </AuthLayout>
  );
};

export default StudentLogin;