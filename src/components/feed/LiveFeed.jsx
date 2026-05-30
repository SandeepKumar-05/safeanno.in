import React, { useState, useEffect } from 'react';
import FeedCard from './FeedCard';
import FeedEmpty from './FeedEmpty';
import LiveBadge from '../ui/LiveBadge';
import SectionHeading from '../ui/SectionHeading';

/**
 * Scrollable live feed of disaster reports.
 * New reports appear at the top via Supabase Realtime.
 */
export default function LiveFeed({ reports, loading, onCardClick }) {
  const [seenIds, setSeenIds] = useState(new Set());

  // Track which reports were present on first render to mark "new" ones
  useEffect(() => {
    if (reports.length > 0 && seenIds.size === 0) {
      setSeenIds(new Set(reports.map((r) => r.id)));
    }
  }, [reports, seenIds.size]);

  // Mark new reports that arrive after initial load
  useEffect(() => {
    if (seenIds.size > 0) {
      const timer = setTimeout(() => {
        setSeenIds(new Set(reports.map((r) => r.id)));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [reports, seenIds]);

  return (
    <section className="live-feed" id="live-feed-section">
      <div className="live-feed__header">
        <SectionHeading
          titleMl="തത്സമയ അപ്ഡേറ്റുകൾ"
          titleEn="Live Updates"
          icon="📡"
        />
        <LiveBadge />
      </div>

      <div className="live-feed__list">
        {loading ? (
          <div className="feed-loading">
            <span className="spinner" /> ലോഡ് ചെയ്യുന്നു...
          </div>
        ) : reports.length === 0 ? (
          <FeedEmpty />
        ) : (
          reports.slice(0, 20).map((report) => (
            <FeedCard
              key={report.id}
              report={report}
              onClick={onCardClick}
              isNew={!seenIds.has(report.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
