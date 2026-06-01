import React from 'react';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';

/**
 * Alert banner — shows count of districts on weather alert.
 * Powered by real Open-Meteo weather data.
 */
export default function AlertBanner() {
  const { redAlerts, orangeAlerts, yellowAlerts } = useWeatherAlerts();

  const redCount    = redAlerts.length;
  const orangeCount = orangeAlerts.length;
  const yellowCount = yellowAlerts.length;

  if (redCount === 0 && orangeCount === 0 && yellowCount === 0) return null;

  const parts = [];
  if (redCount    > 0) parts.push(`${redCount} Red`);
  if (orangeCount > 0) parts.push(`${orangeCount} Orange`);
  if (yellowCount > 0) parts.push(`${yellowCount} Yellow`);

  const bgColor = redCount > 0
    ? 'rgba(192, 57, 43, 0.12)'
    : orangeCount > 0
      ? 'rgba(211, 84, 0, 0.1)'
      : 'rgba(241, 196, 15, 0.08)';

  return (
    <div className="alert-banner" style={{ background: bgColor }} id="alert-banner">
      <div className="alert-banner__inner">
        <span className="alert-banner__icon">⚠️</span>
        <div>
          <span className="alert-banner__title">
            Weather Warning Active — Kerala
          </span>
          <span className="alert-banner__districts">
            {parts.join(' • ')} alert{(redCount + orangeCount + yellowCount) > 1 ? 's' : ''} across districts
          </span>
        </div>
        <a
          href="https://mausam.imd.gov.in/imd_latest/contents/warning.php"
          target="_blank"
          rel="noopener noreferrer"
          className="alert-banner__link"
        >
          IMD ↗
        </a>
      </div>
    </div>
  );
}
