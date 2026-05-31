import React from 'react';
import { useDistricts } from '../../hooks/useDistricts';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';

/**
 * Alert banner — shows count of districts on alert.
 * Simplified — detailed marquee is in AlertTicker.jsx.
 */
export default function AlertBanner() {
  const { districts } = useDistricts();

  const redCount = (districts || []).filter((d) => d.alert_level === 'red').length;
  const orangeCount = (districts || []).filter((d) => d.alert_level === 'orange').length;
  const yellowCount = (districts || []).filter((d) => d.alert_level === 'yellow').length;

  if (redCount === 0 && orangeCount === 0 && yellowCount === 0) return null;

  const parts = [];
  if (redCount > 0) parts.push(`${redCount} Red`);
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
            IMD മുന്നറിയിപ്പ് — Weather Warning Active
          </span>
          <span className="alert-banner__districts">
            {parts.join(' • ')} alert{(redCount + orangeCount + yellowCount) > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
