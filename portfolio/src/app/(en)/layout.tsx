import type { Metadata } from "next";
import "../globals.css";
import { bodyClassName, SiteChrome } from "@/components/site-chrome";
import { fontMono, fontSans } from "@/lib/fonts";
import { localeConfig } from "@/lib/i18n";
import { rootMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = rootMetadata("en");

/** Root layout for the English site (/en, /en/blog). */
export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={localeConfig.en.htmlLang} suppressHydrationWarning>
      <body className={cn(bodyClassName, fontSans.variable, fontMono.variable)} suppressHydrationWarning>
        <SiteChrome locale="en">{children}</SiteChrome>
      </body>
    </html>
  );
}
