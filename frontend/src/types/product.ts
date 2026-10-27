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
  price: number; // Base price for Size S
  imageUrl: string;
  stock: number;
  version?: number;
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
