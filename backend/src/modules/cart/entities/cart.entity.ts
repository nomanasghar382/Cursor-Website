export interface CartLineView {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  imageUrl?: string;
  gradient: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  brand?: string;
}

export interface CartView {
  id: string;
  currencyCode: string;
  items: CartLineView[];
  savedForLater: CartLineView[];
  subtotal: number;
  itemCount: number;
  estimatedTax: number;
  shippingEstimate: number;
  aiSuggestions: string[];
  crossSell: string[];
  upsell: string[];
}
