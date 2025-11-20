import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db, users, userProfiles } from '@grapplemap/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'user',
        membershipStatus: 'grace',
        membershipTier: 'standard',
      })
      .returning();

    // Create user profile
    await db.insert(userProfiles).values({
      userId: newUser.id,
      displayName: `${firstName || ''} ${lastName || ''}`.trim() || undefined,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
