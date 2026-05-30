import React, { createContext, useState, useEffect } from 'react';

export const SessionContext = createContext(null);

const STORAGE_KEY = 'vk_session_id';

/**
 * Provides an anonymous session ID to the entire app.
 * Generated once via crypto.randomUUID() and persisted in localStorage.
 * No cookies, no tracking, no personal data.
 */
export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let id = null;
    try {
      id = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }

    if (!id) {
      id = crypto.randomUUID();
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {
        // localStorage unavailable — session is ephemeral
      }
    }

    setSessionId(id);
  }, []);

  return (
    <SessionContext.Provider value={sessionId}>
      {children}
    </SessionContext.Provider>
  );
}
