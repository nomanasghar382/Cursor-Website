export type AdminExecutive = {
  revenue: number;
  orders: number;
  customers: number;
  vendors: number;
  products: number;
  conversionRate: number;
  lowStockAlerts: number;
};

export type AdminDashboard = {
  executive: AdminExecutive;
  orderBreakdown: Array<{ status: string; count: number }>;
  salesSeries: Array<{ day: string; revenue: number; orders: number }>;
  trafficSources: Array<{ source: string; visits: number }>;
  topProducts: Array<{ name: string; units: number; revenue: number }>;
  topCategories: Array<{ categoryId: string; name: string; count: number }>;
  latestOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
    customer: string;
    itemCount: number;
    createdAt: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    actorUserId: string | null;
    createdAt: string;
  }>;
  systemHealth: Array<{
    key: string;
    dimension: string;
    value: number;
    windowStart: string;
    windowEnd: string;
  }>;
};

export type AdminAiInsights = {
  salesForecast: { projectedRevenue: number; confidence: number; horizonDays: number };
  inventoryPrediction: { trackedSkus: number; availableUnits: number; reorderRisk: string };
  fraudDetection: { signalsLast7Days: number; riskLevel: string };
  productPerformance: Array<{
    productId: string;
    name: string;
    slug?: string;
    averageScore: number;
    recommendationCount: number;
  }>;
  marketingSuggestions: string[];
  supportAnalytics: { openReturns: number; pendingReviews: number };
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  visibility: string;
  basePrice: number;
  currencyCode: string;
  aiScore: number;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  store?: { id: string; name: string };
  imageUrl?: string;
  variantCount: number;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items?: T[];
  total: number;
  page: number;
  limit: number;
};

export type AdminOrder = {
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

export type AdminCustomer = {
  id: string;
  email: string;
  status: string;
  name: string;
  phone?: string | null;
  orderCount: number;
  wishlistCount: number;
  createdAt: string;
};

export type AdminVendor = {
  id: string;
  legalName: string;
  displayName: string;
  status: string;
  kycStatus: string;
  storeCount: number;
  userCount: number;
  createdAt: string;
};
