import React, { useState } from 'react';
import { DISASTER_TYPES, SEVERITY_LEVELS } from '../../lib/constants';
import { timeAgo } from '../../lib/formatters';
import './FeedCard.css';

/**
 * WhatsApp share function
 */
function shareReport(report, typeInfo) {
  const text = `⚠ *വെള്ളം കേറിയോ? Alert*\n\n`
    + `*${typeInfo?.labelMl || report.type}* — ${report.place_name || 'Kerala'}\n`
    + `${report.message}\n\n`
    + `Severity: ${report.severity}\n`
    + `Reported: ${timeAgo(report.created_at)}\n\n`
    + `📍 See on map: https://vellomkeriyo.in`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Individual feed card with WhatsApp share, photo, truncation.
 */
export default function FeedCard({ report, onClick, onConfirm }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = DISASTER_TYPES.find((t) => t.id === report.type);
  const sevInfo = SEVERITY_LEVELS.find((s) => s.id === report.severity);

  const isLongMessage = report.message && report.message.length > 120;

  return (
    <div className="feed-card" onClick={() => onClick && onClick(report)}>
      <div className="feed-card__top">
        <span className="feed-card__icon">{typeInfo?.icon || '⚠️'}</span>
        <div className="feed-card__info">
          <h4 className="feed-card__type">{typeInfo?.labelMl || report.type}</h4>
          <p className="feed-card__place">
            📍 {report.place_name || 'Unknown location'}
          </p>
        </div>
        <span
          className="feed-card__severity"
          style={{ backgroundColor: sevInfo?.color || '#888' }}
        >
          {sevInfo?.labelEn || report.severity}
        </span>
      </div>

      <p className={`feed-card__message ${!expanded && isLongMessage ? 'feed-card__message--truncated' : ''}`}>
        {report.message}
      </p>
      {isLongMessage && (
        <button
          className="feed-card__read-more"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          type="button"
        >
          {expanded ? 'Show less' : 'Read more...'}
        </button>
      )}

      {report.photo_url && (
        <img
          src={report.photo_url}
          alt="Report photo"
          className="feed-card__photo"
          loading="lazy"
        />
      )}

      <div className="feed-card__bottom">
        <span className="feed-card__time">
          ⏱ {timeAgo(report.created_at)}
          {report.confirm_count > 0 && ` • ✓ ${report.confirm_count}`}
        </span>
        <div className="feed-card__actions">
          <button
            className="feed-card__confirm-btn"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm && onConfirm(report.id);
            }}
            type="button"
          >
            ✓ Confirm
          </button>
          <button
            className="feed-card__share-btn"
            onClick={(e) => {
              e.stopPropagation();
              shareReport(report, typeInfo);
            }}
            type="button"
          >
            📱 Share
          </button>
        </div>
      </div>
    </div>
  );
}
