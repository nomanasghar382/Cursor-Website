import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Headphones,
  Home,
  LayoutDashboard,
  Shield,
  ShoppingBag,
  Sparkles,
  Watch,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: NavItem[];
};

export const primaryNavigation: NavItem[] = [
  {
    title: "Discover",
    href: "/products",
    children: [
      {
        title: "Robotics",
        href: "/products?category=robotics",
        description: "Autonomous assistants and precision robotics.",
        icon: Bot,
        badge: "AI Best Match",
      },
      {
        title: "Smart Home",
        href: "/products?category=smart-home",
        description: "Ambient intelligence for every room.",
        icon: Home,
      },
      {
        title: "Wearables",
        href: "/products?category=wearables",
        description: "Premium devices with adaptive AI.",
        icon: Watch,
      },
      {
        title: "Immersive Audio",
        href: "/products?category=immersive-audio",
        description: "Spatial sound engineered for focus.",
        icon: Headphones,
      },
    ],
  },
  { title: "AI Studio", href: "/ai", description: "Personalized product intelligence." },
  { title: "Enterprise", href: "/enterprise", description: "Vendor and operations tooling." },
];

export const accountNavigation: NavItem[] = [
  { title: "Overview", href: "/account", icon: LayoutDashboard },
  { title: "Orders", href: "/account/orders", icon: ShoppingBag },
  { title: "Security", href: "/account/security", icon: Shield },
  { title: "AI Preferences", href: "/account/ai", icon: Sparkles },
];

export const footerNavigation = {
  product: [
    { title: "Catalog", href: "/products" },
    { title: "AI Recommendations", href: "/ai" },
    { title: "Enterprise", href: "/enterprise" },
  ],
  company: [
    { title: "About", href: "/about" },
    { title: "Careers", href: "/careers" },
    { title: "Press", href: "/press" },
  ],
  support: [
    { title: "Help Center", href: "/support" },
    { title: "Security", href: "/account/security" },
    { title: "Contact", href: "/contact" },
  ],
  legal: [
    { title: "Privacy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
    { title: "Cookies", href: "/cookies" },
  ],
} as const;
