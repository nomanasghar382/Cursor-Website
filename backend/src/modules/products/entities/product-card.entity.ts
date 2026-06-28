export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  brand?: string;
  brandSlug?: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  badge: string;
  badges: string[];
  aiMatch: number;
  description: string;
  gradient: string;
  imageUrl?: string;
  colors: string[];
  discountPercent?: number;
  defaultVariantId?: string;
  createdAt: string;
}
