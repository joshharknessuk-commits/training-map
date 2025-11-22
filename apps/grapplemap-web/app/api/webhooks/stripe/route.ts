import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, users } from '@grapplemap/db';
import { eq } from 'drizzle-orm';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
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
// Webhook Event Handlers
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  const email = session.customer_email || session.metadata?.email;
  const tier = session.metadata?.tier;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!email) {
    console.error('No email found in checkout session:', session.id);
    return;
  }

  try {
    // Get subscription details to find the period end
    let activeUntil: Date | null = null;
    if (subscriptionId && stripe) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      activeUntil = new Date(subscription.current_period_end * 1000);
    }

    // Update user with Stripe customer ID and activate membership
    await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        membershipStatus: 'active',
        membershipTier: (tier as 'standard' | 'pro' | 'academy') || 'standard',
        activeUntil: activeUntil,
      })
      .where(eq(users.email, email));

    console.log('Membership activated for:', { email, tier, customerId });
    // TODO: Send welcome email
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const customerId = subscription.customer as string;
  const periodEnd = new Date(subscription.current_period_end * 1000);

  try {
    // Update user membership based on subscription
    await db
      .update(users)
      .set({
        membershipStatus: 'active',
        activeUntil: periodEnd,
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.log('Subscription activated for customer:', customerId);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const customerId = subscription.customer as string;
  const status = subscription.status;
  const periodEnd = new Date(subscription.current_period_end * 1000);

  // Map Stripe subscription status to our membership status
  let membershipStatus: 'active' | 'past_due' | 'canceled' | 'grace' = 'active';

  switch (status) {
    case 'active':
      membershipStatus = 'active';
      break;
    case 'past_due':
    case 'unpaid':
      membershipStatus = 'past_due';
      break;
    case 'canceled':
    case 'incomplete_expired':
      membershipStatus = 'canceled';
      break;
    case 'trialing':
      membershipStatus = 'active'; // Treat trial as active
      break;
    default:
      console.warn('Unknown subscription status:', status);
      membershipStatus = 'canceled';
  }

  try {
    // Update user membership based on subscription status
    await db
      .update(users)
      .set({
        membershipStatus,
        activeUntil: periodEnd,
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.log('Subscription updated for customer:', { customerId, status: membershipStatus });
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;

  try {
    // Set membership to canceled but keep activeUntil (they have access until period end)
    await db
      .update(users)
      .set({
        membershipStatus: 'canceled',
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.log('Subscription canceled for customer:', customerId);
    // TODO: Send cancellation email
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);

  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  try {
    // Get subscription to find the period end
    let activeUntil: Date | null = null;
    if (subscriptionId && stripe) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
      activeUntil = new Date(subscription.current_period_end * 1000);
    }

    // Reactivate membership if it was past_due
    await db
      .update(users)
      .set({
        membershipStatus: 'active',
        ...(activeUntil && { activeUntil }),
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.log('Invoice paid for customer:', customerId);
    // TODO: Send payment confirmation email
  } catch (error) {
    console.error('Error handling invoice paid:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  try {
    // Mark membership as past_due when payment fails
    await db
      .update(users)
      .set({
        membershipStatus: 'past_due',
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.log('Payment failed for customer:', customerId);
    // TODO: Send payment failure notification email
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}
