import React from 'react';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { DISASTER_TYPES, SEVERITY_LEVELS } from '../../lib/constants';
import { timeAgo } from '../../lib/formatters';

/**
 * Shared WhatsApp share function
 */
function shareReport(report, typeInfo) {
  const text = `⚠ *SafeAano? Alert*\n\n`
    + `*${typeInfo?.labelMl || report.type}* — ${report.place_name || 'Kerala'}\n`
    + `${report.message}\n\n`
    + `Severity: ${report.severity}\n`
    + `Reported: ${timeAgo(report.created_at)}\n\n`
    + `📍 See on map: https://vellomkeriyo.in`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Custom incident marker with popup showing details,
 * confirm button, WhatsApp share, and photo.
 */
export default function IncidentMarker({ report, onConfirm, sessionId }) {
  const typeInfo = DISASTER_TYPES.find((t) => t.id === report.type);
  const sevInfo = SEVERITY_LEVELS.find((s) => s.id === report.severity);

  // Extract coordinates
  let lat, lng;
  if (report.location?.coordinates) {
    [lng, lat] = report.location.coordinates;
  } else {
    const match = String(report.location || '').match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      lng = parseFloat(match[1]);
      lat = parseFloat(match[2]);
    }
  }

  if (lat == null || lng == null) return null;

  // Custom emoji icon for marker
  const icon = L.divIcon({
    html: `<span style="font-size:24px">${typeInfo?.icon || '⚠️'}</span>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup className="marker-popup" maxWidth={280}>
        <div className="marker-popup__header">
          <span className="marker-popup__icon">{typeInfo?.icon || '⚠️'}</span>
          <div>
            <h3 className="marker-popup__title">
              {typeInfo?.labelMl || report.type}
            </h3>
            <span
              className="marker-popup__severity"
              style={{ backgroundColor: sevInfo?.color || '#888' }}
            >
              {sevInfo?.labelEn || report.severity}
            </span>
          </div>
        </div>

        <p className="marker-popup__message">
          &ldquo;{report.message}&rdquo;
        </p>

        {report.photo_url && (
          <img
            src={report.photo_url}
            alt="Report photo"
            className="marker-popup__photo"
            loading="lazy"
          />
        )}

        <p className="marker-popup__place">
          📍 {report.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
        </p>
        <p className="marker-popup__time">
          ⏱ {timeAgo(report.created_at)}
        </p>
        <p className="marker-popup__confirms">
          ✓ {report.confirm_count || 0} confirmations
        </p>

        <div className="marker-popup__actions">
          <button
            className="marker-popup__btn marker-popup__btn--confirm"
            onClick={() => onConfirm && onConfirm(report.id)}
            type="button"
          >
            ✓ Confirm
          </button>
          <button
            className="marker-popup__btn marker-popup__btn--share"
            onClick={() => shareReport(report, typeInfo)}
            type="button"
          >
            📱 Share
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
