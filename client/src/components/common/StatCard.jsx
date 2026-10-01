import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, trend, color = 'primary', delay = 0 }) => {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/30',
    accent: 'from-accent-400 to-accent-600 shadow-accent-500/30',
    orange: 'from-accent-500 to-accent-700 shadow-orange-glow',
    pink: 'from-primary-400 to-primary-500 shadow-primary-500/30',
    blue: 'from-accent-400 to-accent-600 shadow-accent-500/30',
    red: 'from-danger-500 to-danger-600 shadow-danger-500/30',
    yellow: 'from-gold to-accent-500 shadow-warning-500/30',
    purple: 'from-primary-500 to-primary-800 shadow-primary-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="glass-hover p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-display font-extrabold text-surface-900 dark:text-white truncate">
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-1.5 font-bold flex items-center gap-1 ${trend > 0 ? 'text-success-600' : 'text-danger-500'}`}>
              <span className={`px-1.5 py-0.5 rounded-full border ${trend > 0 ? 'bg-success-500/10 border-success-500/20' : 'bg-danger-500/10 border-danger-500/20'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-surface-400 font-normal">vs last week</span>
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg border border-white/20 shrink-0`}>
          <span className="text-2xl block">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;