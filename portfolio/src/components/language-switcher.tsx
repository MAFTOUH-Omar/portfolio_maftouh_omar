"use client";

import { buttonVariants } from "@/components/ui/button";
import { localizePath, neutralPath, otherLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Props extends Omit<React.ComponentPropsWithRef<"a">, "href"> {
  locale: Locale;
  label: string;
  /** Blog slugs that exist in every locale; other posts fall back to the blog index. */
  translatedSlugs: readonly string[];
}

/**
 * Plain <a> on purpose: each locale has its own root layout (and <html lang>),
 * so switching is a full document load anyway.
 */
export function LanguageSwitcher({
  locale,
  label,
  translatedSlugs,
  className,
  ...props
}: Props) {
  const pathname = usePathname() ?? "/";
  const target = otherLocale(locale);

  let path = neutralPath(pathname);
  const post = path.match(/^\/blog\/([^/]+)$/);
  if (post && !translatedSlugs.includes(post[1])) path = "/blog";

  return (
    <a
      {...props}
      href={localizePath(target, path)}
      hrefLang={target}
      lang={target}
      aria-label={`${target.toUpperCase()} — ${label}`}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-12 text-xs font-semibold uppercase tracking-wide",
        className
      )}
    >
      {target}
    </a>
  );
}
