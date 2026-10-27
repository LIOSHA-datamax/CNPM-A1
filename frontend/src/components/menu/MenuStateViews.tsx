import React from 'react';

export const MenuSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-3 animate-pulse"
        >
          <div className="aspect-square w-full rounded-lg bg-stone-100" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-stone-200" />
            <div className="h-3 w-full rounded bg-stone-100" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2">
            <div className="h-4 w-1/3 rounded bg-stone-200" />
            <div className="h-7 w-14 rounded-lg bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyMenu: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500 mb-3">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
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
      <h3 className="text-sm font-semibold text-stone-800">Không có sản phẩm nào phù hợp</h3>
      <p className="mt-1 text-xs text-stone-500 max-w-sm">
        Thử thay đổi từ khóa tìm kiếm hoặc bấm tải lại để cập nhật menu mới.
      </p>
      <button
        onClick={onRefresh}
        className="mt-4 rounded-lg bg-[#5D3A1A] hover:bg-[#472C14] px-4 py-2 text-xs font-medium text-white transition-colors"
      >
        Tải lại Menu
      </button>
    </div>
  );
};

export const ErrorMenu: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 py-10 px-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-2">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-stone-900">Không thể kết nối đến máy chủ</h3>
      <p className="mt-1 text-xs text-stone-500 max-w-md">{error}</p>
      <button
        onClick={onRetry}
        className="mt-3.5 rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
};
