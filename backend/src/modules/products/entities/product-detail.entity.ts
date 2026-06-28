import { ProductCard } from "./product-card.entity";

export interface ProductVariantView {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  color?: string;
  size?: string;
  material?: string;
  label: string;
}

export interface ProductImageView {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductReviewView {
  id: string;
  rating: number;
  title?: string;
  body: string;
  author: string;
  createdAt: string;
  verified: boolean;
  images: string[];
}

export interface ProductQuestionView {
  id: string;
  question: string;
  answer?: string;
  author: string;
  createdAt: string;
}

export interface ProductSpecificationView {
  key: string;
  value: string;
  unit?: string;
}

export interface ProductDetail extends ProductCard {
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
}
