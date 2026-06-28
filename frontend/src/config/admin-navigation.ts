import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  FileText,
  Globe,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Warehouse,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export const adminNavigation: AdminNavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Vendors", href: "/admin/vendors", icon: Store },
  { title: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { title: "Content", href: "/admin/content", icon: FileText },
  { title: "SEO", href: "/admin/seo", icon: Globe },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "AI Insights", href: "/admin/ai", icon: Bot },
  { title: "System", href: "/admin/system", icon: Settings },
];

export const adminQuickActions = [
  { label: "Create product", href: "/admin/products" },
  { label: "Review orders", href: "/admin/orders" },
  { label: "Approve vendors", href: "/admin/vendors" },
  { label: "Export revenue report", href: "/admin/analytics" },
];
