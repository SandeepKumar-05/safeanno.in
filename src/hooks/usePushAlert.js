import { useState, useEffect, useCallback } from 'react';
import { registerServiceWorker, subscribePush } from '../lib/push';

/**
 * Hook for managing Web Push notification subscription.
 * Handles service worker registration and push subscription lifecycle.
 */
export function usePushAlert() {
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registration, setRegistration] = useState(null);

  // Register service worker on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const reg = await registerServiceWorker();
      if (!cancelled && reg) {
        setRegistration(reg);

        // Check if already subscribed
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          setSubscription(existingSub);
          setIsSubscribed(true);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Subscribe to push notifications
   * @returns {PushSubscription | null}
   */
  const subscribe = useCallback(async () => {
    if (!registration) {
      setError('Service worker not registered');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const sub = await subscribePush(registration);
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
        return sub;
      } else {
        setError('Push subscription failed');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [registration]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
    }
  }, [subscription]);

  return { subscription, isSubscribed, loading, error, subscribe, unsubscribe };
}
