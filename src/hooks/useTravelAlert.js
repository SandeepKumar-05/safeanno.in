import { useState, useEffect, useRef, useCallback } from 'react';
import { haversineDistance } from '../lib/routing';
import { GEOFENCE_RADIUS_KM } from '../lib/constants';

/**
 * Hook for geofencing while driving.
 * Watches user's GPS and triggers onAlert when they enter
 * a danger zone (within GEOFENCE_RADIUS_KM of active reports).
 *
 * @param {object} options
 * @param {boolean} options.enabled — whether geofencing is active
 * @param {Array} options.reports — active disaster reports
 * @param {Function} options.onAlert — callback when user enters danger zone
 */
export function useTravelAlert({ enabled = false, reports = [], onAlert }) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const alertedReportsRef = useRef(new Set());
  const watchIdRef = useRef(null);
  const reportsRef = useRef(reports);
  const onAlertRef = useRef(onAlert);

  // Keep refs current without re-subscribing watch
  useEffect(() => {
    reportsRef.current = reports;
  }, [reports]);

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  /**
   * Extract coordinates from report location (handles GeoJSON and WKT)
   */
  const getReportCoords = useCallback((report) => {
    if (report.location?.coordinates) {
      return report.location.coordinates; // [lng, lat]
    }
    // Try to parse WKT POINT
    const match = String(report.location || '').match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[2])];
    }
    return null;
  }, []);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const userPoint = [pos.coords.longitude, pos.coords.latitude];
        setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsTracking(true);

        // Check all active reports for proximity
        reportsRef.current.forEach((report) => {
          const reportCoords = getReportCoords(report);
          if (!reportCoords) return;

          const dist = haversineDistance(userPoint, reportCoords);

          // Alert if within geofence and not already alerted for this report
          if (dist < GEOFENCE_RADIUS_KM && !alertedReportsRef.current.has(report.id)) {
            alertedReportsRef.current.add(report.id);
            if (onAlertRef.current) {
              onAlertRef.current({
                ...report,
                distanceKm: dist,
              });
            }
          }
        });
      },
      (err) => {
        console.error('Travel alert geolocation error:', err);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsTracking(false);
      }
    };
  }, [enabled, getReportCoords]);

  /**
   * Clear alerted reports (e.g. when route changes)
   */
  const clearAlerted = useCallback(() => {
    alertedReportsRef.current.clear();
  }, []);

  return {
    isTracking,
    currentPosition,
    clearAlerted,
  };
}
