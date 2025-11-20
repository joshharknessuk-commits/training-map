import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@grapplemap/db';
import { userProfiles, users } from '@grapplemap/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      displayName,
      bio,
      beltRank,
      stripes,
      weightKg,
      weightClass,
      yearsTraining,
      homeGymId,
      avatarUrl,
      instagramHandle,
      preferredTrainingTimes,
      trainingGoals,
      isPublic,
      city,
      postcode,
    } = body;

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId: session.user.id,
          displayName,
          bio,
          beltRank,
          stripes,
          weightKg,
          weightClass,
          yearsTraining,
          homeGymId,
          avatarUrl,
          instagramHandle,
          preferredTrainingTimes,
          trainingGoals,
          isPublic: isPublic ? 1 : 0,
          city,
          postcode,
        })
        .returning();

      return NextResponse.json({ profile: newProfile });
    }

    // Update existing profile
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        displayName,
        bio,
        beltRank,
        stripes,
        weightKg,
        weightClass,
        yearsTraining,
        homeGymId,
        avatarUrl,
        instagramHandle,
        preferredTrainingTimes,
        trainingGoals,
        isPublic: isPublic !== undefined ? (isPublic ? 1 : 0) : existingProfile.isPublic,
        city,
        postcode,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
