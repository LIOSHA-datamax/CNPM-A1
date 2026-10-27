'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { OrderConfirmation } from '@/types';

interface OrderSuccessModalProps {
  order: OrderConfirmation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    if (order.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all">
          {/* Header Banner thành công */}
          <div className="bg-gradient-to-b from-emerald-50 to-white px-6 pt-7 pb-5 text-center border-b border-stone-100">
            {/* Checkmark Icon lớn */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 shadow-inner">
              <svg
                className="h-9 w-9"
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

            <h3 className="mt-4 text-lg sm:text-xl font-black text-stone-900 tracking-tight">
              Thanh toán thành công!
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Đơn hàng của bạn đã được ghi nhận và chuyển đến quầy Barista.
            </p>

            {/* Trạng thái PAID & Mã đơn hàng nổi bật (Task 8) */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {/* Badge PAID */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-300 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                TRẠNG THÁI: {order.status}
              </span>

              {/* Mã đơn #... */}
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 px-3 py-1 text-xs font-mono font-bold text-stone-800 border border-stone-200 transition-colors"
                title="Sao chép mã đơn"
              >
                <span>{order.orderNumber}</span>
                <span className="text-[10px] text-stone-500">
                  {copied ? '✓ Đã chép' : '📋 Chép'}
                </span>
              </button>
            </div>
          </div>

          {/* Chi tiết đơn hàng */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Thông số giao dịch */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Thời gian giao dịch:</span>
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
                <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-1.5">
                  <span>Ghi chú pha chế:</span>
                  <span className="italic text-stone-700">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Danh sách món đồ uống */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Các món đã đặt ({order.items.length})
              </h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2.5"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-stone-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Size {item.size} • SL: {item.quantity}
                        {item.selectedToppings.length > 0 && (
                          <span className="ml-1 text-amber-700">
                            (+{item.selectedToppings.map((t) => t.name).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-stone-900 shrink-0">
                      {item.totalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tổng cộng */}
            <div className="border-t border-stone-200 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">Tổng tiền đã thanh toán:</span>
              <span className="text-base sm:text-lg font-black text-[#5D3A1A]">
                {order.totalAmount.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="border-t border-stone-100 bg-stone-50/80 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors text-center"
            >
              Tiếp tục đặt món mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
