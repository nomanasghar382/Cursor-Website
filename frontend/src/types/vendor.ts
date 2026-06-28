export type VendorDashboard = {
  executive: {
    revenue: number;
    orders: number;
    products: number;
    averageRating: number;
    reviewCount: number;
    healthScore: number;
    lowStockAlerts: number;
  };
  orderBreakdown: Array<{ status: string; count: number }>;
  salesSeries: Array<{ day: string; revenue: number; orders: number }>;
  pendingOrders: VendorOrder[];
  recentOrders: VendorOrder[];
  lowStockAlerts: Array<{ id: string; productName: string; sku: string; warehouse: string; available: number }>;
  topProducts: Array<{ name: string; units: number; revenue: number }>;
  notifications: Array<{ id: string; title: string; body: string; createdAt: string }>;
  quickActions: Array<{ label: string; href: string }>;
};

export type VendorOrder = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  currencyCode: string;
  itemCount: number;
  customerEmail?: string;
  customerName?: string;
  createdAt: string;
};

export type VendorProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  basePrice: number;
  currencyCode: string;
  aiScore: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
  variantCount: number;
  imageCount: number;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
};

export type VendorStore = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  status: string;
  currency: string;
  productCount: number;
  orderCount: number;
  vendor: { id: string; displayName: string; status: string; kycStatus: string };
  seoTitle: string;
  seoDescription?: string | null;
  bannerUrl?: string | null;
  policies: Record<string, string>;
  vacationMode: boolean;
  theme: string;
};

export type VendorAiInsights = {
  salesForecast: { projectedRevenue: number; horizonDays: number; confidence: number };
  inventoryPrediction: { lowStockSkus: number; recommendation: string };
  pricingSuggestions: Array<{ productId: string; name: string; currentPrice: number; suggestedPrice: number; reason: string }>;
  marketingSuggestions: string[];
  customerInsights: { uniqueBuyers: number; visitorSignals: number; repeatPurchaseRate: number };
};

export type VendorPayouts = {
  earnings: {
    grossRevenue: number;
    commission: number;
    commissionRate: number;
    netEarnings: number;
    pendingSettlement: number;
  };
  architecture: string[];
  transactions: Array<{ id: string; orderNumber: string; status: string; amount: number; createdAt: string }>;
  invoices: Array<{ id: string; invoiceNumber: string; orderNumber: string; issuedAt?: string }>;
  commissionReports: Array<{ orderNumber: string; gross: number; commission: number; net: number }>;
};
