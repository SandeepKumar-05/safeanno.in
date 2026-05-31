import React from 'react';

/**
 * Pulsing LIVE badge indicator.
 */
export default function LiveBadge() {
  return (
    <span className="live-badge">
      <span className="live-badge__dot" />
      LIVE
    </span>
  );
}
