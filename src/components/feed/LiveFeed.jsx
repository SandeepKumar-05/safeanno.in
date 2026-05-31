import React from 'react';
import FeedCard from './FeedCard';
import FeedEmpty from './FeedEmpty';
import Skeleton from '../ui/Skeleton';
import SectionHeading from '../ui/SectionHeading';
import LiveBadge from '../ui/LiveBadge';

/**
 * Live feed of disaster reports with skeleton loading state.
 */
export default function LiveFeed({ reports = [], loading, onCardClick, onConfirm }) {
  return (
    <section id="live-feed">
      <div className="live-feed__header">
        <SectionHeading
          icon="📋"
          titleMl="തത്സമയ ഫീഡ്"
          subtitleEn="Live Feed"
        />
        <LiveBadge />
      </div>

      <div className="live-feed__list">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="feed-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Skeleton width="40px" height="40px" borderRadius="50%" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height="1em" />
                  <Skeleton width="40%" height="0.8em" />
                </div>
              </div>
              <Skeleton count={2} height="0.8em" />
            </div>
          ))
        ) : reports.length === 0 ? (
          <FeedEmpty />
        ) : (
          reports.map((report) => (
            <FeedCard
              key={report.id}
              report={report}
              onClick={onCardClick}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>
    </section>
  );
}
