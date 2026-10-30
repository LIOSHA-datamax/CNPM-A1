import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CartItem,
  SelectedProductPayload,
  UserProfile,
  OrderConfirmation,
  PaymentMethodType,
} from './types';

export interface CheckoutPaymentParams {
  orderId: string;
  paymentMethod: PaymentMethodType;
  providerName: string;
  simulateFailure: boolean;
  notes?: string;
}

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
      user: null,
      accessToken: null,
      isLoggedIn: false,

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
        set({
          user: null,
          accessToken: null,
          isLoggedIn: false,
          items: [],
          lastOrder: null,
        });
      },

      items: [],

      // Thêm món vào giỏ hàng (Chỉ cho phép khi đã đăng nhập)
      addItem: (payload) => {
        const { isLoggedIn } = get();
        if (!isLoggedIn) {
          return;
        }
        const toppingKey = payload.selectedToppings
          .map((t) => t.id)
          .sort()
          .join('-');
        const cartItemId = `${payload.productId}-${payload.size}-${toppingKey}`;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.cartItemId === cartItemId
          );
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
        const { isLoggedIn, items } = get();
        if (!isLoggedIn) return 0;
        return items.reduce((total, i) => total + i.quantity, 0);
      },

      // Tính tổng tiền giỏ hàng
      getTotalAmount: () => {
        const { isLoggedIn, items } = get();
        if (!isLoggedIn) return 0;
        return items.reduce((total, i) => total + i.totalPrice, 0);
      },

      // Quản lý đơn hàng vừa đặt thành công (Task 8)
      lastOrder: null,
      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    {
      name: 'brewlite_app_storage',
      onRehydrateStorage: () => (state) => {
        if (
          state?.user?.email === 'barista@brewlite.com' &&
          state?.user?.fullName !== 'Nguyễn Văn A'
        ) {
          state.user.fullName = 'Nguyễn Văn A';
        }
      },
    }
  )
);

// Hàm xử lý thanh toán dùng chung cho cả CheckoutModal và CheckoutPage (Task 8)
export async function executeCheckoutPayment(
  params: CheckoutPaymentParams
): Promise<OrderConfirmation> {
  const {
    items,
    getTotalAmount,
    clearCart,
    user,
    accessToken,
    isLoggedIn,
    updateLoyaltyPoints,
    setLastOrder,
  } = useAppStore.getState();

  const totalAmount = getTotalAmount();

  if (!isLoggedIn || !accessToken || !user) {
    throw new Error(
      'Vui lòng đăng nhập tài khoản trên thanh menu trước khi xác nhận thanh toán! Giỏ hàng của bạn được bảo lưu nguyên vẹn.'
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // 1. Tạo đơn hàng PENDING qua POST /orders (Task 6)
  let actualOrderId = params.orderId;
  let backendOrder: any = null;

  try {
    const orderPayload = {
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        qty: i.quantity,
        toppingIds: i.selectedToppings?.map((t) => t.id) || [],
      })),
      notes: params.notes || undefined,
    };

    const createOrderRes = await fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-user-id': user.id,
      },
      body: JSON.stringify(orderPayload),
    });

    if (createOrderRes.ok) {
      backendOrder = await createOrderRes.json();
      actualOrderId = backendOrder.id;
    } else {
      const errData = await createOrderRes.json().catch(() => null);
      if (errData?.message) {
        throw new Error(
          Array.isArray(errData.message)
            ? errData.message.join(', ')
            : errData.message
        );
      }
    }
  } catch (err: any) {
    if (err?.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  let res: Response;

  try {
    res = await fetch(`${apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': `brewlite-idem-${Date.now()}`,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        orderId: actualOrderId,
        method: params.paymentMethod,
        amount: backendOrder ? Number(backendOrder.total) : totalAmount,
        simulateFailure: params.simulateFailure,
        notes: params.notes,
      }),
    });
  } catch {
    throw new Error(
      'Không thể kết nối tới máy chủ thanh toán. Vui lòng kiểm tra kết nối mạng và thử lại! Giỏ hàng của bạn được bảo lưu nguyên vẹn.'
    );
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const serverMsg = Array.isArray(errData?.message)
      ? errData.message.join(', ')
      : errData?.message ||
        `Giao dịch bị từ chối bởi máy chủ (HTTP ${res.status})`;
    throw new Error(serverMsg);
  }

  const data = await res.json();

  if (data.status === 'FAILED' || params.simulateFailure) {
    throw new Error(
      'Giao dịch bị từ chối bởi ngân hàng phát hành (Mã: 51 - Số dư không đủ hoặc thẻ bị khóa). Giỏ hàng của bạn được bảo lưu nguyên vẹn!'
    );
  }

  if (typeof data.loyaltyPoints === 'number') {
    updateLoyaltyPoints(data.loyaltyPoints);
  }

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = backendOrder?.orderNumber || (data.order?.orderNumber
    ? data.order.orderNumber.startsWith('#')
      ? data.order.orderNumber
      : `#${data.order.orderNumber}`
    : `#ORD-${randomSuffix}`);
  const transactionId =
    data.transactionRef || `TXN-${Date.now().toString().slice(-8)}`;

  const completedOrder: OrderConfirmation = {
    orderId: actualOrderId,
    orderNumber,
    items: [...items],
    subtotal: totalAmount,
    discount: 0,
    totalAmount: backendOrder ? Number(backendOrder.total) : totalAmount,
    paymentMethod: params.paymentMethod,
    paymentProviderName: params.providerName,
    status: 'PAID',
    transactionId,
    createdAt: new Date().toISOString(),
    customerName: user.fullName || 'Khách hàng',
    customerEmail: user.email,
    notes: params.notes || undefined,
  };

  clearCart();
  setLastOrder(completedOrder);
  return completedOrder;
}
