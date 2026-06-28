export type CartLine = {
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
};

export type CartView = {
  id: string;
  currencyCode: string;
  items: CartLine[];
  savedForLater: CartLine[];
  subtotal: number;
  itemCount: number;
  estimatedTax: number;
  shippingEstimate: number;
  aiSuggestions: string[];
  crossSell: string[];
  upsell: string[];
};

export type GuestCartItem = {
  variantId: string;
  productId: string;
  quantity: number;
};

export type WishlistItemView = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  imageUrl?: string;
  category: string;
  brand?: string;
  price: number;
  stock: number;
  inStock: boolean;
  note?: string;
  priceDropAlert: boolean;
  backInStockAlert: boolean;
  gradient: string;
};

export type WishlistView = {
  id: string;
  name: string;
  isDefault: boolean;
  itemCount: number;
  analytics: { views: number; shares: number };
  items: WishlistItemView[];
};

export type ShippingMethod = {
  id: string;
  name: string;
  carrier: string;
  serviceLevel: string;
  price: number;
  currencyCode: string;
  estimatedDays: number;
};

export type CheckoutAddress = {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
};

export type CheckoutPreview = {
  lines: Array<{
    variantId: string;
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  couponDiscount: number;
  grandTotal: number;
  shippingMethodId: string;
  shippingCarrier: string;
  estimatedDeliveryDays: number;
  aiSuggestions: string[];
  crossSell: string[];
  upsell: string[];
  coupon?: { id: string; code: string };
  giftCard?: { giftCardId: string; appliedAmount: number };
};

export type CheckoutPayment = {
  id: string;
  gateway: string;
  status: string;
  clientSecret: string | null;
  publishableKey: string | null;
  supportedGateways: string[];
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  currencyCode: string;
  subtotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  discountTotal?: number;
  grandTotal: number;
  itemCount?: number;
  createdAt?: string;
  estimatedDeliveryDays: number;
  invoiceNumber?: string;
  items?: Array<{
    id: string;
    productName: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  timeline?: Array<{ key: string; label: string; completed: boolean; current: boolean }>;
  payments?: Array<{ id: string; gateway: string; status: string; amount: number; clientSecret?: string | null }>;
  shipments?: Array<{
    id: string;
    carrier: string;
    status: string;
    trackingNumber?: string | null;
    method: string;
    events?: Array<{ id: string; status: string; description?: string | null; occurredAt: string }>;
  }>;
  shippingAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  deliveryInstructions?: string;
  notes?: Array<{ id: string; note: string; createdAt: string; author?: string }>;
  returns?: Array<{ id: string; status: string; reason: string; requestedAt: string }>;
  coupon?: string;
};
