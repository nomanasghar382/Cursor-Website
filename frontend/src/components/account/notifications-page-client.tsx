"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { PreferenceToggle } from "@/components/account/preference-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { customerApi } from "@/lib/api/customer";
import type { CustomerPreferences, DashboardData } from "@/types/dashboard";

type Notification = DashboardData["notifications"][number];

const typeIcon = {
  ORDER: Bell,
  SECURITY: Shield,
  PROMOTION: Sparkles,
  SYSTEM: Mail,
} as const;

export function NotificationsPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    const [notificationResult, preferenceResult] = await Promise.all([
      customerApi.notifications(token),
      customerApi.preferences(token),
    ]);
    setNotifications(notificationResult.notifications);
    setUnreadCount(notificationResult.unreadCount);
    setPreferences(preferenceResult.preferences);
  };

  useEffect(() => {
    if (!ready || !token) return;
    void load().finally(() => setLoading(false));
  }, [ready, token]);

  const markRead = async (id: string) => {
    if (!token) return;
    const result = await customerApi.markNotificationRead(token, id);
    setNotifications(result.notifications);
    setUnreadCount(result.unreadCount);
  };

  const updatePreference = async (key: keyof CustomerPreferences, value: boolean) => {
    if (!token || !preferences) return;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    const result = await customerApi.updatePreferences(token, { [key]: value });
    setPreferences(result.preferences);
    toast.success("Preferences updated");
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading notifications...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Stay on top of orders, security alerts, promotions, and system updates."
        icon={Bell}
      />

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({unreadCount})</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <EmptyState
              title="All caught up"
              description="You have no notifications right now. Order and security alerts will appear here."
              icon={Bell}
            />
          ) : (
            notifications.map((notification, index) => {
              const Icon = typeIcon[notification.type as keyof typeof typeIcon] ?? Bell;
              return (
                <motion.article
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`flex flex-wrap items-start justify-between gap-4 rounded-[1.5rem] border px-5 py-4 ${
                    notification.read ? "border-border/40 opacity-80" : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        <Badge variant="secondary">{notification.type}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.read ? (
                    <Button size="sm" variant="outline" onClick={() => void markRead(notification.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </motion.article>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-6 space-y-3">
          {preferences ? (
            <>
              <PreferenceToggle
                id="email-order-updates"
                label="Email order updates"
                description="Shipping, delivery, and fulfillment notifications."
                checked={preferences.emailOrderUpdates}
                onCheckedChange={(checked) => void updatePreference("emailOrderUpdates", checked)}
              />
              <PreferenceToggle
                id="email-promotions"
                label="Email promotions"
                description="Exclusive offers and personalized campaigns."
                checked={preferences.emailPromotions}
                onCheckedChange={(checked) => void updatePreference("emailPromotions", checked)}
              />
              <PreferenceToggle
                id="push-order-updates"
                label="Push order updates"
                description="Real-time delivery and payment alerts."
                checked={preferences.pushOrderUpdates}
                onCheckedChange={(checked) => void updatePreference("pushOrderUpdates", checked)}
              />
              <PreferenceToggle
                id="push-promotions"
                label="Push promotions"
                description="Flash sales and AI-curated drops."
                checked={preferences.pushPromotions}
                onCheckedChange={(checked) => void updatePreference("pushPromotions", checked)}
              />
              <PreferenceToggle
                id="sms-alerts"
                label="SMS alerts"
                description="Critical security and delivery confirmations."
                checked={preferences.smsAlerts}
                onCheckedChange={(checked) => void updatePreference("smsAlerts", checked)}
              />
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
