import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineFire, HiOutlineBell, HiOutlineClock, HiOutlineKey } from 'react-icons/hi2';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';

const OrderCard = ({ order, onAccept, onReject, onPrepare, onReady, onComplete }) => {
  const statusInfo = ORDER_STATUSES[order.status];
  const [pickupToken, setPickupToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleComplete = async () => {
    if (!pickupToken.trim()) {
      alert('Enter the pickup token from the student\'s QR code to complete this order');
      return;
    }
    setVerifying(true);
    try {
      await onComplete(order._id, pickupToken.trim());
      setPickupToken('');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="glass p-6 space-y-4 hover:border-primary-300/60 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-display font-extrabold text-lg text-surface-900 dark:text-white flex items-center gap-2">
            <span>📦 {order.orderNumber}</span>
          </h3>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mt-0.5">
            👤 {order.student?.name} • {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className={`badge ${statusInfo?.color} text-xs px-3 py-1 font-extrabold shadow-sm`}>
          {statusInfo?.icon} {statusInfo?.label}
        </span>
      </div>

      {/* Items list in glass panel */}
      <div className="glass-panel p-4 space-y-2.5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs font-semibold">
            <span className="text-surface-800 dark:text-surface-200">
              <span className="px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 mr-2 font-bold">{item.quantity}×</span>
              {item.name}
            </span>
            <span className="font-bold text-surface-900 dark:text-white">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-surface-200/80 dark:border-surface-700/60 pt-2.5 flex justify-between items-center">
          <span className="font-extrabold text-sm text-surface-900 dark:text-white">Total Amount</span>
          <span className="font-extrabold text-base text-primary-600 dark:text-primary-400">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {/* Pickup time & instructions */}
      <div className="flex items-center justify-between text-xs text-surface-600 dark:text-surface-400">
        <span className="flex items-center gap-1 font-semibold">
          <HiOutlineClock className="w-4 h-4 text-primary-500" />
          <span>Pickup: <strong className="text-surface-900 dark:text-white">{order.pickupTime}</strong></span>
        </span>
        {order.specialInstructions && (
          <span className="italic text-surface-500 truncate max-w-[200px]" title={order.specialInstructions}>
            📝 {order.specialInstructions}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-1">
        {order.status === 'pending' && (
          <>
            <button onClick={() => onAccept(order._id)} className="btn-accent !py-2.5 !px-4 text-xs flex-1 flex items-center justify-center gap-1">
              <HiOutlineCheck className="w-4 h-4" /> Accept Order
            </button>
            <button onClick={() => onReject(order._id)} className="btn-danger !py-2.5 !px-4 text-xs flex-1 flex items-center justify-center gap-1">
              <HiOutlineXMark className="w-4 h-4" /> Reject
            </button>
          </>
        )}
        {order.status === 'accepted' && (
          <button onClick={() => onPrepare(order._id)} className="btn-primary w-full !py-2.5 text-xs flex items-center justify-center gap-1">
            <HiOutlineFire className="w-4 h-4" /> Start Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button onClick={() => onReady(order._id)} className="btn-accent w-full !py-2.5 text-xs flex items-center justify-center gap-1">
            <HiOutlineBell className="w-4 h-4" /> Mark Ready for Pickup
          </button>
        )}
        {order.status === 'ready' && (
          <div className="space-y-2.5 w-full">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-surface-600 dark:text-surface-400">
                <HiOutlineKey className="w-4 h-4 text-primary-500" />
                Enter pickup token to verify & complete:
              </span>
            </div>
            <input
              value={pickupToken}
              onChange={(e) => setPickupToken(e.target.value)}
              placeholder="e.g. A1B2C3D4E5F6"
              maxLength={32}
              className="input-field !py-2.5 text-sm uppercase tracking-wide"
            />
            <button onClick={handleComplete} disabled={verifying} className="btn-primary w-full !py-2.5 text-xs flex items-center justify-center gap-1">
              <HiOutlineCheck className="w-4 h-4" /> {verifying ? 'Verifying...' : 'Complete Pickup & Verification'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderCard;
