import React from 'react';
import { useMap } from 'react-leaflet';
import { formatAccuracy } from '../../lib/formatters';

/**
 * Map control buttons — zoom, locate, report.
 * Shows GPS accuracy badge when position is available.
 */
export default function MapControls({ onReportClick, userAccuracy }) {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
  };

  const accInfo = formatAccuracy(userAccuracy);

  return (
    <div className="map-controls">
      <button
        className="map-controls__btn"
        onClick={handleZoomIn}
        title="Zoom in"
        type="button"
      >
        +
      </button>
      <button
        className="map-controls__btn"
        onClick={handleZoomOut}
        title="Zoom out"
        type="button"
      >
        −
      </button>
      <button
        className="map-controls__btn"
        onClick={handleLocate}
        title="My location"
        type="button"
      >
        📍
      </button>
      {userAccuracy != null && (
        <div className="map-controls__accuracy" style={{ color: accInfo.color }}>
          {accInfo.text}
        </div>
      )}
      {onReportClick && (
        <button
          className="map-controls__btn map-controls__btn--report"
          onClick={onReportClick}
          title="Report disaster"
          type="button"
        >
          🚨 Report
        </button>
      )}
    </div>
  );
}
