import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { NotificationContext } from '../../context/NotificationContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { timeAgo } from '../../utils/helpers';
import { HiOutlineBell, HiOutlineCheck, HiOutlineTrash } from 'react-icons/hi2';

const typeIcons = { order_accepted: '✅', order_preparing: '🍳', order_ready: '🎉', order_completed: '✨', order_cancelled: '❌', announcement: '📢', welcome: '👋', system: '⚙️', order_placed: '📦' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchUnreadCount } = useContext(NotificationContext);

  useEffect(() => {
    API.get('/notifications').then(res => { setNotifications(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    fetchUnreadCount();
  };

  const markAllRead = async () => {
    await API.patch('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    fetchUnreadCount();
  };

  const deleteNotif = async (id) => {
    await API.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
    fetchUnreadCount();
  };

  if (loading) return <LoadingSkeleton type="table-row" count={5} />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🔔 Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="btn-ghost text-sm text-primary-500 flex items-center gap-1"><HiOutlineCheck className="w-4 h-4" /> Mark all read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-20"><p className="text-5xl mb-4">🔕</p><p className="text-xl text-surface-500">No notifications</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className={`glass p-4 flex items-start gap-4 ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}>
              <span className="text-2xl shrink-0">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-surface-900 dark:text-white">{n.title}</h4>
                <p className="text-sm text-surface-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-surface-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.isRead && <button onClick={() => markAsRead(n._id)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"><HiOutlineCheck className="w-4 h-4 text-success-600" /></button>}
                <button onClick={() => deleteNotif(n._id)} className="p-1.5 rounded-lg hover:bg-danger-500/10 dark:hover:bg-danger-900/20"><HiOutlineTrash className="w-4 h-4 text-danger-500" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
