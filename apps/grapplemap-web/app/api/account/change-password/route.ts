import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@grapplemap/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Get user data
    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 400 },
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
        // TODO: Add passwordChangedAt field to invalidate old sessions
        // This requires:
        // 1. Database migration to add passwordChangedAt timestamp field
        // 2. Update this line to: passwordChangedAt: new Date()
        // 3. Update auth config (lib/auth.ts) JWT callback to check:
        //    if (token.iat < user.passwordChangedAt) { return null; }
        // Without this, old sessions remain valid after password change (security risk)
      })
      .where(eq(users.id, session.user.id));

    // TODO: Once passwordChangedAt is implemented, this will automatically
    // invalidate all existing sessions for this user
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
