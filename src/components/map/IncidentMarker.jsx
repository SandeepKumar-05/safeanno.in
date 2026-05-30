import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getDisasterType, getSeverityLevel, timeAgo } from '../../lib/formatters';

/**
 * Create a custom DivIcon for a disaster type
 */
function createMarkerIcon(type, severity) {
  const disasterType = getDisasterType(type);
  const severityLevel = getSeverityLevel(severity);

  return L.divIcon({
    className: 'incident-marker',
    html: `
      <div class="incident-marker__inner" style="
        background: ${severityLevel.color};
        box-shadow: 0 0 12px ${severityLevel.color}66;
      ">
        <span class="incident-marker__icon">${disasterType.icon}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
}

/**
 * Map marker for a single incident/report with popup details
 */
export default function IncidentMarker({ report, onConfirm, sessionId }) {
  const disasterType = getDisasterType(report.type);
  const severityLevel = getSeverityLevel(report.severity);

  // Extract coordinates from PostGIS geometry
  let lat, lng;
  if (report.location && report.location.coordinates) {
    [lng, lat] = report.location.coordinates;
  } else if (report.lat && report.lng) {
    lat = report.lat;
    lng = report.lng;
  } else {
    return null;
  }

  const icon = createMarkerIcon(report.type, report.severity);

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup className="incident-popup" maxWidth={280} minWidth={220}>
        <div className="incident-popup__content">
          <div className="incident-popup__header">
            <span className="incident-popup__type-icon">{disasterType.icon}</span>
            <div>
              <strong className="incident-popup__type-label">
                {disasterType.labelMl}
              </strong>
              <span className="incident-popup__type-en">
                {disasterType.labelEn}
              </span>
            </div>
          </div>

          <span
            className="incident-popup__severity"
            style={{ color: severityLevel.color }}
          >
            {severityLevel.labelMl} ({severityLevel.labelEn})
          </span>

          <p className="incident-popup__message">{report.message}</p>

          {report.place_name && (
            <p className="incident-popup__place">📍 {report.place_name}</p>
          )}

          <div className="incident-popup__meta">
            <span className="incident-popup__time">
              🕐 {timeAgo(report.created_at)}
            </span>
            <span className="incident-popup__confirms">
              ✅ {report.confirm_count || 0} സ്ഥിരീകരണം
            </span>
          </div>

          {onConfirm && (
            <button
              className="incident-popup__confirm-btn"
              onClick={() => onConfirm(report.id)}
              id={`confirm-btn-${report.id}`}
            >
              ✅ സ്ഥിരീകരിക്കുക (Confirm)
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
