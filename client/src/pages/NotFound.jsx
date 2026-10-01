import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <p className="text-8xl mb-4">🍕</p>
      <h1 className="font-display text-6xl font-extrabold gradient-text mb-4">404</h1>
      <p className="text-xl text-surface-500 mb-8">Oops! This page seems to have been eaten.</p>
      <Link to="/" className="btn-primary inline-block">Back to Home</Link>
    </motion.div>
  </div>
);

export default NotFound;
