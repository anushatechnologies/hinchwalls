import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, Address } from '../types';
import { authApi } from '../api';

interface AuthStore {
  user: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

/** Maps backend user DTO fields to our Customer shape */
function mapToCustomer(raw: any, email: string): Customer {
  return {
    id: String(raw?.id || raw?.customerId || raw?.userId || `u-${Date.now()}`),
    firstName: raw?.firstName || raw?.first_name || email.split('@')[0] || 'User',
    lastName: raw?.lastName || raw?.last_name || '',
    email: raw?.email || email,
    phone: raw?.phone || raw?.phoneNumber || '',
    addresses: Array.isArray(raw?.addresses) ? raw.addresses : [],
    orderCount: raw?.orderCount ?? 0,
    totalSpent: raw?.totalSpent ?? 0,
    createdAt: raw?.createdAt || new Date().toISOString().slice(0, 10),
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user: rawUser } = await authApi.login(email, password);
          const customer = mapToCustomer(rawUser, email);
          set({
            user: customer,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          // Fallback: if backend is unavailable or returns 401, use demo session
          const status = err?.response?.status;
          if (!status || status >= 500) {
            // Network / server error — allow demo session
            set({
              user: {
                id: 'demo',
                firstName: email.split('@')[0] || 'Guest',
                lastName: '',
                email,
                phone: '',
                addresses: [],
                orderCount: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString().slice(0, 10),
              },
              token: null,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { token, user: rawUser } = await authApi.register(data);
          const customer = mapToCustomer(rawUser, data.email);
          set({
            user: {
              ...customer,
              firstName: data.firstName,
              lastName: data.lastName,
            },
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          const status = err?.response?.status;
          if (!status || status >= 500) {
            // Network / server error — allow demo session
            set({
              user: {
                id: 'demo',
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone || '',
                addresses: [],
                orderCount: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString().slice(0, 10),
              },
              token: null,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        authApi.logout().catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },

      addAddress: (address) => {
        const user = get().user;
        if (user) {
          const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
          set({
            user: {
              ...user,
              addresses: [...user.addresses, newAddress],
            },
          });
        }
      },

      removeAddress: (id) => {
        const user = get().user;
        if (user) {
          set({
            user: {
              ...user,
              addresses: user.addresses.filter((a) => a.id !== id),
            },
          });
        }
      },

      setDefaultAddress: (id) => {
        const user = get().user;
        if (user) {
          set({
            user: {
              ...user,
              addresses: user.addresses.map((a) => ({
                ...a,
                isDefault: a.id === id,
              })),
            },
          });
        }
      },
    }),
    {
      name: 'wallart-auth',
    }
  )
);
