import { Controls } from './components/Controls';
import { Legend } from './components/Legend';
import { MapView } from './components/MapView';
import { useGyms } from './state/useGyms';

export default function App() {
  const {
    filteredGyms,
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
    error,
  } = useGyms();

  return (
    <div className="relative h-full w-full">
      <MapView
        gyms={filteredGyms}
        radiusMiles={radius}
        showRings={showRings}
        fillOpacity={opacity}
      />

      <Controls
        search={search}
        setSearch={setSearch}
        radius={radius}
        setRadius={setRadius}
        opacity={opacity}
        setOpacity={setOpacity}
        showRings={showRings}
        setShowRings={setShowRings}
        source={source}
        setSource={setSource}
        totalCount={totalCount}
        shownCount={shownCount}
        refresh={refresh}
        loading={loading}
      />

      <Legend />

      {loading ? (
        <div className="pointer-events-none fixed top-4 right-4 z-[1000] rounded-xl bg-white/85 px-3 py-2 text-sm text-slate-600 shadow backdrop-blur">
          Loading gyms…
        </div>
      ) : null}

      {error ? (
        <div className="fixed top-24 left-1/2 z-[1100] -translate-x-1/2 rounded-xl bg-rose-500/90 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      ) : null}
    </div>
  );
}
