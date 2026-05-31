import React from 'react';

/**
 * Empty state for live feed when no reports exist.
 */
export default function FeedEmpty() {
  return (
    <div className="feed-empty">
      <div className="feed-empty__icon">🌤️</div>
      <h3 className="feed-empty__title">
        റിപ്പോർട്ടുകൾ ഇല്ല
      </h3>
      <p className="feed-empty__subtitle">
        No active reports — stay safe!
      </p>
    </div>
  );
}
