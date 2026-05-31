import React from 'react';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';

/**
 * Individual district card showing name and IMD alert level.
 */
export default function DistrictCard({ district }) {
  const color = ALERT_LEVEL_COLORS[district.alert_level] || ALERT_LEVEL_COLORS.green;

  return (
    <div className="district-card">
      <div
        className="district-card__indicator"
        style={{ backgroundColor: color }}
      />
      <div className="district-card__info">
        <h4 className="district-card__name-ml">{district.name_ml}</h4>
        <p className="district-card__name-en">{district.name_en}</p>
      </div>
      <span
        className="district-card__badge"
        style={{ backgroundColor: color }}
      >
        {district.alert_level}
      </span>
      {district.alert_text && (
        <p className="district-card__alert-text">{district.alert_text}</p>
      )}
    </div>
  );
}
