import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { formatDistance, formatDuration } from '../../lib/formatters';

/**
 * Renders OSRM road route as a blue polyline on the map.
 * @param {object} props
 * @param {number[][]} props.coordinates — [[lng, lat], ...]
 * @param {number} props.distanceKm
 * @param {number} props.durationMin
 */
export default function RoutePolyline({ coordinates, distanceKm, durationMin }) {
  if (!coordinates || coordinates.length === 0) return null;

  // Convert [lng, lat] → [lat, lng] for Leaflet
  const positions = coordinates.map(([lng, lat]) => [lat, lng]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#2980b9',
        weight: 4,
        opacity: 0.8,
        dashArray: null,
      }}
    >
      <Tooltip sticky>
        📏 {formatDistance(distanceKm)} • ⏱ {formatDuration(durationMin)}
      </Tooltip>
    </Polyline>
  );
}
