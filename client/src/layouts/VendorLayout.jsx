import { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  HiOutlineHome, HiOutlineClipboardDocumentList, HiOutlineSquares2X2,
  HiOutlinePlusCircle, HiOutlineBanknotes, HiOutlineChatBubbleLeft,
  HiOutlineBell, HiOutlineBars3, HiOutlineXMark, HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';

const navItems = [
  { path: '/vendor', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { path: '/vendor/orders', icon: HiOutlineClipboardDocumentList, label: 'Orders' },
  { path: '/vendor/menu', icon: HiOutlineSquares2X2, label: 'Manage Menu' },
  { path: '/vendor/add-food', icon: HiOutlinePlusCircle, label: 'Add Food' },
  { path: '/vendor/revenue', icon: HiOutlineBanknotes, label: 'Revenue' },
  { path: '/vendor/feedback', icon: HiOutlineChatBubbleLeft, label: 'Feedback' },
  { path: '/vendor/notifications', icon: HiOutlineBell, label: 'Notifications' },
];

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative overflow-hidden">
      {/* Warm decorative blobs */}
      <div className="fixed top-10 left-64 w-96 h-96 glow-orb glow-orb-accent -z-0" />
      <div className="fixed bottom-10 right-10 w-96 h-96 glow-orb glow-orb-primary -z-0" style={{ animationDelay: '4s' }} />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass rounded-none border-x-0 border-t-0 border-b border-[#F0DDD3] dark:border-surface-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
            <HiOutlineBars3 className="w-6 h-6 text-surface-700 dark:text-surface-300" />
          </button>
          <h1 className="font-display font-extrabold text-lg gradient-text">🏪 Vendor Panel</h1>
          <ThemeToggle />
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-surface-950/60 backdrop-blur-md z-50" />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-surface-900 border-r border-[#F0DDD3] dark:border-surface-700 shadow-soft-lg dark:shadow-glass-dark transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <h1 className="font-display font-extrabold text-xl gradient-text">🏪 Vendor Panel</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-peach dark:bg-surface-800/70 border border-[#F0DDD3] dark:border-surface-700 rounded-2xl p-3 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-md shadow-accent-500/30">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-surface-900 dark:text-white truncate">{user?.shopName || user?.name}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path} end={path === '/vendor'} onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-2 pt-4 border-t border-[#F0DDD3] dark:border-surface-700">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-surface-500">Theme</span>
              <ThemeToggle />
            </div>
            <button onClick={handleLogout} className="sidebar-link text-danger-500 hover:bg-danger-500/10 dark:hover:bg-danger-900/20 w-full">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;