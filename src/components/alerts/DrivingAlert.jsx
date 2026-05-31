import React, { useEffect, useState, useCallback } from 'react';
import { DISASTER_TYPES } from '../../lib/constants';
import { timeAgo, formatDistance } from '../../lib/formatters';
import { playAlertBeep } from '../../lib/routing';

/**
 * Fullscreen driving alert overlay.
 * Shows when user enters a danger zone while traveling.
 *
 * @param {object} props
 * @param {object} props.report — the danger report
 * @param {Function} props.onDismiss — called when user dismisses
 */
export default function DrivingAlert({ report, onDismiss }) {
  const [countdown, setCountdown] = useState(30);
  const typeInfo = DISASTER_TYPES.find((t) => t.id === report?.type);

  // Vibrate and play sound on mount
  useEffect(() => {
    if (!report) return;

    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // Play alert beep
    playAlertBeep(880, 0.3);
  }, [report]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!report) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onDismiss) onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [report, onDismiss]);

  const handleAlternateRoute = useCallback(() => {
    // Open Google Maps or Apple Maps
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const place = report?.place_name || 'Kerala';

    if (isIOS) {
      window.open(`https://maps.apple.com/?daddr=${encodeURIComponent(place)}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}&travelmode=driving`, '_blank');
    }
  }, [report]);

  if (!report) return null;

  return (
    <div className="driving-alert" id="driving-alert">
      <div className="driving-alert__card">
        <div className="driving-alert__icon">🔴</div>
        <h2 className="driving-alert__title">DANGER AHEAD</h2>

        <div className="driving-alert__type">
          {typeInfo?.icon} {typeInfo?.labelMl || report.type}
        </div>
        <div className="driving-alert__type-en">
          {typeInfo?.labelEn || report.type}
        </div>

        <div className="driving-alert__distance">
          📍 {formatDistance(report.distanceKm)} ahead
        </div>

        <div className="driving-alert__place">
          {report.place_name || 'Unknown location'}
          {report.district ? ` — ${report.district}` : ''}
        </div>

        {report.message && (
          <div className="driving-alert__message">
            &ldquo;{report.message}&rdquo;
          </div>
        )}

        <div className="driving-alert__meta">
          <span>⏱ {timeAgo(report.created_at)}</span>
          <span>✓ {report.confirm_count || 0} confirmations</span>
        </div>

        <div className="driving-alert__actions">
          <button
            className="driving-alert__btn driving-alert__btn--primary"
            onClick={handleAlternateRoute}
            type="button"
          >
            🗺️ TAKE ALTERNATE ROUTE
          </button>
          <button
            className="driving-alert__btn driving-alert__btn--secondary"
            onClick={onDismiss}
            type="button"
          >
            I KNOW — CONTINUE
          </button>
        </div>

        <div className="driving-alert__countdown">
          Auto-dismiss in {countdown}s
        </div>
      </div>
    </div>
  );
}
