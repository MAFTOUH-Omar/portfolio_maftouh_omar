/** Coarse, dependency-free UA parsing — good enough for analytics buckets,
 *  not meant to be exhaustive. */

const BROWSERS: [RegExp, string][] = [
  [/edg\//i, "Edge"],
  [/opr\/|opera/i, "Opera"],
  [/chrome|crios/i, "Chrome"],
  [/firefox|fxios/i, "Firefox"],
  [/safari/i, "Safari"],
];

const OS: [RegExp, string][] = [
  [/windows/i, "Windows"],
  [/mac os x|macintosh/i, "macOS"],
  [/android/i, "Android"],
  [/iphone|ipad|ipod/i, "iOS"],
  [/linux/i, "Linux"],
];

export function parseUserAgent(userAgent: string | null) {
  if (!userAgent) return { browser: null, os: null, device: null };

  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
  const os = OS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
  const device = /mobile|iphone|android/i.test(userAgent)
    ? "mobile"
    : /ipad|tablet/i.test(userAgent)
      ? "tablet"
      : "desktop";

  return { browser, os, device };
}
