'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDrizzleDb } from '@db/drizzle';
import { checkIns, gyms, openMats, users } from '@db/schema';
import { demoOpenMats } from '../lib/demo-data';
import { formatDateLabel, formatTimeRange } from '@utils/index';

export interface CheckInActionState {
  success: boolean;
  message: string;
  details?: {
    gymName: string;
    startsAt: Date;
    endsAt: Date;
  };
}

const checkInSchema = z.object({
  email: z.string().email('Enter a valid member email.'),
  code: z
    .string()
    .min(4, 'QR code too short.')
    .max(64, 'QR code too long.')
    .transform((value) => value.trim().toLowerCase()),
});

export async function completeCheckIn(
  _prevState: CheckInActionState,
  formData: FormData,
): Promise<CheckInActionState> {
  const candidate = {
    email: formData.get('email'),
    code: formData.get('code'),
  };
  const parsed = checkInSchema.safeParse(candidate);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid fields.';
    return {
      success: false,
      message,
    };
  }

  try {
    const db = getDrizzleDb();
    const member = await db.query.users.findFirst({
      where: eq(users.email, parsed.data.email),
    });

    if (!member) {
      return {
        success: false,
        message: 'Member record not found.',
      };
    }

    const [openMat] = await db
      .select({
        id: openMats.id,
        gymName: gyms.name,
        title: openMats.title,
        startsAt: openMats.startsAt,
        endsAt: openMats.endsAt,
      })
      .from(openMats)
      .innerJoin(gyms, eq(openMats.gymId, gyms.id))
      .where(eq(openMats.qrSlug, parsed.data.code))
      .limit(1);

    if (!openMat) {
      return {
        success: false,
        message: 'QR code not recognised.',
      };
    }

    await db.insert(checkIns).values({
      userId: member.id,
      openMatId: openMat.id,
      qrSlug: parsed.data.code,
    });

    return {
      success: true,
      message: `Check-in recorded for ${openMat.gymName} (${formatDateLabel(openMat.startsAt)} ${formatTimeRange(openMat.startsAt, openMat.endsAt)}).`,
      details: {
        gymName: openMat.gymName,
        startsAt: openMat.startsAt,
        endsAt: openMat.endsAt,
      },
    };
  } catch (error) {
    console.warn('[network] Falling back to demo check-in handling', error);
    const fallbackMat =
      demoOpenMats.find(
        (mat) => mat.qrSlug.toLowerCase() === parsed.data.code.toLowerCase(),
      ) ?? demoOpenMats[0];

    if (!fallbackMat) {
      return {
        success: false,
        message: 'Unable to verify QR code.',
      };
    }

    return {
      success: true,
      message: `Simulated check-in for ${fallbackMat.gymName}.`,
      details: {
        gymName: fallbackMat.gymName,
        startsAt: fallbackMat.startsAt,
        endsAt: fallbackMat.endsAt,
      },
    };
  }
}
