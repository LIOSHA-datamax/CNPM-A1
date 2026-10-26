'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Home, Clock, Sparkles } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'BL-1042';
  const status = searchParams.get('status') || 'PAID';

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 sm:p-10 relative overflow-hidden">
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Đặt hàng thành công!
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Giao dịch không tiền mặt của bạn đã được ghi nhận vào hệ thống.
        </p>

        {/* Order Details Ticket Box */}
        <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Mã đơn hàng:</span>
            <span className="font-extrabold text-stone-900 font-mono text-base">
              #{orderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Trạng thái:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3" /> {status}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-200 text-xs text-stone-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Mời bạn tới quầy nhận đồ uống khi hiển thị <strong>READY</strong>.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Link
            href="/orders"
            className="w-full py-3.5 px-4 rounded-xl bg-coffee-800 hover:bg-coffee-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-coffee-900/10"
          >
            <Clock className="w-4 h-4" />
            Xem lịch sử đơn hàng
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
