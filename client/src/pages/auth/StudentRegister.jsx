import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/common/AuthLayout';

const StudentRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', rollNumber: '', department: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register('student', form);
      toast.success('Registration successful!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <AuthLayout
      role="student"
      title="Join Campus Canteen!"
      subtitle="Create your student account, browse the menu, and pre-order delicious meals in seconds."
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">🎓</p>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">Create Account</h1>
        <p className="text-surface-500 mt-1">Join Campus Canteen today</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="9876543210" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="student@university.edu" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Roll Number</label>
            <input name="rollNumber" value={form.rollNumber} onChange={handleChange} className="input-field" placeholder="CS2024001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Department</label>
            <input name="department" value={form.department} onChange={handleChange} className="input-field" placeholder="CSE" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Password *</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="input-field" placeholder="Min 6 characters" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Register'}</button>
      </form>
      <p className="text-center mt-6 text-sm text-surface-500">
        Already have an account? <Link to="/student/login" className="text-primary-500 font-semibold">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default StudentRegister;