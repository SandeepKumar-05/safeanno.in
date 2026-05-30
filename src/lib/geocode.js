/**
 * Geocoding using OpenStreetMap Nominatim API (free, no key needed)
 * Rate limited to 1 request per second per Nominatim usage policy
 */

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // slightly over 1s to be safe

/**
 * Forward geocode — place name to coordinates
 * @param {string} query — place name to search
 * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
 */
export async function geocodePlace(query) {
  if (!query || query.trim().length < 2) return null;

  // Rate limit enforcement
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'in',
      viewbox: '74.5,8.0,77.5,12.8', // Kerala bounding box
      bounded: '1',
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'VellamKeriyo/1.0 (disaster-alert-app)',
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

/**
 * Reverse geocode — coordinates to place name
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{placeName: string, district: string} | null>}
 */
export async function reverseGeocode(lat, lng) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      zoom: '14',
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          'User-Agent': 'VellamKeriyo/1.0 (disaster-alert-app)',
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.error) return null;

    const address = data.address || {};
    return {
      placeName: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      district: address.state_district || address.county || address.city || '',
    };
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
}
