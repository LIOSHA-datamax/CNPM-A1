'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/cartStore';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const {
    items,
    isLoggedIn,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalItems,
  } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const totalAmount = mounted ? getTotalAmount() : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 pb-16">
      <Navbar onOpenCart={() => {}} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb / Title */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/" className="hover:text-stone-800 transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-stone-800 font-medium">Giỏ hàng</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Giỏ hàng của bạn
            </h1>
          </div>
          {totalItems > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
              {totalItems} món
            </span>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-2xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-800 mb-4">
              <svg
                className="h-10 w-10 text-[#8A5833]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-800">
              Vui lòng đăng nhập tài khoản
            </h2>
            <p className="mt-1 max-w-sm text-xs sm:text-sm text-stone-500">
              Bạn cần đăng nhập tài khoản để xem giỏ hàng và tiến hành đặt món.
            </p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="mt-6 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-2xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-800 mb-4">
              <svg
                className="h-10 w-10 text-[#8A5833]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-800">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="mt-1 max-w-sm text-xs sm:text-sm text-stone-500">
              Bạn chưa thêm sản phẩm nào vào giỏ. Hãy xem qua danh sách thức uống thơm ngon của chúng tôi!
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors"
            >
              ← Khám phá Menu ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
                <span>Danh sách món</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="hover:text-rose-600 font-medium transition-colors"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-stone-300 transition-colors"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Xóa món này"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          Size {item.size} {item.sizePriceOffset > 0 && `(+${item.sizePriceOffset.toLocaleString('vi-VN')}₫)`}
                        </span>
                        {item.selectedToppings.map((top) => (
                          <span
                            key={top.id}
                            className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                          >
                            +{top.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5">
                      <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.cartItemId)}
                          className="flex h-7 w-7 items-center justify-center text-stone-600 hover:bg-stone-200/60 rounded-l transition-colors"
                          title="Giảm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.cartItemId)}
                          className="flex h-7 w-7 items-center justify-center text-stone-600 hover:bg-stone-200/60 rounded-r transition-colors"
                          title="Tăng"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-stone-900">
                          {item.totalPrice.toLocaleString('vi-VN')}₫
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-stone-400">
                            {item.unitPrice.toLocaleString('vi-VN')}₫/ly
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cột phải: Tóm tắt thanh toán */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 border-b border-stone-100 pb-3">
                  Tóm tắt thanh toán
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Tạm tính ({totalItems} món)</span>
                    <span className="font-semibold text-stone-800">
                      {totalAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Phí dịch vụ</span>
                    <span className="font-semibold text-emerald-600">0₫ (Miễn phí)</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-100 pt-3 text-sm font-bold text-stone-900">
                    <span>Tổng cộng</span>
                    <span className="text-base text-[#5D3A1A]">
                      {totalAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] py-3 text-sm font-semibold text-white shadow-sm transition-all"
                >
                  <span>Chọn phương thức thanh toán</span>
                  <span>→</span>
                </button>

                <Link
                  href="/"
                  className="block text-center text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
                >
                  ← Thêm món khác vào giỏ
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

