import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

/**
 * Hook to get the anonymous session ID
 * @returns {string | null} session ID
 */
export function useSession() {
  return useContext(SessionContext);
}
