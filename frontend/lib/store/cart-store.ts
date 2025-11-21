import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceUSD?: number | string | null;
    priceMNs?: number | string | null;
    images: string[];
  };
  productVariant?: {
    id: string;
    name: string;
    priceUSD?: number | string | null;
    priceMNs?: number | string | null;
  } | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  setCart: (items: CartItem[], subtotal: number, total: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      total: 0,
      setCart: (items, subtotal, total) => {
        set({ items, subtotal, total });
      },
      clearCart: () => {
        set({ items: [], subtotal: 0, total: 0 });
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      fetchCart: async () => {
        try {
          const response = await api.get('/cart');
          const cart = response.data;
          set({
            items: cart.items || [],
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
          });
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

