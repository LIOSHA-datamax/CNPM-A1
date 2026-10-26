'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  RefreshCw, 
  ChevronRight, 
  CreditCard, 
  Wallet,
  Receipt,
  Sparkles
} from 'lucide-react';

interface ToppingItem {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  size: 'S' | 'M' | 'L';
  basePrice: number;
  qty: number;
  lineTotal: number;
  toppings: ToppingItem[];
}

interface PaymentInfo {
  id: string;
  idempotencyKey: string;
  amount: number;
  method: 'E_WALLET' | 'BANK_CARD';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionRef?: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'PAYMENT_FAILED';
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  payments: PaymentInfo[];
}

// Dữ liệu mẫu dự phòng trường hợp chưa kết nối CSDL hoặc backend đang tắt
const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ord-demo-1',
    orderNumber: 'BL-1042',
    userId: 'user-customer-1',
    status: 'PAID',
    subtotal: 55000,
    discountAmount: 10000,
    total: 45000,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        productId: 'prod-cappuccino',
        productName: 'Cappuccino',
        imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
        size: 'M',
        basePrice: 45000,
        qty: 1,
        lineTotal: 55000,
        toppings: [
          { id: 'top-1', name: 'Kem cheese (Kem)', price: 10000 },
        ],
      },
    ],
    payments: [
      {
        id: 'pay-1',
        idempotencyKey: 'idem-seed-1042',
        amount: 45000,
        method: 'E_WALLET',
        status: 'SUCCESS',
        transactionRef: 'MOMO-PAY-20261026-1042',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'ord-demo-2',
    orderNumber: 'BL-1038',
    userId: 'user-customer-1',
    status: 'PREPARING',
    subtotal: 123000,
    discountAmount: 0,
    total: 123000,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      {
        id: 'item-2',
        productId: 'prod-cps',
        productName: 'Cà phê sữa',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
        size: 'M',
        basePrice: 35000,
        qty: 1,
        lineTotal: 40000,
        toppings: [{ id: 'top-2', name: 'Trân châu đen', price: 5000 }],
      },
      {
        id: 'item-3',
        productId: 'prod-td',
        productName: 'Trà đào',
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
        size: 'L',
        basePrice: 39000,
        qty: 2,
        lineTotal: 83000,
        toppings: [{ id: 'top-3', name: 'Trân châu trắng', price: 7000 }],
      },
    ],
    payments: [
      {
        id: 'pay-2',
        idempotencyKey: 'idem-seed-1038',
        amount: 123000,
        method: 'BANK_CARD',
        status: 'SUCCESS',
        transactionRef: 'VNPAY-20261026-1038',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'ord-demo-3',
    orderNumber: 'BL-1025',
    userId: 'user-customer-1',
    status: 'COMPLETED',
    subtotal: 40000,
    discountAmount: 0,
    total: 40000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      {
        id: 'item-4',
        productId: 'prod-americano',
        productName: 'Americano',
        imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600',
        size: 'M',
        basePrice: 40000,
        qty: 1,
        lineTotal: 40000,
        toppings: [],
      },
    ],
    payments: [
      {
        id: 'pay-3',
        idempotencyKey: 'idem-seed-1025',
        amount: 40000,
        method: 'E_WALLET',
        status: 'SUCCESS',
        transactionRef: 'MOMO-PAY-20261025-1025',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    try {
      const res = await fetch(`${apiUrl}/orders/me`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
        setIsLiveApi(true);
      } else {
        // Fallback demo data if db empty
        setOrders(FALLBACK_ORDERS);
        setIsLiveApi(false);
      }
    } catch {
      // Khi backend chưa bật, dùng dữ liệu demo mô phỏng để giao diện luôn chạy được
      setOrders(FALLBACK_ORDERS);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán (PAID)
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang pha chế
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" /> Mời lấy nước tại quầy
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
          </span>
        );
      case 'PAYMENT_FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Lỗi thanh toán
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Lịch sử đơn hàng
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-coffee-100 text-coffee-800">
              Task 9
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Theo dõi tiến trình xử lý từ khi thanh toán đến lúc nhận đồ uống tại quầy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${
              isLiveApi
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {isLiveApi ? 'Live API (NestJS)' : 'Mock Demo Data'}
          </span>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PAID', label: 'Đã thanh toán' },
          { key: 'PREPARING', label: 'Đang pha chế' },
          { key: 'READY', label: 'Sẵn sàng nhận' },
          { key: 'COMPLETED', label: 'Hoàn tất' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-coffee-800 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="space-y-4 mt-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-5 bg-stone-200 rounded w-1/3" />
              <div className="h-16 bg-stone-100 rounded" />
              <div className="h-4 bg-stone-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-xs mt-4">
          <div className="w-16 h-16 rounded-2xl bg-coffee-50 text-coffee-600 flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">Chưa có đơn hàng nào</h3>
          <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
            Bạn chưa có đơn hàng nào trong mục này. Hãy trải nghiệm đặt món đồ uống yêu thích nhé!
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coffee-800 text-white text-sm font-semibold hover:bg-coffee-700 transition"
            >
              Xem thực đơn <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5 mt-2">
          {filteredOrders.map((order) => {
            const primaryPayment = order.payments?.[0];
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Card Top Bar */}
                <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 tracking-tight text-base">
                          Mã đơn: #{order.orderNumber}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">
                        Đặt lúc: {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items List */}
                <div className="p-4 sm:p-5 divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-4">
                      {item.imageUrl ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-coffee-100 text-coffee-700 flex items-center justify-center flex-shrink-0">
                          <Coffee className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-stone-900 text-sm">
                            {item.productName}
                          </h4>
                          <span className="font-semibold text-stone-900 text-sm">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span className="px-2 py-0.5 rounded bg-stone-100 font-medium text-stone-700">
                            Size: {item.size}
                          </span>
                          <span>Số lượng: x{item.qty}</span>
                        </div>

                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.toppings.map((top) => (
                              <span
                                key={top.id}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                              >
                                + {top.name} ({formatPrice(top.price)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary & Payment Info */}
                <div className="p-4 sm:p-5 bg-stone-50/40 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Payment details */}
                  <div className="text-xs text-stone-600 space-y-1">
                    {primaryPayment && (
                      <div className="flex items-center gap-1.5">
                        {primaryPayment.method === 'E_WALLET' ? (
                          <Wallet className="w-3.5 h-3.5 text-pink-600" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>
                          Phương thức:{' '}
                          <strong className="text-stone-800">
                            {primaryPayment.method === 'E_WALLET' ? 'Ví điện tử (MoMo)' : 'Thẻ ngân hàng (VNPay)'}
                          </strong>
                        </span>
                        {primaryPayment.transactionRef && (
                          <span className="text-stone-400 font-mono">
                            ({primaryPayment.transactionRef})
                          </span>
                        )}
                      </div>
                    )}
                    {order.discountAmount > 0 && (
                      <div className="text-emerald-700 font-medium">
                        Giảm giá khuyến mãi: -{formatPrice(order.discountAmount)}
                      </div>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="text-xs text-stone-500">Tổng thanh toán:</span>
                    <span className="text-lg font-black text-coffee-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
