import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import useCashfreeCheckout from '../../hooks/useCashfreeCheckout';
import API from '../../api/axios';
import { formatPrice } from '../../utils/helpers';
import { PICKUP_TIMES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { HiOutlineBanknotes, HiOutlineQrCode, HiOutlineCreditCard, HiOutlineSparkles } from 'react-icons/hi2';

const paymentOptions = [
  { id: 'cash', label: 'Cash on Pickup', icon: HiOutlineBanknotes, desc: 'Pay cash at canteen counter' },
  { id: 'upi', label: 'UPI Payment', icon: HiOutlineQrCode, desc: 'GPay, PhonePe, Paytm QR' },
  { id: 'card', label: 'Credit / Debit Card', icon: HiOutlineCreditCard, desc: 'Visa, MasterCard, RuPay' },
  { id: 'online', label: 'Online Gateway', icon: HiOutlineSparkles, desc: 'Instant NetBanking & Wallet' },
];

const ONLINE_METHODS = ['upi', 'card', 'online'];

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const { openCheckout, checkoutError, setCheckoutError } = useCashfreeCheckout();
  const navigate = useNavigate();

  const isOnlinePayment = ONLINE_METHODS.includes(paymentMethod);

  // Open the Cashfree drop-in checkout for an existing (unpaid) order
  const openCashfreeCheckout = async (order) => {
    setGatewayLoading(true);
    try {
      const { data } = await API.post('/payments/create-session', { orderId: order._id });
      const { paymentSessionId, mode } = data.data;
      // After payment, Cashfree redirects the user to the payment-status page
      await openCheckout({ paymentSessionId, mode });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to start payment';
      if (!err.response?.data?.message) {
        // SDK-level failure (session expired, network…) — keep the user on this page to retry
        toast.error(msg);
      }
    } finally {
      setGatewayLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    setLoading(true);
    setCheckoutError('');
    try {
      const orderData = {
        items: cartItems.map(item => ({ food: item._id, quantity: item.quantity })),
        pickupTime,
        paymentMethod,
        specialInstructions,
      };
      const { data } = await API.post('/orders', orderData);
      clearCart();

      if (isOnlinePayment) {
        toast.success('Order placed! Complete your payment to confirm it. 💳');
        await openCashfreeCheckout(data.data);
      } else {
        toast.success('Order placed! Payment is collected on pickup. 🎉');
        navigate(`/student/orders/${data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/student/cart');
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-surface-900 dark:text-white">📋 Checkout & Payment</h1>

      {/* Order items summary */}
      <div className="glass p-6">
        <h3 className="font-display font-extrabold text-lg mb-4 text-surface-900 dark:text-white">Order Summary</h3>
        <div className="space-y-2.5">
          {cartItems.map(item => (
            <div key={item._id} className="flex justify-between py-2 border-b border-surface-200/60 dark:border-surface-700/50 last:border-0 text-sm">
              <span className="text-surface-800 dark:text-surface-200 font-semibold">{item.quantity}× {item.name}</span>
              <span className="font-bold text-surface-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 mt-3 bg-gradient-to-r from-peach to-primary-50 dark:from-surface-800 dark:to-surface-800/60 rounded-2xl px-5 py-4 border border-primary-200 dark:border-primary-500/30">
          <span className="text-xl font-extrabold text-surface-900 dark:text-white">Total Payable</span>
          <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{formatPrice(cartTotal)}</span>
        </div>
      </div>

      {/* Pickup time selector */}
      <div className="glass p-6">
        <h3 className="font-display font-extrabold text-lg mb-4 text-surface-900 dark:text-white">🕐 Select Pickup Time *</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {PICKUP_TIMES.map(time => (
            <button key={time} onClick={() => setPickupTime(time)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all border ${
                pickupTime === time
                  ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/30'
                  : 'bg-white/70 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200/50'
              }`}>
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Options */}
      <div className="glass p-6">
        <h3 className="font-display font-extrabold text-lg mb-4 text-surface-900 dark:text-white">💳 Payment Method *</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentOptions.map(({ id, label, icon: Icon, desc }) => (
            <div
              key={id}
              onClick={() => { setPaymentMethod(id); setCheckoutError(''); }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                paymentMethod === id
                  ? 'bg-peach dark:bg-surface-800 border-primary-500 shadow-coral'
                  : 'bg-white/70 dark:bg-surface-800/50 border-surface-200/80 dark:border-surface-700/60 text-surface-700 dark:text-surface-300 hover:border-primary-400/50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${paymentMethod === id ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-surface-900 dark:text-white">{label}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        {isOnlinePayment && (
          <p className="mt-4 text-xs font-semibold text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
            <HiOutlineSparkles className="w-4 h-4 text-primary-500" />
            Online payments are processed securely by Cashfree (sandbox/test mode). Your order is confirmed only after payment succeeds.
          </p>
        )}
      </div>

      {/* Special instructions */}
      <div className="glass p-6">
        <h3 className="font-display font-extrabold text-lg mb-4 text-surface-900 dark:text-white">📝 Special Instructions</h3>
        <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="input-field resize-none" rows="3" placeholder="Any special requests or allergies? (optional)" />
      </div>

      {/* Gateway error (expired/invalid session, SDK failure) — allows retry */}
      {checkoutError && (
        <div className="glass p-4 rounded-2xl bg-danger-500/10 border border-danger-500/30">
          <p className="text-sm font-semibold text-danger-600 dark:text-danger-300">{checkoutError}</p>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading || gatewayLoading}
        className="btn-primary w-full text-lg py-4 shadow-xl"
      >
        {loading
          ? 'Placing Order...'
          : gatewayLoading
            ? 'Opening Payment Gateway...'
            : isOnlinePayment
              ? `Pay Now — ${formatPrice(cartTotal)}`
              : `Confirm Order — ${formatPrice(cartTotal)}`}
      </button>
    </motion.div>
  );
};

export default Checkout;