'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-stone-200 bg-white p-3 shadow-2xs transition-all duration-150 ${
        isOutOfStock
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:border-stone-300 hover:shadow-xs'
      }`}
    >
      {/* Khung ảnh món */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-102"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 backdrop-blur-2xs">
            <span className="rounded bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
              Hết hàng
            </span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 rounded bg-stone-900/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-2xs">
            Còn {product.stock}
          </div>
        )}

        {product.category && (
          <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-stone-700">
            {product.category}
          </div>
        )}
      </div>

      {/* Thông tin món */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-stone-900 group-hover:text-amber-900">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-stone-500 leading-normal">
            {product.description || 'Pha chế tươi mới tại quầy.'}
          </p>
        </div>

        {/* Giá & Nút chọn món */}
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5">
          <div>
            <span className="block text-[10px] text-stone-400">Giá từ</span>
            <span className="text-sm font-bold text-stone-900">
              {Number(product.price).toLocaleString('vi-VN')}₫
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] px-2.5 py-1.5 text-xs font-medium text-white transition-colors disabled:bg-stone-300"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
