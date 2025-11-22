import { CheckInForm } from '../../components/check-in-form';
import { getMemberDashboard } from '../../server/membership';
import { formatDateLabel, formatTimeRange } from '@utils/index';

export const metadata = {
  title: 'GrappleMap Network — Check-in',
  description: 'Verify membership tokens and open mat attendance.',
};

export default async function NetworkCheckInPage() {
  const dashboard = await getMemberDashboard();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <CheckInForm />
      <div className="rounded-3xl border-2 border-neutral-200 bg-white/70 p-6 shadow-glow backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Upcoming sessions
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Live QR windows</h2>
        <p className="mt-1 text-sm text-neutral-800">
          Cross-check the slug shown at the host gym or issue a manual override.
        </p>
        <ul className="mt-6 space-y-4">
          {dashboard.upcomingOpenMats.map((mat) => (
            <li key={mat.id} className="rounded-2xl border border-white/5 bg-neutral-50 p-4">
              <div className="flex items-center justify-between text-sm text-neutral-700">
                <span>{formatDateLabel(mat.startsAt)}</span>
                <span>{formatTimeRange(mat.startsAt, mat.endsAt)}</span>
              </div>
              <p className="mt-2 text-base font-semibold text-neutral-900">{mat.title}</p>
              <p className="text-sm text-neutral-800">{mat.gymName}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
