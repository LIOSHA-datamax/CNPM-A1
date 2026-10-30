'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Product, SelectedProductPayload, OrderConfirmation } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { useAppStore } from '@/cartStore';

// Dữ liệu mẫu fallback theo đề bài (nếu backend chưa bật)
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Cà phê sữa',
    category: 'Cà phê truyền thống',
    description: 'Cà phê Robusta truyền thống kết hợp sữa đặc ngọt béo thơm lừng.',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
    stock: 50,
  },
  {
    id: 'prod-2',
    name: 'Americano',
    category: 'Cà phê Espresso',
    description: 'Espresso đậm vị pha loãng cùng nước tinh khiết thanh nhẹ.',
    price: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600',
    stock: 40,
  },
  {
    id: 'prod-3',
    name: 'Cappuccino',
    category: 'Cà phê Espresso',
    description: 'Espresso Ý hòa quyện cùng lớp bọt sữa mịn màng bồng bềnh.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
    stock: 35,
  },
  {
    id: 'prod-4',
    name: 'Trà đào',
    category: 'Trà hoa quả',
    description: 'Trà đen thơm mát kết hợp miếng đào tươi giòn sần sật.',
    price: 39000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
    stock: 60,
  },
];

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tìm kiếm & Danh mục
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Modal chi tiết món (Task 4)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Giỏ hàng, Thanh toán & Xác nhận đơn (Task 5 & Task 8)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<OrderConfirmation | null>(null);

  const { addItem, getTotalItems, getTotalAmount, setLastOrder } = useAppStore();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    loadProducts();
  }, []);

  // Gọi API backend GET /products (Task 3)
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch {
      // Dùng dữ liệu mẫu nếu backend chưa bật
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = (payload: SelectedProductPayload) => {
    addItem(payload);
    showToast(`Đã thêm ${payload.quantity}x ${payload.name} (${payload.size}) vào giỏ hàng`);
  };

  const handlePaymentSuccess = (order: OrderConfirmation) => {
    setCompletedOrder(order);
    setLastOrder(order);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
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
      const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalItems = mounted ? getTotalItems() : 0;
  const totalAmount = mounted ? getTotalAmount() : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 pb-16">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-stone-900 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-lg animate-in fade-in">
          ✓ {toastMessage}
        </div>
      )}

      {/* 1. Header Navbar với Badge giỏ hàng (Task 5) */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onAuthSuccess={(msg) => showToast(msg)}
      />

      {/* 2. Nội dung Menu chính */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Menu đồ uống
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Chọn món yêu thích và thanh toán nhanh chóng tại quầy.
              </p>
            </div>
            {!isLoading && (
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">
                {filteredProducts.length} món
              </span>
            )}
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cà phê, trà..."
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-9 text-xs sm:text-sm text-stone-900 focus:border-[#5D3A1A] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-3 flex items-center text-stone-400 text-xs">✕</button>
            )}
          </div>

          {/* Bộ lọc danh mục */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#5D3A1A] text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trạng thái Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
                <div className="aspect-square w-full rounded-lg bg-stone-100" />
                <div className="h-4 w-3/4 rounded bg-stone-200" />
                <div className="h-3 w-1/2 rounded bg-stone-100" />
              </div>
            ))}
          </div>
        )}

        {/* Trạng thái Empty */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-14 px-4 text-center">
            <p className="text-sm font-semibold text-stone-700">Không tìm thấy món phù hợp</p>
            <button onClick={loadProducts} className="mt-3 rounded-lg bg-[#5D3A1A] px-3.5 py-1.5 text-xs text-white">Tải lại</button>
          </div>
        )}

        {/* Lưới sản phẩm */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && setActiveProduct(p)}
                  className={`group relative flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-3 shadow-2xs transition-all ${
                    isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-stone-300'
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100">
                    <Image src={p.imageUrl} alt={p.name} fill unoptimized className="object-cover group-hover:scale-102 transition-transform" />
                    {isOutOfStock ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 text-white text-xs font-semibold">Hết hàng</div>
                    ) : (
                      <span className="absolute top-2 right-2 rounded bg-stone-900/60 px-1.5 py-0.5 text-[10px] text-white">Còn {p.stock}</span>
                    )}
                  </div>
                  <div className="mt-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-1 text-sm font-semibold text-stone-900">{p.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{p.description}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2">
                      <div>
                        <span className="block text-[10px] text-stone-400">Giá từ</span>
                        <span className="text-sm font-bold text-stone-900">{Number(p.price).toLocaleString('vi-VN')}₫</span>
                      </div>
                      <button type="button" disabled={isOutOfStock} className="rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] px-2.5 py-1 text-xs text-white font-medium">Chọn +</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bar: Chỉ hiện trên Mobile khi giỏ hàng có món (Task 5) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 p-3 md:hidden shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block">Tạm tính ({totalItems} món)</span>
              <span className="text-sm font-bold text-stone-900">{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="rounded-lg bg-[#5D3A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              Xem giỏ hàng ({totalItems}) →
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal Chi tiết món & Tùy chọn Size/Topping (Task 4) */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 4. Giỏ hàng Drawer bằng Zustand (Task 5) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 5. Màn hình Chọn phương thức thanh toán (Task 8 - Ví điện tử / Thẻ) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* 6. Màn hình Xác nhận đặt hàng thành công (Task 8 - Trạng thái PAID & Mã đơn) */}
      <OrderSuccessModal
        isOpen={isOrderSuccessOpen}
        order={completedOrder}
        onClose={() => setIsOrderSuccessOpen(false)}
      />
    </div>
  );
}
