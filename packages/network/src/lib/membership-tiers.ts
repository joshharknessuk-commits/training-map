export type MembershipTier = 'standard' | 'pro' | 'academy';

export interface TierDefinition {
  id: MembershipTier;
  name: string;
  price: number;
  description: string;
  perks: string[];
}

export const membershipTiers: TierDefinition[] = [
  {
    id: 'standard',
    name: 'Network',
    price: 29,
    description: 'Unlimited drop-ins at partner open mats across Greater London.',
    perks: ['QR check-in access', 'SMS reminders', 'Partner gym directory'],
  },
  {
    id: 'pro',
    name: 'Network Pro',
    price: 59,
    description: 'Priority access and analytics for serious grapplers.',
    perks: ['All Network perks', 'Priority guest list', 'Attendance insights', 'Monthly merch drops'],
  },
  {
    id: 'academy',
    name: 'Academy Plan',
    price: 99,
    description: 'Automated payouts + shared member verification for gyms.',
    perks: ['Real-time QR verification', 'Automated payouts', 'Stripe Connect-ready', 'Concierge onboarding'],
  },
];
