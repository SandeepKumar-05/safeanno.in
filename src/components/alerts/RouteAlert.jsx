import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { getRoadRoute, toGeoJSON } from '../../lib/routing';
import { formatDistance, formatDuration } from '../../lib/formatters';
import { useSession } from '../../hooks/useSession';
import { usePushAlert } from '../../hooks/usePushAlert';
import { useToast } from '../../hooks/useToast';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';
import { getRouteAlertLevel, KERALA_DISTRICTS } from '../../lib/weatherAlerts';
import { ALERT_LEVEL_COLORS } from '../../lib/constants';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import LocationDetect from '../report/LocationDetect';
import SectionHeading from '../ui/SectionHeading';
import './RouteAlert.css';

/**
 * Route alert subscription panel.
 * Users pick origin + destination via autocomplete,
 * system fetches real road route from OSRM,
 * checks IMD/weather alert level for districts along the route,
 * and saves to Supabase with push subscription.
 */
export default function RouteAlert({ onRouteCalculated }) {
  const sessionId = useSession();
  const { subscription, isSubscribed, subscribe } = usePushAlert();
  const { addToast } = useToast();
  const { districts: weatherDistricts, loading: weatherLoading } = useWeatherAlerts();

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState('');
  const [routeSafety, setRouteSafety] = useState(null); // { level, districts }

  /**
   * Check which Kerala districts the route passes through
   * using rough bounding box intersection with district HQ coords
   */
  const checkRouteDistricts = useCallback((coordinates) => {
    if (!coordinates || coordinates.length === 0) return [];

    // Get bounding box of route
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const [lng, lat] of coordinates) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    // Pad bounding box by 0.3 degrees (~33km)
    const pad = 0.3;
    minLat -= pad; maxLat += pad;
    minLng -= pad; maxLng += pad;

    // Find districts whose HQ falls within the route bounding box
    const districtNames = KERALA_DISTRICTS
      .filter((d) => d.lat >= minLat && d.lat <= maxLat && d.lng >= minLng && d.lng <= maxLng)
      .map((d) => d.name_en);

    return districtNames;
  }, []);

  // Calculate route when both points are set
  const handleCalculateRoute = useCallback(async () => {
    if (!origin || !destination) {
      addToast('ഉറവിടവും ലക്ഷ്യസ്ഥാനവും തിരഞ്ഞെടുക്കുക (Select origin & destination)', 'warning');
      return;
    }

    setLoading(true);
    setRouteData(null);
    setRouteSafety(null);

    try {
      const route = await getRoadRoute(
        origin.lat, origin.lng,
        destination.lat, destination.lng
      );

      setRouteData(route);

      // Notify parent to display route on map
      if (onRouteCalculated) {
        onRouteCalculated(route);
      }

      // Check district safety along route
      const districtNames = checkRouteDistricts(route.coordinates);
      if (districtNames.length > 0 && weatherDistricts.length > 0) {
        const safety = getRouteAlertLevel(districtNames, weatherDistricts);
        setRouteSafety({ ...safety, checkedDistricts: districtNames });
      }

      addToast('✅ Route calculated!', 'success');
    } catch (err) {
      console.error('Route calculation error:', err);
      addToast(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, onRouteCalculated, addToast, checkRouteDistricts, weatherDistricts]);

  // Save route with push subscription
  const handleSaveRoute = useCallback(async () => {
    if (!routeData || !origin || !destination) return;

    setLoading(true);

    try {
      // Subscribe to push if not already
      let pushSub = subscription;
      if (!isSubscribed) {
        pushSub = await subscribe();
      }

      const { error } = await supabase
        .from('routes')
        .insert({
          session_id: sessionId,
          origin_name: origin.displayName,
          destination_name: destination.displayName,
          origin_lat: origin.lat,
          origin_lng: origin.lng,
          dest_lat: destination.lat,
          dest_lng: destination.lng,
          route: toGeoJSON(routeData.coordinates),
          push_subscription: pushSub ? JSON.stringify(pushSub) : null,
          phone: phone || null,
        });

      if (error) throw error;

      setSaved(true);
      addToast('✅ Route alert saved! You will be notified of disasters along this route.', 'success');
    } catch (err) {
      console.error('Save route error:', err);
      addToast(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [routeData, origin, destination, sessionId, subscription, isSubscribed, subscribe, phone, addToast]);

  // Render safety banner
  const renderSafetyBanner = () => {
    if (!routeSafety) return null;

    const { level, districts } = routeSafety;
    const color = ALERT_LEVEL_COLORS[level] || ALERT_LEVEL_COLORS.green;

    if (level === 'green') {
      return (
        <div className="route-safety-banner route-safety-banner--green">
          ✅ <strong>Route appears SAFE</strong> — No active weather alerts along this route.
        </div>
      );
    }

    const levelEmoji = level === 'red' ? '🔴' : level === 'orange' ? '🟠' : '🟡';
    const levelLabel = level === 'red' ? 'RED ALERT' : level === 'orange' ? 'ORANGE ALERT' : 'YELLOW ALERT';

    return (
      <div
        className={`route-safety-banner route-safety-banner--${level}`}
        style={{ borderColor: color, background: `${color}11` }}
      >
        <div className="route-safety-banner__header">
          {levelEmoji} <strong>{levelLabel} — Travel with Caution</strong>
        </div>
        <div className="route-safety-banner__districts">
          Districts on alert along your route:
          {districts.map((d) => (
            <span
              key={d.id}
              className="route-safety-district"
              style={{ color, borderColor: color }}
            >
              {d.name_ml} ({d.name_en}): {d.alert_text}
            </span>
          ))}
        </div>
        {level === 'red' && (
          <div className="route-safety-banner__warning">
            ⚠️ <strong>RED ALERT: Avoid travel if possible. Extremely hazardous conditions.</strong>
          </div>
        )}
        {level === 'orange' && (
          <div className="route-safety-banner__warning">
            ⚠️ Be prepared for heavy rain. Carry emergency supplies. Inform someone of your travel.
          </div>
        )}
        <a
          href="https://sdma.kerala.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="route-safety-banner__link"
        >
          Check KSDMA official alerts ↗
        </a>
      </div>
    );
  };

  return (
    <section className="route-alert-section" id="route-alert">
      <SectionHeading
        icon="🛣️"
        titleMl="റൂട്ട് സുരക്ഷ പരിശോധന"
        subtitleEn="Check Route Safety & Get Alerts"
      />

      <div className="route-alert__form">
        <div className="route-alert__field">
          <label className="route-alert__label">
            ഉറവിടം <span className="route-alert__label-en">(Origin)</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <LocationDetect onDetect={(loc) => setOrigin({
              lat: loc.lat,
              lng: loc.lng,
              displayName: loc.placeName,
              district: loc.district,
            })} />
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7f8c8d' }}>അല്ലെങ്കിൽ തിരയുക (Or search)</div>
            <LocationAutocomplete
              placeholder="ഉറവിടം തിരയുക (Search origin)"
              onSelect={setOrigin}
              value={origin}
              id="route-origin"
            />
          </div>
        </div>

        <div className="route-alert__field">
          <label className="route-alert__label">
            ലക്ഷ്യസ്ഥാനം <span className="route-alert__label-en">(Destination)</span>
          </label>
          <LocationAutocomplete
            placeholder="ലക്ഷ്യസ്ഥാനം തിരയുക (Search destination)"
            onSelect={setDestination}
            value={destination}
            id="route-destination"
          />
        </div>

        {/* Optional phone */}
        <div className="route-alert__field">
          <label className="route-alert__label">
            ഫോൺ <span className="route-alert__label-en">(Phone — optional SMS alerts)</span>
          </label>
          <input
            type="tel"
            className="route-alert__input"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
          />
        </div>

        {/* Calculate button */}
        {!routeData && (
          <button
            className="route-alert__btn route-alert__btn--calculate"
            onClick={handleCalculateRoute}
            disabled={loading || !origin || !destination}
            type="button"
          >
            {loading ? '⏳ Calculating...' : '🗺️ Check Route Safety'}
          </button>
        )}

        {/* Safety banner — shown right after route calculation */}
        {renderSafetyBanner()}

        {/* Route info */}
        {routeData && (
          <>
            <div className="route-info">
              <div className="route-info__item">
                📏 <strong>{formatDistance(routeData.distanceKm)}</strong>
              </div>
              <div className="route-info__item">
                ⏱ <strong>{formatDuration(routeData.durationMin)}</strong>
              </div>
            </div>

            {!saved && (
              <button
                className="route-alert__btn route-alert__btn--save"
                onClick={handleSaveRoute}
                disabled={loading}
                type="button"
              >
                {loading ? '⏳ Saving...' : '🔔 Save & Get Alerts'}
              </button>
            )}

            {saved && (
              <div className="route-alert__success">
                ✅ Route alert active! Disasters along this route will trigger notifications.
              </div>
            )}

            <button
              className="route-alert__btn route-alert__btn--reset"
              onClick={() => {
                setRouteData(null);
                setRouteSafety(null);
                setSaved(false);
                setOrigin(null);
                setDestination(null);
                if (onRouteCalculated) onRouteCalculated(null);
              }}
              type="button"
            >
              🔁 Check Another Route
            </button>
          </>
        )}
      </div>
    </section>
  );
}
