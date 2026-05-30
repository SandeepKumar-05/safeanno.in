/**
 * Spam / rate-limit guard using localStorage
 * Prevents rapid-fire report submissions from the same session
 */
import { RATE_LIMIT_SECONDS } from './constants';

const STORAGE_KEY = 'vk_last_report_time';

/**
 * Check if the user can submit a report right now
 * @returns {{ allowed: boolean, waitSeconds: number }}
 */
export function canSubmitReport() {
  try {
    const lastTime = localStorage.getItem(STORAGE_KEY);
    if (!lastTime) return { allowed: true, waitSeconds: 0 };

    const elapsed = (Date.now() - parseInt(lastTime, 10)) / 1000;
    if (elapsed >= RATE_LIMIT_SECONDS) {
      return { allowed: true, waitSeconds: 0 };
    }

    return {
      allowed: false,
      waitSeconds: Math.ceil(RATE_LIMIT_SECONDS - elapsed),
    };
  } catch {
    // If localStorage is unavailable, allow submission
    return { allowed: true, waitSeconds: 0 };
  }
}

/**
 * Record that a report was just submitted
 */
export function markReportSubmitted() {
  try {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch {
    // Silently fail if localStorage unavailable
  }
}
