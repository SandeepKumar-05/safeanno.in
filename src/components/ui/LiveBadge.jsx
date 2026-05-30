import React from 'react';

/**
 * Pulsing green "LIVE" badge indicator
 */
export default function LiveBadge() {
  return (
    <span className="live-badge" aria-label="Live updates active">
      <span className="live-badge__dot" />
      <span className="live-badge__text">LIVE</span>
    </span>
  );
}
