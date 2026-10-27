import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'BARISTA' | 'ADMIN';
  loyaltyPoints: number;
}

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: UserProfile | null, token?: string | null) => void;
  updateLoyaltyPoints: (points: number) => void;
  logout: () => void;
}

// Khởi tạo tài khoản mẫu chuẩn theo seed đề bài (khớp hình ảnh người dùng)
const defaultCustomer: UserProfile = {
  id: 'user-default-1',
  email: 'customer@brewlite.com',
  fullName: 'Nguyễn Văn Khách',
  role: 'CUSTOMER',
  loyaltyPoints: 121, // 121 điểm tích lũy đúng như thiết kế
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: defaultCustomer,
      token: 'sample-jwt-token-brewlite',
      isLoggedIn: true,

      setUser: (user, token = null) => {
        set({ user, token, isLoggedIn: !!user });
      },

      updateLoyaltyPoints: (points) => {
        set((state) => ({
          user: state.user ? { ...state.user, loyaltyPoints: points } : null,
        }));
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: 'brewlite_auth_storage',
    }
  )
);
