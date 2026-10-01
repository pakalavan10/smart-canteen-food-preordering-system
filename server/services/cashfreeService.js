const { Cashfree, CFEnvironment } = require('cashfree-pg');
const cashfreeConfig = require('../config/cashfree');

let client = null;

// Lazily build the SDK client. Throws a 503-style error when not configured so
// the app keeps working for cash payments without Cashfree credentials.
const getClient = () => {
  if (client) return client;
  if (!cashfreeConfig.isConfigured) {
    const err = new Error(
      'Cashfree is not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to the server .env file.'
    );
    err.statusCode = 503;
    throw err;
  }
  const env =
    cashfreeConfig.environment === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  client = new Cashfree(env, cashfreeConfig.appId, cashfreeConfig.secretKey);
  return client;
};

// Build a unique Cashfree order id per payment attempt. Attempt 1 uses the raw
// MongoDB order id (Cashfree order ids must be unique, so retries get a suffix).
const buildCashfreeOrderId = (order) => {
  const attempt = order.paymentAttempt || 0;
  return attempt <= 1 ? order._id.toString() : `${order._id.toString()}-A${attempt}`;
};

// Create a Cashfree order + payment session for an existing canteen order.
// The amount is always taken from the database order — never from the client.
const createPaymentSession = async ({ order, student }) => {
  const cf = getClient();
  const amount = Number((order.totalAmount || 0).toFixed(2));

  const request = {
    order_id: buildCashfreeOrderId(order),
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: `STU-${student._id.toString()}`,
      customer_name: student.name || 'Student',
      customer_email: student.email || 'student@example.com',
      customer_phone: student.phone ? String(student.phone).replace(/\D/g, '').slice(0, 10) : '9999999999',
    },
    order_meta: {
      return_url: `${cashfreeConfig.returnUrl}?app_order=${order._id.toString()}&order_id={order_id}`,
    },
    order_note: `Canteen order ${order.orderNumber || ''}`.trim(),
    order_tags: {
      app: 'campus-canteen',
      order_number: order.orderNumber || '',
    },
    order_expiry_time: new Date(Date.now() + cashfreeConfig.sessionTtlMs * 2).toISOString(),
  };

  const response = await cf.PGCreateOrder(request);
  const created = response.data;
  return {
    orderId: created.order_id, // our cashfree order id
    cfOrderId: created.cf_order_id, // Cashfree's internal order reference
    paymentSessionId: created.payment_session_id,
    orderStatus: created.order_status,
  };
};

// Fetch the authoritative list of payments attempted against a Cashfree order.
const fetchPayments = async (cashfreeOrderId) => {
  const cf = getClient();
  const response = await cf.PGOrderFetchPayments(cashfreeOrderId);
  return response.data || [];
};

// Map a Cashfree payment_status to our order paymentStatus enum
// (PENDING / SUCCESS / FAILED / REFUNDED).
const normalizePaymentStatus = (cfStatus) => {
  switch (cfStatus) {
    case 'SUCCESS':
      return 'SUCCESS';
    case 'FAILED':
    case 'CANCELLED':
    case 'USER_DENIED':
    case 'VOID':
    case 'EXPIRED':
      return 'FAILED';
    case 'REFUNDED':
      return 'REFUNDED';
    default:
      return 'PENDING';
  }
};

// Verify the webhook signature. Returns the parsed webhook event, or null when
// the signature is missing/invalid (never trust an unverified webhook).
const verifyWebhook = (rawBody, headers) => {
  const signature = headers['x-webhook-signature'];
  const timestamp = headers['x-webhook-timestamp'];
  if (!signature || !timestamp || !rawBody) return null;
  try {
    const cf = getClient();
    return cf.PGVerifyWebhookSignature(signature, rawBody, timestamp);
  } catch (err) {
    return null;
  }
};

module.exports = {
  getClient,
  buildCashfreeOrderId,
  createPaymentSession,
  fetchPayments,
  normalizePaymentStatus,
  verifyWebhook,
};