import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@grapplemap/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Generate a time-based token for QR code
// Token format: base64(email:timestamp:signature)
// Signature = HMAC(email + timestamp, secret)
function generateQRToken(email: string, membershipTier: string, membershipStatus: string): string {
  const timestamp = Date.now();
  const hourTimestamp = Math.floor(timestamp / (60 * 60 * 1000)); // Round to hour

  const secret = process.env.QR_SECRET || 'default-secret-change-in-production';
  const data = `${email}:${hourTimestamp}:${membershipTier}:${membershipStatus}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .substring(0, 16);

  const token = Buffer.from(`${data}:${signature}`).toString('base64url');
  return token;
}

function getExpiryTime(): Date {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const [user] = await db
      .select({
        email: users.email,
        membershipTier: users.membershipTier,
        membershipStatus: users.membershipStatus,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only generate QR codes for active or grace period members
    if (user.membershipStatus !== 'active' && user.membershipStatus !== 'grace') {
      return NextResponse.json(
        { error: 'QR code only available for active members' },
        { status: 403 },
      );
    }

    const token = generateQRToken(user.email, user.membershipTier, user.membershipStatus);
    const expiresAt = getExpiryTime();

    return NextResponse.json({
      token,
      expiresAt: expiresAt.toISOString(),
      membershipTier: user.membershipTier,
      membershipStatus: user.membershipStatus,
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Verify QR code (for gym staff to use)
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      const parts = decoded.split(':');

      if (parts.length !== 5) {
        return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
      }

      const [email, hourTimestamp, membershipTier, membershipStatus, signature] = parts;

      // Verify signature
      const secret = process.env.QR_SECRET || 'default-secret-change-in-production';
      const data = `${email}:${hourTimestamp}:${membershipTier}:${membershipStatus}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('hex')
        .substring(0, 16);

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }

      // Check if token is expired (older than 1 hour from current hour)
      const currentHourTimestamp = Math.floor(Date.now() / (60 * 60 * 1000));
      const tokenHourTimestamp = parseInt(hourTimestamp);

      if (currentHourTimestamp - tokenHourTimestamp > 0) {
        return NextResponse.json({ error: 'Token expired' }, { status: 400 });
      }

      // Verify user still exists and has active membership
      const [user] = await db
        .select({
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          membershipTier: users.membershipTier,
          membershipStatus: users.membershipStatus,
          activeUntil: users.activeUntil,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.membershipStatus !== 'active' && user.membershipStatus !== 'grace') {
        return NextResponse.json({ error: 'Membership not active' }, { status: 403 });
      }

      return NextResponse.json({
        valid: true,
        member: {
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member',
          membershipTier: user.membershipTier,
          membershipStatus: user.membershipStatus,
          activeUntil: user.activeUntil?.toISOString(),
        },
      });
    } catch (decodeError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
  } catch (error) {
    console.error('QR code verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
