/**
 * Geocoding using OpenStreetMap Nominatim API
 * All queries are Kerala-biased using viewbox bounding
 */

import { KERALA_VIEWBOX } from './constants';

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100;

/**
 * Throttle requests to respect Nominatim usage policy
 */
async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Forward geocode with Kerala bias — returns up to 5 results
 * @param {string} query — place name to search
 * @returns {Promise<Array<{lat: number, lng: number, displayName: string, district: string}>>}
 */
export async function geocodeKerala(query) {
  if (!query || query.trim().length < 2) return [];

  await throttle();

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', `${query.trim()}, Kerala, India`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5');
    url.searchParams.set('viewbox', KERALA_VIEWBOX);
    url.searchParams.set('bounded', '1');
    url.searchParams.set('countrycodes', 'in');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'VellomKeriyo/1.0 (vellomkeriyo.in)',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      district: item.address?.state_district || item.address?.county || '',
      shortName: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
    }));
  } catch (err) {
    console.error('Geocoding error:', err);
    return [];
  }
}

/**
 * Reverse geocode — coordinates to place name (Kerala biased)
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{placeName: string, district: string} | null>}
 */
export async function reverseGeocode(lat, lng) {
  await throttle();

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('zoom', '14');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'VellomKeriyo/1.0 (vellomkeriyo.in)',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.error) return null;

    const address = data.address || {};
    return {
      placeName: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      district: address.state_district || address.county || address.city || '',
      shortName: address.city || address.town || address.village || data.display_name?.split(',')[0] || '',
    };
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
}
