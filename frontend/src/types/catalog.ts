export type ProductCard = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  badge: string;
  aiMatch: number;
  description: string;
  gradient: string;
};

export type ProductListResponse = {
  products: ProductCard[];
  count: number;
};

export type ProductQuery = {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
};
