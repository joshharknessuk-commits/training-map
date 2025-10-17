'use client';

export function Legend() {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[900] flex items-center gap-2 rounded-lg border border-[#ffdf00]/40 bg-[#002776]/85 px-3 py-2 text-xs text-[#ffdf00] shadow-lg shadow-[#00277640] backdrop-blur">
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#009c3b]" aria-hidden="true" />
      <span className="font-semibold">1 mile</span> coverage ring
    </div>
  );
}
