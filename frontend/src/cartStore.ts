import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, SelectedProductPayload, UserProfile, OrderConfirmation } from './types';

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
  updateLoyaltyPoints: (points: number) => void;
  logout: () => void;

  // 2. Quản lý giỏ hàng (Task 5)
  items: CartItem[];
  addItem: (payload: SelectedProductPayload) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;

  // 3. Quản lý đơn hàng vừa đặt (Task 8)
  lastOrder: OrderConfirmation | null;
  setLastOrder: (order: OrderConfirmation | null) => void;
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

      updateLoyaltyPoints: (points) => {
        set((state) => ({
          user: state.user ? { ...state.user, loyaltyPoints: points } : null,
        }));
      },

      logout: () => {
        set({ user: null, accessToken: null, isLoggedIn: false });
      },

      items: [],

      // Thêm món vào giỏ hàng
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

      // Xóa món khỏi giỏ hàng
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },

      // Tăng số lượng món
      increaseQuantity: (cartItemId) => {
        const item = get().items.find((i) => i.cartItemId === cartItemId);
        if (item) {
          get().updateQuantity(cartItemId, item.quantity + 1);
        }
      },

      // Giảm số lượng món (nếu về 0 thì tự xóa món)
      decreaseQuantity: (cartItemId) => {
        const item = get().items.find((i) => i.cartItemId === cartItemId);
        if (item) {
          get().updateQuantity(cartItemId, item.quantity - 1);
        }
      },

      // Cập nhật số lượng trực tiếp
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

      // Xóa toàn bộ giỏ hàng
      clearCart: () => set({ items: [] }),

      // Tính tổng số lượng ly/món trong giỏ hàng
      getTotalItems: () => {
        return get().items.reduce((total, i) => total + i.quantity, 0);
      },

      // Tính tổng tiền giỏ hàng
      getTotalAmount: () => {
        return get().items.reduce((total, i) => total + i.totalPrice, 0);
      },

      // Quản lý đơn hàng vừa đặt thành công (Task 8)
      lastOrder: null,
      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    {
      name: 'brewlite_app_storage',
    }
  )
);
