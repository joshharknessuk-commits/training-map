'use server';

import { and, count, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { getDrizzleDb } from '@db/drizzle';
import { checkIns, gymPayouts, gyms, openMats, users, type GymPayout, type User } from '@db/schema';
import { demoCheckIns, demoOpenMats, demoPayouts, demoUser } from '../lib/demo-data';

export interface NetworkOverview {
  activeMembers: number;
  partnerGyms: number;
  openMatsThisWeek: number;
  payoutsInQueue: number;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
    tier: User['membershipTier'];
    status: User['membershipStatus'];
    activeUntil: Date;
  };
  upcomingOpenMats: Array<{
    id: string;
    title: string;
    gymName: string;
    startsAt: Date;
    endsAt: Date;
  }>;
  recentCheckIns: Array<{
    id: string;
    gymName: string;
    occurredAt: Date;
    status: 'verified' | 'pending';
  }>;
  payouts: Array<{
    id: string;
    amountCents: number;
    status: GymPayout['status'];
    scheduledFor: Date;
    gymName: string;
  }>;
}

function toDisplayName(user: User): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }
  return user.email;
}

function fallbackOverview(): NetworkOverview {
  return {
    activeMembers: 128,
    partnerGyms: 42,
    openMatsThisWeek: demoOpenMats.length,
    payoutsInQueue: demoPayouts.length,
  };
}

function fallbackDashboard(): DashboardData {
  return {
    user: {
      name: demoUser.name,
      email: demoUser.email,
      tier: demoUser.tier,
      status: demoUser.status,
      activeUntil: demoUser.activeUntil,
    },
    upcomingOpenMats: demoOpenMats.map((mat) => ({
      id: mat.id,
      title: mat.title,
      gymName: mat.gymName,
      startsAt: mat.startsAt,
      endsAt: mat.endsAt,
    })),
    recentCheckIns: demoCheckIns.map((entry) => ({
      id: entry.id,
      gymName: entry.gymName,
      occurredAt: entry.occurredAt,
      status: entry.status,
    })),
    payouts: demoPayouts.map((payout) => ({
      id: payout.id,
      amountCents: payout.amountCents,
      status: payout.status,
      scheduledFor: payout.scheduledFor,
      gymName: payout.gymName,
    })),
  };
}

export async function getNetworkOverview(): Promise<NetworkOverview> {
  try {
    const db = getDrizzleDb();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    const [{ value: activeMembers } = { value: 0 }] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.membershipStatus, 'active'));

    const [{ value: partnerGyms } = { value: 0 }] = await db
      .select({ value: count() })
      .from(gyms);

    const [{ value: openMatCount } = { value: 0 }] = await db
      .select({ value: count() })
      .from(openMats)
      .where(and(gte(openMats.startsAt, weekStart), lte(openMats.startsAt, weekEnd)));

    const [{ value: payoutsInQueue } = { value: 0 }] = await db
      .select({ value: count() })
      .from(gymPayouts)
      .where(
        and(
          gte(gymPayouts.scheduledFor, now),
          inArray(gymPayouts.status, ['pending', 'processing']),
        ),
      );

    return {
      activeMembers,
      partnerGyms,
      openMatsThisWeek: openMatCount,
      payoutsInQueue,
    };
  } catch (error) {
    console.warn('[network] Failed to load overview metrics', error);
    return fallbackOverview();
  }
}

export async function getMemberDashboard(email: string = demoUser.email): Promise<DashboardData> {
  try {
    const db = getDrizzleDb();
    const now = new Date();

    const member = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!member) {
      return fallbackDashboard();
    }

    const upcoming = await db
      .select({
        id: openMats.id,
        title: openMats.title,
        startsAt: openMats.startsAt,
        endsAt: openMats.endsAt,
        gymName: gyms.name,
      })
      .from(openMats)
      .innerJoin(gyms, eq(openMats.gymId, gyms.id))
      .where(gte(openMats.startsAt, now))
      .orderBy(openMats.startsAt)
      .limit(4);

    const recent = await db
      .select({
        id: checkIns.id,
        occurredAt: checkIns.createdAt,
        verifiedAt: checkIns.verifiedAt,
        gymName: gyms.name,
      })
      .from(checkIns)
      .innerJoin(openMats, eq(checkIns.openMatId, openMats.id))
      .innerJoin(gyms, eq(openMats.gymId, gyms.id))
      .where(eq(checkIns.userId, member.id))
      .orderBy(desc(checkIns.createdAt))
      .limit(4);

    const payouts = await db
      .select({
        id: gymPayouts.id,
        amountCents: gymPayouts.amountCents,
        status: gymPayouts.status,
        scheduledFor: gymPayouts.scheduledFor,
        gymName: gyms.name,
      })
      .from(gymPayouts)
      .innerJoin(gyms, eq(gymPayouts.gymId, gyms.id))
      .orderBy(desc(gymPayouts.scheduledFor))
      .limit(3);

    return {
      user: {
        name: toDisplayName(member),
        email: member.email,
        tier: member.membershipTier,
        status: member.membershipStatus,
        activeUntil: member.activeUntil ?? new Date(),
      },
      upcomingOpenMats:
        upcoming.length > 0
          ? upcoming.map((mat) => ({
              id: mat.id,
              title: mat.title,
              gymName: mat.gymName,
              startsAt: mat.startsAt,
              endsAt: mat.endsAt,
            }))
          : fallbackDashboard().upcomingOpenMats,
      recentCheckIns:
        recent.length > 0
          ? recent.map((entry) => ({
              id: entry.id,
              gymName: entry.gymName,
              occurredAt: entry.occurredAt,
              status: entry.verifiedAt ? 'verified' : 'pending',
            }))
          : fallbackDashboard().recentCheckIns,
      payouts:
        payouts.length > 0
          ? payouts.map((payout) => ({
              id: payout.id,
              amountCents: payout.amountCents,
              status: payout.status,
              scheduledFor: payout.scheduledFor,
              gymName: payout.gymName,
            }))
          : fallbackDashboard().payouts,
    };
  } catch (error) {
    console.warn('[network] Failed to load dashboard data', error);
    return fallbackDashboard();
  }
}
