import { useCallback, useRef, useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';

// Shared hook for opening the Cashfree drop-in checkout.
// Mode ('sandbox' | 'production') always comes from the backend response,
// so the environment follows the server config — never a frontend setting.
const useCashfreeCheckout = () => {
  const [checkoutError, setCheckoutError] = useState('');
  const openingRef = useRef(false);

  const openCheckout = useCallback(async ({ paymentSessionId, mode = 'sandbox' }) => {
    setCheckoutError('');
    if (openingRef.current) return;
    openingRef.current = true;
    try {
      const cashfree = await load({ mode: mode === 'production' ? 'production' : 'sandbox' });
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      const message = err?.message || 'Unable to open the payment window';
      if (/expired|invalid|session/i.test(message)) {
        setCheckoutError('Your payment session has expired or is invalid. Start a new session and try again.');
      } else {
        setCheckoutError(message);
      }
      throw err;
    } finally {
      openingRef.current = false;
    }
  }, []);

  return { openCheckout, checkoutError, setCheckoutError };
};

export default useCashfreeCheckout;