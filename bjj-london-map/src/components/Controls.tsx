import type { ChangeEvent, MouseEvent } from 'react';
import type { GymSource } from '../lib/overpass';

interface ControlsProps {
  search: string;
  setSearch: (value: string) => void;
  radius: number;
  setRadius: (value: number) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
  source: GymSource;
  setSource: (value: GymSource) => void;
  totalCount: number;
  shownCount: number;
  refresh: () => void;
  loading: boolean;
}

export function Controls({
  search,
  setSearch,
  radius,
  setRadius,
  opacity,
  setOpacity,
  showRings,
  setShowRings,
  source,
  setSource,
  totalCount,
  shownCount,
  refresh,
  loading,
}: ControlsProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRadius(Number(event.target.value));
  };

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpacity(Number(event.target.value));
  };

  const handleShowRingsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowRings(event.target.checked);
  };

  const handleSourceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSource(event.target.value as GymSource);
  };

  const handleRefresh = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    refresh();
  };

  return (
    <div className="fixed top-4 left-4 z-[1000] w-80 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">BJJ Gyms</h2>
        <span className="text-sm text-slate-600">
          {shownCount} / {totalCount}
        </span>
      </div>

      <div className="mt-3 space-y-3 text-sm">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Search</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Gym name"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Radius ({radius.toFixed(1)} mi)
          </span>
          <input
            className="mt-2 w-full accent-sky-500"
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={radius}
            onChange={handleRadiusChange}
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Ring Opacity ({opacity.toFixed(2)})
          </span>
          <input
            className="mt-2 w-full accent-sky-500"
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={opacity}
            onChange={handleOpacityChange}
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-500">Show rings</span>
          <input
            className="h-4 w-4 accent-sky-500"
            type="checkbox"
            checked={showRings}
            onChange={handleShowRingsChange}
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Data source</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={source}
            onChange={handleSourceChange}
          >
            <option value="cached">Cached</option>
            <option value="overpass">Overpass</option>
          </select>
        </label>

        <button
          className="w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="button"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
