import apiClient, { syncFirebaseTokenDirectly } from '../api/apiClient';
import { tokenStorage } from './tokenStorage';
import { firebaseAuthService } from './firebase';
import type { SyncResponseData, SyncRequest, CheckPhoneResponse } from '../types';

export const authService = {
  /**
   * API 1: Check Phone
   * GET /api/auth/check-phone?phone=%2B919876543210
   */
  async checkPhone(phone: string): Promise<{ exists: boolean }> {
    try {
      const res = await apiClient.get<any>('/auth/check-phone', {
        params: { phone },
      });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      return { exists: Boolean(data?.exists) };
    } catch (err: any) {
      // Non-blocking error handling: do not halt registration/login if check endpoint fails
      return { exists: false };
    }
  },

  /**
   * API 2: Synchronize User and Exchange Tokens
   * POST /api/auth/sync
   * Body: { firebaseIdToken, name?, phone?, email? }
   */
  async syncWithBackend(
    firebaseIdToken: string,
    profile?: { name?: string; phone?: string; email?: string }
  ): Promise<SyncResponseData> {
    if (!firebaseIdToken) {
      throw new Error('Firebase ID Token is required for backend synchronization.');
    }

    const payload: SyncRequest = {
      firebaseIdToken,
      ...(profile?.name ? { name: profile.name } : {}),
      ...(profile?.phone ? { phone: profile.phone } : {}),
      ...(profile?.email ? { email: profile.email } : {}),
    };

    const res = await syncFirebaseTokenDirectly(payload.firebaseIdToken, profile);
    const data: SyncResponseData = res?.data !== undefined ? res.data : res;

    if (!data?.accessToken) {
      throw new Error('Backend response did not include a valid HinchMart access token.');
    }

    // Save token in centralized session storage
    tokenStorage.setAccessToken(data.accessToken);

    return data;
  },

  /**
   * API 3: Current User Profile
   * GET /api/auth/me
   * Authorization: Bearer <HINCHMART_JWT>
   */
  async getCurrentUser(): Promise<any> {
    const res = await apiClient.get<any>('/auth/me');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * API 4: Refresh Token
   * POST /api/auth/refresh-token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const res = await apiClient.post<any>('/auth/refresh-token');
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    if (data?.accessToken) {
      tokenStorage.setAccessToken(data.accessToken);
    }
    return data;
  },

  /**
   * API 5: Logout
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore backend logout network error; local logout still occurs
    } finally {
      tokenStorage.clear();
      await firebaseAuthService.signOut();
    }
  },

  /**
   * API 6: Admin Claim
   * POST /api/auth/claim-admin
   */
  async claimAdmin(): Promise<any> {
    const res = await apiClient.post<any>('/auth/claim-admin');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  /**
   * Full session recovery flow (used on reload or 401).
   * Coalesces concurrent calls into a single in-flight operation.
   */
  async recoverSession(): Promise<SyncResponseData | null> {
    if (activeRecoveryPromise) {
      return activeRecoveryPromise;
    }

    activeRecoveryPromise = (async () => {
      try {
        const freshFirebaseToken = await firebaseAuthService.getIdToken(true);
        if (!freshFirebaseToken) {
          return null;
        }
        return await this.syncWithBackend(freshFirebaseToken);
      } finally {
        activeRecoveryPromise = null;
      }
    })();

    return activeRecoveryPromise;
  },
};

let activeRecoveryPromise: Promise<SyncResponseData | null> | null = null;
