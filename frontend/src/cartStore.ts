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
  customItems?: (CartItem | SelectedProductPayload)[];
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
    items: cartItems,
    getTotalAmount,
    clearCart,
    user,
    accessToken,
    isLoggedIn,
    updateLoyaltyPoints,
    setLastOrder,
  } = useAppStore.getState();

  const isDirectBuy = Boolean(params.customItems && params.customItems.length > 0);

  const activeItems: CartItem[] = isDirectBuy
    ? params.customItems!.map((item, idx) => ({
        ...item,
        cartItemId: (item as CartItem).cartItemId || `direct-${item.productId}-${Date.now()}-${idx}`,
      }))
    : cartItems;

  const totalAmount = isDirectBuy
    ? activeItems.reduce((sum, i) => sum + i.totalPrice, 0)
    : getTotalAmount();

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
    const PRODUCT_FALLBACK_MAP: Record<string, string> = {
      'prod-1': '79547677-67f7-4d76-a1d7-672c4ffe01b6', // Cà phê sữa
      'prod-2': '1a271418-ba4f-4eb4-b5c3-47cb9960978a', // Americano
      'prod-3': '6e43857f-76ae-49a8-ac91-63a9f7385584', // Cappuccino
      'prod-4': 'eef59179-2894-444f-b918-3914f1c6feb1', // Trà đào
      'prod-5': 'b8178129-923f-4e0a-bf47-9755b76cfca1', // Cold Brew
      'prod-6': '9c03792f-b472-4638-a28a-773df4559eb2', // Matcha Latte
    };

    const TOPPING_FALLBACK_MAP: Record<string, string> = {
      'top-1': 'cc3b5884-8677-4d55-a6e9-7c28f858fb8d', // Trân châu đen
      'top-2': '87500eb8-ff0b-49f9-bcc8-b7c07b5aee8c', // Trân châu trắng
      'top-3': '26a1e2d0-04a7-4725-be5c-2adfb0567fb4', // Kem cheese
      'top-4': '4221a337-2125-4f53-b95a-f74316fb18d9', // Thạch cà phê
    };

    const orderPayload = {
      items: activeItems.map((i) => ({
        productId: PRODUCT_FALLBACK_MAP[i.productId] || i.productId,
        size: i.size,
        qty: i.quantity,
        toppingIds:
          i.selectedToppings?.map((t) => TOPPING_FALLBACK_MAP[t.id] || t.id) || [],
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
    items: [...activeItems],
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

  if (!isDirectBuy) {
    clearCart();
  }
  setLastOrder(completedOrder);
  return completedOrder;
}
