// Cashfree Payment Gateway configuration — loaded from server .env
// Credentials NEVER leave the backend (no secret is exposed to the frontend).
const config = {
  appId: process.env.CASHFREE_APP_ID || '',
  secretKey: process.env.CASHFREE_SECRET_KEY || '',
  environment: (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase(),
  // Where Cashfree redirects the user after payment (drop-in checkout return URL)
  returnUrl:
    process.env.CASHFREE_RETURN_URL ||
    `${process.env.CLIENT_URL || 'http://localhost:5173'}/student/payment-status`,
  // Public URL Cashfree will call for payment webhooks (configured in the dashboard)
  webhookUrl: process.env.CASHFREE_WEBHOOK_URL || '',
  isConfigured: Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY),
  // Drop-in payment sessions expire after ~15 minutes on Cashfree's side
  sessionTtlMs: 15 * 60 * 1000,
};

module.exports = config;