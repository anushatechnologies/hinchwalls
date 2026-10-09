/**
 * Centralized Token Storage Service
 * Manages HinchMart JWT access token in memory with secure fallback storage.
 * Never stores signing secrets or logs raw tokens.
 */

const TOKEN_KEY = 'hinchmart_access_token';

// In-memory token cache for high-speed, secure access
let inMemoryToken: string | null = null;

// Initialize from session/local storage if available
try {
  inMemoryToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
} catch {
  // Storage may be restricted in private/sandboxed contexts
  inMemoryToken = null;
}

export const tokenStorage = {
  /**
   * Get the current HinchMart JWT access token.
   */
  getAccessToken(): string | null {
    if (inMemoryToken) {
      return inMemoryToken;
    }
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      // ignore storage access error
    }
    return null;
  },

  /**
   * Set the HinchMart JWT access token.
   */
  setAccessToken(token: string | null): void {
    inMemoryToken = token;
    try {
      if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore storage access error
    }
  },

  /**
   * Clear the stored token.
   */
  clear(): void {
    inMemoryToken = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Check if an access token is currently held.
   */
  hasAccessToken(): boolean {
    return Boolean(this.getAccessToken());
  },
};
