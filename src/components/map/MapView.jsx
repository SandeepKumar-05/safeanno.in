import React, { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import IncidentMarker from './IncidentMarker';
import MapControls from './MapControls';
import {
  MAP_CENTER,
  MAP_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
  TILE_URL,
  TILE_ATTRIBUTION,
} from '../../lib/constants';
import './MapView.css';

/**
 * Inner component to handle map click events
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Full interactive Leaflet map showing disaster reports.
 * Exposes flyTo method via ref for FeedCard clicks.
 */
const MapView = forwardRef(function MapView(
  { reports, onMapClick, onConfirm, onReportClick, sessionId, userPosition },
  ref
) {
  const mapRef = useRef(null);

  // Expose flyTo to parent via ref
  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom = 13) {
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], zoom, { duration: 1 });
      }
    },
    getMap() {
      return mapRef.current;
    },
  }));

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="map-wrapper" id="map-section">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        ref={(mapInstance) => {
          if (mapInstance) handleMapReady(mapInstance);
        }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

        <MapClickHandler onMapClick={onMapClick} />
        <MapControls userPosition={userPosition} />

        {reports.map((report) => (
          <IncidentMarker
            key={report.id}
            report={report}
            onConfirm={onConfirm}
            sessionId={sessionId}
          />
        ))}
      </MapContainer>

      {onReportClick && (
        <button
          className="map-report-btn"
          onClick={onReportClick}
          id="map-report-btn"
        >
          🚨 റിപ്പോർട്ട് ചെയ്യുക (Report)
        </button>
      )}
    </div>
  );
});

export default MapView;
