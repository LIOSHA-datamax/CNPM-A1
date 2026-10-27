'use client';

import React from 'react';
import Image from 'next/image';
import { useAppStore } from '@/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalItems,
  } = useAppStore();

  if (!isOpen) return null;

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5D3A1A] text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 leading-none">
                  Giỏ hàng của bạn
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {totalItems > 0 ? `${totalItems} món đang chờ đặt` : 'Chưa có món nào'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-800 mb-4">
                  <svg
                    className="h-10 w-10 text-[#8A5833]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-stone-800">
                  Giỏ hàng của bạn đang trống
                </h3>
                <p className="mt-1 max-w-xs text-xs text-stone-500">
                  Hãy khám phá menu thức uống thơm ngon và chọn món yêu thích của bạn ngay nhé!
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Khám phá Menu ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3.5 rounded-xl border border-stone-200/90 bg-white p-3 shadow-2xs hover:border-stone-300 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.cartItemId)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                            title="Xóa món"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>

                        {/* Size & Topping tags */}
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700">
                            Size {item.size} {item.sizePriceOffset > 0 && `(+${item.sizePriceOffset.toLocaleString('vi-VN')}₫)`}
                          </span>
                          {item.selectedToppings.map((top) => (
                            <span
                              key={top.id}
                              className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
                            >
                              +{top.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Controls & Total Price */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2">
                        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.cartItemId)}
                            className="flex h-6 w-6 items-center justify-center text-stone-600 hover:bg-stone-200/60 rounded-l transition-colors"
                            title="Giảm số lượng"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.cartItemId)}
                            className="flex h-6 w-6 items-center justify-center text-stone-600 hover:bg-stone-200/60 rounded-r transition-colors"
                            title="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-900">
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

                {/* Clear Cart Button */}
                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-stone-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Xóa tất cả món trong giỏ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50/70 p-4 sm:p-5 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ({totalItems} món)</span>
                  <span className="font-semibold text-stone-800">
                    {totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí dịch vụ / Đóng gói</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
                <div className="flex justify-between border-t border-stone-200/80 pt-2 text-sm font-bold text-stone-900">
                  <span>Tổng tiền thanh toán</span>
                  <span className="text-base text-[#5D3A1A]">
                    {totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] py-3 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.99]"
              >
                <span>Tiến hành thanh toán</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

