import Link from "next/link";
import { Code2, Globe, Share2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { HomepageNewsletter } from "@/components/home/homepage-newsletter";

const socialLinks = [
  { href: siteConfig.links.twitter, label: "Social", icon: Share2 },
  { href: siteConfig.links.github, label: "GitHub", icon: Code2 },
  { href: "https://linkedin.com/company/novaex", label: "Website", icon: Globe },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <HomepageNewsletter />
        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <p className="font-display text-2xl font-semibold tracking-[0.18em]">{siteConfig.name}</p>
            <p className="max-w-md text-sm text-muted-foreground">{siteConfig.description}</p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          {Object.entries(footerNavigation).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{section}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-foreground">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/80 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
