import { NextRequest, NextResponse } from "next/server";
import { getBlogPostsPage } from "@/data/blog";
import { locales, type Locale } from "@/lib/i18n";

const MAX_PAGE_SIZE = 10;

function isLocale(value: string | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Backs the blog index's infinite scroll: one page of published posts
 *  (metadata only, no markdown render) at a time, capped at 10. */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale");
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Math.min(MAX_PAGE_SIZE, Number(searchParams.get("limit") ?? String(MAX_PAGE_SIZE)));

  if (!isLocale(locale) || !Number.isFinite(offset) || offset < 0 || !Number.isFinite(limit) || limit <= 0) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { posts, hasMore } = await getBlogPostsPage(locale, offset, limit);
  return NextResponse.json({ posts, hasMore });
}
