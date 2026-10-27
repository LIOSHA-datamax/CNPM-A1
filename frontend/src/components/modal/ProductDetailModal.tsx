'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, ProductSize, Topping, SelectedProductPayload } from '@/types/product';
import { DEFAULT_TOPPINGS, SIZE_PRICE_OFFSET } from '@/services/productService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (payload: SelectedProductPayload) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
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

  // Tính giá động theo thời gian thực (Task 4)
  const basePrice = Number(product.price);
  const sizeOffset = SIZE_PRICE_OFFSET[selectedSize] || 0;
  const toppingsTotal = selectedToppings.reduce((acc, t) => acc + Number(t.price), 0);
  const unitPrice = basePrice + sizeOffset + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      return exists ? prev.filter((t) => t.id !== topping.id) : [...prev, topping];
    });
  };

  const handleConfirmAddToCart = () => {
    const payload: SelectedProductPayload = {
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
    onAddToCart(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Khớp Wireframe (2): Nút mũi tên và tên món */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3.5">
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            title="Đóng"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Thân cuộn nội dung */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Thông tin món & Ảnh */}
          <div className="flex gap-3.5 items-center">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded-lg object-cover border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-stone-900 truncate">{product.name}</h3>
              <p className="mt-0.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {product.description || 'Pha chế tươi mới chuẩn vị tại quầy.'}
              </p>
              <div className="mt-1.5 text-sm font-semibold text-stone-900">
                Giá gốc: {basePrice.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* 1. CHỌN SIZE (Task 4) */}
          <div className="border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Kích cỡ (Size)
              </span>
              <span className="text-[11px] text-stone-400">Chọn 1</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { size: 'S', label: 'Size S' },
                  { size: 'M', label: 'Size M' },
                  { size: 'L', label: 'Size L' },
                ] as const
              ).map(({ size, label }) => {
                const offset = SIZE_PRICE_OFFSET[size];
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2.5 px-2 transition-all ${
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
          <div className="border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Topping thêm
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
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                      isChecked
                        ? 'border-[#5D3A1A] bg-[#FAF5F0] text-stone-900'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
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
          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Số lượng
              </span>
              <p className="text-[11px] text-stone-400">Tồn kho: {product.stock}</p>
            </div>
            <div className="flex items-center gap-2.5 border border-stone-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span className="w-6 text-center text-sm font-semibold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-7 w-7 items-center justify-center rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* NÚT THÊM VÀO GIỎ TỰ ĐỘNG CẬP NHẬT TIỀN */}
        <div className="border-t border-stone-200 bg-white p-4">
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="flex w-full items-center justify-between rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] px-4 py-3 text-white transition-colors text-sm font-semibold"
          >
            <span>Thêm vào giỏ</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </button>
        </div>
      </div>
    </div>
  );
};
