export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  categoryId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
