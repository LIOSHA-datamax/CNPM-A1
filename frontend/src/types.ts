// Định nghĩa kiểu dữ liệu dùng chung toàn bộ Frontend BrewLite

export type ProductSize = 'S' | 'M' | 'L';

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number; // Giá cơ bản cho Size S
  imageUrl: string;
  stock: number;
  isActive?: boolean;
}

export interface SelectedProductPayload {
  productId: string;
  name: string;
  imageUrl: string;
  size: ProductSize;
  sizePriceOffset: number;
  selectedToppings: Topping[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartItem extends SelectedProductPayload {
  cartItemId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'BARISTA' | 'ADMIN';
  loyaltyPoints: number;
}
