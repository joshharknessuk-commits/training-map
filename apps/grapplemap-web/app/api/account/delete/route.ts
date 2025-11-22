import { NextRequest, NextResponse } from 'next/server';
import { withApiProtection } from '@/lib/api-middleware';
import { db, users, userProfiles, checkIns } from '@grapplemap/db';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

export async function DELETE(request: NextRequest) {
  try {
    const { error, userId } = await withApiProtection(request);
    if (error) return error;

    // Get user data
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        stripeCustomerId: users.stripeCustomerId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cancel Stripe subscription if exists
    // IMPORTANT: Do NOT catch errors here - if Stripe cancellation fails,
    // the entire deletion should fail to prevent user being deleted while
    // still being charged by Stripe
    if (stripe && user.stripeCustomerId) {
      // Get all active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
      });

      // Cancel all subscriptions immediately
      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.cancel(subscription.id);
      }

      console.log(`Canceled ${subscriptions.data.length} subscription(s) for customer ${user.stripeCustomerId}`);
    }

    // Delete user's check-ins
    try {
      await db.delete(checkIns).where(eq(checkIns.userId, user.id));
    } catch (error) {
      console.error('Error deleting check-ins:', error);
      // Continue even if this fails
    }

    // Delete user profile
    try {
      await db.delete(userProfiles).where(eq(userProfiles.userId, user.id));
    } catch (error) {
      console.error('Error deleting user profile:', error);
      // Continue even if this fails
    }

    // Delete user account
    await db.delete(users).where(eq(users.id, user.id));

    // TODO: Invalidate all sessions for this user
    // This would require session management in the auth configuration

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
