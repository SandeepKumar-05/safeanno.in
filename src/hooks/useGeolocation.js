import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Geolocation error messages (bilingual)
 */
function getErrorMessage(err) {
  switch (err.code) {
    case 1:
      return 'ലൊക്കേഷൻ അനുമതി നിഷേധിച്ചു — Location permission denied';
    case 2:
      return 'ലൊക്കേഷൻ ലഭ്യമല്ല — Position unavailable';
    case 3:
      return 'ലൊക്കേഷൻ ടൈംഔട്ട് — Location request timed out';
    default:
      return 'ലൊക്കേഷൻ പിശക് — Location error';
  }
}

/**
 * Hook for continuous geolocation tracking with high accuracy.
 * Uses watchPosition for real-time updates while traveling.
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watching, setWatching] = useState(false);
  const watchIdRef = useRef(null);

  /**
   * Get position once (for initial location detection)
   */
  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
      },
      (err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  /**
   * Start continuous GPS watching (for driving/traveling)
   */
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLoading(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
        setWatching(true);
      },
      (err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  /**
   * Stop continuous GPS watching
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setWatching(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    accuracy,
    loading,
    error,
    watching,
    getPosition,
    startWatching,
    stopWatching,
  };
}
