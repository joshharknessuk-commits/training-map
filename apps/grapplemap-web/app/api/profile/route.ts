import { NextRequest, NextResponse } from 'next/server';
import { withAuthOnly, withApiProtection } from '@/lib/api-middleware';
import { db, userProfiles, users } from '@grapplemap/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await withAuthOnly(request);
    if (error) return error;

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
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

// Basic XSS sanitization - remove HTML tags
function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null;
  // Remove HTML tags and trim
  return text.replace(/<[^>]*>/g, '').trim();
}

export async function PUT(request: NextRequest) {
  try {
    const { error, userId } = await withApiProtection(request);
    if (error) return error;

    const body = await request.json();
    let {
      displayName,
      bio,
      beltRank,
      stripes,
      weightKg,
      weightClass,
      yearsTraining,
      homeGymId,
      // SECURITY: Do NOT allow avatarUrl to be set here
      // It should only be set via the upload endpoint
      // avatarUrl,
      instagramHandle,
      preferredTrainingTimes,
      trainingGoals,
      isPublic,
      city,
      postcode,
    } = body;

    // Input validation
    if (displayName !== undefined && displayName !== null) {
      displayName = sanitizeText(displayName);
      if (displayName && displayName.length > 100) {
        return NextResponse.json(
          { error: 'Display name must be less than 100 characters' },
          { status: 400 }
        );
      }
    }

    if (bio !== undefined && bio !== null) {
      bio = sanitizeText(bio);
      if (bio && bio.length > 2000) {
        return NextResponse.json(
          { error: 'Bio must be less than 2000 characters' },
          { status: 400 }
        );
      }
    }

    if (instagramHandle !== undefined && instagramHandle !== null) {
      instagramHandle = sanitizeText(instagramHandle);
      if (instagramHandle) {
        // Remove @ symbol if present and validate format
        instagramHandle = instagramHandle.replace('@', '');
        if (instagramHandle.length > 30 || !/^[a-zA-Z0-9._]+$/.test(instagramHandle)) {
          return NextResponse.json(
            { error: 'Invalid Instagram handle format' },
            { status: 400 }
          );
        }
      }
    }

    if (weightKg !== undefined && weightKg !== null) {
      const weight = Number(weightKg);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        return NextResponse.json(
          { error: 'Weight must be between 30 and 300 kg' },
          { status: 400 }
        );
      }
    }

    if (yearsTraining !== undefined && yearsTraining !== null) {
      const years = Number(yearsTraining);
      if (isNaN(years) || years < 0 || years > 100) {
        return NextResponse.json(
          { error: 'Years training must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    if (stripes !== undefined && stripes !== null) {
      const stripesNum = Number(stripes);
      if (isNaN(stripesNum) || stripesNum < 0 || stripesNum > 4) {
        return NextResponse.json({ error: 'Stripes must be between 0 and 4' }, { status: 400 });
      }
    }

    // Validate belt rank
    const validBeltRanks = ['white', 'blue', 'purple', 'brown', 'black'];
    if (beltRank && !validBeltRanks.includes(beltRank)) {
      return NextResponse.json({ error: 'Invalid belt rank' }, { status: 400 });
    }

    // Sanitize text fields
    if (city) city = sanitizeText(city);
    if (postcode) postcode = sanitizeText(postcode);
    if (preferredTrainingTimes) preferredTrainingTimes = sanitizeText(preferredTrainingTimes);
    if (trainingGoals) trainingGoals = sanitizeText(trainingGoals);

    // TODO: Validate homeGymId exists in gyms table if provided
    // For now, allow it but note this is a security concern

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId,
          displayName,
          bio,
          beltRank,
          stripes,
          weightKg,
          weightClass,
          yearsTraining,
          homeGymId,
          // avatarUrl removed - must use upload endpoint
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
        // avatarUrl removed - must use upload endpoint
        instagramHandle,
        preferredTrainingTimes,
        trainingGoals,
        isPublic: isPublic !== undefined ? (isPublic ? 1 : 0) : existingProfile.isPublic,
        city,
        postcode,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
