import React from 'react';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';

/**
 * Alert ticker marquee — shows RED and ORANGE district weather alerts
 * scrolling continuously below the navbar.
 * Returns null if no RED/ORANGE alerts exist.
 * Powered by real Open-Meteo weather data.
 */
export default function AlertTicker() {
  const { districts } = useWeatherAlerts();

  // Filter only RED and ORANGE alerts
  const urgentAlerts = (districts || []).filter(
    (d) => d.alert_level === 'red' || d.alert_level === 'orange'
  );

  if (urgentAlerts.length === 0) return null;

  // Build ticker text items
  const tickerItems = urgentAlerts.map((d) => {
    const prefix = d.alert_level === 'red' ? '🔴' : '🟠';
    const label = d.alert_level === 'red' ? 'RED ALERT' : 'ORANGE ALERT';
    const text = d.alert_text || `${d.name_en} district on ${d.alert_level} alert`;
    return {
      key: d.id,
      level: d.alert_level,
      text: `${prefix} ${label} — ${d.name_ml} (${d.name_en}): ${text}`,
    };
  });

  return (
    <div className="alert-ticker" id="alert-ticker" role="marquee" aria-live="polite">
      <div className="alert-ticker__inner">
        {/* Render items twice for seamless loop */}
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span
            key={`${item.key}-${i}`}
            className={`alert-ticker__item alert-ticker__item--${item.level}`}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
