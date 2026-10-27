'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Product, SelectedProductPayload } from '@/types/product';
import { fetchProducts } from '@/services/productService';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/menu/ProductCard';
import { MenuSkeleton, EmptyMenu, ErrorMenu } from '@/components/menu/MenuStateViews';
import { ProductDetailModal } from '@/components/modal/ProductDetailModal';
import { useCartStore } from '@/stores/cartStore';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc danh mục & tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Món đang mở modal chi tiết (Task 4)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Giỏ hàng Zustand
  const { addItem, getTotalItems, getTotalAmount } = useCartStore();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (payload: SelectedProductPayload) => {
    addItem(payload);
    showToast(`Đã thêm ${payload.quantity}x ${payload.name} (${payload.size}) vào giỏ hàng`);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Tất cả', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalItems = mounted ? getTotalItems() : 0;
  const totalAmount = mounted ? getTotalAmount() : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 pb-20">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-lg">
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* THANH HEADER ĐIỀU HƯỚNG CHUẨN */}
      <Navbar
        onOpenCart={() => showToast(`Giỏ hàng: ${totalItems} món (${totalAmount.toLocaleString('vi-VN')}₫). Sẵn sàng chuyển giao cho Task 5!`)}
        onOpenHistory={() => showToast('Màn hình Lịch sử đơn hàng (GET /orders/me) - Sẽ bàn giao trong Task 9!')}
      />

      {/* Nội dung Menu chính */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Tiêu đề & Tìm kiếm */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Menu đồ uống
              </h2>
              <p className="text-xs text-stone-500">
                Lựa chọn đồ uống yêu thích và thanh toán nhanh chóng tại quầy.
              </p>
            </div>
            {!isLoading && !error && (
              <span className="self-start sm:self-auto text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded">
                {products.length} sản phẩm
              </span>
            )}
          </div>

          {/* Ô tìm kiếm món với SVG Icon chuẩn */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-stone-400 pointer-events-none">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cà phê, trà..."
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-9 text-xs sm:text-sm text-stone-900 transition focus:border-[#5D3A1A] focus:outline-none focus:ring-1 focus:ring-[#5D3A1A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Thanh Tab Danh mục (Pills Filter) */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#5D3A1A] text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Trạng thái Loading Skeleton (Task 3 DoD) */}
        {isLoading && <MenuSkeleton />}

        {/* 2. Trạng thái Lỗi kết nối (Task 3 DoD) */}
        {!isLoading && error && <ErrorMenu error={error} onRetry={loadProducts} />}

        {/* 3. Trạng thái Trống (Task 3 DoD) */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <EmptyMenu onRefresh={loadProducts} />
        )}

        {/* 4. Lưới hiển thị món (Task 3 DoD) */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => setActiveProduct(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bar: CHỈ HIỆN TRÊN ĐIỆN THOẠI (Mobile) VÀ CHỈ KHI CÓ MÓN TRONG GIỎ (ẨN TRÊN DESKTOP) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 p-3 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                <svg
                  className="w-5 h-5"
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
                <span className="block text-[10px] text-stone-400">Tạm tính ({totalItems})</span>
                <span className="text-sm font-bold text-stone-900">
                  {totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast(`Xem giỏ hàng: ${totalItems} món - Tổng: ${totalAmount.toLocaleString('vi-VN')}₫`)}
              className="rounded-lg bg-[#5D3A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              Xem giỏ hàng →
            </button>
          </div>
        </div>
      )}

      {/* Modal Chi tiết & Chọn Size/Topping (Task 4) */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
