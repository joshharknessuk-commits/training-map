import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@grapplemap/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select({
        email: users.email,
        membershipTier: users.membershipTier,
        membershipStatus: users.membershipStatus,
        activeUntil: users.activeUntil,
        stripeCustomerId: users.stripeCustomerId,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      account: {
        ...user,
        activeUntil: user.activeUntil?.toISOString(),
      }
    });
  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
