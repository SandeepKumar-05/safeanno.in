import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching and subscribing to live reports from Supabase.
 * Returns all non-expired reports and auto-updates via Realtime.
 */
export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all current reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReports(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Subscribe to realtime INSERT events on reports table
    const channel = supabase
      .channel(`reports-realtime-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          setReports((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          setReports((prev) =>
            prev.map((r) => (r.id === payload.new.id ? payload.new : r))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe();

    // Cleanup: remove channel on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports]);

  /**
   * Get today's report count via live query
   */
  const getTodayCount = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (countError) throw countError;
      return count || 0;
    } catch {
      return 0;
    }
  }, []);

  return { reports, loading, error, refetch: fetchReports, getTodayCount };
}
