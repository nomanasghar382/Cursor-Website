export type ProductCard = {
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
};

export type ProductVariantView = {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  color?: string;
  size?: string;
  material?: string;
  label: string;
};

export type ProductImageView = {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
};

export type ProductReviewView = {
  id: string;
  rating: number;
  title?: string;
  body: string;
  author: string;
  createdAt: string;
  verified: boolean;
  images: string[];
};

export type ProductQuestionView = {
  id: string;
  question: string;
  answer?: string;
  author: string;
  createdAt: string;
};

export type ProductSpecificationView = {
  key: string;
  value: string;
  unit?: string;
};

export type ProductDetail = ProductCard & {
  currencyCode: string;
  specifications: ProductSpecificationView[];
  images: ProductImageView[];
  variants: ProductVariantView[];
  reviews: ProductReviewView[];
  questions: ProductQuestionView[];
  assets360: { url: string; frameCount: number }[];
  model3dUrl?: string;
  arModelUrl?: string;
  aiSummary: string;
  aiHighlights: string[];
  aiAlternatives: ProductCard[];
  crossSell: ProductCard[];
  upsell: ProductCard[];
  frequentlyBoughtTogether: ProductCard[];
  similarProducts: ProductCard[];
  estimatedDeliveryDays: number;
};

export type CatalogFacets = {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
  minPrice: number;
  maxPrice: number;
};

export type ProductListResponse = {
  products: ProductCard[];
  count: number;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: CatalogFacets;
};

export type ProductDetailResponse = {
  product: ProductDetail;
};

export type CatalogSection = "featured" | "trending" | "new" | "bestseller" | "flash-sale";

export type CatalogSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"
  | "trending"
  | "discount"
  | "ai-recommended";

export type CatalogViewMode = "grid" | "list";

export type ProductQuery = {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  section?: CatalogSection;
  sort?: CatalogSort;
  page?: number;
  limit?: number;
};
