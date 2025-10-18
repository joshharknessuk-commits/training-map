'use client';

import { useState, type ReactNode } from 'react';

interface NearMeButtonProps {
  onLocate: (coords: { lat: number; lng: number }) => void;
  onError?: (error: GeolocationPositionError | null) => void;
  className?: string;
  children?: ReactNode;
}

const BASE_BUTTON_STYLES =
  'inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm shadow-blue-900/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70';

export function NearMeButton({
  onLocate,
  onError,
  className,
  children,
}: NearMeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      onError?.(null);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };

        onLocate(coords);
        onError?.(null);
        setLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission denied. You can still search manually.');
        }

        onError?.(error);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  };

  const classes = className ? `${BASE_BUTTON_STYLES} ${className}` : BASE_BUTTON_STYLES;

  return (
    <button className={classes} type="button" onClick={handleClick} disabled={loading}>
      <span aria-hidden="true">📍</span>
      {loading ? 'Locating…' : children ?? 'Near me'}
    </button>
  );
}
