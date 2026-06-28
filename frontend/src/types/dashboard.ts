export type DashboardWelcome = {
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountCompletion: number;
};

export type DashboardLoyalty = {
  points: number;
  tier: string;
  nextTierAt: number | null;
};

export type DashboardWallet = {
  balance: number;
  currencyCode: string;
  architecture: string;
};

export type DashboardStatistics = {
  totalOrders: number;
  lifetimeSpend: number;
  wishlistItems: number;
  savedAddresses: number;
  unreadNotifications: number;
};

export type DashboardData = {
  welcome: DashboardWelcome;
  loyalty: DashboardLoyalty;
  wallet: DashboardWallet;
  statistics: DashboardStatistics;
  quickActions: { label: string; href: string }[];
  aiInsights: string[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
    createdAt: string;
    itemCount: number;
    estimatedDeliveryDays: number;
  }>;
  wishlistSummary: {
    count: number;
    items: Array<{ id: string; productId: string; name: string; imageUrl?: string }>;
  };
  addresses: Array<{
    id: string;
    label?: string;
    recipientName: string;
    line1: string;
    postalCode?: string;
    isDefault: boolean;
  }>;
  recentlyViewed: Array<{
    productId: string;
    name: string;
    slug: string;
    imageUrl?: string;
    category: string;
    viewedAt: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }>;
  recommendations: Array<{
    productId: string;
    name: string;
    slug: string;
    imageUrl?: string;
    score: number;
    reason: string;
  }>;
};

export type CustomerAddress = {
  id: string;
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  isDefault: boolean;
};

export type CustomerPreferences = {
  emailOrderUpdates: boolean;
  emailPromotions: boolean;
  pushOrderUpdates: boolean;
  pushPromotions: boolean;
  smsAlerts: boolean;
};

export type CustomerSettings = {
  theme: "light" | "dark" | "system";
  language: string;
  currency: string;
  reducedMotion: boolean;
  marketingOptIn: boolean;
};
