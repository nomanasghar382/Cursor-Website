import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import { fontDisplay, fontSans } from "@/lib/fonts";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased`}>
        <AppProviders>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
          />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
