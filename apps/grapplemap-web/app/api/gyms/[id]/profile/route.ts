import { NextRequest, NextResponse } from 'next/server';
import { db, gymProfiles, gyms } from '@grapplemap/db';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [profile] = await db
      .select()
      .from(gymProfiles)
      .where(eq(gymProfiles.gymId, id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Gym profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get gym profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add authorization check - only gym admins should be able to update

    const {
      description,
      facilities,
      amenities,
      logoUrl,
      coverImageUrl,
      galleryImages,
      phone,
      email,
      instagramHandle,
      facebookUrl,
      dropInPrice,
      monthlyMembershipPrice,
      hasFreeTrial,
      requiresGiForGiClass,
      allowsDropIns,
      covidPolicies,
    } = body;

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(gymProfiles)
      .where(eq(gymProfiles.gymId, id))
      .limit(1);

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const [newProfile] = await db
        .insert(gymProfiles)
        .values({
          gymId: id,
          description,
          facilities,
          amenities,
          logoUrl,
          coverImageUrl,
          galleryImages,
          phone,
          email,
          instagramHandle,
          facebookUrl,
          dropInPrice,
          monthlyMembershipPrice,
          hasFreeTrial: hasFreeTrial ? 1 : 0,
          requiresGiForGiClass: requiresGiForGiClass !== undefined ? (requiresGiForGiClass ? 1 : 0) : 1,
          allowsDropIns: allowsDropIns !== undefined ? (allowsDropIns ? 1 : 0) : 1,
          covidPolicies,
        })
        .returning();

      return NextResponse.json({ profile: newProfile });
    }

    // Update existing profile
    const [updatedProfile] = await db
      .update(gymProfiles)
      .set({
        description,
        facilities,
        amenities,
        logoUrl,
        coverImageUrl,
        galleryImages,
        phone,
        email,
        instagramHandle,
        facebookUrl,
        dropInPrice,
        monthlyMembershipPrice,
        hasFreeTrial: hasFreeTrial !== undefined ? (hasFreeTrial ? 1 : 0) : existingProfile.hasFreeTrial,
        requiresGiForGiClass: requiresGiForGiClass !== undefined ? (requiresGiForGiClass ? 1 : 0) : existingProfile.requiresGiForGiClass,
        allowsDropIns: allowsDropIns !== undefined ? (allowsDropIns ? 1 : 0) : existingProfile.allowsDropIns,
        covidPolicies,
        updatedAt: new Date(),
      })
      .where(eq(gymProfiles.gymId, id))
      .returning();

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update gym profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
