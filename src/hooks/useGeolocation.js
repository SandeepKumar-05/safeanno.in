import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for accessing the browser Geolocation API.
 * Returns the user's current position and provides a refresh method.
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let message = 'Location access denied';
        if (err.code === 2) message = 'Position unavailable';
        if (err.code === 3) message = 'Location request timed out';
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Try to get position on mount
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  return { position, loading, error, refresh: getPosition };
}
