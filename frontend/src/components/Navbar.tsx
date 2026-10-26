'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, ShoppingBag, Clock, Home, UserCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/menu', label: 'Thực đơn', icon: Coffee },
    { href: '/orders', label: 'Lịch sử đơn', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-coffee-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coffee-800 to-coffee-600 flex items-center justify-center text-white shadow-md shadow-coffee-700/20 group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-coffee-900 flex items-center gap-1">
                Brew<span className="text-coffee-600">Lite</span>
              </span>
              <span className="block text-[10px] text-coffee-500 uppercase tracking-widest font-semibold -mt-1">
                Coffee & Pay
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-coffee-100 text-coffee-900 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-coffee-800 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Demo User & Cart */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Khách hàng: NV Khách</span>
            </div>

            <Link
              href="/cart"
              className="relative p-2 rounded-xl bg-coffee-800 text-white hover:bg-coffee-700 transition shadow-sm flex items-center gap-1.5 px-3 text-sm font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              <span className="bg-amber-400 text-stone-900 text-xs font-bold px-1.5 py-0.2 rounded-full">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
