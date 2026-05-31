import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Banner that appears when user goes offline.
 * Shows yellow warning when offline, green flash when reconnected.
 */
export default function OfflineBanner() {
  const { isOnline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    }

    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="offline-banner" id="offline-banner">
        📡 ഇന്റർനെറ്റ് ബന്ധം ഇല്ല — Offline mode. Showing last known data.
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="offline-banner offline-banner--reconnected" id="offline-banner">
        ✅ Connected — ബന്ധം പുനഃസ്ഥാപിച്ചു
      </div>
    );
  }

  return null;
}
