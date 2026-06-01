import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchKeralaWeatherAlerts } from '../lib/weatherAlerts';

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Hook to fetch and refresh live weather alerts for all 14 Kerala districts.
 * Uses Open-Meteo API (free, no key) — refreshes every 30 minutes.
 */
export function useWeatherAlerts() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchKeralaWeatherAlerts();
      setDistricts(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Weather alerts fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Refresh every 30 minutes
    intervalRef.current = setInterval(fetchAlerts, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAlerts]);

  // Derived values
  const redAlerts = districts.filter((d) => d.alert_level === 'red');
  const orangeAlerts = districts.filter((d) => d.alert_level === 'orange');
  const yellowAlerts = districts.filter((d) => d.alert_level === 'yellow');
  const activeAlertCount = districts.filter((d) => d.alert_level !== 'green').length;

  const highestAlert = districts.reduce((highest, d) => {
    const order = { red: 3, orange: 2, yellow: 1, green: 0 };
    return (order[d.alert_level] || 0) > (order[highest] || 0) ? d.alert_level : highest;
  }, 'green');

  return {
    districts,
    loading,
    error,
    lastUpdated,
    redAlerts,
    orangeAlerts,
    yellowAlerts,
    activeAlertCount,
    highestAlert,
    refetch: fetchAlerts,
  };
}
