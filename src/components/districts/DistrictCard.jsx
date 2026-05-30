import React from 'react';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';

/**
 * Single district alert card showing name and IMD alert level
 */
export default function DistrictCard({ district }) {
  const level = district.alert_level || 'green';
  const color = ALERT_LEVEL_COLORS[level] || ALERT_LEVEL_COLORS.green;

  const levelLabels = {
    red: 'ചുവപ്പ് (Red)',
    orange: 'ഓറഞ്ച് (Orange)',
    yellow: 'മഞ്ഞ (Yellow)',
    green: 'പച്ച (Green)',
  };

  return (
    <div
      className={`district-card district-card--${level}`}
      style={{ '--alert-color': color }}
      id={`district-${district.name_en?.toLowerCase()}`}
    >
      <div className="district-card__indicator" style={{ background: color }} />
      <div className="district-card__info">
        <h4 className="district-card__name-ml">{district.name_ml}</h4>
        <p className="district-card__name-en">{district.name_en}</p>
      </div>
      <div className="district-card__level">
        <span
          className="district-card__badge"
          style={{ background: color }}
        >
          {levelLabels[level] || level}
        </span>
      </div>
      {district.alert_text && level !== 'green' && (
        <p className="district-card__alert-text">{district.alert_text}</p>
      )}
    </div>
  );
}
