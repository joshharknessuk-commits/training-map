import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, userProfiles } from '@grapplemap/db';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

// Whitelist of allowed MIME types and their extensions
const ALLOWED_FILE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type using whitelist (prevent malicious file uploads)
    const fileExtension = ALLOWED_FILE_TYPES[file.type];
    if (!fileExtension) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG and PNG images are allowed.',
          allowedTypes: Object.keys(ALLOWED_FILE_TYPES),
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Get current avatar to delete old file
    const [currentProfile] = await db
      .select({ avatarUrl: userProfiles.avatarUrl })
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename using validated extension from whitelist
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = `${hash}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Generate URL
    const url = `/uploads/avatars/${filename}`;

    // Update user profile
    await db
      .update(userProfiles)
      .set({
        avatarUrl: url,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session.user.id));

    // Delete old avatar file after successful upload and database update
    if (currentProfile?.avatarUrl) {
      try {
        const oldFilename = currentProfile.avatarUrl.split('/').pop();
        if (oldFilename) {
          const oldFilepath = join(uploadsDir, oldFilename);
          await unlink(oldFilepath);
        }
      } catch (deleteError) {
        // Log error but don't fail the request if old file can't be deleted
        console.error('Failed to delete old avatar:', deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      url,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current avatar to delete file
    const [currentProfile] = await db
      .select({ avatarUrl: userProfiles.avatarUrl })
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    // Update user profile to remove avatar
    await db
      .update(userProfiles)
      .set({
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session.user.id));

    // Delete avatar file from disk
    if (currentProfile?.avatarUrl) {
      try {
        const filename = currentProfile.avatarUrl.split('/').pop();
        if (filename) {
          const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
          const filepath = join(uploadsDir, filename);
          await unlink(filepath);
        }
      } catch (deleteError) {
        // Log error but don't fail the request if file can't be deleted
        console.error('Failed to delete avatar file:', deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
