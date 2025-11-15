export interface Highlight {
  title: string;
  description: string;
  badge?: string;
}

export const highlights: Highlight[] = [
  {
    title: 'Unified Network Access',
    description:
      'One pass unlocks every GrappleMap Network partner open mat plus guest spots at rotating host gyms.',
    badge: 'New',
  },
  {
    title: 'Instant QR Verification',
    description:
      'Gyms scan a rotating QR code displayed in the member app to validate entries and keep real attendance logs.',
  },
  {
    title: 'Revenue Sharing',
    description:
      'Every verified check-in automatically allocates a payout to the hosting gym at the end of the cycle.',
  },
  {
    title: 'Open Mat Intelligence',
    description:
      'Heatmaps of where members train, conversion funnels, and retention cohorts arrive out-of-the-box.',
  },
];
