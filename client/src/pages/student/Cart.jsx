import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import CartItem from '../../components/student/CartItem';
import { formatPrice } from '../../utils/helpers';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-surface-500 mb-6">Add some delicious food to get started!</p>
        <Link to="/student/menu" className="btn-primary inline-block">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white">🛒 My Cart</h1>
          <p className="text-surface-500">{cartCount} item{cartCount > 1 ? 's' : ''} from {cartItems[0]?.vendorName || 'vendor'}</p>
        </div>
        <button onClick={clearCart} className="btn-ghost text-danger-500 text-sm">Clear All</button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {cartItems.map(item => (
          <CartItem key={item._id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
        ))}
      </motion.div>

      {/* Summary */}
      <div className="glass p-6">
        <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">Order Summary</h3>
        <div className="space-y-2 mt-3">
          {cartItems.map(item => (
            <div key={item._id} className="flex justify-between text-sm text-surface-600 dark:text-surface-400">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 bg-gradient-to-r from-peach to-primary-50 dark:from-surface-800 dark:to-surface-800/60 rounded-2xl px-5 py-4 border border-primary-200 dark:border-primary-500/30">
          <span className="text-lg font-bold text-surface-900 dark:text-white">Total</span>
          <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{formatPrice(cartTotal)}</span>
        </div>
        <Link to="/student/checkout" className="btn-primary w-full block text-center mt-5">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default Cart;
