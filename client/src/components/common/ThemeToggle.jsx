import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <HiOutlineSun className="w-5 h-5 text-warning-400" />
      ) : (
        <HiOutlineMoon className="w-5 h-5 text-surface-600" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
