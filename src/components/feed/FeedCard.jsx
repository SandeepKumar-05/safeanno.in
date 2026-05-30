import React from 'react';
import { getDisasterType, getSeverityLevel, timeAgo, truncate } from '../../lib/formatters';
import './FeedCard.css';

/**
 * Single report card in the live feed.
 * Clicking it flies the map to the report location.
 */
export default function FeedCard({ report, onClick, isNew }) {
  const disasterType = getDisasterType(report.type);
  const severityLevel = getSeverityLevel(report.severity);

  return (
    <article
      className={`feed-card ${isNew ? 'feed-card--new' : ''}`}
      onClick={() => onClick?.(report)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(report)}
      id={`feed-card-${report.id}`}
    >
      <div className="feed-card__header">
        <span className="feed-card__icon">{disasterType.icon}</span>
        <div className="feed-card__type-info">
          <span className="feed-card__type-ml">{disasterType.labelMl}</span>
          <span className="feed-card__type-en">{disasterType.labelEn}</span>
        </div>
        <span
          className="feed-card__severity"
          style={{ background: severityLevel.color }}
        >
          {severityLevel.labelMl}
        </span>
      </div>

      <p className="feed-card__message">{truncate(report.message, 120)}</p>

      <div className="feed-card__meta">
        <span className="feed-card__place">
          📍 {report.place_name || report.district || 'Kerala'}
        </span>
        <span className="feed-card__time">
          🕐 {timeAgo(report.created_at)}
        </span>
      </div>

      <div className="feed-card__meta" style={{ marginTop: '0.25rem' }}>
        <span className="feed-card__confirms">
          ✅ {report.confirm_count || 0} സ്ഥിരീകരണം
        </span>
      </div>
    </article>
  );
}
