import React, { useState } from 'react';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';
import SectionHeading from '../ui/SectionHeading';
import Skeleton from '../ui/Skeleton';

const ALERT_LEVEL_LABELS = {
  red:    { ml: 'റെഡ് അലേർട്ട്',    en: 'Red Alert',    emoji: '🔴' },
  orange: { ml: 'ഓറഞ്ച് അലേർട്ട്', en: 'Orange Alert', emoji: '🟠' },
  yellow: { ml: 'യെല്ലോ അലേർട്ട്', en: 'Yellow Alert', emoji: '🟡' },
  green:  { ml: 'സുരക്ഷിതം',       en: 'Safe',         emoji: '🟢' },
};

function AlertLevelBadge({ level }) {
  const color = ALERT_LEVEL_COLORS[level] || ALERT_LEVEL_COLORS.green;
  const info = ALERT_LEVEL_LABELS[level] || ALERT_LEVEL_LABELS.green;
  return (
    <span
      className="district-alert-badge"
      style={{ backgroundColor: color + '22', color, borderColor: color + '66', border: '1px solid' }}
    >
      {info.emoji} {info.en}
    </span>
  );
}

/**
 * Weather Alert Panel — shows live IMD-equivalent alerts for all 14 Kerala districts
 * powered by Open-Meteo weather API.
 */
export default function WeatherAlertPanel() {
  const {
    districts,
    loading,
    error,
    lastUpdated,
    redAlerts,
    orangeAlerts,
    yellowAlerts,
    activeAlertCount,
    refetch,
  } = useWeatherAlerts();

  const [filter, setFilter] = useState('all'); // 'all' | 'red' | 'orange' | 'yellow'

  const filteredDistricts = filter === 'all'
    ? districts
    : districts.filter((d) => d.alert_level === filter);

  const summaryItems = [
    { level: 'red',    count: redAlerts.length,    label: 'Red Alert' },
    { level: 'orange', count: orangeAlerts.length,  label: 'Orange Alert' },
    { level: 'yellow', count: yellowAlerts.length,  label: 'Yellow Alert' },
  ].filter((s) => s.count > 0);

  return (
    <section id="weather-alerts-section" className="weather-alert-panel">
      <SectionHeading
        icon="🌦️"
        titleMl="ജില്ലാ കാലാവസ്ഥ അലേർട്ട്"
        subtitleEn="Kerala District Weather Alerts — Live Data"
      />

      {/* Source & refresh info */}
      <div className="weather-alert-panel__meta">
        <span className="weather-alert-panel__source">
          📡 Source: Open-Meteo Weather API (Real-time)
        </span>
        {lastUpdated && (
          <span className="weather-alert-panel__updated">
            Updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button
          className="weather-alert-panel__refresh-btn"
          onClick={refetch}
          disabled={loading}
          type="button"
          title="Refresh weather data"
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="weather-alert-panel__error">
          ⚠️ Unable to fetch live weather data. Showing last known values.
        </div>
      )}

      {/* Summary pill bar */}
      {!loading && summaryItems.length > 0 && (
        <div className="weather-alert-panel__summary">
          <span className="weather-alert-panel__summary-label">
            ⚠️ {activeAlertCount} district{activeAlertCount !== 1 ? 's' : ''} on active alert:
          </span>
          {summaryItems.map((s) => (
            <button
              key={s.level}
              className={`weather-alert-panel__filter-pill weather-alert-panel__filter-pill--${s.level} ${filter === s.level ? 'active' : ''}`}
              onClick={() => setFilter(filter === s.level ? 'all' : s.level)}
              type="button"
            >
              {ALERT_LEVEL_LABELS[s.level].emoji} {s.count} {s.label}
            </button>
          ))}
          {filter !== 'all' && (
            <button
              className="weather-alert-panel__filter-pill weather-alert-panel__filter-pill--clear"
              onClick={() => setFilter('all')}
              type="button"
            >
              Show All
            </button>
          )}
        </div>
      )}

      {/* District grid */}
      <div className="weather-alert-grid">
        {loading
          ? Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="weather-alert-card weather-alert-card--skeleton">
                <Skeleton width="6px" height="100%" borderRadius="3px" />
                <div style={{ flex: 1, padding: '0.5rem' }}>
                  <Skeleton width="60%" height="1em" />
                  <Skeleton width="40%" height="0.8em" style={{ marginTop: '0.4rem' }} />
                </div>
                <Skeleton width="80px" height="24px" borderRadius="4px" />
              </div>
            ))
          : filteredDistricts.map((district) => {
              const color = ALERT_LEVEL_COLORS[district.alert_level] || ALERT_LEVEL_COLORS.green;
              const isAlert = district.alert_level !== 'green';
              return (
                <div
                  key={district.id}
                  className={`weather-alert-card ${isAlert ? `weather-alert-card--${district.alert_level}` : ''}`}
                  style={{
                    borderLeft: `4px solid ${color}`,
                    background: isAlert ? `${color}08` : undefined,
                  }}
                >
                  <div className="weather-alert-card__left">
                    <div className="weather-alert-card__name-ml">{district.name_ml}</div>
                    <div className="weather-alert-card__name-en">{district.name_en}</div>
                    {district.alert_text && district.alert_level !== 'green' && (
                      <div className="weather-alert-card__text" style={{ color }}>
                        {district.alert_text}
                      </div>
                    )}
                  </div>
                  <AlertLevelBadge level={district.alert_level} />
                </div>
              );
            })}
      </div>

      {/* IMD disclaimer */}
      <p className="weather-alert-panel__disclaimer">
        ⓘ Weather data from Open-Meteo (WMO standard). For official alerts, visit{' '}
        <a
          href="https://mausam.imd.gov.in/imd_latest/contents/warning.php"
          target="_blank"
          rel="noopener noreferrer"
          className="weather-alert-panel__link"
        >
          IMD mausam.imd.gov.in
        </a>{' '}
        or{' '}
        <a
          href="https://sdma.kerala.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="weather-alert-panel__link"
        >
          KSDMA sdma.kerala.gov.in
        </a>
        .
      </p>
    </section>
  );
}
