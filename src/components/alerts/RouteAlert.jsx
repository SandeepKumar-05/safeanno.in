import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { getRoadRoute, toGeoJSON } from '../../lib/routing';
import { formatDistance, formatDuration } from '../../lib/formatters';
import { useSession } from '../../hooks/useSession';
import { usePushAlert } from '../../hooks/usePushAlert';
import { useToast } from '../../hooks/useToast';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import SectionHeading from '../ui/SectionHeading';
import './RouteAlert.css';

/**
 * Route alert subscription panel.
 * Users pick origin + destination via autocomplete,
 * system fetches real road route from OSRM,
 * saves to Supabase with push subscription.
 */
export default function RouteAlert({ onRouteCalculated }) {
  const sessionId = useSession();
  const { subscription, isSubscribed, subscribe } = usePushAlert();
  const { addToast } = useToast();

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState('');

  // Calculate route when both points are set
  const handleCalculateRoute = useCallback(async () => {
    if (!origin || !destination) {
      addToast('ഉറവിടവും ലക്ഷ്യസ്ഥാനവും തിരഞ്ഞെടുക്കുക (Select origin & destination)', 'warning');
      return;
    }

    setLoading(true);
    setRouteData(null);

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

      addToast('✅ Route calculated!', 'success');
    } catch (err) {
      console.error('Route calculation error:', err);
      addToast(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, onRouteCalculated, addToast]);

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

  return (
    <section className="route-alert-section" id="route-alert">
      <SectionHeading
        icon="🛣️"
        titleMl="റൂട്ട് അലേർട്ട്"
        subtitleEn="Get alerts along your travel route"
      />

      <div className="route-alert__form">
        <div className="route-alert__field">
          <label className="route-alert__label">
            ഉറവിടം <span className="route-alert__label-en">(Origin)</span>
          </label>
          <LocationAutocomplete
            placeholder="ഉറവിടം തിരയുക (Search origin)"
            onSelect={setOrigin}
            value={origin}
            id="route-origin"
          />
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
            {loading ? '⏳ Calculating...' : '🗺️ Calculate Route'}
          </button>
        )}

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
          </>
        )}
      </div>
    </section>
  );
}
