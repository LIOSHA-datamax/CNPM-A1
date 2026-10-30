'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { useAppStore } from '@/cartStore';
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
  Sparkles,
  UserCheck
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
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'PAYMENT_FAILED';
  subtotal: number;
  discountAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payments: PaymentInfo[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [mounted, setMounted] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isLoggedIn, accessToken, user } = useAppStore();
  const isStaff = user?.role === 'BARISTA' || user?.role === 'ADMIN';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async (silent = false) => {
    if (!isLoggedIn) {
      setOrders([]);
      if (!silent) setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const res = await fetch(`${apiUrl}/orders/me`, {
        cache: 'no-store',
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
          'x-user-id': user?.id || '',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      if (!silent) setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Polling tự động mỗi 2.5s để đồng bộ trực tiếp giữa tab Khách hàng và tab Barista
  useEffect(() => {
    if (mounted && isLoggedIn) {
      fetchOrders(false);

      const timer = setInterval(() => {
        fetchOrders(true);
      }, 2500);

      return () => clearInterval(timer);
    }
  }, [mounted, isLoggedIn, accessToken, user?.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Không thể chuyển trạng thái đơn hàng');
      }

      // Cập nhật state tức thì (optimistic)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (newStatus === 'PREPARING') {
        showToast('✓ Đã xác nhận đơn! Đơn đã chuyển sang mục: Đang pha chế ☕');
      } else if (newStatus === 'READY') {
        showToast('✓ Hoàn thành pha chế! Đơn đã chuyển sang mục: Sẵn sàng nhận 🔔');
      } else if (newStatus === 'COMPLETED') {
        if (isStaff) {
          showToast('✓ Đã hoàn tất đơn hàng! Doanh thu quán đã được ghi nhận.');
        } else {
          showToast('Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã hoàn thành ❤️');
        }
      }

      await fetchOrders(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

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
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán (Chờ pha chế)
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Sẵn sàng nhận tại quầy
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{' '}
            {isStaff ? 'Hoàn tất' : 'Đơn hàng bạn đã hoàn thành'}
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

  const formatDateTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const time = d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const date = d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return { time, date, full: `${time} ngày ${date}` };
    } catch {
      return { time: '', date: '', full: isoStr };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      {/* Toast thông báo thao tác */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-stone-900 border border-stone-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xl animate-in fade-in">
          {toastMessage}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {isStaff ? 'Bảng pha chế quầy (Barista)' : 'Lịch sử đơn hàng'}
              </h1>
              {isStaff && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Nhân viên quầy
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {isStaff
                ? 'Tiếp nhận đơn khách đã thanh toán, xác nhận pha chế và báo sẵn sàng giao đồ uống tại quầy.'
                : 'Theo dõi tiến trình xử lý từ khi thanh toán đến lúc nhận đồ uống tại quầy.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(false)}
              disabled={loading}
              className="p-2 px-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition flex items-center gap-1.5 text-xs font-semibold shadow-xs"
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
            { key: 'ALL', label: 'Tất cả', count: orders.length },
            { key: 'PAID', label: 'Đã thanh toán', count: orders.filter((o) => o.status === 'PAID').length },
            { key: 'PREPARING', label: 'Đang pha chế', count: orders.filter((o) => o.status === 'PREPARING').length },
            { key: 'READY', label: 'Sẵn sàng nhận', count: orders.filter((o) => o.status === 'READY').length },
            { key: 'COMPLETED', label: 'Hoàn tất', count: orders.filter((o) => o.status === 'COMPLETED').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-coffee-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>{tab.label}</span>
              {mounted && isLoggedIn && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    filter === tab.key
                      ? 'bg-white/20 text-white'
                      : tab.key === 'PAID'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order List */}
        {!mounted ? (
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
        ) : !isLoggedIn ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-xs mt-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#8A5833]" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Vui lòng đăng nhập tài khoản</h3>
            <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
              Bạn cần đăng nhập tài khoản để xem lịch sử đơn hàng của mình.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] text-white text-sm font-semibold transition shadow-xs"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        ) : loading && orders.length === 0 ? (
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
            <h3 className="text-lg font-bold text-stone-800">
              {isStaff ? 'Chưa có đơn hàng nào ở trạng thái này' : 'Chưa có đơn hàng nào'}
            </h3>
            <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
              {isStaff
                ? 'Khi khách hàng đặt và thanh toán xong đơn món, đơn hàng sẽ ngay lập tức xuất hiện tại đây.'
                : 'Bạn chưa có đơn hàng nào trong mục này. Hãy trải nghiệm đặt món đồ uống yêu thích nhé!'}
            </p>
            {!isStaff && (
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coffee-800 text-white text-sm font-semibold hover:bg-coffee-700 transition"
                >
                  Xem thực đơn <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
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
                  <div className="p-4 sm:p-5 bg-stone-50/80 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shadow-2xs">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
                            Mã đơn: #{order.orderNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>Giờ đặt:</span>
                            <strong className="text-stone-800 font-semibold">{formatDateTime(order.createdAt).time}</strong>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="flex items-center gap-1">
                            <span>📅 Ngày đặt:</span>
                            <strong className="text-stone-800 font-semibold">{formatDateTime(order.createdAt).date}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Ghi chú của khách hàng (Hiển thị chi tiết theo yêu cầu) */}
                  {order.notes && (
                    <div className={`p-3 sm:px-5 border-b flex items-start gap-2.5 text-xs ${
                      isStaff
                        ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                        : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}>
                      <span className="text-base select-none shrink-0">📝</span>
                      <div>
                        <span className="font-bold block text-stone-900">
                          {isStaff ? 'Ghi chú của khách hàng:' : 'Ghi chú chi tiết bạn đã yêu cầu:'}
                        </span>
                        <p className="mt-0.5 font-medium text-stone-700 leading-relaxed">
                          {order.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Danh sách thông tin món trong menu (Tên món, Số lượng mỗi món, Size, Topping) */}
                  <div className="p-4 sm:p-5 divide-y divide-stone-100">
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                      {isStaff ? 'Danh sách món khách đã đặt:' : 'Danh sách món trong đơn hàng:'}
                    </div>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5 sm:gap-4">
                          {item.imageUrl ? (
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200/50">
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-amber-50 text-[#8A5833] flex items-center justify-center flex-shrink-0 text-xl border border-amber-100">
                              ☕
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-stone-900 text-sm tracking-tight">
                                {item.productName}
                              </h4>
                              <span className="font-bold text-stone-900 text-sm whitespace-nowrap">
                                {formatPrice(item.lineTotal)}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-700">
                                Size: {item.size}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 font-bold text-amber-900">
                                Số lượng: x{item.qty}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                ({formatPrice(item.basePrice)}/ly)
                              </span>
                            </div>

                            {item.toppings && item.toppings.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {item.toppings.map((top) => (
                                  <span
                                    key={top.id}
                                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50/80 text-amber-800 border border-amber-200"
                                  >
                                    + {top.name} ({formatPrice(top.price)})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 flex items-center justify-between text-xs text-stone-600">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#8A5833] flex items-center justify-center font-bold text-xl">☕</div>
                          <div>
                            <p className="font-bold text-stone-900 text-sm">Đơn cà phê đặc sản tại quầy</p>
                            <p className="text-[11px] text-stone-500">Món uống thơm ngon chuẩn vị BrewLite</p>
                          </div>
                        </div>
                        <span className="font-bold text-stone-900 text-sm">{formatPrice(order.total)}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary & Payment Info (Hiển thị riêng biệt cho Nhân viên vs Khách) */}
                  <div className="p-4 sm:p-5 bg-stone-50/50 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Payment details */}
                    <div className="text-xs text-stone-600 space-y-1.5">
                      {primaryPayment && (
                        <div className="flex items-center gap-2">
                          {primaryPayment.method === 'E_WALLET' ? (
                            <Wallet className="w-4 h-4 text-pink-600 shrink-0" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span>
                            Phương thức thanh toán:{' '}
                            <strong className="text-stone-800 font-semibold">
                              {primaryPayment.method === 'E_WALLET' ? 'Ví điện tử' : 'Thẻ ngân hàng'}
                            </strong>
                          </span>
                          {primaryPayment.transactionRef && (
                            <span className="text-stone-400 font-mono text-[11px]">
                              ({primaryPayment.transactionRef})
                            </span>
                          )}
                        </div>
                      )}
                      {order.discountAmount > 0 && (
                        <div className="text-emerald-700 font-medium text-xs">
                          Giảm giá khuyến mãi: -{formatPrice(order.discountAmount)}
                        </div>
                      )}
                    </div>

                    {/* Total Amount (Phân biệt chữ Doanh thu cho Nhân viên và Số tiền đã thanh toán cho Khách hàng) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <span className="text-xs text-stone-500 font-medium">
                        {isStaff
                          ? 'Tổng số tiền khách đã thanh toán:'
                          : 'Số tiền đã thanh toán cho đơn hàng:'}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-coffee-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* THAO TÁC XỬ LÝ ĐƠN HÀNG (BARISTA & KHÁCH HÀNG) */}
                  <div className="p-4 sm:p-5 bg-white border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Khối thông tin dành riêng cho từng vai trò */}
                    {isStaff ? (
                      <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2">
                        <UserCheck className="w-4 h-4 text-stone-400 shrink-0" />
                        <span>
                          Khách hàng:{' '}
                          <strong className="text-stone-900 font-bold">
                            {order.customerName || 'Khách vãng lai'}
                          </strong>
                        </span>
                        {order.customerPhone && (
                          <span className="font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold">
                            SĐT: {order.customerPhone}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-600">
                        {order.status === 'PAID' && (
                          <span className="text-amber-800 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Đơn đã gửi tới quầy, vui lòng đợi nhân viên pha chế.
                          </span>
                        )}
                        {order.status === 'PREPARING' && (
                          <span className="text-blue-700 font-medium flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" /> Barista đang chuẩn bị đồ uống cho bạn...
                          </span>
                        )}
                        {order.status === 'READY' && (
                          <span className="text-purple-700 font-bold flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-4 h-4 text-purple-600" /> Đồ uống đã pha xong! Mời bạn đến quầy nhận món.
                          </span>
                        )}
                        {order.status === 'COMPLETED' && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đơn hàng bạn đã hoàn thành
                          </span>
                        )}
                      </div>
                    )}

                    {/* NÚT THAO TÁC CỦA BARISTA */}
                    {isStaff && (
                      <div className="flex items-center gap-2 ml-auto">
                        {order.status === 'PAID' && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
                          >
                            <span>⚡</span>
                            <span>{updatingId === order.id ? 'Đang cập nhật...' : 'Xác nhận đơn (Bắt đầu pha chế)'}</span>
                          </button>
                        )}

                        {order.status === 'PREPARING' && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'READY')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
                          >
                            <span>☕</span>
                            <span>{updatingId === order.id ? 'Đang cập nhật...' : 'Hoàn thành đơn (Sẵn sàng nhận)'}</span>
                          </button>
                        )}

                        {order.status === 'READY' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5" /> Đang đợi khách xác nhận nhận tại quầy
                          </span>
                        )}

                        {order.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Khách đã nhận • Ghi nhận doanh thu
                          </span>
                        )}
                      </div>
                    )}

                    {/* NÚT THAO TÁC CỦA KHÁCH HÀNG (CUSTOMER) */}
                    {!isStaff && (
                      <div className="flex items-center gap-2 ml-auto">
                        {order.status === 'READY' && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-md animate-bounce"
                          >
                            <span>🛍️</span>
                            <span>{updatingId === order.id ? 'Đang xác nhận...' : 'Xác nhận đã nhận đơn'}</span>
                          </button>
                        )}

                        {order.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đơn hàng bạn đã hoàn thành
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchOrders(false)}
      />
    </div>
  );
}
