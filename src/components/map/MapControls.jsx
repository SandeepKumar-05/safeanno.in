import React from 'react';
import { useMap } from 'react-leaflet';
import { MAP_CENTER, MAP_ZOOM } from '../../lib/constants';

/**
 * Custom map control buttons — reset view, locate user
 */
export default function MapControls({ userPosition }) {
  const map = useMap();

  const handleReset = () => {
    map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1 });
  };

  const handleLocate = () => {
    if (userPosition) {
      map.flyTo([userPosition.lat, userPosition.lng], 13, { duration: 1 });
    } else {
      map.locate({ setView: true, maxZoom: 13 });
    }
  };

  return (
    <div className="map-controls">
      <button
        className="map-controls__btn"
        onClick={handleLocate}
        title="എന്റെ സ്ഥാനം (My location)"
        aria-label="Go to my location"
        id="map-locate-btn"
      >
        📍
      </button>
      <button
        className="map-controls__btn"
        onClick={handleReset}
        title="കേരളം കാണുക (View Kerala)"
        aria-label="Reset map to Kerala"
        id="map-reset-btn"
      >
        🏠
      </button>
    </div>
  );
}
