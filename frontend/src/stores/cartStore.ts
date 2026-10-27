import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SelectedProductPayload } from '@/types/product';

export interface CartItem extends SelectedProductPayload {
  cartItemId: string; // Khóa duy nhất cho từng tùy chọn món
}

interface CartStore {
  items: CartItem[];
  addItem: (payload: SelectedProductPayload) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (payload) => {
        // Tạo khóa định danh duy nhất theo productId + size + danh sách topping
        const toppingKey = payload.selectedToppings
          .map((t) => t.id)
          .sort()
          .join('-');
        const cartItemId = `${payload.productId}-${payload.size}-${toppingKey}`;

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQty = existing.quantity + payload.quantity;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              totalPrice: existing.unitPrice * newQty,
            };
            return { items: updatedItems };
          }
          return {
            items: [...state.items, { ...payload, cartItemId }],
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: 'brewlite_cart_storage',
    }
  )
);
