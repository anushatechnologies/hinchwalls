import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductSize, ProductColor } from '../types';
import { cartApi } from '../api';
import { useAuthStore } from './authStore';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, options?: {
    size?: ProductSize;
    color?: ProductColor;
    quantity?: number;
    customText?: string;
  }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  syncWithBackend: () => Promise<void>;
  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const VALID_COUPONS: Record<string, number> = {
  'SAVE10': 10,
  'SAVE20': 20,
  'WALLART15': 15,
  'WELCOME': 10,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,

      syncWithBackend: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        try {
          const serverCart = await cartApi.get(token);
          if (serverCart && Array.isArray(serverCart.items) && serverCart.items.length > 0) {
            // Merge or update if server has items
            if (serverCart.couponDiscount) {
              set({ couponDiscount: serverCart.couponDiscount });
            }
          }
        } catch {
          // ignore background sync error
        }
      },

      addItem: (product, options = {}) => {
        const { size, color, quantity = 1, customText } = options;
        const itemId = `${product.id}-${size?.value || 'default'}-${color?.id || 'default'}-${customText || ''}`;
        const unitPrice = product.price + (size?.priceModifier || 0);

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === itemId);
          if (existingIndex >= 0) {
            const items = [...state.items];
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: items[existingIndex].quantity + quantity,
              totalPrice: unitPrice * (items[existingIndex].quantity + quantity),
            };
            return { items };
          }
          return {
            items: [
              ...state.items,
              {
                id: itemId,
                productId: product.id,
                product,
                quantity,
                selectedSize: size,
                selectedColor: color,
                customText,
                unitPrice,
                totalPrice: unitPrice * quantity,
              },
            ],
          };
        });

        // Fire-and-forget backend sync if authenticated
        const token = useAuthStore.getState().token;
        const prodNumericId = Number(product.productId || product.id);
        if (token && !isNaN(prodNumericId)) {
          cartApi.addItem({ productId: prodNumericId, quantity }, token).catch(() => {});
        }
      },

      removeItem: (itemId) => {
        const target = get().items.find((i) => i.id === itemId);
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));

        const token = useAuthStore.getState().token;
        const prodNumericId = target ? Number(target.product?.productId || target.productId || target.id) : NaN;
        if (token && !isNaN(prodNumericId)) {
          cartApi.removeItem(prodNumericId, token).catch(() => {});
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
              : i
          ),
        }));

        const target = get().items.find((i) => i.id === itemId);
        const token = useAuthStore.getState().token;
        const prodNumericId = target ? Number(target.product?.productId || target.productId || target.id) : NaN;
        if (token && !isNaN(prodNumericId)) {
          cartApi.updateQuantity(prodNumericId, quantity, token).catch(() => {});
        }
      },

      clearCart: () => {
        set({ items: [], couponCode: null, couponDiscount: 0 });
        const token = useAuthStore.getState().token;
        if (token) {
          cartApi.clear(token).catch(() => {});
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      applyCoupon: async (code) => {
        const cleanCode = code.trim().toUpperCase();
        const token = useAuthStore.getState().token;

        // Try backend coupon validation first if online
        try {
          const res = await cartApi.applyCoupon(cleanCode, token || undefined);
          if (res) {
            // calculate discount percent
            const subtotal = get().getSubtotal();
            const pct = res.discountAmount && subtotal > 0
              ? Math.min(100, Math.round((res.discountAmount / subtotal) * 100))
              : 10;
            set({ couponCode: cleanCode, couponDiscount: pct || 10 });
            return true;
          }
        } catch {
          // fallback to client-side coupons
        }

        const localDiscount = VALID_COUPONS[cleanCode];
        if (localDiscount) {
          set({ couponCode: cleanCode, couponDiscount: localDiscount });
          return true;
        }
        return false;
      },

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.totalPrice, 0),

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 200 ? 0 : 9.99;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const couponDiscount = get().couponDiscount;
        const discountAmount = (subtotal * couponDiscount) / 100;
        return parseFloat(((subtotal - discountAmount) * 0.08).toFixed(2));
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const couponDiscount = get().couponDiscount;
        const discountAmount = (subtotal * couponDiscount) / 100;
        const shipping = get().getShipping();
        const tax = get().getTax();
        return parseFloat((subtotal - discountAmount + shipping + tax).toFixed(2));
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'wallart-cart',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);
