'use client';

import { useMemo, useState, type ChangeEvent } from 'react';

interface BoroughOption {
  name: string;
  count: number;
}

interface ControlsProps {
  radius: number;
  setRadius: (value: number) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
  totalCount: number;
  shownCount: number;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  boroughOptions: BoroughOption[];
  selectedBoroughs: string[];
  toggleBorough: (name: string) => void;
  clearFilters: () => void;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (value: boolean) => void;
  showBoroughHighlights: boolean;
  setShowBoroughHighlights: (value: boolean) => void;
  showGymMarkers: boolean;
  setShowGymMarkers: (value: boolean) => void;
}

export function Controls({
  radius,
  setRadius,
  opacity,
  setOpacity,
  showRings,
  setShowRings,
  totalCount,
  shownCount,
  loading,
  searchTerm,
  setSearchTerm,
  boroughOptions,
  selectedBoroughs,
  toggleBorough,
  clearFilters,
  open,
  onOpenChange,
  showHeatmap,
  setShowHeatmap,
  showBoroughHighlights,
  setShowBoroughHighlights,
  showGymMarkers,
  setShowGymMarkers,
}: ControlsProps) {
  const filtersActive = useMemo(
    () => searchTerm.trim().length > 0 || selectedBoroughs.length > 0,
    [searchTerm, selectedBoroughs],
  );
  const [viewsOpen, setViewsOpen] = useState(true);

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRadius(Number(event.target.value));
  };

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpacity(Number(event.target.value));
  };

  const handleShowRingsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowRings(event.target.checked);
  };

  const handleHeatmapChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowHeatmap(event.target.checked);
  };

  const handleBoroughHighlightChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowBoroughHighlights(event.target.checked);
  };

  const handleShowMarkersChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowGymMarkers(event.target.checked);
  };

  return (
    <div
      className={`pointer-events-auto fixed bottom-0 left-0 z-[950] flex w-full max-w-md transform transition-transform duration-300 ease-out lg:max-w-[360px] ${
        open ? 'translate-x-0' : '-translate-x-[calc(100%+4rem)] lg:-translate-x-[calc(100%+4rem)]'
      }`}
      style={{ top: 'var(--header-offset, 3rem)' }}
    >
      <aside className="flex h-full w-full flex-col border-r border-neutral-200 bg-white/90 text-neutral-900 shadow-2xl shadow-neutral-950/50 backdrop-blur lg:h-full">
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            className="flex items-center justify-center text-lg text-neutral-900/70 transition hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-white/40"
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Collapse filters"
          >
            ×
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-5"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain', touchAction: 'pan-y' }}
        >
          <div className="flex flex-col gap-5 pb-16">
            <section className="rounded-3xl border-2 border-neutral-200 bg-neutral-100 px-4 py-4 shadow-sm shadow-black/20">
              <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                <span aria-hidden="true" className="text-base leading-none">
                  🔍
                </span>
                <span>Search</span>
              </header>
              <div className="mt-3">
                <input
                  className="w-full rounded-xl border-2 border-neutral-200 bg-white/80 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-900/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  type="search"
                  placeholder="Name, station, borough..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </section>

            <section className="rounded-3xl border-2 border-neutral-200 bg-neutral-50/70 px-4 py-4 shadow-sm shadow-black/20">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600"
                onClick={() => setViewsOpen((prev) => !prev)}
                aria-expanded={viewsOpen}
                aria-controls="views-panel"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-base leading-none">
                    🗺️
                  </span>
                  Views
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-900/80">
                  {viewsOpen ? 'Hide' : 'Show'}
                </span>
              </button>
              {viewsOpen ? (
                <div id="views-panel" className="mt-4 space-y-3 text-sm">
                  <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-3 py-3 text-[13px] font-medium text-neutral-900/90">
                    <span>Show gym markers</span>
                    <input
                      className="h-4 w-4 accent-brand-500"
                      type="checkbox"
                      checked={showGymMarkers}
                      onChange={handleShowMarkersChange}
                    />
                  </label>
                  <p className="text-xs text-neutral-900/60">
                    Toggle individual gym dots and clusters. Switch off when you only want density overlays.
                  </p>

                  <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-3 py-3 text-[13px] font-medium text-neutral-900/90">
                    <span>Heatmap overlay</span>
                    <input
                      className="h-4 w-4 accent-brand-500"
                      type="checkbox"
                      checked={showHeatmap}
                      onChange={handleHeatmapChange}
                    />
                  </label>
                  <p className="text-xs text-neutral-900/60">
                    Visualise overall gym density. Works best when combined with a wider zoom level.
                  </p>

                  <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-3 py-3 text-[13px] font-medium text-neutral-900/90">
                    <span>Borough highlights</span>
                    <input
                      className="h-4 w-4 accent-brand-500"
                      type="checkbox"
                      checked={showBoroughHighlights}
                      onChange={handleBoroughHighlightChange}
                    />
                  </label>
                  <p className="text-xs text-neutral-900/60">
                    Pins the approximate centre of each borough with gym counts so you can compare coverage quickly.
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border-2 border-neutral-200 bg-neutral-50/70 px-4 py-4 shadow-sm shadow-black/20">
              <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  <span aria-hidden="true" className="text-base leading-none">
                    🏷️
                  </span>
                  <span>Boroughs</span>
                </div>
                <button
                  className="text-[11px] font-semibold uppercase tracking-wide text-neutral-900/70 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-900/30"
                  type="button"
                  onClick={clearFilters}
                  disabled={!filtersActive}
                >
                  Clear
                </button>
              </header>

              <div className="mt-4 max-h-52 space-y-2 overflow-y-auto pr-2 text-sm">
                {boroughOptions.length === 0 ? (
                  <p className="text-xs text-neutral-900/50">No borough metadata available.</p>
                ) : (
                  boroughOptions.map((option) => {
                    const checked = selectedBoroughs.includes(option.name);
                    return (
                      <label
                        key={option.name}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition ${
                          checked
                            ? 'border-brand-400/60 bg-brand-500/20 text-neutral-900 shadow-sm shadow-soft'
                            : 'border-transparent bg-neutral-50 text-neutral-900/80 hover:border-neutral-300'
                        }`}
                      >
                        <span className="flex-1 truncate">{option.name}</span>
                        <span className="ml-2 text-xs text-neutral-900/50">{option.count}</span>
                        <input
                          className="ml-3 h-4 w-4 accent-brand-500"
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBorough(option.name)}
                        />
                      </label>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-3xl border-2 border-neutral-200 bg-neutral-50/70 px-4 py-4 text-sm shadow-sm shadow-black/20">
              <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                <span aria-hidden="true" className="text-base leading-none">
                  📍
                </span>
                <span>Map actions</span>
              </header>

              <div className="mt-4 space-y-6">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-900/70">
                    Radius ({radius.toFixed(1)} mi)
                  </span>
                  <input
                    className="mt-2 w-full accent-brand-500"
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={radius}
                    onChange={handleRadiusChange}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-900/70">
                    Ring opacity ({opacity.toFixed(2)})
                  </span>
                  <input
                    className="mt-2 w-full accent-brand-500"
                    type="range"
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    value={opacity}
                    onChange={handleOpacityChange}
                  />
                </label>

                  <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-3 py-3 text-[13px] font-medium text-neutral-900/90">
                  <span>Show coverage rings</span>
                    <input
                      className="h-4 w-4 accent-brand-500"
                    type="checkbox"
                    checked={showRings}
                    onChange={handleShowRingsChange}
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-neutral-200 pt-5">
              <div className="rounded-3xl border-2 border-neutral-200 bg-neutral-50/70 px-4 py-3 text-xs text-neutral-900/60 shadow-sm shadow-black/20">
                <header className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                  <span aria-hidden="true" className="text-base leading-none">
                    🧭
                  </span>
                  <span>Map info</span>
                </header>
                <p>Data sourced from curated CSV + OpenStreetMap geocoding; last sync via Postgres backend.</p>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
