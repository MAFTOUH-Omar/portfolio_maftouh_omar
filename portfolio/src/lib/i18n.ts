import { absoluteUrl } from "@/lib/site";

/**
 * French is served unprefixed (/, /blog) because the primary audience is
 * Moroccan recruiters and clients; English lives under /en.
 */
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export type Localized<T = string> = Record<Locale, T>;

export const localeConfig = {
  fr: {
    htmlLang: "fr-MA",
    hreflang: "fr",
    ogLocale: "fr_MA",
    dateLocale: "fr-FR",
    label: "Français",
  },
  en: {
    htmlLang: "en",
    hreflang: "en",
    ogLocale: "en_US",
    dateLocale: "en-US",
    label: "English",
  },
} as const satisfies Record<Locale, unknown>;

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

/** Prefixes a locale-neutral path ("/", "/blog") for the given locale. */
export function localizePath(locale: Locale, path = "/"): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Strips the locale prefix from a pathname, returning the locale-neutral path. */
export function neutralPath(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/**
 * Builds the `alternates.languages` map (hreflang) for a page that exists in
 * the given locales. x-default points at French when available.
 */
export function languageAlternates(
  path: string,
  available: readonly Locale[] = locales
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of available) {
    languages[localeConfig[locale].hreflang] = absoluteUrl(localizePath(locale, path));
  }
  const fallback = available.includes(defaultLocale) ? defaultLocale : available[0];
  if (fallback) languages["x-default"] = absoluteUrl(localizePath(fallback, path));
  return languages;
}
