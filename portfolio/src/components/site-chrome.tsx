import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollProgress } from "@/components/scroll-progress";
import { BackToTop } from "@/components/back-to-top";
import { CookieConsent } from "@/components/cookie-consent";
import { VisitorTracker } from "@/components/visitor-tracker";
import { getDictionary } from "@/data/dictionaries";
import { getHubTags, getTranslatedSlugs } from "@/data/blog";
import { otherLocale, type Locale } from "@/lib/i18n";

/** Everything inside <body> shared by the French and English root layouts. */
export async function SiteChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = getDictionary(locale);
  const [translatedSlugs, targetHubTags] = await Promise.all([
    getTranslatedSlugs(),
    getHubTags(otherLocale(locale)),
  ]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider delayDuration={0}>
        <ScrollProgress />
        {children}
        <BackToTop label={t.a11y.backToTop} />
        <Navbar
          locale={locale}
          translatedSlugs={translatedSlugs}
          targetTagSlugs={targetHubTags.map((tag) => tag.slug)}
        />
      </TooltipProvider>
      {/* Loads Vercel Analytics only once the visitor accepts. */}
      <CookieConsent labels={t.cookies} />
      <VisitorTracker />
    </ThemeProvider>
  );
}

export const bodyClassName =
  "min-h-screen bg-background font-sans antialiased max-w-4xl mx-auto pt-6 pb-12 sm:pt-10 sm:pb-24 px-6";
