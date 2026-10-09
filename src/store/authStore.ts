import { create } from 'zustand';
import type { Customer, Address, UserRole, SyncResponseData } from '../types';
import { authService } from '../services/authService';
import { firebaseAuthService } from '../services/firebase';
import { tokenStorage } from '../services/tokenStorage';
import { onSessionExpired, onTokenUpdated } from '../api/apiClient';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthState {
  user: Customer | null;
  accessToken: string | null;
  token: string | null; // Backwards compatible alias
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  // Lifecycle
  initAuth: () => Promise<void>;
  clearError: () => void;

  // Authentication operations
  loginWithPhone: (
    phone: string,
    recaptchaVerifier: RecaptchaVerifier
  ) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otp: string,
    optionalProfile?: { name?: string; email?: string }
  ) => Promise<{ success: boolean; isProfileComplete: boolean; role: UserRole }>;
  loginWithGoogle: () => Promise<{ success: boolean; isProfileComplete: boolean; role: UserRole }>;
  loginWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; isProfileComplete: boolean; role: UserRole }>;
  registerWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; isProfileComplete: boolean; role: UserRole }>;

  // Backwards compatibility wrappers
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;

  // Profile & Address management
  updateProfile: (data: Partial<Customer>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export function mapBackendUserToCustomer(raw: any): Customer {
  const fullName = (raw?.name || '').trim();
  const nameParts = fullName ? fullName.split(' ') : [];
  const firstName = raw?.firstName || nameParts[0] || (raw?.email ? raw.email.split('@')[0] : 'User');
  const lastName = raw?.lastName || nameParts.slice(1).join(' ') || '';
  const userId = raw?.userId || raw?.id || raw?.customerId || 0;

  return {
    id: String(userId),
    userId: userId,
    firebaseUid: raw?.firebaseUid || '',
    firstName,
    lastName,
    name: fullName || `${firstName} ${lastName}`.trim(),
    email: raw?.email || '',
    phone: raw?.phone || raw?.phoneNumber || '',
    role: (raw?.role || 'CUSTOMER') as UserRole,
    sellerId: raw?.sellerId ?? null,
    isProfileComplete: raw?.isProfileComplete ?? true,
    addresses: Array.isArray(raw?.addresses) ? raw.addresses : [],
    orderCount: Number(raw?.orderCount ?? 0),
    totalSpent: Number(raw?.totalSpent ?? 0),
    createdAt: raw?.createdAt || new Date().toISOString().slice(0, 10),
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for background token updates from 401 recovery
  onTokenUpdated((newToken, userData) => {
    set({
      accessToken: newToken,
      token: newToken,
      ...(userData ? { user: mapBackendUserToCustomer(userData), isAuthenticated: true } : {}),
    });
  });

  // Listen for session expiry from failed 401 recovery
  onSessionExpired(() => {
    set({
      user: null,
      accessToken: null,
      token: null,
      isAuthenticated: false,
      error: 'Your session has expired. Please sign in again.',
    });
  });

  return {
    user: null,
    accessToken: tokenStorage.getAccessToken(),
    token: tokenStorage.getAccessToken(),
    isAuthenticated: tokenStorage.hasAccessToken(),
    isInitializing: true,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Session Initialization & Restoration
     * Restores session on page reload using current token or Firebase ID Token exchange.
     */
    initAuth: async () => {
      set({ isInitializing: true });
      const storedToken = tokenStorage.getAccessToken();

      try {
        if (storedToken) {
          // Verify token against /api/auth/me
          const meData = await authService.getCurrentUser();
          const customer = mapBackendUserToCustomer(meData);
          set({
            user: customer,
            accessToken: storedToken,
            token: storedToken,
            isAuthenticated: true,
            isInitializing: false,
          });
          return;
        }

        // If no HinchMart token stored, check if there is an active Firebase session
        const freshFirebaseToken = await firebaseAuthService.getIdToken(false);
        if (freshFirebaseToken) {
          const syncData = await authService.syncWithBackend(freshFirebaseToken);
          const customer = mapBackendUserToCustomer(syncData);
          set({
            user: customer,
            accessToken: syncData.accessToken,
            token: syncData.accessToken,
            isAuthenticated: true,
            isInitializing: false,
          });
          return;
        }

        // No active session
        set({
          user: null,
          accessToken: null,
          token: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      } catch (err: any) {
        // If restoring token failed, clear invalid state
        tokenStorage.clear();
        set({
          user: null,
          accessToken: null,
          token: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    },

    /**
     * Step 1 for Phone Login: Send OTP
     */
    loginWithPhone: async (phone: string, recaptchaVerifier: RecaptchaVerifier) => {
      set({ isLoading: true, error: null });
      try {
        // Pre-check phone number status optionally with backend
        await authService.checkPhone(phone);

        // Request OTP via Firebase
        const confirmationResult = await firebaseAuthService.sendPhoneOtp(phone, recaptchaVerifier);
        set({ isLoading: false });
        return confirmationResult;
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Failed to send OTP.' });
        throw err;
      }
    },

    /**
     * Step 2 for Phone Login: Verify OTP and Sync with Backend
     */
    verifyPhoneOtp: async (confirmationResult, otp, optionalProfile) => {
      set({ isLoading: true, error: null });
      try {
        // Verify OTP with Firebase
        const { user: fbUser, idToken } = await firebaseAuthService.verifyOtp(confirmationResult, otp);

        // Exchange Firebase ID Token with HinchMart Backend
        const syncData: SyncResponseData = await authService.syncWithBackend(idToken, {
          phone: fbUser.phoneNumber || undefined,
          name: optionalProfile?.name,
          email: optionalProfile?.email,
        });

        const customer = mapBackendUserToCustomer(syncData);
        set({
          user: customer,
          accessToken: syncData.accessToken,
          token: syncData.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          isProfileComplete: syncData.isProfileComplete,
          role: syncData.role,
        };
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Verification failed.' });
        throw err;
      }
    },

    /**
     * Google Sign-In and Sync with Backend
     */
    loginWithGoogle: async () => {
      set({ isLoading: true, error: null });
      try {
        const { user: fbUser, idToken } = await firebaseAuthService.signInWithGoogle();

        const syncData: SyncResponseData = await authService.syncWithBackend(idToken, {
          name: fbUser.displayName || undefined,
          email: fbUser.email || undefined,
          phone: fbUser.phoneNumber || undefined,
        });

        const customer = mapBackendUserToCustomer(syncData);
        set({
          user: customer,
          accessToken: syncData.accessToken,
          token: syncData.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          isProfileComplete: syncData.isProfileComplete,
          role: syncData.role,
        };
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Google sign-in failed.' });
        throw err;
      }
    },

    /**
     * Email/Password Sign-In and Sync with Backend
     */
    loginWithEmail: async (email: string, pass: string) => {
      set({ isLoading: true, error: null });
      try {
        const { user: fbUser, idToken } = await firebaseAuthService.signInWithEmail(email, pass);

        const syncData: SyncResponseData = await authService.syncWithBackend(idToken, {
          email: fbUser.email || email,
        });

        const customer = mapBackendUserToCustomer(syncData);
        set({
          user: customer,
          accessToken: syncData.accessToken,
          token: syncData.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          isProfileComplete: syncData.isProfileComplete,
          role: syncData.role,
        };
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Email sign-in failed.' });
        throw err;
      }
    },

    /**
     * Email/Password Registration and Sync with Backend
     */
    registerWithEmail: async (email: string, pass: string, name?: string) => {
      set({ isLoading: true, error: null });
      try {
        const { user: fbUser, idToken } = await firebaseAuthService.signUpWithEmail(email, pass, name);

        const syncData: SyncResponseData = await authService.syncWithBackend(idToken, {
          name: name || undefined,
          email: fbUser.email || email,
        });

        const customer = mapBackendUserToCustomer(syncData);
        set({
          user: customer,
          accessToken: syncData.accessToken,
          token: syncData.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          isProfileComplete: syncData.isProfileComplete,
          role: syncData.role,
        };
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Registration failed.' });
        throw err;
      }
    },

    /**
     * Backwards-compatible login
     */
    login: async (email: string, password: string) => {
      try {
        const res = await get().loginWithEmail(email, password);
        return res.success;
      } catch {
        return false;
      }
    },

    /**
     * Backwards-compatible register
     */
    register: async (data: RegisterData) => {
      try {
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        const res = await get().registerWithEmail(data.email, data.password, fullName);
        return res.success;
      } catch {
        return false;
      }
    },

    /**
     * Full secure logout: clear backend session, sign out of Firebase, reset caches
     */
    logout: async () => {
      set({ isLoading: true });
      try {
        await authService.logout();
      } finally {
        tokenStorage.clear();
        set({
          user: null,
          accessToken: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    updateProfile: (data: Partial<Customer>) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...data } });
      }
    },

    addAddress: (address: Omit<Address, 'id'>) => {
      const currentUser = get().user;
      if (currentUser) {
        const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
        set({
          user: {
            ...currentUser,
            addresses: [...currentUser.addresses, newAddress],
          },
        });
      }
    },

    removeAddress: (id: string) => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            addresses: currentUser.addresses.filter((a) => a.id !== id),
          },
        });
      }
    },

    setDefaultAddress: (id: string) => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            addresses: currentUser.addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          },
        });
      }
    },
  };
});
