export type OrderTimelineStep = {
  key: string;
  label: string;
  completed: boolean;
  current: boolean;
};

export type OrderShipmentView = {
  id: string;
  carrier: string;
  status: string;
  trackingNumber?: string | null;
  method: string;
  shippedAt?: string;
  deliveredAt?: string;
  events: Array<{
    id: string;
    status: string;
    description?: string | null;
    location?: string | null;
    occurredAt: string;
  }>;
};

export type OrderPaymentView = {
  id: string;
  gateway: string;
  status: string;
  amount: number;
  clientSecret?: string | null;
  refunds?: Array<{ id: string; amount: number; status: string }>;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  currencyCode: string;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  itemCount: number;
  createdAt: string;
  estimatedDeliveryDays: number;
  items: Array<{
    id: string;
    productId?: string;
    productName: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  shippingAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  deliveryInstructions?: string;
  notes?: Array<{ id: string; note: string; createdAt: string; author?: string }>;
  payments?: OrderPaymentView[];
  shipments?: OrderShipmentView[];
  returns?: Array<{ id: string; status: string; reason: string; requestedAt: string }>;
  invoiceNumber?: string;
  coupon?: string;
  timeline: OrderTimelineStep[];
  customerEmail?: string;
  customerName?: string;
};

export type OrderTracking = {
  orderNumber: string;
  status: string;
  timeline: OrderTimelineStep[];
  shipments: OrderShipmentView[];
  estimatedDeliveryDays: number;
};

export type InvoicePayload = {
  invoiceNumber: string;
  issuedAt?: string;
  orderNumber: string;
  status: string;
  currencyCode: string;
  billing?: Record<string, string>;
  shipping?: Record<string, string>;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  items: Array<{
    name: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    taxAmount: number;
    lineTotal: number;
  }>;
  payments: Array<{ gateway: string; status: string; amount: number }>;
  pdf: {
    architecture: string;
    template: string;
    downloadUrl?: string | null;
    renderEndpoint: string;
  };
};

export type ShippingCatalog = {
  methods: Array<{
    id: string;
    name: string;
    carrier: string;
    serviceLevel: string;
    price: number;
    currencyCode: string;
    estimatedDays: number;
  }>;
  zones: Array<{
    id: string;
    name: string;
    country: string;
    city?: string;
    postalCodePattern?: string | null;
  }>;
};

export type FulfillmentAnalytics = {
  orders: Array<{ status: string; count: number }>;
  payments: Array<{ status: string; count: number; amount: number }>;
  shipments: Array<{ status: string; count: number }>;
  refunds: { count: number; amount: number };
};
