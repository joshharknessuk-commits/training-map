import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@grapplemap/db';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    if (!stripe) {
      // For development without Stripe configured
      console.warn('Stripe not configured - simulating cancel');
      await db
        .update(users)
        .set({
          membershipStatus: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      return NextResponse.json({
        success: true,
        message: 'Membership cancelled (development mode)',
      });
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update user status in database
    await db
      .update(users)
      .set({
        membershipStatus: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: 'Membership cancelled successfully. Access continues until the end of your billing period.',
    });
  } catch (error) {
    console.error('Cancel membership error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel membership' },
      { status: 500 },
    );
  }
}
