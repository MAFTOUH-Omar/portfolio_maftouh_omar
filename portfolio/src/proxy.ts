import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const config = {
  // Matchers must be literals (statically analyzed at build time), so the
  // GONE_PATHS entries are repeated here.
  matcher: ["/admin/:path*", "/api/admin/:path*", "/blog/hello-world", "/en/blog/hello-world"],
};

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

/**
 * URLs that existed once (template placeholder post) and were removed for
 * good. Search Console still crawls them; 410 Gone says "intentionally
 * removed, drop it" more firmly than a 404, so they leave the index sooner.
 */
const GONE_PATHS = new Set(["/blog/hello-world", "/en/blog/hello-world"]);

function gone(pathname: string) {
  const en = pathname.startsWith("/en/");
  const html = `<!doctype html><html lang="${en ? "en" : "fr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${en ? "Page removed" : "Page supprimée"}</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem;text-align:center"><p style="font-family:monospace;color:#666">410</p><h1>${en ? "This page has been removed" : "Cette page a été supprimée"}</h1><p><a href="${en ? "/en/blog" : "/blog"}">${en ? "Browse the blog" : "Parcourir le blog"}</a> · <a href="${en ? "/en" : "/"}">${en ? "Back to home" : "Retour à l'accueil"}</a></p></body></html>`;
  return new NextResponse(html, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (GONE_PATHS.has(pathname)) return gone(pathname);

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
