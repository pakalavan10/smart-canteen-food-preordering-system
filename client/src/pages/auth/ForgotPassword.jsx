import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/common/AuthLayout';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const roleLabel = role === 'vendor' ? 'Vendor' : role === 'admin' ? 'Admin' : 'Student';

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/${role}/forgot-password`, { email: form.email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/${role}/verify-otp`, { email: form.email, otp: form.otp });
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/${role}/reset-password`, form);
      toast.success('Password reset successful! Please login.');
      setStep(4);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout
      role={role}
      title="Reset Your Password"
      subtitle="No worries — we'll help you get back to ordering your favorite campus meals in no time."
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">🔐</p>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
          {step === 4 ? 'Password Reset!' : `Forgot Password (${roleLabel})`}
        </h1>
      </div>

      {/* Step indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <span key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-primary-500' : s < step ? 'w-2 bg-primary-300' : 'w-2 bg-surface-200 dark:bg-surface-700'}`} />
          ))}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="Enter your email" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <p className="text-sm text-surface-500 text-center mb-4">Enter the 6-digit OTP sent to <strong className="text-primary-600 dark:text-primary-400">{form.email}</strong></p>
          <div>
            <input type="text" value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} required maxLength={6} className="input-field text-center text-2xl tracking-[0.5em] font-mono" placeholder="000000" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying...' : 'Verify OTP'}</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">New Password</label>
            <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required minLength={6} className="input-field" placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      )}

      {step === 4 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
          <span className="mx-auto w-16 h-16 rounded-full bg-success-500/12 text-success-600 dark:text-success-400 flex items-center justify-center text-3xl">✅</span>
          <p className="text-success-600 dark:text-success-400 text-lg font-bold">Your password has been reset successfully!</p>
          <Link to={`/${role}/login`} className="btn-primary inline-block">Go to Login</Link>
        </motion.div>
      )}

      {step > 1 && step < 4 && (
        <button onClick={() => setStep(step - 1)} className="block mx-auto mt-5 text-sm text-surface-400 hover:text-primary-600 transition-colors">
          ← Back
        </button>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;