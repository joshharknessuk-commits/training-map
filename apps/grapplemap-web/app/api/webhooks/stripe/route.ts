import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error('Stripe not configured');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// ============================================
// Webhook Event Handlers (Scaffolding)
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  const email = session.customer_email || session.metadata?.email;
  const tier = session.metadata?.tier;
  const customerId = session.customer as string;

  // TODO: Implement the following:
  // 1. Find or create user by email
  // 2. Update user's stripeCustomerId
  // 3. Set membershipStatus to 'active'
  // 4. Set membershipTier to the purchased tier
  // 5. Set activeUntil to subscription period end
  // 6. Send welcome email

  console.log('TODO: Activate membership for:', { email, tier, customerId });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const customerId = subscription.customer as string;
  const tier = subscription.metadata?.tier;
  const periodEnd = new Date(subscription.current_period_end * 1000);

  // TODO: Implement the following:
  // 1. Find user by stripeCustomerId
  // 2. Update membershipStatus to 'active'
  // 3. Update activeUntil to periodEnd

  console.log('TODO: Process subscription creation:', { customerId, tier, periodEnd });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const customerId = subscription.customer as string;
  const status = subscription.status;
  const periodEnd = new Date(subscription.current_period_end * 1000);

  // TODO: Implement the following:
  // 1. Find user by stripeCustomerId
  // 2. Update membershipStatus based on subscription status:
  //    - 'active' -> 'active'
  //    - 'past_due' -> 'past_due'
  //    - 'canceled' -> 'canceled'
  //    - 'unpaid' -> 'past_due'
  // 3. Update activeUntil to periodEnd

  console.log('TODO: Process subscription update:', { customerId, status, periodEnd });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;

  // TODO: Implement the following:
  // 1. Find user by stripeCustomerId
  // 2. Set membershipStatus to 'canceled'
  // 3. Keep activeUntil as is (they have access until period end)
  // 4. Send cancellation email

  console.log('TODO: Process subscription cancellation:', { customerId });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);

  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  // TODO: Implement the following:
  // 1. Find user by stripeCustomerId
  // 2. Update membershipStatus to 'active' (in case they were past_due)
  // 3. Extend activeUntil if needed
  // 4. Send payment confirmation email

  console.log('TODO: Process invoice payment:', { customerId, subscriptionId });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // TODO: Implement the following:
  // 1. Find user by stripeCustomerId
  // 2. Update membershipStatus to 'past_due'
  // 3. Send payment failure notification email

  console.log('TODO: Process payment failure:', { customerId });
}
