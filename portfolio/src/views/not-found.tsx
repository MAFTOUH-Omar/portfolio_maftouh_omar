import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDictionary } from "@/data/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";

/**
 * In-locale 404 (a post or tag that doesn't exist, `notFound()`), rendered
 * inside that locale's layout so the navbar stays usable. Next.js still
 * answers 404 and adds `noindex`; the links give readers — and crawlers
 * following a stale URL — a way back to live content instead of a dead end.
 * Unmatched URLs outside both locales use app/global-not-found.tsx.
 */
export function NotFoundView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).notFound;
  const linkClass =
    "group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/60";

  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">{t.title}</h1>
        <p className="text-muted-foreground">{t.body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={localizePath(locale, "/")} className={linkClass}>
          {t.back}
        </Link>
        <Link href={localizePath(locale, "/blog")} className={linkClass}>
          {t.blog}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      </div>
    </main>
  );
}
