import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  DollarSign,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Store,
  Users,
  Warehouse,
} from "lucide-react";

export type VendorNavItem = { title: string; href: string; icon: LucideIcon };

export const vendorNavigation: VendorNavItem[] = [
  { title: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { title: "Store", href: "/vendor/store", icon: Store },
  { title: "Products", href: "/vendor/products", icon: Package },
  { title: "Inventory", href: "/vendor/inventory", icon: Warehouse },
  { title: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  { title: "Customers", href: "/vendor/customers", icon: Users },
  { title: "Reviews", href: "/vendor/reviews", icon: Star },
  { title: "Payouts", href: "/vendor/payouts", icon: DollarSign },
  { title: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { title: "AI Studio", href: "/vendor/ai", icon: Bot },
];

export const vendorQuickActions = [
  { label: "Add product", href: "/vendor/products" },
  { label: "Fulfill orders", href: "/vendor/orders" },
  { label: "Request payout", href: "/vendor/payouts" },
  { label: "Optimize store", href: "/vendor/store" },
];
