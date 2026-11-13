"use client";

import { buttonVariants } from "@/components/ui/button";
import { localizePath, neutralPath, otherLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

/** Flag shown for each locale (64px WebP in public/flags, ~2–3 KB each). */
const FLAG: Record<Locale, string> = {
  fr: "/flags/fr.webp",
  en: "/flags/gb.webp",
};

interface Props extends Omit<React.ComponentPropsWithRef<"a">, "href"> {
  locale: Locale;
  label: string;
  /** Blog slugs that exist in every locale; other posts fall back to the blog index. */
  translatedSlugs: readonly string[];
}

/**
 * Shows the flag of the language you'd switch *to*.
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
      aria-label={label}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-12",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FLAG[target]}
        alt=""
        width={22}
        height={22}
        decoding="async"
        className="size-[22px]"
      />
    </a>
  );
}
