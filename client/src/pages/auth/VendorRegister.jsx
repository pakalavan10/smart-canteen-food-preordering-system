import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import AuthLayout from '../../components/common/AuthLayout';

const VendorRegister = () => {
  const [form, setForm] = useState({ name: '', shopName: '', email: '', password: '', phone: '', shopDescription: '' });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/vendor/register', form);
      toast.success('Registration submitted!');
      setIsSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <AuthLayout
      role="vendor"
      title="Register Your Shop!"
      subtitle="Get your canteen shop approved by the administrator and start fulfilling pre-orders."
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">🏪</p>
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">Vendor Registration</h1>
        <p className="text-surface-500 mt-1">Register your canteen shop</p>
      </div>

      {isSubmitted ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 py-4">
          <HiOutlineCheckCircle className="w-16 h-16 text-success-500 mx-auto" />
          <h2 className="text-2xl font-bold font-display text-surface-900 dark:text-white">Registration Pending Approval!</h2>
          <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed">
            Thank you for registering <strong className="text-primary-600 dark:text-primary-400">{form.shopName}</strong>! Your account details have been sent to the Canteen Administrator for review.
          </p>
          <div className="p-4 bg-warning-500/10 border border-warning-500/25 text-warning-700 dark:text-warning-300 rounded-2xl text-xs leading-relaxed">
            ℹ️ Once approved by the admin, you will be able to log in to your vendor dashboard and manage your menu.
          </div>
          <Link to="/vendor/login" className="btn-primary w-full block text-center mt-4">
            Go to Vendor Login
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Owner Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Shop Name *</label>
              <input name="shopName" value={form.shopName} onChange={handleChange} required className="input-field" placeholder="Main Canteen" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="vendor@canteen.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="input-field" placeholder="••••••••" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Shop Description</label>
            <textarea name="shopDescription" value={form.shopDescription} onChange={handleChange} rows="2" className="input-field resize-none" placeholder="Short description of your canteen offerings..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full font-semibold">
            {loading ? 'Submitting...' : 'Register Vendor Account'}
          </button>
        </form>
      )}

      {!isSubmitted && (
        <p className="text-center mt-6 text-sm text-surface-500">
          Already registered? <Link to="/vendor/login" className="text-primary-500 font-semibold hover:underline">Log in</Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default VendorRegister;