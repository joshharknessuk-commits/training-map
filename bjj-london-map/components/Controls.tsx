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
}: ControlsProps) {
  const [open, setOpen] = useState(true);

  const filtersActive = useMemo(
    () => searchTerm.trim().length > 0 || selectedBoroughs.length > 0,
    [searchTerm, selectedBoroughs],
  );

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRadius(Number(event.target.value));
  };

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpacity(Number(event.target.value));
  };

  const handleShowRingsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowRings(event.target.checked);
  };

  return (
    <>
      <aside
        className={`pointer-events-auto fixed inset-y-0 left-0 z-[950] flex w-full max-w-md transform bg-slate-950/90 text-slate-100 shadow-2xl shadow-slate-950/50 backdrop-blur transition-transform duration-300 ease-out lg:relative lg:max-w-[360px] ${
          open ? 'translate-x-0' : '-translate-x-[calc(100%+4rem)] lg:-translate-x-[calc(100%+4rem)]'
        }`}
      >
        <div className="flex h-full w-full flex-col border-r border-white/10">
          <div className="relative border-b border-white/10 bg-gradient-to-r from-[#002776] via-[#009c3b] to-[#ffdf00] px-5 pb-4 pt-6 text-white shadow-lg shadow-black/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold leading-tight">London BJJ Gyms</h2>
                <p className="mt-1 text-xs text-white/80">
                  Filter the dataset to explore clubs around Greater London.
                </p>
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/80"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Collapse filters"
              >
                X
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2 text-sm">
              <span className="font-semibold text-[#ffdf00]">{shownCount}</span>
              <span className="text-white/70">shown</span>
              <span className="text-white/40">/</span>
              <span className="text-white/70">{totalCount}</span>
              {loading ? (
                <span
                  className="ml-auto h-2 w-2 animate-pulse rounded-full bg-[#ffdf00]"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#ffdf00]">
                  Search
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ffdf00] focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/40"
                  type="search"
                  placeholder="Name, station, borough..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#ffdf00]">
                  <span>Boroughs</span>
                  <button
                    className="text-[11px] font-semibold uppercase tracking-wide text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:text-white/30"
                    type="button"
                    onClick={clearFilters}
                    disabled={!filtersActive}
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-2 text-sm">
                  {boroughOptions.length === 0 ? (
                    <p className="text-xs text-white/50">No borough metadata available.</p>
                  ) : (
                    boroughOptions.map((option) => {
                      const checked = selectedBoroughs.includes(option.name);
                      return (
                        <label
                          key={option.name}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-white/20 ${
                            checked ? 'bg-[#009c3b]/20 text-white' : 'bg-white/5 text-white/80'
                          }`}
                        >
                          <span className="flex-1 truncate">{option.name}</span>
                          <span className="ml-2 text-xs text-white/50">{option.count}</span>
                          <input
                            className="ml-3 h-4 w-4 accent-[#ffdf00]"
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleBorough(option.name)}
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <header className="text-xs font-semibold uppercase tracking-wide text-[#ffdf00]">
                  Coverage rings
                </header>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    Radius ({radius.toFixed(1)} mi)
                  </span>
                  <input
                    className="mt-2 w-full accent-[#ffdf00]"
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={radius}
                    onChange={handleRadiusChange}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    Ring opacity ({opacity.toFixed(2)})
                  </span>
                  <input
                    className="mt-2 w-full accent-[#ffdf00]"
                    type="range"
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    value={opacity}
                    onChange={handleOpacityChange}
                  />
                </label>

                <label className="flex items-center justify-between gap-3 text-[13px] font-medium text-white/90">
                  <span>Show coverage rings</span>
                  <input
                    className="h-4 w-4 accent-[#ffdf00]"
                    type="checkbox"
                    checked={showRings}
                    onChange={handleShowRingsChange}
                  />
                </label>
              </section>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-4 text-xs text-white/60">
            Data sourced from curated CSV + OpenStreetMap geocoding; last sync via Postgres backend.
          </div>
        </div>
      </aside>

      {!open ? (
        <button
          className="fixed left-4 top-4 z-[960] flex items-center gap-2 rounded-full bg-[#009c3b] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-[#00b84d] focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/60"
          type="button"
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">☰</span>
          Filters
          {filtersActive ? (
            <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-[#ffdf00]" aria-hidden="true" />
          ) : null}
        </button>
      ) : (
        <button
          className="fixed left-[calc(min(320px,90vw))] top-6 z-[960] hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-slate-900/80 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-black/40 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#ffdf00]/60 lg:flex"
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Collapse sidebar"
        >
          X
        </button>
      )}
    </>
  );
}
