import { motion } from 'framer-motion';
import { ORDER_STATUSES } from '../../utils/constants';

const steps = ['pending', 'accepted', 'preparing', 'ready', 'completed'];

const OrderTimeline = ({ currentStatus, statusHistory = [] }) => {
  const currentIdx = steps.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="py-4">
      {isCancelled ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-danger-500 font-bold text-lg">Order Cancelled</p>
        </div>
      ) : (
        <div className="flex items-center justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-surface-200 dark:bg-surface-700 mx-8" />
          {/* Progress bar fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute top-5 left-0 h-1 bg-primary-500 mx-8"
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const info = ORDER_STATUSES[step];
            const historyEntry = statusHistory.find(h => h.status === step);

            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2" style={{ width: '20%' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.15 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all ${
                    isCompleted
                      ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-surface-100 dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-surface-400'
                  } ${isCurrent ? 'ring-4 ring-primary-200 dark:ring-primary-800' : ''}`}
                >
                  {info.icon}
                </motion.div>
                <span className={`text-xs font-semibold text-center ${
                  isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'
                }`}>
                  {info.label}
                </span>
                {historyEntry && (
                  <span className="text-[10px] text-surface-400">
                    {new Date(historyEntry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
