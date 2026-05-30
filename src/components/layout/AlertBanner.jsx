import React from 'react';
import { useDistricts } from '../../hooks/useDistricts';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';

/**
 * Top-level IMD alert banner — only shows when there are non-green alerts
 */
export default function AlertBanner() {
  const { districts, highestAlert } = useDistricts();

  if (highestAlert === 'green') return null;

  const affectedDistricts = districts
    .filter((d) => d.alert_level && d.alert_level !== 'green')
    .sort((a, b) => {
      const order = { red: 0, orange: 1, yellow: 2 };
      return (order[a.alert_level] || 3) - (order[b.alert_level] || 3);
    });

  const bannerColor = ALERT_LEVEL_COLORS[highestAlert] || ALERT_LEVEL_COLORS.yellow;

  return (
    <div
      className="alert-banner"
      style={{
        '--banner-color': bannerColor,
        background: `linear-gradient(90deg, ${bannerColor}22, ${bannerColor}11)`,
        borderBottom: `2px solid ${bannerColor}`,
      }}
      role="alert"
      id="alert-banner"
    >
      <div className="alert-banner__inner">
        <span className="alert-banner__icon">⚠️</span>
        <div className="alert-banner__content">
          <strong className="alert-banner__title">
            IMD മുന്നറിയിപ്പ് സജീവം
          </strong>
          <span className="alert-banner__districts">
            {affectedDistricts.map((d) => d.name_ml).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
}
