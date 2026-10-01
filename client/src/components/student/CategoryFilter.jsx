import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
          !selected
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
        }`}
      >
        🍽️ All
      </motion.button>
      {categories?.map((cat) => (
        <motion.button
          key={cat._id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat._id)}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
            selected === cat._id
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
        >
          {cat.icon} {cat.name}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
