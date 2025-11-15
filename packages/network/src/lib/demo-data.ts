import type { MembershipTier } from './membership-tiers';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  tier: MembershipTier;
  status: 'active' | 'grace' | 'paused' | 'past_due' | 'canceled';
  activeUntil: Date;
}

export const demoUser: DemoUser = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Demo Member',
  email: 'demo@grapplemap.uk',
  tier: 'pro',
  status: 'active',
  activeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

export interface DemoOpenMat {
  id: string;
  title: string;
  gymName: string;
  startsAt: Date;
  endsAt: Date;
  qrSlug: string;
}

export const demoOpenMats: DemoOpenMat[] = [
  {
    id: 'mat-1',
    title: 'Sunday Open Mat',
    gymName: 'Peckham Grappling Club',
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    qrSlug: 'peckham-sunday',
  },
  {
    id: 'mat-2',
    title: 'Thursday No-Gi Lab',
    gymName: 'Hackney Roll Factory',
    startsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    qrSlug: 'hackney-thursday',
  },
];

export interface DemoCheckIn {
  id: string;
  gymName: string;
  occurredAt: Date;
  status: 'verified' | 'pending';
}

export const demoCheckIns: DemoCheckIn[] = [
  {
    id: 'checkin-1',
    gymName: 'Camden Submission Cooperative',
    occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'verified',
  },
  {
    id: 'checkin-2',
    gymName: 'Deptford Fight Lab',
    occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'verified',
  },
];

export interface DemoPayout {
  id: string;
  gymName: string;
  amountCents: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  scheduledFor: Date;
}

export const demoPayouts: DemoPayout[] = [
  {
    id: 'payout-1',
    gymName: 'Hackney Roll Factory',
    amountCents: 18500,
    status: 'processing',
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'payout-2',
    gymName: 'Peckham Grappling Club',
    amountCents: 14200,
    status: 'pending',
    scheduledFor: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  },
];
