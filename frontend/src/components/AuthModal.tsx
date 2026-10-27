'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/cartStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setAuth } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fillDemoCustomer = () => {
    setMode('login');
    setEmail('customer@brewlite.com');
    setPassword('123456');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      mode === 'login'
        ? { email, password }
        : {
            email,
            password,
            fullName: fullName.trim() || undefined,
            phone: phone.trim() || undefined,
          };

    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || 'Đăng nhập / đăng ký thất bại';
        setError(msg);
        return;
      }

      const token = data.access_token || data.accessToken;
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName || data.user.email.split('@')[0],
          role: data.user.role || 'CUSTOMER',
          loyaltyPoints: data.user.loyaltyPoints ?? 0,
        },
        token
      );

      if (onSuccess) {
        onSuccess(
          mode === 'login'
            ? `Đăng nhập thành công: ${data.user.fullName || data.user.email}`
            : `Đăng ký thành công: ${data.user.fullName || data.user.email}`
        );
      }
      onClose();
    } catch {
      setError('Không thể kết nối tới Backend (http://localhost:4000).');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/50 backdrop-blur-2xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {mode === 'login' ? 'Đăng nhập BrewLite' : 'Đăng ký tài khoản'}
            </h2>
            <p className="text-[11px] text-stone-500">
              Xác thực bảo mật bằng JWT & Bcrypt (Task 7)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        {/* Chuyển đổi tab Đăng nhập / Đăng ký */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50 p-1 mx-5 mt-4 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'login'
                ? 'bg-white text-[#5D3A1A] shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'register'
                ? 'bg-white text-[#5D3A1A] shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#5D3A1A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#5D3A1A] focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@brewlite.com"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#5D3A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#5D3A1A] focus:outline-none"
            />
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[11px] text-stone-400">
                Tài khoản mẫu: customer@brewlite.com / 123456
              </span>
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="text-[11px] font-semibold text-[#5D3A1A] hover:underline"
              >
                Điền nhanh
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] disabled:opacity-60 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng nhập'
              : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    </div>
  );
};

