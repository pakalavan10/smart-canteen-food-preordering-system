import { motion } from 'framer-motion';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingCart, HiStar } from 'react-icons/hi2';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const MenuCard = ({ food, onAddToCart, onToggleFavorite, isFavorite, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="glass-hover overflow-hidden cursor-pointer group rounded-3xl"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={getImageUrl(food.image)}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity" />

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(food._id); }}
          className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-white/80 dark:bg-surface-900/70 backdrop-blur-md border border-[#F0DDD3] dark:border-surface-700 hover:scale-110 active:scale-95 transition-all shadow-soft"
          aria-label="Toggle Favorite"
        >
          {isFavorite ? (
            <HiHeart className="w-5 h-5 text-primary-500 fill-primary-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-surface-700 dark:text-surface-200" />
          )}
        </button>

        {/* Veg/Non-veg Badge */}
        <div className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md border shadow-md ${
          food.isVeg 
            ? 'bg-success-500/25 text-white border-success-400/50' 
            : 'bg-danger-500/25 text-white border-danger-400/50'
        }`}>
          {food.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
        </div>

        {/* Unavailable overlay */}
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-danger-500/30 border border-danger-500/50 text-danger-100 font-extrabold text-sm tracking-wide uppercase">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category Pill on Image */}
        {food.category?.name && (
          <div className="absolute bottom-3 left-3.5 px-2.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-white/90 text-xs font-semibold">
            {food.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-extrabold text-surface-900 dark:text-white text-lg leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
            {food.name}
          </h3>
          {food.rating > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning-500/15 text-warning-600 border border-warning-500/30 text-xs font-bold shrink-0">
              <HiStar className="w-3.5 h-3.5 fill-current" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2">
          🏪 {food.vendor?.shopName || 'Canteen Shop'}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 line-clamp-2 leading-relaxed">
          {food.description || 'Delicious freshly prepared canteen special food item.'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-surface-200/60 dark:border-surface-700/50">
          <div>
            <span className="text-2xl font-display font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(food.price)}
            </span>
            {food.preparationTime && (
              <p className="text-[11px] font-semibold text-surface-400">⏱ {food.preparationTime} mins prep</p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(food); }}
            disabled={!food.isAvailable}
            className="btn-primary !px-4 !py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
