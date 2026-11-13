import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollProgress } from "@/components/scroll-progress";
import { BackToTop } from "@/components/back-to-top";
import { CookieConsent } from "@/components/cookie-consent";
import { getDictionary } from "@/data/dictionaries";
import { getTranslatedSlugs } from "@/data/blog";
import type { Locale } from "@/lib/i18n";

/** Everything inside <body> shared by the French and English root layouts. */
export function SiteChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = getDictionary(locale);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider delayDuration={0}>
        <ScrollProgress />
        {children}
        <BackToTop label={t.a11y.backToTop} />
        <Navbar locale={locale} translatedSlugs={getTranslatedSlugs()} />
      </TooltipProvider>
      {/* Loads Vercel Analytics only once the visitor accepts. */}
      <CookieConsent labels={t.cookies} />
    </ThemeProvider>
  );
}

export const bodyClassName =
  "min-h-screen bg-background font-sans antialiased max-w-4xl mx-auto pt-6 pb-12 sm:pt-10 sm:pb-24 px-6";
