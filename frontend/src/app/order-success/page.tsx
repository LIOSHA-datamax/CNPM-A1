'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/cartStore';
import { Navbar } from '@/components/Navbar';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const { lastOrder } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Dữ liệu fallback nếu truy cập trực tiếp
  const order = lastOrder || {
    orderId: 'order-demo-default',
    orderNumber: '#ORD-882914',
    items: [
      {
        cartItemId: 'item-demo-1',
        productId: 'prod-1',
        name: 'Cà phê sữa',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
        size: 'M' as const,
        sizePriceOffset: 5000,
        selectedToppings: [{ id: 'top-1', name: 'Trân châu đen', price: 5000 }],
        quantity: 2,
        unitPrice: 45000,
        totalPrice: 90000,
      },
    ],
    subtotal: 90000,
    discount: 0,
    totalAmount: 90000,
    paymentMethod: 'E_WALLET' as const,
    paymentProviderName: 'Ví điện tử MoMo',
    status: 'PAID' as const,
    transactionId: 'TXN-99824102',
    createdAt: new Date().toISOString(),
    customerName: 'Nguyễn Văn Khách',
    customerEmail: 'customer@brewlite.com',
    notes: 'Ít đường, nhiều sữa',
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 pb-16">
      <Navbar onOpenCart={() => router.push('/cart')} />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
          {/* Header Banner thành công */}
          <div className="bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-white px-6 pt-8 pb-6 text-center border-b border-stone-100">
            {/* Checkmark Icon lớn */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 shadow-inner">
              <svg
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 className="mt-5 text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Thanh toán & Đặt hàng thành công!
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Cảm ơn quý khách đã ủng hộ BrewLite. Đơn hàng của bạn đã được tiếp nhận và nhân viên pha chế đang thực hiện.
            </p>

            {/* Trạng thái PAID & Mã đơn hàng #... (Task 8) */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {/* Badge PAID */}
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-800 border border-emerald-300 shadow-2xs">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                TRẠNG THÁI: {order.status}
              </span>

              {/* Mã đơn hàng #... */}
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="inline-flex items-center gap-2 rounded-full bg-stone-100 hover:bg-stone-200 px-4 py-1.5 text-xs font-mono font-bold text-stone-800 border border-stone-200 transition-colors"
                title="Bấm để sao chép mã đơn"
              >
                <span>{order.orderNumber}</span>
                <span className="text-[11px] text-stone-500">
                  {copied ? '✓ Đã chép' : '📋 Chép mã'}
                </span>
              </button>
            </div>
          </div>

          {/* Chi tiết đơn hàng */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Thông số giao dịch */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Thời gian thanh toán:</span>
                <span className="font-semibold text-stone-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Cổng thanh toán:</span>
                <span className="font-semibold text-stone-800">{order.paymentProviderName}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Mã giao dịch (Txn ID):</span>
                <span className="font-mono text-stone-700">{order.transactionId}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Khách hàng:</span>
                <span className="font-semibold text-stone-800">{order.customerName}</span>
              </div>
              {order.notes && (
                <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-2">
                  <span>Ghi chú pha chế:</span>
                  <span className="italic text-stone-700">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Danh sách các món đồ uống */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Danh sách món đồ uống ({order.items.length})
              </h2>
              <div className="space-y-2.5">
                {order.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-white p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-stone-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        Size {item.size} • Số lượng: {item.quantity}
                        {item.selectedToppings.length > 0 && (
                          <span className="ml-1 text-amber-700">
                            (+{item.selectedToppings.map((t) => t.name).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-stone-900 shrink-0">
                      {item.totalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tổng cộng */}
            <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block uppercase font-bold tracking-wider">
                  Số tiền thanh toán
                </span>
                <span className="text-lg sm:text-xl font-black text-[#5D3A1A]">
                  {order.totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Giao dịch đã tất toán
                </span>
              </div>
            </div>

            {/* Nút điều hướng */}
            <div className="border-t border-stone-100 pt-6">
              <Link
                href="/"
                className="block w-full rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] py-3.5 text-center text-sm font-semibold text-white shadow-xs transition-colors"
              >
                ← Tiếp tục đặt món mới
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
