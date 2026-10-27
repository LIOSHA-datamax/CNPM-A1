'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

interface NavbarProps {
  onOpenCart?: () => void;
  onOpenHistory?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenHistory }) => {
  const { user, isLoggedIn, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* LOGO & BRAND (Khớp 100% hình ảnh) */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6B4423] text-white shadow-xs">
            {/* Icon tách cà phê bốc khói */}
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
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
          <div>
            <div className="text-lg font-black tracking-tight text-[#42220F] leading-none">
              BrewLite
            </div>
            <div className="text-[10px] font-bold tracking-wider text-[#A06D44] uppercase mt-0.5">
              COFFEE & PAYMENT
            </div>
          </div>
        </div>

        {/* NAVIGATION & USER ACTIONS (Desktop - Khớp hoàn toàn hình ảnh của bạn) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Menu Link */}
          <button
            type="button"
            className="text-sm font-bold text-[#42220F] hover:text-[#A06D44] transition-colors"
          >
            Menu
          </button>

          {/* Lịch sử đơn Link */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-[#6B4423] transition-colors"
          >
            <svg
              className="h-4 w-4 text-stone-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Lịch sử đơn</span>
          </button>

          {/* Giỏ hàng với Badge số lượng (Task 5) */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
            title="Giỏ hàng"
          >
            <svg
              className="h-6 w-6 text-stone-800"
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
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E06D14] text-[11px] font-black text-white shadow-xs animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </button>

          {/* Đường gạch phân cách | */}
          <div className="h-7 w-[1.5px] bg-stone-200" />

          {/* Thông tin khách hàng & Điểm tích lũy Loyalty (Task 7 & Task 10.4) */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold text-stone-900 leading-tight">
                  {user.fullName}
                </div>
                <div className="text-[11px] font-semibold text-[#B36829]">
                  {user.loyaltyPoints} điểm tích lũy
                </div>
              </div>

              {/* Nút Đăng xuất [-> */}
              <button
                type="button"
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                title="Đăng xuất"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rounded-xl bg-[#6B4423] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#523318] transition-colors"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* MOBILE VIEW (Rút gọn tiện dụng cho di động) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Icon giỏ hàng với Badge */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-stone-700"
          >
            <svg
              className="h-6 w-6 text-stone-800"
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
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E06D14] text-[11px] font-black text-white shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          {/* Nút Hamburger menu ≡ */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xl font-bold"
          >
            {mobileMenuOpen ? '✕' : '≡'}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER KHI BẤM ≡ */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-100 bg-white px-5 py-4 md:hidden space-y-4 shadow-lg animate-in slide-in-from-top-2">
          {isLoggedIn && user ? (
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <p className="text-sm font-bold text-stone-900">{user.fullName}</p>
                <p className="text-xs font-semibold text-[#B36829]">
                  {user.loyaltyPoints} điểm tích lũy
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-rose-600 font-semibold"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="pb-3 border-b border-stone-100">
              <button
                type="button"
                className="w-full rounded-xl bg-[#6B4423] py-2 text-xs font-bold text-white text-center"
              >
                Đăng nhập tài khoản
              </button>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold text-stone-800"
            >
              <span>📋 Thực đơn đồ uống (Menu)</span>
              <span className="text-stone-400">→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenHistory) onOpenHistory();
              }}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold text-stone-800"
            >
              <span>🕒 Lịch sử đơn hàng (GET /orders/me)</span>
              <span className="text-stone-400">→</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
