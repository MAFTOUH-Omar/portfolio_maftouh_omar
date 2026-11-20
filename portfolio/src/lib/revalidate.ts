import { revalidatePath } from "next/cache";

/**
 * Refreshes every statically cached public page after a content change.
 *
 * A post or tag edit ripples far beyond its own URL: the old slug (renamed,
 * unpublished or deleted posts must turn into 404s, not keep serving a cached
 * 200), tag hubs, related-post lists on other posts, the home page's latest
 * posts, the navbar's language switcher, the sitemap and the RSS feed.
 * Tracking each dependent path is error-prone; on a site this small,
 * revalidating everything is cheap — pages re-render lazily on next visit.
 */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
  // Metadata routes and route handlers, listed explicitly to be safe.
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
}
