'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/cartStore';
import { Navbar } from '@/components/Navbar';
import { PaymentMethodType, OrderConfirmation } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const { items, getTotalAmount, getTotalItems, clearCart, user, setLastOrder } = useAppStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('E_WALLET');
  const [selectedWallet, setSelectedWallet] = useState<'MOMO' | 'VNPAY' | 'ZALOPAY'>('MOMO');
  const [selectedCardType, setSelectedCardType] = useState<'VISA' | 'NAPAS'>('VISA');

  // Form thẻ
  const [cardNumber, setCardNumber] = useState<string>('9704 2200 1234 5678');
  const [cardHolder, setCardHolder] = useState<string>('NGUYEN VAN KHACH');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('888');

  // Thông tin nhận hàng & ghi chú
  const [notes, setNotes] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('0901 234 567');
  const [tableOrAddress, setTableOrAddress] = useState<string>('Bàn số 05 (Uống tại quán)');

  // Trạng thái xử lý
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalAmount = mounted ? getTotalAmount() : 0;
  const totalItems = mounted ? getTotalItems() : 0;

  // Nếu giỏ hàng trống và đã load store -> chuyển về trang chủ
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/');
    }
  }, [mounted, items.length, router]);

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const providerName =
      paymentMethod === 'E_WALLET'
        ? selectedWallet === 'MOMO'
          ? 'Ví điện tử MoMo'
          : selectedWallet === 'VNPAY'
          ? 'Cổng thanh toán VNPAY-QR'
          : 'Ví điện tử ZaloPay'
        : selectedCardType === 'VISA'
        ? 'Thẻ quốc tế Visa / Mastercard'
        : 'Thẻ ATM nội địa (NAPAS)';

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `#ORD-${randomSuffix}`;
    const orderId = `order-${Date.now()}`;
    const transactionId = `TXN-${Date.now().toString().slice(-8)}`;

    try {
      // Giả lập độ trễ xử lý 1.2s
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Thử gọi backend NestJS nếu có bật
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'idempotency-key': `brewlite-key-${Date.now()}`,
          },
          body: JSON.stringify({
            orderId,
            method: paymentMethod,
            amount: totalAmount,
            simulateFailure,
          }),
        });
      } catch {
        // Fallback giả lập client
      }

      if (simulateFailure) {
        throw new Error(
          'Thanh toán không thành công: Ngân hàng từ chối giao dịch. Giỏ hàng của bạn vẫn được giữ nguyên để thử lại!'
        );
      }

      const completedOrder: OrderConfirmation = {
        orderId,
        orderNumber,
        items: [...items],
        subtotal: totalAmount,
        discount: 0,
        totalAmount,
        paymentMethod,
        paymentProviderName: providerName,
        status: 'PAID',
        transactionId,
        createdAt: new Date().toISOString(),
        customerName: user?.fullName || 'Khách vãng lai',
        customerEmail: user?.email || 'customer@brewlite.com',
        notes: notes || undefined,
      };

      clearCart();
      setLastOrder(completedOrder);
      setIsProcessing(false);
      router.push('/order-success');
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra!';
      setErrorMessage(msg);
    }
  };

  if (!mounted || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 pb-16">
      <Navbar onOpenCart={() => router.push('/cart')} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-800 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-stone-800 transition-colors">
            Giỏ hàng
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">Thanh toán</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Chọn phương thức thanh toán
        </h1>

        {/* Thông báo lỗi nếu thất bại */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 animate-in fade-in">
            <svg className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <span className="font-bold">Lỗi thanh toán:</span> {errorMessage}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Chọn phương thức & thông tin */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Chọn loại phương thức */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                1. Phương thức thanh toán
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {/* Ví điện tử */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('E_WALLET')}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                    paymentMethod === 'E_WALLET'
                      ? 'border-[#5D3A1A] bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A50064] text-white text-sm">
                      📱
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'E_WALLET'
                          ? 'border-[#5D3A1A] bg-[#5D3A1A]'
                          : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'E_WALLET' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">Ví điện tử</div>
                    <div className="text-xs text-stone-500">MoMo, VNPay, ZaloPay</div>
                  </div>
                </button>

                {/* Thẻ thanh toán */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_CARD')}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                    paymentMethod === 'BANK_CARD'
                      ? 'border-[#5D3A1A] bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005BAA] text-white text-sm">
                      💳
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'BANK_CARD'
                          ? 'border-[#5D3A1A] bg-[#5D3A1A]'
                          : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'BANK_CARD' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">Thẻ thanh toán</div>
                    <div className="text-xs text-stone-500">Visa, Mastercard, Napas</div>
                  </div>
                </button>
              </div>

              {/* Chi tiết theo loại */}
              {paymentMethod === 'E_WALLET' ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
                  <div className="text-xs font-semibold text-stone-700">Chọn ví:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedWallet('MOMO')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border py-3 px-2 transition-all ${
                        selectedWallet === 'MOMO'
                          ? 'border-[#A50064] bg-white ring-2 ring-[#A50064]/20 font-bold text-[#A50064]'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      <span className="h-6 w-6 rounded bg-[#A50064] text-white text-[10px] font-black flex items-center justify-center">
                        M
                      </span>
                      <span className="text-xs">Ví MoMo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWallet('VNPAY')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border py-3 px-2 transition-all ${
                        selectedWallet === 'VNPAY'
                          ? 'border-[#005BAA] bg-white ring-2 ring-[#005BAA]/20 font-bold text-[#005BAA]'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      <span className="h-6 w-6 rounded bg-[#005BAA] text-white text-[10px] font-black flex items-center justify-center">
                        V
                      </span>
                      <span className="text-xs">VNPay QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWallet('ZALOPAY')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border py-3 px-2 transition-all ${
                        selectedWallet === 'ZALOPAY'
                          ? 'border-[#0068FF] bg-white ring-2 ring-[#0068FF]/20 font-bold text-[#0068FF]'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      <span className="h-6 w-6 rounded bg-[#0068FF] text-white text-[10px] font-black flex items-center justify-center">
                        Z
                      </span>
                      <span className="text-xs">ZaloPay</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCardType('VISA')}
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        selectedCardType === 'VISA'
                          ? 'bg-[#5D3A1A] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Visa / Mastercard
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCardType('NAPAS')}
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        selectedCardType === 'NAPAS'
                          ? 'bg-[#5D3A1A] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      ATM Nội địa (NAPAS)
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-stone-500 mb-1">Số thẻ</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-500 mb-1">Hạn dùng (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-500 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-500 mb-1">Tên chủ thẻ</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Thông tin nhận món */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                2. Thông tin phục vụ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Vị trí / Bàn</label>
                  <input
                    type="text"
                    value={tableOrAddress}
                    onChange={(e) => setTableOrAddress(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Ghi chú cho Barista
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Ít đường, mang ra bàn nhanh..."
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Kịch bản kiểm thử Sprint 3 */}
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-400 text-amber-600"
                />
                <span className="text-xs font-medium text-amber-900">
                  Mô phỏng thanh toán thất bại (Task 8: Báo lỗi &amp; bảo lưu giỏ hàng)
                </span>
              </label>
            </div>
          </div>

          {/* Cột phải: Đơn hàng tóm tắt & Nút xác nhận */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 border-b border-stone-100 pb-3">
                Đơn hàng ({totalItems} món)
              </h2>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs divide-y divide-stone-100">
                {items.map((i) => (
                  <div key={i.cartItemId} className="flex justify-between pt-1.5 first:pt-0">
                    <div>
                      <div className="font-semibold text-stone-800">{i.quantity}x {i.name}</div>
                      <div className="text-[11px] text-stone-400">Size {i.size}</div>
                    </div>
                    <div className="font-bold text-stone-900">
                      {i.totalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí dịch vụ</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
                <div className="flex justify-between border-t border-stone-100 pt-3 text-sm font-bold text-stone-900">
                  <span>Tổng thanh toán</span>
                  <span className="text-base text-[#5D3A1A]">
                    {totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5D3A1A] hover:bg-[#472C14] py-3.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Đang xử lý giao dịch...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận thanh toán</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

