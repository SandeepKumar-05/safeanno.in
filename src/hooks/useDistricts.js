import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching and subscribing to Kerala district alert levels.
 * Auto-updates via Supabase Realtime when sync-imd-alerts runs.
 */
export function useDistricts() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDistricts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('districts')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      setDistricts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistricts();

    // Subscribe to realtime UPDATE events on districts table
    const channel = supabase
      .channel(`districts-realtime-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'districts',
        },
        (payload) => {
          setDistricts((prev) =>
            prev.map((d) => (d.id === payload.new.id ? payload.new : d))
          );
        }
      )
      .subscribe();

    // Cleanup: remove channel on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDistricts]);

  // Derived: count of districts with non-green alert
  const activeAlertCount = districts.filter(
    (d) => d.alert_level && d.alert_level !== 'green'
  ).length;

  // Derived: highest alert level across all districts
  const highestAlert = districts.reduce((highest, d) => {
    const order = { red: 3, orange: 2, yellow: 1, green: 0 };
    const level = order[d.alert_level] || 0;
    return level > (order[highest] || 0) ? d.alert_level : highest;
  }, 'green');

  return { districts, loading, error, activeAlertCount, highestAlert, refetch: fetchDistricts };
}
