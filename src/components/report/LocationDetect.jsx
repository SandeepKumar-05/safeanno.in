import React from 'react';
import { formatCoords } from '../../lib/formatters';

/**
 * Location detection component — shows current GPS coords
 * and allows picking a point on the map.
 */
export default function LocationDetect({
  coords,
  placeName,
  loading,
  onDetect,
}) {
  return (
    <div className="location-detect">
      <label className="form-label">
        സ്ഥലം (Location) <span className="required">*</span>
      </label>

      <div className="location-detect__display">
        {coords ? (
          <div className="location-detect__info">
            <span className="location-detect__pin">📍</span>
            <div>
              {placeName && (
                <p className="location-detect__place">{placeName}</p>
              )}
              <p className="location-detect__coords">
                {formatCoords(coords.lat, coords.lng)}
              </p>
            </div>
          </div>
        ) : (
          <p className="location-detect__empty">
            മാപ്പിൽ ടാപ്പ് ചെയ്യുക അല്ലെങ്കിൽ GPS ഉപയോഗിക്കുക
            <br />
            <small>Tap on map or use GPS</small>
          </p>
        )}
      </div>

      <button
        type="button"
        className="location-detect__btn"
        onClick={onDetect}
        disabled={loading}
        id="detect-location-btn"
      >
        {loading ? (
          <>
            <span className="spinner" /> കണ്ടെത്തുന്നു...
          </>
        ) : (
          <>📡 GPS സ്ഥാനം കണ്ടെത്തുക (Detect GPS)</>
        )}
      </button>
    </div>
  );
}
