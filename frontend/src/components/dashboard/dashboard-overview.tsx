"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CreditCard,
  MapPin,
  Package,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

export function DashboardOverview({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card/40 to-card/20 p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Welcome back</p>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">{data.welcome.name}</h1>
            <p className="max-w-2xl text-muted-foreground">
              Your AI-powered command center for orders, rewards, addresses, and premium shopping intelligence.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={data.welcome.emailVerified ? "success" : "secondary"}>
                {data.welcome.emailVerified ? "Email verified" : "Email pending"}
              </Badge>
              <Badge variant="accent">{data.loyalty.tier} member</Badge>
              <Badge variant="secondary">{data.welcome.accountCompletion}% profile complete</Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.quickActions.map((action) => (
              <Button key={action.href} asChild variant="outline" className="justify-between">
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Orders" value={String(data.statistics.totalOrders)} hint="Lifetime purchases" />
        <StatCard icon={TrendingUp} label="Lifetime spend" value={formatCurrency(data.statistics.lifetimeSpend)} hint="Verified total" />
        <StatCard icon={Star} label="Reward points" value={String(data.loyalty.points)} hint={data.loyalty.tier} />
        <StatCard icon={Bell} label="Notifications" value={String(data.statistics.unreadNotifications)} hint="Unread alerts" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI shopping insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {data.aiInsights.map((insight) => (
              <p key={insight} className="rounded-xl border border-border/50 px-4 py-3">
                {insight}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Loyalty & wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Reward points</p>
              <p className="font-display text-3xl font-semibold">{data.loyalty.points}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet balance</p>
              <p className="font-display text-2xl font-semibold">{formatCurrency(data.wallet.balance)}</p>
            </div>
            <p className="text-xs text-muted-foreground">{data.wallet.architecture}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardListCard
          title="Recent orders"
          href="/account/orders"
          items={data.recentOrders.map((order) => ({
            id: order.id,
            title: order.orderNumber,
            subtitle: `${order.itemCount} items · ${order.status}`,
            meta: formatCurrency(order.grandTotal),
            href: `/account/orders/${order.id}`,
          }))}
        />
        <DashboardListCard
          title="Notifications"
          href="/account/notifications"
          items={data.notifications.map((entry) => ({
            id: entry.id,
            title: entry.title,
            subtitle: entry.body,
            meta: entry.read ? "Read" : "New",
            href: "/account/notifications",
          }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardListCard
          title="Saved addresses"
          href="/account/addresses"
          items={data.addresses.map((address) => ({
            id: address.id,
            title: address.label ?? "Address",
            subtitle: `${address.recipientName} · ${address.line1}`,
            meta: address.isDefault ? "Default" : "",
            href: "/account/addresses",
          }))}
          icon={MapPin}
        />
        <DashboardListCard
          title="Wishlist"
          href="/wishlist"
          items={data.wishlistSummary.items.map((item) => ({
            id: item.id,
            title: item.name,
            subtitle: "Saved item",
            href: `/products/${item.productId}`,
          }))}
        />
        <DashboardListCard
          title="AI recommendations"
          href="/products"
          items={data.recommendations.map((item) => ({
            id: item.productId,
            title: item.name,
            subtitle: item.reason,
            meta: `${item.score}%`,
            href: `/products/${item.productId}`,
          }))}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-border/60 bg-card/40 transition hover:border-primary/30 hover:shadow-[var(--shadow-soft)]">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <p className="font-display text-3xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function DashboardListCard({
  title,
  href,
  items,
  icon: Icon,
}: {
  title: string;
  href: string;
  items: Array<{ id: string; title: string; subtitle?: string; meta?: string; href: string }>;
  icon?: typeof Package;
}) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
          {title}
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href={href}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3 transition hover:border-primary/30"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                {item.subtitle ? <p className="text-xs text-muted-foreground">{item.subtitle}</p> : null}
              </div>
              {item.meta ? <span className="text-xs text-primary">{item.meta}</span> : null}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
        ))}
      </div>
    </div>
  );
}
