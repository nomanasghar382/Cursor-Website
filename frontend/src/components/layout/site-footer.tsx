import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/config/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-5 md:px-6">
        <div className="space-y-4 lg:col-span-2">
          <p className="font-display text-2xl font-semibold tracking-[0.18em]">{siteConfig.name}</p>
          <p className="max-w-md text-sm text-muted-foreground">{siteConfig.description}</p>
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
      <div className="border-t border-border/80 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
