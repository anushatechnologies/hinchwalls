import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { tokenStorage } from '../services/tokenStorage';
import { firebaseAuthService } from '../services/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session lifecycle listeners
type SessionExpiredHandler = () => void;
type TokenUpdatedHandler = (token: string, userData?: any) => void;

let sessionExpiredHandlers: SessionExpiredHandler[] = [];
let tokenUpdatedHandlers: TokenUpdatedHandler[] = [];

export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredHandlers.push(handler);
  return () => {
    sessionExpiredHandlers = sessionExpiredHandlers.filter((h) => h !== handler);
  };
}

export function onTokenUpdated(handler: TokenUpdatedHandler): () => void {
  tokenUpdatedHandlers.push(handler);
  return () => {
    tokenUpdatedHandlers = tokenUpdatedHandlers.filter((h) => h !== handler);
  };
}

function triggerSessionExpired(): void {
  sessionExpiredHandlers.forEach((h) => {
    try {
      h();
    } catch {
      // ignore handler error
    }
  });
}

function triggerTokenUpdated(token: string, userData?: any): void {
  tokenUpdatedHandlers.forEach((h) => {
    try {
      h(token, userData);
    } catch {
      // ignore handler error
    }
  });
}

// ============================================================
// Request Interceptor: Attach HinchMart JWT Bearer token
// ============================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();

    // Attach Bearer token if available and not already overridden
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor: Controlled HTTP 401 Recovery Coordinator
// ============================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Direct token exchange call that bypasses apiClient interceptors to avoid recursive loops.
 */
export async function syncFirebaseTokenDirectly(
  firebaseIdToken: string,
  profile?: { name?: string; phone?: string; email?: string }
): Promise<any> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/auth/sync`;
  const response = await axios.post(
    url,
    {
      firebaseIdToken,
      ...(profile?.name ? { name: profile.name } : {}),
      ...(profile?.phone ? { phone: profile.phone } : {}),
      ...(profile?.email ? { email: profile.email } : {}),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  return response.data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If there is no response or original request, reject
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // HTTP 403: Forbidden - preserve session, never logout or refresh!
    if (status === 403) {
      return Promise.reject(error);
    }

    // HTTP 401: Unauthorized - handle expired JWT recovery
    if (status === 401) {
      const url = originalRequest.url || '';
      const isAuthEndpoint =
        url.includes('/auth/sync') ||
        url.includes('/auth/login') ||
        url.includes('/auth/check-phone');

      // Never retry auth endpoints or requests that already attempted recovery
      if (originalRequest._retry || isAuthEndpoint) {
        return Promise.reject(error);
      }

      // If another recovery is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Step 1: Obtain a fresh Firebase ID Token
        const freshFirebaseToken = await firebaseAuthService.getIdToken(true);
        if (!freshFirebaseToken) {
          throw new Error('No active Firebase session available for renewal.');
        }

        // Step 2: Exchange Firebase token with backend /api/auth/sync
        const syncResponse = await syncFirebaseTokenDirectly(freshFirebaseToken);
        const data = syncResponse?.data || syncResponse;
        const newAccessToken = data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Backend sync response did not contain an accessToken.');
        }

        // Step 3: Store replacement token and notify state listeners
        tokenStorage.setAccessToken(newAccessToken);
        triggerTokenUpdated(newAccessToken, data);

        // Step 4: Resume all queued concurrent requests
        processQueue(null, newAccessToken);

        // Step 5: Retry the original request once
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (recoveryError) {
        // Recovery failed: purge invalid session and notify application
        processQueue(recoveryError, null);
        tokenStorage.clear();
        await firebaseAuthService.signOut();
        triggerSessionExpired();
        return Promise.reject(recoveryError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
