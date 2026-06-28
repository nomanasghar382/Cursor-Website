"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { PreferenceToggle } from "@/components/account/preference-toggle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { customerApi } from "@/lib/api/customer";
import type { CustomerSettings } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

const currencies = ["USD", "EUR", "GBP", "JPY", "AUD"];

export function SettingsPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/settings");
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<CustomerSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void customerApi.settings(token).then((result) => setSettings(result.settings)).finally(() => setLoading(false));
  }, [ready, token]);

  const saveSettings = async (patch: Partial<CustomerSettings>) => {
    if (!token || !settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    const result = await customerApi.updateSettings(token, patch);
    setSettings(result.settings);
    if (patch.theme) setTheme(patch.theme);
    toast.success("Settings saved");
  };

  if (loading || !settings) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Theme, language, currency, privacy, and accessibility preferences."
        icon={Settings}
      />

      <section className="space-y-4 rounded-[2rem] border border-border/60 p-6">
        <h2 className="font-display text-2xl font-semibold">Appearance</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["light", "dark", "system"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => void saveSettings({ theme: value })}
              className={cn(
                "rounded-[1.25rem] border px-4 py-4 text-left capitalize transition-colors",
                (theme ?? settings.theme) === value ? "border-primary bg-primary/10" : "border-border/60 hover:bg-secondary/60",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-[2rem] border border-border/60 p-6">
          <h2 className="font-display text-2xl font-semibold">Language</h2>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred language</Label>
            <select
              id="language"
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
              value={settings.language}
              onChange={(event) => void saveSettings({ language: event.target.value })}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-border/60 p-6">
          <h2 className="font-display text-2xl font-semibold">Currency</h2>
          <div className="space-y-2">
            <Label htmlFor="currency">Display currency</Label>
            <select
              id="currency"
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
              value={settings.currency}
              onChange={(event) => void saveSettings({ currency: event.target.value })}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-[2rem] border border-border/60 p-6">
        <h2 className="font-display text-2xl font-semibold">Privacy & accessibility</h2>
        <PreferenceToggle
          id="marketing-opt-in"
          label="Marketing communications"
          description="Receive personalized offers and product discovery updates."
          checked={settings.marketingOptIn}
          onCheckedChange={(checked) => void saveSettings({ marketingOptIn: checked })}
        />
        <PreferenceToggle
          id="reduced-motion"
          label="Reduced motion"
          description="Minimize animations for a calmer experience."
          checked={settings.reducedMotion}
          onCheckedChange={(checked) => void saveSettings({ reducedMotion: checked })}
        />
      </section>

      <Button variant="outline" onClick={() => void saveSettings(settings)}>
        Save all settings
      </Button>
    </div>
  );
}
