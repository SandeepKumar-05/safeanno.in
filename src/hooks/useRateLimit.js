import { useState, useEffect, useCallback } from 'react';
import { canSubmitReport, markReportSubmitted } from '../lib/spamGuard';
import { RATE_LIMIT_SECONDS } from '../lib/constants';

/**
 * Hook for enforcing rate limiting on report submissions.
 * Returns the current rate limit state and a function to record submissions.
 */
export function useRateLimit() {
  const [isLimited, setIsLimited] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);

  // Check rate limit state
  const checkLimit = useCallback(() => {
    const { allowed, waitSeconds: wait } = canSubmitReport();
    setIsLimited(!allowed);
    setWaitSeconds(wait);
    return allowed;
  }, []);

  // Re-check every second while limited
  useEffect(() => {
    checkLimit();

    const interval = setInterval(() => {
      const { allowed, waitSeconds: wait } = canSubmitReport();
      setIsLimited(!allowed);
      setWaitSeconds(wait);

      if (allowed) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkLimit]);

  /**
   * Record a submission and start the cooldown
   */
  const recordSubmission = useCallback(() => {
    markReportSubmitted();
    setIsLimited(true);
    setWaitSeconds(RATE_LIMIT_SECONDS);
  }, []);

  return { isLimited, waitSeconds, checkLimit, recordSubmission };
}
