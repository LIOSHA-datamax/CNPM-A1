import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, SelectedProductPayload, UserProfile } from './types';

// Dữ liệu khách hàng mẫu theo đề bài (hiển thị trên Navbar)
const defaultCustomer: UserProfile = {
  id: 'user-default-1',
  email: 'customer@brewlite.com',
  fullName: 'Nguyễn Văn Khách',
  role: 'CUSTOMER',
  loyaltyPoints: 100,
};

interface AppStore {
  // 1. Quản lý tài khoản (Task 7 & 10.4)
  user: UserProfile | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;

  // 2. Quản lý giỏ hàng (Task 5)
  items: CartItem[];
  addItem: (payload: SelectedProductPayload) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: defaultCustomer,
      accessToken: null,
      isLoggedIn: true,

      setAuth: (user, token) => {
        set({
          user,
          accessToken: token,
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({ user: null, accessToken: null, isLoggedIn: false });
      },

      items: [],

      addItem: (payload) => {
        const toppingKey = payload.selectedToppings
          .map((t) => t.id)
          .sort()
          .join('-');
        const cartItemId = `${payload.productId}-${payload.size}-${toppingKey}`;

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
          if (existingIndex > -1) {
            const updated = [...state.items];
            const item = updated[existingIndex];
            const newQty = item.quantity + payload.quantity;
            updated[existingIndex] = {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
            return { items: updated };
          }
          return { items: [...state.items, { ...payload, cartItemId }] };
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
          items: state.items.map((i) =>
            i.cartItemId === cartItemId
              ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, i) => total + i.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((total, i) => total + i.totalPrice, 0);
      },
    }),
    {
      name: 'brewlite_app_storage',
    }
  )
);
