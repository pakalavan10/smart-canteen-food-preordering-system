import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import useCashfreeCheckout from '../../hooks/useCashfreeCheckout';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineArrowLeft,
  HiOutlineArrowPath, HiOutlineCreditCard, HiOutlineShieldCheck,
} from 'react-icons/hi2';

// States: verifying | success | failed | pending | error
const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const appOrder = searchParams.get('app_order');
  const [state, setState] = useState('verifying');
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [paying, setPaying] = useState(false);
  const { openCheckout } = useCashfreeCheckout();

  const verify = async () => {
    if (!appOrder) {
      setState('error');
      setMessage('Missing order reference in the URL. Please open the order from your order history.');
      return;
    }
    setState('verifying');
    try {
      const { data } = await API.post('/payments/verify', { orderId: appOrder });
      const result = data.data;
      setOrder(result);
      if (result.paymentStatus === 'SUCCESS') {
        setState('success');
      } else if (result.paymentStatus === 'FAILED') {
        setState('failed');
        setMessage(result.paymentFailureReason || 'Your payment could not be completed.');
      } else {
        setState('pending');
        setMessage(
          'We could not confirm your payment yet. It may still be processing, or the payment window was closed before completing.'
        );
      }
    } catch (err) {
      setState('error');
      setMessage(err.response?.data?.message || 'Unable to verify the payment right now. Please check your order status.');
    }
  };

  useEffect(() => {
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appOrder]);

  const retryPayment = async () => {
    if (!appOrder) return;
    setPaying(true);
    try {
      const { data } = await API.post('/payments/create-session', { orderId: appOrder });
      const { paymentSessionId, mode } = data.data;
      await openCheckout({ paymentSessionId, mode });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Unable to start payment');
    } finally {
      setPaying(false);
    }
  };

  const configs = {
    verifying: {
      icon: <HiOutlineClock className="w-10 h-10 text-accent-500" />,
      title: 'Verifying your payment…',
      subtitle: 'Checking the payment status securely with the payment gateway.',
      color: 'text-accent-600',
    },
    success: {
      icon: <HiOutlineCheckCircle className="w-10 h-10 text-success-600" />,
      title: 'Payment Successful! 🎉',
      subtitle: 'Your order is confirmed. Track its progress and pick it up at the scheduled time.',
      color: 'text-success-600',
    },
    failed: {
      icon: <HiOutlineXCircle className="w-10 h-10 text-danger-500" />,
      title: 'Payment Failed',
      subtitle: message,
      color: 'text-danger-500',
    },
    pending: {
      icon: <HiOutlineClock className="w-10 h-10 text-warning-500" />,
      title: 'Payment Not Completed',
      subtitle: message,
      color: 'text-warning-500',
    },
    error: {
      icon: <HiOutlineXCircle className="w-10 h-10 text-danger-500" />,
      title: 'Something Went Wrong',
      subtitle: message,
      color: 'text-danger-500',
    },
  };

  const config = configs[state];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-surface-900 dark:text-white">Payment Status</h1>

      <div className="glass p-8 text-center space-y-5">
        <div className="mx-auto w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          {config.icon}
        </div>
        <h2 className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">{config.title}</h2>
        <p className={`text-sm font-semibold ${config.color} leading-relaxed`}>{config.subtitle}</p>

        {(state === 'verifying') && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-surface-500">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            Please wait, do not close this page
          </div>
        )}

        {state === 'success' && (
          <div className="flex justify-center gap-3 pt-2">
            <Link to={`/student/orders/${appOrder}`} className="btn-primary !px-6 text-sm flex items-center gap-2">
              <HiOutlineCreditCard className="w-4 h-4" />
              View Order
            </Link>
          </div>
        )}

        {(state === 'failed' || state === 'pending') && (
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <button onClick={retryPayment} disabled={paying} className="btn-primary !px-6 text-sm flex items-center gap-2">
              <HiOutlineArrowPath className={`w-4 h-4 ${paying ? 'animate-spin' : ''}`} />
              {paying ? 'Opening Gateway...' : 'Try Paying Again'}
            </button>
            <Link to={`/student/orders/${appOrder}`} className="btn-secondary !px-6 text-sm flex items-center gap-2">
              View Order
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <button onClick={verify} className="btn-primary !px-6 text-sm flex items-center gap-2">
              <HiOutlineArrowPath className="w-4 h-4" />
              Retry Verification
            </button>
            {appOrder && (
              <Link to={`/student/orders/${appOrder}`} className="btn-secondary !px-6 text-sm flex items-center gap-2">
                View Order
              </Link>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-surface-200/70 dark:border-surface-700/60">
          <Link to="/student/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-500 hover:text-primary-600 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to My Orders
          </Link>
        </div>
      </div>

      <div className="glass p-4 flex items-center gap-3">
        <HiOutlineShieldCheck className="w-5 h-5 text-success-600 shrink-0" />
        <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 leading-relaxed">
          Payments are verified server-side with the payment gateway before your order is marked paid. The order total is always validated against your saved cart by the server.
        </p>
      </div>
    </motion.div>
  );
};

export default PaymentStatus;