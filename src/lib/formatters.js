/**
 * Formatting utilities for the app
 */
import { formatDistanceToNow } from 'date-fns';
import { DISASTER_TYPES, SEVERITY_LEVELS } from './constants';

/**
 * Get time-ago string from a timestamp
 * @param {string} timestamp — ISO timestamp
 * @returns {string} e.g. "5 minutes ago"
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
 * Look up a disaster type object by id
 * @param {string} typeId
 * @returns {object} the matching DISASTER_TYPES entry
 */
export function getDisasterType(typeId) {
  return DISASTER_TYPES.find((t) => t.id === typeId) || DISASTER_TYPES[0];
}

/**
 * Look up a severity level object by id
 * @param {string} severityId
 * @returns {object} the matching SEVERITY_LEVELS entry
 */
export function getSeverityLevel(severityId) {
  return SEVERITY_LEVELS.find((s) => s.id === severityId) || SEVERITY_LEVELS[0];
}

/**
 * Format coordinates for display
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function formatCoords(lat, lng) {
  if (lat == null || lng == null) return '';
  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
}

/**
 * Truncate text to a max length with ellipsis
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(text, maxLen = 100) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}
