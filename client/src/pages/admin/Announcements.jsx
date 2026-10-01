import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [form, setForm] = useState({ title: '', message: '', targetAudience: 'all' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/admin/announcements', form);
      toast.success('Broadcast announcement sent to all users!');
      setForm({ title: '', message: '', targetAudience: 'all' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">📢 Broadcast Announcement</h1>
      <div className="glass p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Target Audience</label>
            <select value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} className="input-field">
              <option value="all">Everyone (Students & Vendors)</option>
              <option value="students">Students Only</option>
              <option value="vendors">Vendors Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input-field" placeholder="e.g. Canteen Closure Notice" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Message *</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows="4" className="input-field resize-none" placeholder="Type notification content..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending Broadcast...' : 'Send Broadcast Notification'}</button>
        </form>
      </div>
    </div>
  );
};

export default Announcements;
