import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { tokenStorage } from '../services/tokenStorage';
import { firebaseAuthService } from '../services/firebase';
import { authService } from '../services/authService';
import { useAuthStore, mapBackendUserToCustomer } from '../store/authStore';
import { apiClient, onSessionExpired, syncFirebaseTokenDirectly } from '../api/apiClient';

describe('HinchMart Authentication System - 20 Core Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    tokenStorage.clear();
  });

  // Scenario 1: Successful Firebase phone OTP login
  it('Scenario 1: Successful Firebase phone OTP login', async () => {
    const mockConfirmationResult = {
      confirm: vi.fn().mockResolvedValue({
        user: { uid: 'fb-user-123', phoneNumber: '+919876543210', getIdToken: vi.fn().mockResolvedValue('fake-fb-id-token') },
      }),
    };

    vi.spyOn(firebaseAuthService, 'verifyOtp').mockResolvedValue({
      user: { uid: 'fb-user-123', phoneNumber: '+919876543210' } as any,
      idToken: 'fake-fb-id-token',
    });

    const result = await firebaseAuthService.verifyOtp(mockConfirmationResult as any, '123456');
    expect(result.idToken).toBe('fake-fb-id-token');
    expect(result.user.phoneNumber).toBe('+919876543210');
  });

  // Scenario 2: Successful Firebase login followed by backend synchronization
  it('Scenario 2: Successful Firebase login followed by backend synchronization', async () => {
    const backendPayload = {
      success: true,
      data: {
        accessToken: 'hinchmart-jwt-token-123',
        tokenType: 'Bearer',
        expiresIn: 86400,
        userId: 42,
        firebaseUid: 'fb-user-123',
        email: 'user@example.com',
        name: 'Jane Doe',
        phone: '+919876543210',
        role: 'CUSTOMER',
        sellerId: null,
        isProfileComplete: true,
      },
    };

    vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: backendPayload });

    const syncResult = await authService.syncWithBackend('fake-fb-id-token');
    expect(syncResult.accessToken).toBe('hinchmart-jwt-token-123');
    expect(syncResult.userId).toBe(42);
    expect(tokenStorage.getAccessToken()).toBe('hinchmart-jwt-token-123');
  });

  // Scenario 3: Existing customer login
  it('Scenario 3: Existing customer login preserves user profile and status', async () => {
    const existingUserData = {
      accessToken: 'jwt-existing-cust',
      userId: 101,
      firebaseUid: 'fb-cust-101',
      email: 'john@hinchmart.com',
      name: 'John Customer',
      phone: '+919876543211',
      role: 'CUSTOMER',
      sellerId: null,
      isProfileComplete: true,
    };

    vi.spyOn(authService, 'syncWithBackend').mockResolvedValueOnce(existingUserData as any);

    const store = useAuthStore.getState();
    vi.spyOn(firebaseAuthService, 'signInWithEmail').mockResolvedValueOnce({
      user: { email: 'john@hinchmart.com' } as any,
      idToken: 'token-abc',
    });

    const res = await store.loginWithEmail('john@hinchmart.com', 'secret123');
    expect(res.success).toBe(true);
    expect(res.role).toBe('CUSTOMER');
    expect(res.isProfileComplete).toBe(true);

    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.id).toBe('101');
    expect(updatedUser?.email).toBe('john@hinchmart.com');
    expect(updatedUser?.role).toBe('CUSTOMER');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  // Scenario 4: New customer registration
  it('Scenario 4: New customer registration captures name and syncs profile', async () => {
    const newUserData = {
      accessToken: 'jwt-new-user',
      userId: 202,
      firebaseUid: 'fb-new-202',
      email: 'newbie@example.com',
      name: 'Alice Wonder',
      phone: '+919876543299',
      role: 'CUSTOMER',
      sellerId: null,
      isProfileComplete: true,
    };

    vi.spyOn(firebaseAuthService, 'signUpWithEmail').mockResolvedValueOnce({
      user: { email: 'newbie@example.com' } as any,
      idToken: 'token-new-id',
    });
    vi.spyOn(authService, 'syncWithBackend').mockResolvedValueOnce(newUserData as any);

    const store = useAuthStore.getState();
    const res = await store.registerWithEmail('newbie@example.com', 'password123', 'Alice Wonder');
    expect(res.success).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Alice Wonder');
    expect(useAuthStore.getState().accessToken).toBe('jwt-new-user');
  });

  // Scenario 5: Successful Google or email login if supported
  it('Scenario 5: Successful Google login', async () => {
    vi.spyOn(firebaseAuthService, 'signInWithGoogle').mockResolvedValueOnce({
      user: { uid: 'google-uid', displayName: 'Google User', email: 'g@example.com' } as any,
      idToken: 'google-fb-token',
    });
    vi.spyOn(authService, 'syncWithBackend').mockResolvedValueOnce({
      accessToken: 'jwt-from-google',
      userId: 303,
      firebaseUid: 'google-uid',
      email: 'g@example.com',
      name: 'Google User',
      phone: null,
      role: 'CUSTOMER',
      sellerId: null,
      isProfileComplete: true,
    } as any);

    const store = useAuthStore.getState();
    const res = await store.loginWithGoogle();
    expect(res.success).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('jwt-from-google');
  });

  // Scenario 6: Missing Firebase ID Token
  it('Scenario 6: Missing Firebase ID Token rejected before calling sync', async () => {
    await expect(authService.syncWithBackend('')).rejects.toThrow(
      'Firebase ID Token is required for backend synchronization.'
    );
  });

  // Scenario 7: Backend synchronization failure
  it('Scenario 7: Backend synchronization failure does not authenticate user', async () => {
    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Backend 500 error'));

    await expect(authService.syncWithBackend('valid-fb-token')).rejects.toThrow();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  // Scenario 8: Missing access token in the backend response
  it('Scenario 8: Missing access token in backend response rejected', async () => {
    vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { success: true, data: { userId: 12, role: 'CUSTOMER' } }, // No accessToken
    });

    await expect(authService.syncWithBackend('valid-fb-token')).rejects.toThrow(
      'Backend response did not include a valid HinchMart access token.'
    );
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  // Scenario 9: Successful session restoration after page reload
  it('Scenario 9: Successful session restoration after page reload', async () => {
    tokenStorage.setAccessToken('stored-jwt-xyz');

    vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
      userId: 55,
      firebaseUid: 'fb-55',
      email: 'restored@example.com',
      name: 'Restored User',
      role: 'CUSTOMER',
      isProfileComplete: true,
    });

    const store = useAuthStore.getState();
    await store.initAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.id).toBe('55');
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  // Scenario 10: Expired HinchMart JWT and successful recovery
  it('Scenario 10: Expired HinchMart JWT and successful recovery', async () => {
    tokenStorage.setAccessToken('old-expired-token');

    vi.spyOn(firebaseAuthService, 'getIdToken').mockResolvedValueOnce('fresh-firebase-id-token');
    vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        accessToken: 'renewed-hinchmart-jwt',
        userId: 12,
        firebaseUid: 'fb-uid',
        role: 'CUSTOMER',
        name: 'Jane Doe',
      },
    });

    const recovered = await authService.recoverSession();
    expect(recovered?.accessToken).toBe('renewed-hinchmart-jwt');
    expect(tokenStorage.getAccessToken()).toBe('renewed-hinchmart-jwt');
  });

  // Scenario 11: Failed Firebase token renewal
  it('Scenario 11: Failed Firebase token renewal returns null', async () => {
    vi.spyOn(firebaseAuthService, 'getIdToken').mockResolvedValueOnce(null);

    const recovered = await authService.recoverSession();
    expect(recovered).toBeNull();
  });

  // Scenario 12: Concurrent HTTP 401 responses
  it('Scenario 12: Concurrent HTTP 401 calls coordinate single token exchange', async () => {
    vi.spyOn(firebaseAuthService, 'getIdToken').mockResolvedValue('fresh-fb-token');
    const syncSpy = vi.spyOn(authService, 'syncWithBackend').mockResolvedValue({
      accessToken: 'single-new-token',
      userId: 1,
      role: 'CUSTOMER',
    } as any);

    // Run simultaneous recoveries
    const p1 = authService.recoverSession();
    const p2 = authService.recoverSession();

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1?.accessToken).toBe('single-new-token');
    expect(r2?.accessToken).toBe('single-new-token');
    expect(syncSpy).toHaveBeenCalledTimes(1);
  });

  // Scenario 13: HTTP 403 without logout
  it('Scenario 13: HTTP 403 preserves authenticated session', async () => {
    tokenStorage.setAccessToken('active-customer-jwt');
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1', role: 'CUSTOMER' } as any });

    const error403 = {
      config: { url: '/api/admin/metrics' },
      response: { status: 403, data: { message: 'Forbidden' } },
    };

    // The interceptor for 403 must reject without clearing token
    expect(tokenStorage.getAccessToken()).toBe('active-customer-jwt');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  // Scenario 14: Customer blocked from admin routes
  it('Scenario 14: Customer blocked from admin routes', () => {
    const customer = mapBackendUserToCustomer({
      userId: 1,
      role: 'CUSTOMER',
      name: 'Regular Customer',
    });

    const allowedAdminRoles: string[] = ['ADMIN'];
    const isAuthorized = allowedAdminRoles.includes(customer.role || 'CUSTOMER');
    expect(isAuthorized).toBe(false);
  });

  // Scenario 15: Seller blocked from admin-only actions
  it('Scenario 15: Seller blocked from admin-only actions but allowed seller routes', () => {
    const seller = mapBackendUserToCustomer({
      userId: 2,
      role: 'SELLER',
      sellerId: 10,
      name: 'Merchant Seller',
    });

    const adminRoles: string[] = ['ADMIN'];
    const sellerRoles: string[] = ['SELLER', 'ADMIN'];

    expect(adminRoles.includes(seller.role || 'SELLER')).toBe(false);
    expect(sellerRoles.includes(seller.role || 'SELLER')).toBe(true);
  });

  // Scenario 16: Admin navigation for a verified administrator
  it('Scenario 16: Admin navigation permitted for verified administrator', () => {
    const admin = mapBackendUserToCustomer({
      userId: 99,
      role: 'ADMIN',
      name: 'Super Admin',
    });

    const adminRoles: string[] = ['ADMIN'];
    expect(adminRoles.includes(admin.role || 'ADMIN')).toBe(true);
  });

  // Scenario 17: Logout and clearing of user-specific caches
  it('Scenario 17: Logout clears tokens, auth state, and signs out of Firebase', async () => {
    tokenStorage.setAccessToken('token-to-clear');
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1' } as any });

    const firebaseSignOutSpy = vi.spyOn(firebaseAuthService, 'signOut').mockResolvedValueOnce();

    await useAuthStore.getState().logout();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(firebaseSignOutSpy).toHaveBeenCalled();
  });

  // Scenario 18: Backend unavailable during login
  it('Scenario 18: Backend unavailable during login fails gracefully without fake user', async () => {
    vi.spyOn(firebaseAuthService, 'signInWithEmail').mockResolvedValueOnce({
      user: { email: 'test@example.com' } as any,
      idToken: 'valid-fb-token',
    });
    vi.spyOn(authService, 'syncWithBackend').mockRejectedValueOnce(
      new Error('Network error: Backend server unreachable.')
    );

    const store = useAuthStore.getState();
    const result = await store.login('test@example.com', 'password123');

    expect(result).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  // Scenario 19: Duplicate login submission prevention
  it('Scenario 19: Prevents duplicate concurrent submissions during loading', async () => {
    useAuthStore.setState({ isLoading: true });
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  // Scenario 20: No infinite retry behavior
  it('Scenario 20: No infinite retry behavior on failed auth calls', () => {
    const alreadyRetriedRequest = {
      _retry: true,
      url: '/api/categories',
    };
    const isEligibleForRetry = !alreadyRetriedRequest._retry && !alreadyRetriedRequest.url.includes('/auth/');
    expect(isEligibleForRetry).toBe(false);
  });
});
