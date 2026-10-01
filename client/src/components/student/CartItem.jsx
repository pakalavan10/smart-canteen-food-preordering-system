import { HiOutlinePlus, HiOutlineMinus, HiOutlineTrash } from 'react-icons/hi2';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="glass p-4 flex gap-4 items-center">
      <img
        src={getImageUrl(item.image)}
        alt={item.name}
        className="w-20 h-20 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-surface-900 dark:text-white truncate">{item.name}</h4>
        <p className="text-sm text-surface-500">{formatPrice(item.price)} each</p>
        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 disabled:opacity-30 transition-colors"
        >
          <HiOutlineMinus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-bold text-surface-900 dark:text-white">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
          className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={() => onRemove(item._id)}
        className="p-2 rounded-xl text-danger-500 hover:bg-danger-500/10 dark:hover:bg-danger-900/20 transition-colors"
      >
        <HiOutlineTrash className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartItem;
