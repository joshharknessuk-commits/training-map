'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  const watchIdRef = useRef<number | null>(null);
  const bestPositionRef = useRef<GeolocationPosition | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  const stopWatching = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = null;

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  const finalizePosition = () => {
    if (settledRef.current) {
      return;
    }

    settledRef.current = true;
    stopWatching();
    setLoading(false);

    const position = bestPositionRef.current;
    bestPositionRef.current = null;

    if (!position) {
      alert('We could not determine your location. Please try again or check your device settings.');
      onError?.(null);
      return;
    }

    const { latitude, longitude } = position.coords;
    onLocate({ lat: latitude, lng: longitude });
    onError?.(null);
  };

  const handleWatchSuccess = (position: GeolocationPosition) => {
    const accuracy = position.coords.accuracy ?? Infinity;
    const currentBest = bestPositionRef.current;

    if (!currentBest || accuracy < (currentBest.coords.accuracy ?? Infinity)) {
      bestPositionRef.current = position;
    }

    if (accuracy <= 30) {
      finalizePosition();
    }
  };

  const handleWatchError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      alert('Location permission denied. You can still search manually.');
    }

    if (error.code === error.TIMEOUT && bestPositionRef.current) {
      finalizePosition();
      return;
    }

    stopWatching();
    setLoading(false);
    onError?.(error);
  };

  const requestConsent = async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({
          // `as PermissionName` keeps TypeScript happy when targeting older lib definitions.
          name: 'geolocation' as PermissionName,
        });

        if (status.state === 'granted') {
          return true;
        }

        if (status.state === 'denied') {
          alert('Location access is blocked in your browser settings. Please enable it to use this feature.');
          return false;
        }
      } catch {
        // Ignore permission query errors and fall back to manual consent prompt.
      }
    }

    return window.confirm(
      'Allow BJJ London Map to use your current location? Your position is only used to show nearby gyms and start directions.',
    );
  };

  const handleClick = async () => {
    if (loading) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      onError?.(null);
      return;
    }

    const hasConsent = await requestConsent();

    if (!hasConsent) {
      onError?.(null);
      return;
    }

    setLoading(true);
    settledRef.current = false;
    bestPositionRef.current = null;

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(handleWatchSuccess, handleWatchError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      });

      settleTimerRef.current = window.setTimeout(() => {
        finalizePosition();
      }, 10000);
    } catch {
      stopWatching();
      setLoading(false);
      alert('Unable to start location tracking. Please check your browser settings and try again.');
      onError?.(null);
    }
  };

  const classes = className ? `${BASE_BUTTON_STYLES} ${className}` : BASE_BUTTON_STYLES;

  return (
    <button className={classes} type="button" onClick={handleClick} disabled={loading}>
      <span aria-hidden="true">📍</span>
      {loading ? 'Locating…' : children ?? 'Near me'}
    </button>
  );
}
