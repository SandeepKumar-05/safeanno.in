/**
 * OSRM Road Routing — real road-following routes (free, no API key)
 * Uses the public OSRM demo server
 */

import { OSRM_BASE_URL } from './constants';

/**
 * Get a real road-following route between two points
 * @param {number} originLat
 * @param {number} originLng
 * @param {number} destLat
 * @param {number} destLng
 * @returns {Promise<{geometry: object, distanceKm: number, durationMin: number, coordinates: number[][]}>}
 */
export async function getRoadRoute(originLat, originLng, destLat, destLng) {
  const url = `${OSRM_BASE_URL}/${originLng},${originLat};${destLng},${destLat}`
    + `?overview=full&geometries=geojson&steps=false`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`OSRM routing failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
    throw new Error('Route not found — try different locations');
  }

  const route = data.routes[0];
  return {
    geometry: route.geometry,
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    coordinates: route.geometry.coordinates,
  };
}

/**
 * Convert OSRM GeoJSON coordinates to WKT LineString for PostGIS
 * @param {number[][]} coordinates — [[lng, lat], ...]
 * @returns {string} — WKT string
 */
export function toWKTLineString(coordinates) {
  const points = coordinates.map(([lng, lat]) => `${lng} ${lat}`).join(', ');
  return `SRID=4326;LINESTRING(${points})`;
}

/**
 * Convert OSRM GeoJSON to Supabase-compatible GeoJSON string
 * @param {number[][]} coordinates — [[lng, lat], ...]
 * @returns {string} — GeoJSON string for ST_GeomFromGeoJSON
 */
export function toGeoJSON(coordinates) {
  return JSON.stringify({
    type: 'LineString',
    coordinates: coordinates,
  });
}

/**
 * Haversine distance between two points in kilometers
 * @param {number[]} point1 — [lng, lat]
 * @param {number[]} point2 — [lng, lat]
 * @returns {number} — distance in kilometers
 */
export function haversineDistance(point1, point2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Play an alert beep sound using Web Audio API
 * Falls back silently if Web Audio is unavailable
 * @param {number} frequency — Hz (default 880)
 * @param {number} duration — seconds (default 0.3)
 */
export function playAlertBeep(frequency = 880, duration = 0.3) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Fade in/out to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

    // Play a second beep after a short pause
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 1.2;
    gain2.gain.setValueAtTime(0, ctx.currentTime + duration + 0.1);
    gain2.gain.linearRampToValueAtTime(0.5, ctx.currentTime + duration + 0.11);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + duration * 2 + 0.1);
    osc2.start(ctx.currentTime + duration + 0.1);
    osc2.stop(ctx.currentTime + duration * 2 + 0.1);

    // Close context after sounds finish
    setTimeout(() => ctx.close(), (duration * 2 + 0.2) * 1000);
  } catch {
    // Silently fail — audio is enhancement, not critical
  }
}
