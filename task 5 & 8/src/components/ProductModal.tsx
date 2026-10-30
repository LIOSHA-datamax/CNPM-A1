'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, ProductSize, Topping, SelectedProductPayload } from '@/types';

// Danh sách Topping chuẩn theo đề bài (Mục 7)
export const DEFAULT_TOPPINGS: Topping[] = [
  { id: 'top-1', name: 'Trân châu đen', price: 5000 },
  { id: 'top-2', name: 'Trân châu trắng', price: 7000 },
  { id: 'top-3', name: 'Kem cheese (Kem)', price: 10000 },
  { id: 'top-4', name: 'Thạch cà phê', price: 6000 },
];

export const SIZE_PRICE_OFFSET: Record<ProductSize, number> = {
  S: 0,
  M: 5000,
  L: 10000,
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (payload: SelectedProductPayload) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

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

  const handleConfirm = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      size: selectedSize,
      sizePriceOffset: sizeOffset,
      selectedToppings,
      quantity,
      unitPrice,
      totalPrice,
    });
    onClose();
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
              {DEFAULT_TOPPINGS.map((topping) => {
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
                      +{topping.price.toLocaleString('vi-VN')}₫
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

        {/* Nút Thêm vào giỏ */}
        <div className="border-t border-stone-200 bg-white p-3.5">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex w-full items-center justify-between rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] px-4 py-2.5 text-white text-sm font-semibold transition-colors"
          >
            <span>Thêm vào giỏ</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </button>
        </div>
      </div>
    </div>
  );
};
