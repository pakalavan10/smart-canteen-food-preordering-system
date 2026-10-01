import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import OrderTimeline from '../../components/student/OrderTimeline';
import QRCodeDisplay from '../../components/student/QRCodeDisplay';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import useCashfreeCheckout from '../../hooks/useCashfreeCheckout';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiStar, HiOutlineExclamationTriangle, HiOutlineArrowLeft, HiOutlineArrowPath } from 'react-icons/hi2';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // 'invalid_id' | 'not_found' | 'unauthorized' | 'server_error'
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { socket } = useSocket();
  const { openCheckout } = useCashfreeCheckout();
  const [paying, setPaying] = useState(false);

  const handlePayNow = async (orderId) => {
    setPaying(true);
    try {
      const { data } = await API.post('/payments/create-session', { orderId });
      const { paymentSessionId, mode } = data.data;
      await openCheckout({ paymentSessionId, mode });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to start payment';
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  const fetchOrder = useCallback(async () => {
    // Basic format check
    if (!id || id.length < 12) {
      setErrorState('invalid_id');
      setLoading(false);
      return;
    }

    try {
      setErrorState(null);
      const { data } = await API.get(`/orders/${id}`);
      if (data?.data) {
        setOrder(data.data);
      } else {
        setErrorState('not_found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      const status = err.response?.status;
      if (status === 400) {
        setErrorState('invalid_id');
      } else if (status === 403) {
        setErrorState('unauthorized');
      } else if (status === 404) {
        setErrorState('not_found');
      } else {
        setErrorState('server_error');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000); // Polling backup
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // ⚡ Socket.IO Real-Time Status Update Listener
  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusUpdate = (data) => {
      const updatedOrder = data?.order || data;
      if (updatedOrder && (updatedOrder._id === id || updatedOrder.id === id)) {
        setOrder(updatedOrder);
        if (data?.notification) {
          toast.success(`${data.notification.title} — ${data.notification.message}`, { duration: 5000 });
        }
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);
    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket, id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    try {
      const firstFoodId = order.items?.[0]?.food?._id || order.items?.[0]?.food;
      await API.post('/reviews', {
        foodId: firstFoodId,
        vendorId: order.vendor?._id || order.vendor,
        orderId: order._id,
        rating,
        comment,
      });
      toast.success('Thank you for your feedback! ⭐');
      setReviewSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/student/orders" className="p-2 rounded-xl glass hover:bg-surface-100 dark:hover:bg-surface-800">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-surface-900 dark:text-white">Loading order...</h1>
        </div>
        <LoadingSkeleton type="text" count={6} />
      </div>
    );
  }

  // 2. Error States (Invalid ID, 404 Not Found, 403 Unauthorized, 500 Server Error)
  if (errorState || !order) {
    const errorConfigs = {
      invalid_id: {
        icon: '⚠️',
        title: 'Invalid Order ID Format',
        message: 'The order ID provided in the URL is invalid or malformed.',
      },
      not_found: {
        icon: '🔍',
        title: 'Order Not Found',
        message: 'We could not find an order matching this ID. It may have been removed or does not exist.',
      },
      unauthorized: {
        icon: '🔒',
        title: 'Unauthorized Access',
        message: 'You are not authorized to view this order. Please make sure you are logged into the correct student account.',
      },
      server_error: {
        icon: '⚡',
        title: 'Unable to Load Order',
        message: 'A network or server error occurred while retrieving order details. Please try again.',
      },
    };

    const config = errorConfigs[errorState] || errorConfigs.not_found;

    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="glass p-8 text-center space-y-5">
          <div className="text-5xl mb-2">{config.icon}</div>
          <h2 className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">
            {config.title}
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed max-w-md mx-auto">
            {config.message}
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link to="/student/orders" className="btn-secondary !px-5 text-sm flex items-center gap-2">
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>
            <button onClick={fetchOrder} className="btn-primary !px-5 text-sm flex items-center gap-2">
              <HiOutlineArrowPath className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Successful Order State
  const vendorName = order.vendor?.shopName || 'Canteen Vendor';
  const orderNum = order.orderNumber || 'ORD-000000';
  const paymentMethodStr = (order.paymentMethod || 'cash').toUpperCase();
  const paymentStatusStr = order.paymentStatus || 'PENDING';
  const itemsList = Array.isArray(order.items) ? order.items : [];
  const statusHistoryList = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link to="/student/orders" className="p-2.5 rounded-2xl glass hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5 text-surface-700 dark:text-surface-200" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-surface-900 dark:text-white flex items-center gap-2">
              <span>📦 {orderNum}</span>
            </h1>
            <p className="text-xs font-semibold text-surface-500 mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-success-500/12 text-success-700 dark:text-success-300 font-bold border border-success-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            Live Sync
          </span>
          <span className="badge badge-info">{paymentMethodStr} ({paymentStatusStr})</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass p-6">
        <h3 className="font-display font-extrabold text-lg mb-4 text-surface-900 dark:text-white">Live Order Progress</h3>
        <OrderTimeline currentStatus={order.status || 'pending'} statusHistory={statusHistoryList} />
      </div>

      {/* Pending online payment — resume checkout */}
      {['upi', 'card', 'online'].includes(order.paymentMethod || '') &&
        ['PENDING', 'FAILED'].includes(order.paymentStatus || '') &&
        !['cancelled', 'completed'].includes(order.status || '') && (
        <div className="glass p-5 flex items-center justify-between gap-4 flex-wrap border border-warning-500/30 bg-warning-500/5">
          <div>
            <p className="font-display font-extrabold text-surface-900 dark:text-white">💳 Complete Your Payment</p>
            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mt-0.5">
              Your order is placed but not yet paid. Complete the payment to confirm it.
            </p>
          </div>
          <button onClick={() => handlePayNow(order._id)} disabled={paying} className="btn-primary !px-6 text-sm">
            {paying ? 'Opening Gateway...' : 'Pay Now'}
          </button>
        </div>
      )}

      {/* QR Code — shown when ready */}
      {order.status === 'ready' && order.qrCode && (
        <div className="space-y-3">
          <QRCodeDisplay value={order.qrCode} title="Show this QR Code at Counter for Pickup" />
          {order.pickupToken && (
            <div className="glass p-4 text-center rounded-2xl">
              <p className="text-xs font-semibold text-surface-500 mb-1">Pickup Code (fallback)</p>
              <p className="font-mono text-2xl font-extrabold tracking-widest text-primary-600 dark:text-primary-400">{order.pickupToken}</p>
            </div>
          )}
        </div>
      )}

      {/* Review & Feedback Section — Shown when Completed */}
      {order.status === 'completed' && !reviewSubmitted && (
        <div className="glass p-6 space-y-4">
          <h3 className="font-display font-extrabold text-lg text-surface-900 dark:text-white">⭐ Rate Your Canteen Meal</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-2xl text-warning-400 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-125 transition-transform"
                >
                  {star <= rating ? <HiStar /> : <HiOutlineStar />}
                </button>
              ))}
              <span className="text-sm font-bold text-surface-600 dark:text-surface-300 ml-2">{rating} / 5 Stars</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              className="input-field resize-none"
              placeholder="How was the food quality, taste and pickup speed?"
            />
            <button type="submit" disabled={submittingReview} className="btn-primary w-full text-sm py-3">
              {submittingReview ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

      {/* Order Details */}
      <div className="glass p-6">
        <h3 className="font-display font-extrabold text-lg mb-4 text-surface-900 dark:text-white">Order Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-surface-500">Canteen Shop</span><span className="font-bold text-surface-900 dark:text-white">{vendorName}</span></div>
          <div className="flex justify-between"><span className="text-surface-500">Scheduled Pickup Time</span><span className="font-bold text-surface-900 dark:text-white">{order.pickupTime || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-surface-500">Payment Status</span><span className="font-bold text-success-600 dark:text-success-400">{paymentMethodStr} — {paymentStatusStr}</span></div>
          {order.specialInstructions && (
            <div className="flex justify-between"><span className="text-surface-500">Instructions</span><span className="font-medium text-surface-900 dark:text-white">{order.specialInstructions}</span></div>
          )}
        </div>

        <div className="border-t border-surface-200/80 dark:border-surface-700/60 mt-5 pt-4 space-y-2.5">
          {itemsList.map((item, i) => (
            <div key={i} className="flex justify-between text-sm font-semibold">
              <span className="text-surface-800 dark:text-surface-200">{item.quantity}× {item.name || item.food?.name || 'Food Item'}</span>
              <span className="font-bold text-surface-900 dark:text-white">{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-surface-200/80 dark:border-surface-700/60">
            <span className="font-extrabold text-lg text-surface-900 dark:text-white">Total</span>
            <span className="font-extrabold text-xl text-primary-600 dark:text-primary-400">{formatPrice(order.totalAmount || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
