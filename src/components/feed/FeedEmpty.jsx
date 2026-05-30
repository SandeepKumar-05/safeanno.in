import React from 'react';

/**
 * Empty state when no reports are available
 */
export default function FeedEmpty() {
  return (
    <div className="feed-empty" id="feed-empty">
      <div className="feed-empty__icon">🌤️</div>
      <p className="feed-empty__title">
        ഇപ്പോൾ റിപ്പോർട്ടുകൾ ഇല്ല
      </p>
      <p className="feed-empty__subtitle">
        No reports at the moment — that's good news!
      </p>
    </div>
  );
}
