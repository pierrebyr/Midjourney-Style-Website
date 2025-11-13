import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is required in production');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_dummy', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Stripe price IDs (set these in environment variables)
export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_monthly',
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_yearly',
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  PREMIUM_MONTHLY: {
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month' as const,
    priceId: STRIPE_PRICES.PREMIUM_MONTHLY,
    features: [
      'Unlimited style views',
      'Unlimited style creation',
      'Priority support',
      '50MB upload limit',
      'No ads',
      'Early access to new features',
    ],
  },
  PREMIUM_YEARLY: {
    name: 'Premium Yearly',
    price: 99.99,
    interval: 'year' as const,
    priceId: STRIPE_PRICES.PREMIUM_YEARLY,
    features: [
      'All Monthly features',
      '2 months free',
      'Priority support',
      'Early access to new features',
    ],
  },
};

// Webhook signature secret
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Helper to get plan by price ID
export const getPlanByPriceId = (priceId: string) => {
  if (priceId === STRIPE_PRICES.PREMIUM_MONTHLY) {
    return SUBSCRIPTION_PLANS.PREMIUM_MONTHLY;
  }
  if (priceId === STRIPE_PRICES.PREMIUM_YEARLY) {
    return SUBSCRIPTION_PLANS.PREMIUM_YEARLY;
  }
  return null;
};
