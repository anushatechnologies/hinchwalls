import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggle: (product: Product) => boolean; // returns true if added, false if removed
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set((state) => ({ items: [...state.items, product] }));
        }
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((p) => p.id !== productId) }));
      },

      isInWishlist: (productId) => {
        return get().items.some((p) => p.id === productId);
      },

      toggle: (product) => {
        const isIn = get().isInWishlist(product.id);
        if (isIn) {
          get().removeItem(product.id);
          return false;
        } else {
          get().addItem(product);
          return true;
        }
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: 'wallart-wishlist',
    }
  )
);
