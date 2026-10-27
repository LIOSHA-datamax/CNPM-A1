import { Product, Topping } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const DEFAULT_TOPPINGS: Topping[] = [
  { id: 'top-1', name: 'Trân châu đen', price: 5000 },
  { id: 'top-2', name: 'Trân châu trắng', price: 7000 },
  { id: 'top-3', name: 'Kem cheese (Kem)', price: 10000 },
  { id: 'top-4', name: 'Thạch cà phê', price: 6000 },
];

export const SIZE_PRICE_OFFSET: Record<string, number> = {
  S: 0,
  M: 5000,
  L: 10000,
};

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Máy chủ phản hồi mã lỗi: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Backend chưa khởi động hoặc gặp lỗi, sử dụng dữ liệu mẫu từ đề bài:', error);
    return [
      {
        id: 'prod-1',
        name: 'Cà phê sữa',
        category: 'Cà phê truyền thống',
        description: 'Cà phê Robusta truyền thống kết hợp sữa đặc ngọt béo thơm lừng.',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
        stock: 50,
        isActive: true,
      },
      {
        id: 'prod-2',
        name: 'Americano',
        category: 'Cà phê Espresso',
        description: 'Espresso đậm vị pha loãng cùng nước tinh khiết thanh nhẹ.',
        price: 40000,
        imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600',
        stock: 40,
        isActive: true,
      },
      {
        id: 'prod-3',
        name: 'Cappuccino',
        category: 'Cà phê Espresso',
        description: 'Espresso Ý hòa quyện cùng lớp bọt sữa mịn màng bồng bềnh.',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
        stock: 35,
        isActive: true,
      },
      {
        id: 'prod-4',
        name: 'Trà đào',
        category: 'Trà hoa quả',
        description: 'Trà đen thơm mát kết hợp miếng đào tươi giòn sần sật.',
        price: 39000,
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
        stock: 60,
        isActive: true,
      },
    ];
  }
}
