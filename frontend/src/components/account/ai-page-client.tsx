"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PreferenceToggle } from "@/components/account/preference-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { customerApi } from "@/lib/api/customer";
import type { CustomerPreferences, DashboardData } from "@/types/dashboard";

export function AiPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/ai");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void Promise.all([customerApi.dashboard(token), customerApi.preferences(token)])
      .then(([dashboardResult, preferenceResult]) => {
        setDashboard(dashboardResult);
        setPreferences(preferenceResult.preferences);
      })
      .finally(() => setLoading(false));
  }, [ready, token]);

  const updatePreference = async (key: keyof CustomerPreferences, value: boolean) => {
    if (!token || !preferences) return;
    const result = await customerApi.updatePreferences(token, { [key]: value });
    setPreferences(result.preferences);
  };

  if (loading || !dashboard) {
    return <p className="text-muted-foreground">Loading AI preferences...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Studio"
        title="AI preferences"
        description="Tune your shopping assistant, discovery signals, and personalized recommendations."
        icon={Sparkles}
      />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/40 to-card/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI shopping assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {dashboard.aiInsights.map((insight) => (
            <p key={insight} className="rounded-[1rem] border border-border/60 bg-card/50 px-4 py-3">
              {insight}
            </p>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard icon={TrendingUp} title="Purchase insights" text="Budget-aware suggestions based on your order history." />
        <InsightCard icon={Wand2} title="Product discovery" text="Surface emerging categories aligned with your interests." />
        <InsightCard icon={Sparkles} title="Reorder intelligence" text="Predict replenishment windows for consumables and accessories." />
      </section>

      {preferences ? (
        <section className="space-y-3 rounded-[2rem] border border-border/60 p-6">
          <h2 className="font-display text-2xl font-semibold">Communication signals</h2>
          <PreferenceToggle
            id="ai-email-promotions"
            label="AI-curated email drops"
            description="Personalized campaigns powered by your browsing graph."
            checked={preferences.emailPromotions}
            onCheckedChange={(checked) => void updatePreference("emailPromotions", checked)}
          />
          <PreferenceToggle
            id="ai-push-promotions"
            label="AI push discovery"
            description="Real-time recommendations when new inventory matches your profile."
            checked={preferences.pushPromotions}
            onCheckedChange={(checked) => void updatePreference("pushPromotions", checked)}
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Recommended for you</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.recommendations.map((item, index) => (
            <motion.article
              key={item.productId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[1.5rem] border border-border/60 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                </div>
                <Badge variant="accent">{Math.round(item.score * 100)}% match</Badge>
              </div>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href={`/products/${item.productId}`}>View product</Link>
              </Button>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}

function InsightCard({ icon: Icon, title, text }: { icon: typeof Bot; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border/60 p-5">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
