export type MembershipTier = 'free' | 'standard' | 'pro' | 'academy';

export interface TierDefinition {
  id: MembershipTier;
  name: string;
  price: number;
  description: string;
  perks: string[];
  isFree?: boolean;
}

export const membershipTiers: TierDefinition[] = [
  {
    id: 'free',
    name: 'Network Free',
    price: 0,
    description: 'Access the network and discover open mats across London.',
    perks: ['Browse open mats', 'View gym profiles', 'Save favorite gyms', 'Community access'],
    isFree: true,
  },
  {
    id: 'standard',
    name: 'Network',
    price: 29,
    description: 'Unlimited drop-ins at partner open mats across Greater London.',
    perks: ['QR check-in access', 'SMS reminders', 'Partner gym directory', 'Book classes'],
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
