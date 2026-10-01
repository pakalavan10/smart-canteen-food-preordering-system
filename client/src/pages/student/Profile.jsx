import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { getInitials } from '../../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', rollNumber: user?.rollNumber || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/students/profile', form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      await API.put('/students/change-password', passwords);
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPassLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">👤 My Profile</h1>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">{getInitials(user?.name)}</div>
        <div>
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">{user?.name}</h2>
          <p className="text-surface-500">{user?.email}</p>
          <p className="text-sm text-surface-400">{user?.department} • {user?.rollNumber}</p>
        </div>
      </motion.div>

      {/* Edit Profile */}
      <div className="glass p-6">
        <h3 className="font-display font-bold text-lg mb-4 text-surface-900 dark:text-white">Edit Profile</h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Roll Number</label>
              <input value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Department</label>
              <input value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass p-6">
        <h3 className="font-display font-bold text-lg mb-4 text-surface-900 dark:text-white">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required minLength={6} className="input-field" />
          </div>
          <button type="submit" disabled={passLoading} className="btn-secondary">{passLoading ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
