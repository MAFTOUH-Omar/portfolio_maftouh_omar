import type { Metadata } from "next";
import "../globals.css";
import { bodyClassName, SiteChrome } from "@/components/site-chrome";
import { fontMono, fontSans } from "@/lib/fonts";
import { localeConfig } from "@/lib/i18n";
import { rootMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = rootMetadata("fr");

/** Root layout for the French site (/, /blog). English has its own in app/(en). */
export default function FrenchRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={localeConfig.fr.htmlLang} suppressHydrationWarning>
      <body className={cn(bodyClassName, fontSans.variable, fontMono.variable)} suppressHydrationWarning>
        <SiteChrome locale="fr">{children}</SiteChrome>
      </body>
    </html>
  );
}
