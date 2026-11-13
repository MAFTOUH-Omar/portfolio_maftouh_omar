/**
 * Canonical origin of the site. Must be the host that answers 200 —
 * the apex (omarmaftouh.com) redirects to www on Vercel, so canonicals,
 * hreflang and sitemap URLs all point at www to avoid redirect chains.
 */
export const SITE_URL = "https://www.omarmaftouh.com";

/** Turns a site-relative path into an absolute URL ("/" maps to the bare origin). */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
