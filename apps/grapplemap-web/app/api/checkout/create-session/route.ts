import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe - this will be configured when env vars are set
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

const priceMap: Record<string, string | undefined> = {
  standard: process.env.STRIPE_PRICE_STANDARD,
  pro: process.env.STRIPE_PRICE_PRO,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, email } = body;

    // Validate tier
    if (!tier || !['standard', 'pro'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 });
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if Stripe is configured
    if (!stripe) {
      // Return a placeholder response for development
      console.warn('Stripe not configured - returning mock response');
      return NextResponse.json({
        url: null,
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
        dev: true,
      });
    }

    const priceId = priceMap[tier];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for tier: ${tier}. Please set STRIPE_PRICE_${tier.toUpperCase()}` },
        { status: 500 },
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://grapplemap.uk'}/network/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://grapplemap.uk'}/network/checkout/cancelled`,
      metadata: {
        tier,
        email,
      },
      subscription_data: {
        metadata: {
          tier,
          email,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
