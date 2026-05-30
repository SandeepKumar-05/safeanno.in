import React, { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import { geocodePlace } from '../../lib/geocode';
import { saveRouteAlert } from './PushManager';
import { usePushAlert } from '../../hooks/usePushAlert';
import { useSession } from '../../hooks/useSession';
import { useToast } from '../../hooks/useToast';
import './RouteAlert.css';

/**
 * Route-based alert subscription form.
 * Users enter origin/destination, subscribe to push notifications
 * for disasters along their route.
 */
export default function RouteAlert() {
  const sessionId = useSession();
  const { subscribe, isSubscribed } = usePushAlert();
  const { addToast } = useToast();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!origin.trim() || !destination.trim()) {
      addToast('ആരംഭ സ്ഥലവും ലക്ഷ്യസ്ഥാനവും നൽകുക (Enter origin and destination)', 'warning');
      return;
    }

    setLoading(true);

    try {
      // Geocode both places
      const [originResult, destResult] = await Promise.all([
        geocodePlace(origin),
        geocodePlace(destination),
      ]);

      if (!originResult) {
        addToast(`"${origin}" കണ്ടെത്താൻ കഴിഞ്ഞില്ല (Origin not found)`, 'error');
        setLoading(false);
        return;
      }
      if (!destResult) {
        addToast(`"${destination}" കണ്ടെത്താൻ കഴിഞ്ഞില്ല (Destination not found)`, 'error');
        setLoading(false);
        return;
      }

      // Subscribe to push notifications
      let pushSub = null;
      if (!isSubscribed) {
        pushSub = await subscribe();
      }

      // Save route to database
      await saveRouteAlert({
        sessionId,
        subscription: pushSub,
        originName: origin,
        destinationName: destination,
        originLat: originResult.lat,
        originLng: originResult.lng,
        destLat: destResult.lat,
        destLng: destResult.lng,
        phone: phone || null,
      });

      setSubscribed(true);
      addToast('🔔 അലേർട്ടുകൾ സജ്ജമാക്കി! (Alerts activated!)', 'success');
    } catch (err) {
      console.error('Route alert error:', err);
      addToast(`പരാജയപ്പെട്ടു: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="route-alert" id="route-alert-section">
      <SectionHeading
        titleMl="യാത്രാ മുന്നറിയിപ്പ്"
        titleEn="Route Alerts"
        icon="🔔"
      />

      <p className="route-alert__description">
        നിങ്ങളുടെ യാത്രാ പാതയിൽ ദുരന്തം റിപ്പോർട്ട് ചെയ്യപ്പെട്ടാൽ ഉടൻ അറിയിപ്പ് ലഭിക്കും.
        <br />
        <small>Get instant alerts when disasters are reported along your travel route.</small>
      </p>

      <div className="route-alert__fields">
        <input
          type="text"
          className="route-alert__input"
          placeholder="ആരംഭ സ്ഥലം (Origin)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          id="route-origin"
        />
        <input
          type="text"
          className="route-alert__input"
          placeholder="ലക്ഷ്യസ്ഥാനം (Destination)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          id="route-destination"
        />
        <input
          type="tel"
          className="route-alert__input route-alert__phone"
          placeholder="ഫോൺ നമ്പർ — ഓപ്ഷണൽ (Phone — optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          id="route-phone"
        />
      </div>

      <div className="route-alert__actions">
        <button
          className="route-alert__subscribe-btn"
          onClick={handleSubscribe}
          disabled={loading || subscribed}
          id="route-subscribe-btn"
        >
          {loading ? (
            <><span className="spinner" /> സജ്ജമാക്കുന്നു...</>
          ) : subscribed ? (
            '🔔 അലേർട്ടുകൾ സജീവം (Alerts Active)'
          ) : (
            '🔔 അലേർട്ട് സജ്ജമാക്കുക (Subscribe)'
          )}
        </button>
      </div>

      {subscribed && (
        <div className="route-alert__status">
          🔔 അലേർട്ടുകൾ സജീവം — Alerts active for {origin} → {destination}
        </div>
      )}
    </section>
  );
}
