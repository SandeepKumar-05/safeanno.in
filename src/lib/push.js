/**
 * Web Push utilities
 * Handles service worker registration and push subscription
 */

/**
 * Convert a VAPID public key from URL-safe base64 to Uint8Array
 * Required by the Push API's subscribe method
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the service worker from /sw.js
 * Returns the ServiceWorkerRegistration or null on failure
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service worker registered:', registration.scope);
    return registration;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

/**
 * Subscribe the user to push notifications
 * Returns the PushSubscription object or null on failure
 */
export async function subscribePush(registration) {
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn('VAPID public key not set — push notifications disabled');
    return null;
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log('Push subscription created');
    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}
