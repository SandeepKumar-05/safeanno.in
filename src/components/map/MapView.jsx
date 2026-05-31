import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { MAP_CENTER, MAP_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM, TILE_URL, TILE_ATTRIBUTION } from '../../lib/constants';
import IncidentMarker from './IncidentMarker';
import RoutePolyline from './RoutePolyline';
import MapControls from './MapControls';
import './MapView.css';

/**
 * Map click handler component
 */
function MapClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

/**
 * Main map view centered on Kerala.
 * Shows incident markers, user position, route polyline.
 */
const MapView = forwardRef(function MapView(
  {
    reports = [],
    onMapClick,
    onConfirm,
    onReportClick,
    sessionId,
    userPosition,
    userAccuracy,
    routeData,
  },
  ref
) {
  const mapInstanceRef = useRef(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom = 13) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.5 });
      }
    },
  }));

  return (
    <section id="map-section" className="map-section">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        className="map-container"
        ref={mapInstanceRef}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <MapClickHandler onClick={onMapClick} />
        <MapControls onReportClick={onReportClick} />

        {/* Incident markers */}
        {reports.map((report) => (
          <IncidentMarker
            key={report.id}
            report={report}
            onConfirm={onConfirm}
            sessionId={sessionId}
          />
        ))}

        {/* User position marker */}
        {userPosition && (
          <>
            <Marker position={[userPosition.lat, userPosition.lng]}>
              <Popup>📍 നിങ്ങളുടെ സ്ഥാനം (Your location)</Popup>
            </Marker>
            {userAccuracy && (
              <Circle
                center={[userPosition.lat, userPosition.lng]}
                radius={userAccuracy}
                pathOptions={{
                  color: '#2980b9',
                  fillColor: '#2980b9',
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* OSRM route polyline */}
        {routeData && routeData.coordinates && (
          <RoutePolyline
            coordinates={routeData.coordinates}
            distanceKm={routeData.distanceKm}
            durationMin={routeData.durationMin}
          />
        )}
      </MapContainer>
    </section>
  );
});

export default MapView;
