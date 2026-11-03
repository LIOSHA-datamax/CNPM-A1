'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, ProductSize, Topping, SelectedProductPayload } from '@/types';

// Danh sách Topping đầy đủ, phong phú và khớp chuẩn UUID PostgreSQL
export const DEFAULT_TOPPINGS: Topping[] = [
  { id: 'db22f579-1a61-4b43-b655-98d9f6e42d97', name: 'Trân châu đen', price: 5000 },
  { id: '0e288871-5b5f-4f0d-98d2-d89b0bc53ca5', name: 'Trân châu trắng', price: 7000 },
  { id: 'aef36a97-99e0-495e-94bd-77d97565e6e0', name: 'Kem cheese (Kem)', price: 10000 },
  { id: '890c0b02-4b74-4efd-80d5-394e77033a53', name: 'Thạch cà phê', price: 6000 },
  { id: '76e71934-f1b3-4614-b59a-a17c83e00c90', name: 'Đào miếng', price: 10000 },
  { id: '1b32590b-e4b5-44b9-b64d-675298ae911a', name: 'Shot Espresso', price: 10000 },
  { id: '6f85f99c-97a8-469f-844a-26532346a1c2', name: 'Sữa đặc thêm', price: 5000 },
  { id: '5324f7e3-f569-4254-a392-d478354a96a7', name: 'Sữa tươi yến mạch (Oat Milk)', price: 10000 },
  { id: '194938c8-32fb-4dcd-86a8-4a128c6e3029', name: 'Sốt Caramel', price: 8000 },
  { id: 'e07fc3b5-5356-40f6-8174-2bbc09619ec5', name: 'Bột Cacao', price: 5000 },
  { id: 'e433aae4-f030-443b-b3ec-d8817f814347', name: 'Thạch trái cây nhiệt đới', price: 8000 },
  { id: 'ff631643-ae46-49b9-8c5f-d667131225d5', name: 'Hạt chia thanh mát', price: 7000 },
  { id: '99a67ab4-7989-42c3-b23b-491ea4366edc', name: 'Cam vàng tươi cắt lát', price: 6000 },
  { id: '567fc08c-2ada-43b9-859b-ae6149347db7', name: 'Đậu đỏ bùi ngọt', price: 8000 },
];

// Bản đồ gợi ý topping sát thực tế chuẩn phong cách cà phê hiện đại:
export const PRODUCT_TOPPING_MAP: Record<string, string[]> = {
  // Cà phê sữa: Thạch cà phê, Thêm sữa đặc, Thêm Shot Espresso, Sữa yến mạch Oat Milk
  'Cà phê sữa': [
    'Thạch cà phê',
    'Sữa đặc thêm',
    'Shot Espresso',
    'Sữa tươi yến mạch (Oat Milk)',
  ],

  // Americano: Thêm shot Espresso đậm đà, Thạch cà phê, Cam vàng tươi cắt lát (Americano Orange mát lạnh)
  'Americano': [
    'Shot Espresso',
    'Thạch cà phê',
    'Cam vàng tươi cắt lát',
  ],

  // Cappuccino: Bột Cacao, Sốt Caramel, Shot Espresso, Kem cheese béo ngậy
  'Cappuccino': [
    'Bột Cacao',
    'Sốt Caramel',
    'Shot Espresso',
    'Kem cheese (Kem)',
  ],

  // Cold Brew: Cam vàng tươi (Cold Brew Cam sảng khoái), Kem cheese, Thạch cà phê, Shot Espresso
  'Cold Brew': [
    'Cam vàng tươi cắt lát',
    'Kem cheese (Kem)',
    'Thạch cà phê',
    'Shot Espresso',
  ],

  // Trà đào: Đào miếng giòn ngọt, Thạch trái cây nhiệt đới, Hạt chia thanh mát, Trân châu trắng, Kem cheese
  'Trà đào': [
    'Đào miếng',
    'Thạch trái cây nhiệt đới',
    'Hạt chia thanh mát',
    'Trân châu trắng',
    'Kem cheese (Kem)',
  ],

  // Matcha Latte: Đậu đỏ bùi ngọt, Trân châu đen, Trân châu trắng, Kem cheese, Sữa yến mạch Oat Milk
  'Matcha Latte': [
    'Đậu đỏ bùi ngọt',
    'Trân châu đen',
    'Trân châu trắng',
    'Kem cheese (Kem)',
    'Sữa tươi yến mạch (Oat Milk)',
  ],
};

export const SIZE_PRICE_OFFSET: Record<ProductSize, number> = {
  S: 0,
  M: 5000,
  L: 10000,
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (payload: SelectedProductPayload) => void;
  onBuyNow?: (payload: SelectedProductPayload) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isLoggedIn = true,
  onRequireLogin,
}) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [availableToppings, setAvailableToppings] = useState<Topping[]>(DEFAULT_TOPPINGS);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchToppings = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products/toppings`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailableToppings(data);
          }
        }
      } catch {
        // Fallback giữ nguyên DEFAULT_TOPPINGS khi backend tắt
      }
    };
    fetchToppings();
  }, []);

  useEffect(() => {
    if (product) {
      setSelectedSize('M');
      setSelectedToppings([]);
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Lọc danh sách topping phù hợp với sản phẩm được chọn
  const suitableToppingNames = PRODUCT_TOPPING_MAP[product.name];
  const displayToppings = suitableToppingNames
    ? availableToppings.filter((t) => suitableToppingNames.includes(t.name))
    : availableToppings;

  // Cốt lõi Task 4: Tính lại giá tự động theo tùy chọn thời gian thực
  const basePrice = Number(product.price);
  const sizeOffset = SIZE_PRICE_OFFSET[selectedSize] || 0;
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + Number(t.price), 0);
  const unitPrice = basePrice + sizeOffset + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping]
    );
  };

  const buildPayload = (): SelectedProductPayload | null => {
    if (!product) return null;
    return {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      size: selectedSize,
      sizePriceOffset: sizeOffset,
      selectedToppings,
      quantity,
      unitPrice,
      totalPrice,
    };
  };

  const handleConfirm = () => {
    if (!isLoggedIn) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    onAddToCart(payload);
    onClose();
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    if (onBuyNow) {
      onBuyNow(payload);
    } else {
      onAddToCart(payload);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/50 backdrop-blur-2xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Wireframe (2): Nút mũi tên và Tên món */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
            title="Quay lại"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <h2 className="text-sm font-bold text-stone-900 truncate max-w-[260px]">
            {product.name}
          </h2>

          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
            title="Đóng"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Thông tin món & Ảnh */}
          <div className="flex gap-3.5 items-center">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={76}
              height={76}
              unoptimized
              className="h-19 w-19 rounded-lg object-cover border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-stone-900 truncate">{product.name}</h3>
              <p className="mt-0.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {product.description || 'Pha chế tươi mới chuẩn vị.'}
              </p>
              <div className="mt-1 text-sm font-semibold text-stone-900">
                Giá gốc: {basePrice.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* 1. CHỌN SIZE (Task 4) */}
          <div className="border-t border-stone-100 pt-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                1. Kích cỡ (Size)
              </span>
              <span className="text-[11px] text-stone-400">Bắt buộc</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { size: 'S' as ProductSize, label: 'Size S' },
                  { size: 'M' as ProductSize, label: 'Size M' },
                  { size: 'L' as ProductSize, label: 'Size L' },
                ] as const
              ).map(({ size, label }) => {
                const offset = SIZE_PRICE_OFFSET[size];
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 transition-all ${
                      isSelected
                        ? 'border-[#5D3A1A] bg-[#FAF5F0] text-[#5D3A1A] font-semibold ring-1 ring-[#5D3A1A]'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-[11px] text-stone-500 mt-0.5">
                      {offset === 0 ? 'Chuẩn' : `+${offset.toLocaleString('vi-VN')}₫`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHỌN TOPPING (Task 4) */}
          <div className="border-t border-stone-100 pt-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                2. Topping
              </span>
              <span className="text-[11px] text-stone-400">Tùy chọn</span>
            </div>
            <div className="space-y-1.5">
              {displayToppings.map((topping) => {
                const isChecked = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <div
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                      isChecked
                        ? 'border-[#5D3A1A] bg-[#FAF5F0] text-stone-900'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          isChecked
                            ? 'border-[#5D3A1A] bg-[#5D3A1A] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-medium">{topping.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-stone-700">
                      +{Number(topping.price).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SỐ LƯỢNG */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-3.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                3. Số lượng
              </span>
            </div>
            <div className="flex items-center gap-2 border border-stone-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded text-stone-600 hover:bg-stone-100"
              >
                -
              </button>
              <span className="w-5 text-center text-xs font-semibold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-7 w-7 items-center justify-center rounded text-stone-600 hover:bg-stone-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Nút Thêm sản phẩm & Mua ngay */}
        <div className="border-t border-stone-200 bg-white p-3.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center justify-center rounded-lg border border-[#5D3A1A] bg-white hover:bg-stone-50 py-2.5 px-3 text-[#5D3A1A] text-xs sm:text-sm font-bold transition-colors shadow-2xs"
          >
            <span>Thêm sản phẩm</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex items-center justify-center rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] py-2.5 px-3 text-white text-xs sm:text-sm font-bold transition-colors shadow-xs"
          >
            <span>Mua ngay ({totalPrice.toLocaleString('vi-VN')}₫)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
