import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../lib/geocode';
import { formatAccuracy } from '../../lib/formatters';

/**
 * GPS location detection button for report form.
 * Shows accuracy indicator with color coding.
 */
export default function LocationDetect({ onDetect }) {
  const { position, accuracy, loading, error, getPosition } = useGeolocation();

  const handleDetect = async () => {
    getPosition();
  };

  // When position updates, reverse geocode and notify parent
  React.useEffect(() => {
    if (!position) return;

    async function resolve() {
      const result = await reverseGeocode(position.lat, position.lng);
      if (onDetect) {
        onDetect({
          lat: position.lat,
          lng: position.lng,
          placeName: result?.placeName || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`,
          district: result?.district || '',
        });
      }
    }
    resolve();
  }, [position, onDetect]);

  const accInfo = formatAccuracy(accuracy);

  return (
    <div className="location-detect">
      <button
        className="location-detect__btn"
        onClick={handleDetect}
        disabled={loading}
        type="button"
      >
        {loading ? '⏳ കണ്ടെത്തുന്നു...' : '📍 എന്റെ ലൊക്കേഷൻ (Detect GPS)'}
      </button>

      {accuracy != null && (
        <span
          className="accuracy-badge"
          style={{ color: accInfo.color, borderColor: accInfo.color }}
        >
          {accInfo.text}
        </span>
      )}

      {error && (
        <p className="location-detect__error">{error}</p>
      )}
    </div>
  );
}
