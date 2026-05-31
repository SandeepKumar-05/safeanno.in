import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a timestamp as "X minutes ago" / "X hours ago"
 * @param {string} timestamp — ISO string
 * @returns {string}
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format a timestamp as readable date/time
 * @param {string} timestamp — ISO string
 * @returns {string}
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  try {
    return format(new Date(timestamp), 'dd MMM yyyy, hh:mm a');
  } catch {
    return '';
  }
}

/**
 * Format a timestamp as short time
 * @param {string} timestamp — ISO string
 * @returns {string}
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';
  try {
    return format(new Date(timestamp), 'hh:mm a');
  } catch {
    return '';
  }
}

/**
 * Format distance in km or m
 * @param {number} km — distance in kilometers
 * @returns {string}
 */
export function formatDistance(km) {
  if (km == null || isNaN(km)) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Format duration in minutes or hours
 * @param {number} minutes — duration in minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (minutes == null || isNaN(minutes)) return '';
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format accuracy in meters with color hint
 * @param {number} meters — GPS accuracy in meters
 * @returns {{ text: string, color: string }}
 */
export function formatAccuracy(meters) {
  if (meters == null) return { text: '', color: '#5e8a9e' };
  const rounded = Math.round(meters);
  if (rounded < 20) {
    return { text: `±${rounded}m 🎯`, color: '#27ae60' };
  }
  if (rounded <= 100) {
    return { text: `±${rounded}m`, color: '#d35400' };
  }
  return { text: `±${rounded}m — move outdoors`, color: '#c0392b' };
}
